import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import mammoth from "mammoth";
import * as xlsx from "xlsx";
import { z } from "zod";
import { fileProcessingLimiterFree, fileProcessingLimiterPro } from "@/lib/ratelimit";

const processImageSchema = z.object({
  mediaType: z.string().min(1, "Missing media type."),
  mode: z.enum(["flashcards", "excel"]).default("flashcards")
});

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const LIMITS = {
  FREE: { images: 3, files: 1 },
  PLUS: { images: 10, files: 5 },
  PRO:  { images: 50, files: 20 },
  ADMIN: { images: 999999, files: 999999 },
};

// ── Per-mode system prompts ────────────────────────────
const PROMPTS = {
  flashcards: `You are a flashcard extraction engine embedded in a paste-to-study app.
You will be shown content (an image, pdf, or extracted text).

Your job:
1. Identify the distinct facts, definitions, terms, or data rows worth studying.
2. Convert each one into a clear, concise question-and-answer flashcard.
3. If the content is a table, turn each meaningful row into a Q&A pair.

Rules:
- Return ONLY a valid JSON array.
- Each element must have exactly two string fields: "question" and "answer".
- Keep questions short and specific. Answers under 25 words.
- Extract only the most important study points. Generate up to a maximum of 60 cards.
- If there is no study-worthy content, return an empty array: []`,

  excel: `You are a data extraction engine. You will be shown content containing a table, list, or structured data.

Your job:
1. Identify all rows and columns.
2. Extract the data into a clean, structured JSON array of row objects.
3. Use the column headers as keys. If there are no headers, infer sensible short keys.

Rules:
- Return ONLY a valid JSON array.
- Each element must be a flat object: { "Column A": "value", "Column B": "value" }
- Preserve the original column names exactly as they appear.
- If there is no tabular data, return an empty array: []
- Keep values clean and literal.`
};

function getSystemPrompt(mode) {
  return PROMPTS[mode] ?? PROMPTS.flashcards;
}

