import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const folderId = (await params).id;
    const { content } = await req.json(); // Array of new flashcards or rows

    if (!Array.isArray(content)) {
      return NextResponse.json({ error: "Content must be an array" }, { status: 400 });
    }

    const folder = await prisma.folder.findUnique({
      where: { id: folderId }
    });

    if (!folder || folder.userId !== session.user.id) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const existingContent = Array.isArray(folder.contentJson) ? folder.contentJson : [];
    
    // Merge logic: Simple deduplication
    // For flashcards: unique by "question"
    // For tables: unique by the first column value
    let merged = [...existingContent];

    if (folder.mode === "FLASHCARDS") {
      for (const newCard of content) {
        const q = newCard.question?.trim().toLowerCase();
        const exists = merged.find(c => c.question?.trim().toLowerCase() === q);
        if (exists) {
          // Overwrite answer
          exists.answer = newCard.answer;
        } else {
          merged.push(newCard);
        }
      }
    } else {
      // EXCEL mode
      for (const newRow of content) {
        const keys = Object.keys(newRow);
        if (keys.length === 0) continue;
        const firstKey = keys[0];
        const val = String(newRow[firstKey]).trim().toLowerCase();
        
        const exists = merged.find(r => String(r[firstKey]).trim().toLowerCase() === val);
        if (exists) {
          // Overwrite with new row completely
          Object.assign(exists, newRow);
        } else {
          merged.push(newRow);
        }
      }
    }

    const updated = await prisma.folder.update({
      where: { id: folderId },
      data: {
        previousContent: folder.contentJson, // Save previous state for undo
        contentJson: merged
      }
    });

    return NextResponse.json({ folder: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