function cleanJSON(raw) {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // ── Pre-fetch user to get Tier ──
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { planTier: true, dailyImagesUsed: true, dailyFilesUsed: true, usageResetAt: true, autoSaveEnabled: true },
      });
    } catch (dbError) {
      console.error("Database Error [Find User]:", dbError);
      return NextResponse.json({ error: "An internal database error occurred while fetching user profile." }, { status: 500 });
    }
    
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const tier = user.planTier || "FREE";
    const limits = {
      FREE: 5 * 1024 * 1024,
      PLUS: 10 * 1024 * 1024,
      PRO: 25 * 1024 * 1024,
      ADMIN: 25 * 1024 * 1024,
    };
    const maxSizeBytes = limits[tier] || limits.FREE;
    const maxSizeMB = maxSizeBytes / (1024 * 1024);

    // ── 1. Payload Limit Check ──
    const contentLength = request.headers.get("content-length");
    if (!contentLength || parseInt(contentLength, 10) > maxSizeBytes) {
      return NextResponse.json({ error: `Payload too large. Max file size for your tier is ${maxSizeMB}MB.` }, { status: 413 });
    }

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }

    const file = formData.get("file");
    const rawMediaType = formData.get("mediaType");
    const rawMode = formData.get("mode");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // ── Security: Size & MIME Validation ──
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: `File too large. Maximum size for your tier is ${maxSizeMB}MB.` }, { status: 413 });
    }

    const allowedMimeTypes = [
      "image/jpeg", "image/png", "image/webp", "application/pdf", 
      "text/plain", "text/csv", "text/markdown",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    if (!allowedMimeTypes.includes(rawMediaType)) {
      return NextResponse.json({ error: "Unsupported media type." }, { status: 415 });
    }

    const parsedBody = processImageSchema.safeParse({ mediaType: rawMediaType, mode: rawMode });
    if (!parsedBody.success) {
      return NextResponse.json({ error: parsedBody.error.errors[0].message }, { status: 400 });
    }

    const { mediaType, mode } = parsedBody.data;

    // ── Usage Limit Enforcement ──
    // (User already fetched above)
    // JIT Reset Check
    const now = new Date();
    const lastReset = user.usageResetAt ? new Date(user.usageResetAt) : new Date(0);
    const isNewDay =
      lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
      lastReset.getUTCMonth() !== now.getUTCMonth() ||
      lastReset.getUTCDate() !== now.getUTCDate();

    if (isNewDay) {
      try {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            dailyImagesUsed: 0,
            dailyFilesUsed: 0,
            usageResetAt: now,
          },
        });
        user.dailyImagesUsed = 0;
        user.dailyFilesUsed = 0;
      } catch (resetErr) {
        console.error("Database Error [JIT Reset]:", resetErr);
        // We log the error but don't fail the request, allowing the user to proceed
        // with their current session limits.
      }
    }

    const currentTierLimits = LIMITS[tier] || LIMITS.FREE;

    // ── Rate Limiting ──
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
    const limiter = (tier === "PRO" || tier === "ADMIN") ? fileProcessingLimiterPro : fileProcessingLimiterFree;
    
    if (limiter) {
      try {
        const { success, pending, limit, reset, remaining } = await limiter.limit(ip);
        if (!success) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { 
              status: 429, 
              headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString()
              }
            }
          );
        }
      } catch (rateLimitErr) {
        console.error("Rate Limiter Error:", rateLimitErr);
        // Fail open if Redis is down
      }
    }

    const isImage = mediaType.startsWith("image/");
    const isDocument = !isImage;

    if (isImage && (user.dailyImagesUsed || 0) >= currentTierLimits.images) {
      return NextResponse.json({ error: `Image limit reached for today (${currentTierLimits.images}/${currentTierLimits.images}). Please upgrade your plan.` }, { status: 403 });
    }
    if (isDocument && (user.dailyFilesUsed || 0) >= currentTierLimits.files) {
      return NextResponse.json({ error: `File limit reached for today (${currentTierLimits.files}/${currentTierLimits.files}). Please upgrade your plan.` }, { status: 403 });
    }

    if (!ai) {
      return NextResponse.json({ error: "Gemini API key is not configured. Please add it to your .env file." }, { status: 400 });
    }

    // ── File Parsing & Content Block Generation ──
    const parts = [];
    const arrayBuffer = await file.arrayBuffer();
    const base64Buffer = Buffer.from(arrayBuffer);
    const base64String = base64Buffer.toString("base64");

    if (isImage) {
      // Images
      parts.push({ text: "Extract the data from this image following the system rules exactly." });
      parts.push({
        inlineData: {
          mimeType: mediaType,
          data: base64String,
        },
      });
    } else if (mediaType === "application/pdf") {
      // PDFs
      parts.push({ text: "Extract the data from this PDF document following the system rules exactly." });
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: base64String,
        },
      });
    } else if (
      mediaType.includes("wordprocessingml.document") ||
      mediaType === "application/msword"
    ) {
      // Word Documents
      const result = await mammoth.extractRawText({ buffer: base64Buffer });
      parts.push({
        text: `Here is the extracted text from the Word document:\n\n${result.value}\n\nExtract the data from this document following the system rules exactly.`,
      });
    } else if (
      mediaType.includes("spreadsheetml.sheet") ||
      mediaType === "application/vnd.ms-excel" ||
      mediaType === "text/csv"
    ) {
      // Excel & CSV
      const workbook = xlsx.read(base64Buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const csvData = xlsx.utils.sheet_to_csv(sheet);
      parts.push({
        text: `Here is the extracted CSV data from the spreadsheet:\n\n${csvData}\n\nExtract the data from this spreadsheet following the system rules exactly.`,
      });
    } else {
      // Raw Text / Fallback
      const textData = base64Buffer.toString("utf-8");
      parts.push({
        text: `Here is the extracted text document:\n\n${textData}\n\nExtract the data from this document following the system rules exactly.`,
      });
    }

    // ── Call Gemini ──
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: getSystemPrompt(mode),
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "";

    const cleaned = cleanJSON(rawText);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse model output as JSON:", cleaned);
      return NextResponse.json(
        { error: "The model returned an unexpected format. Please try again." },
        { status: 502 }
      );
    }

    // ── Increment Usage Limits & Save Conversion ──
    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: isImage
            ? { dailyImagesUsed: { increment: 1 } }
            : { dailyFilesUsed: { increment: 1 } },
        }),
        prisma.conversion.create({
          data: {
            userId: session.user.id,
            mode: mode.toUpperCase(),
            sourceType: isImage ? "IMAGE" : "FILE",
            resultJson: parsed,
          },
        }),
      ]);
    } catch (dbError) {
      console.error("Database Error [Transaction]:", dbError);
      return NextResponse.json(
        { error: "An internal database error occurred while saving your conversion." },
        { status: 500 }
      );
    }

    // ── Format Output ──
    if (mode === "flashcards") {
      if (!Array.isArray(parsed)) {
        return NextResponse.json({ error: "Model output was not a JSON array." }, { status: 502 });
      }
      const validCards = parsed.filter(
        (c) => c.question && c.answer && String(c.question).trim() && String(c.answer).trim()
      );
      
      let autoSaved = false;
      if (["PRO", "ADMIN"].includes(user.planTier) && user.autoSaveEnabled && validCards.length > 0) {
        try {
          const folderName = "Auto-Saves - Flashcards";
          let folder = await prisma.folder.findFirst({
            where: { userId: session.user.id, name: folderName, mode: "FLASHCARDS" }
          });
          if (!folder) {
            folder = await prisma.folder.create({
              data: { name: folderName, mode: "FLASHCARDS", userId: session.user.id, contentJson: [] }
            });
          }
          const merged = [...(Array.isArray(folder.contentJson) ? folder.contentJson : []), ...validCards];
          await prisma.folder.update({ where: { id: folder.id }, data: { contentJson: merged } });
          autoSaved = true;
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }

      return NextResponse.json({ flashcards: validCards, mode, autoSaved });
    }

    if (mode === "excel") {
      if (!Array.isArray(parsed)) {
        return NextResponse.json({ error: "Model output was not a JSON array." }, { status: 502 });
      }
      const validRows = parsed.filter((row) => {
        if (!row || typeof row !== "object") return false;
        const keys = Object.keys(row);
        if (keys.length < 2) return false; // Need at least two columns

        return keys.every((k) => {
          const v = row[k];
          if (v === null || v === undefined) return false;
          const str = String(v).trim().toLowerCase();
          return str !== "" && str !== "null" && str !== "undefined" && str !== "n/a" && str !== "-";
        });
      });

      // Ensure all rows have the exact same headers as the first valid row
      if (validRows.length > 0) {
        const baseHeaders = Object.keys(validRows[0]);
        const uniformRows = validRows.filter(row => {
          const keys = Object.keys(row);
          return keys.length === baseHeaders.length && baseHeaders.every(h => keys.includes(h));
        });
        
        let autoSaved = false;
        if (["PRO", "ADMIN"].includes(user.planTier) && user.autoSaveEnabled && uniformRows.length > 0) {
          try {
            const folderName = "Auto-Saves - Table";
            let folder = await prisma.folder.findFirst({
              where: { userId: session.user.id, name: folderName, mode: "EXCEL" }
            });
            if (!folder) {
              folder = await prisma.folder.create({
                data: { name: folderName, mode: "EXCEL", userId: session.user.id, contentJson: [] }
              });
            }
            const merged = [...(Array.isArray(folder.contentJson) ? folder.contentJson : []), ...uniformRows];
            await prisma.folder.update({ where: { id: folder.id }, data: { contentJson: merged } });
            autoSaved = true;
          } catch (err) {
            console.error("Auto-save failed:", err);
          }
        }
        
        return NextResponse.json({ rows: uniformRows, mode, autoSaved });
      }
      
      return NextResponse.json({ rows: [], mode, autoSaved: false });
    }

    return NextResponse.json({ flashcards: [], mode });
  } catch (err) {
    console.error("Gemini Route Error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong while processing the file." },
      { status: 500 }
    );
  }
}
