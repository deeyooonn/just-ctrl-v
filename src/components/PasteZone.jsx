"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useSession } from "next-auth/react";

export default function PasteZone({
  onImagePasted,
  onError,
  disabled,
  isAuthenticated = true,
  onAuthRequired,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef(null);

  const { data: session } = useSession();
  const planTier = session?.user?.planTier || "FREE";

  // ── Shared: File → base64 → callback ──────────────────
  const processFile = useCallback(
    (file) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      if (!file) return;
      
      const limits = {
        FREE: 5 * 1024 * 1024,
        PLUS: 10 * 1024 * 1024,
        PRO: 25 * 1024 * 1024,
        ADMIN: 25 * 1024 * 1024,
      };

      const limit = limits[planTier] || limits.FREE;

      if (file.size > limit) {
        if (planTier === "FREE") {
          onError?.("File exceeds 5MB limit. Upgrade to Plus or Pro for larger uploads.");
        } else if (planTier === "PLUS") {
          onError?.("File exceeds 10MB limit. Upgrade to Pro for up to 25MB uploads.");
        } else {
          onError?.("File exceeds maximum 25MB upload limit.");
        }
        return;
      }

      const validTypes = [
        "image/", "application/pdf", "text/plain", "text/markdown",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword", "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv"
      ];
      const isValid = validTypes.some(type => file.type.startsWith(type)) || file.name.endsWith('.md');
      if (!isValid) {
        onError?.("Unsupported file type. Please upload an image, PDF, or document.");
        return;
      }
      onImagePasted(file);
    },
    [isAuthenticated, onAuthRequired, onImagePasted, onError, planTier]
  );

  // ── Paste (global) ─────────────────────────────────────
  const handlePaste = useCallback(
    (event) => {
      if (disabled) return;
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    },
    [disabled, isAuthenticated, onAuthRequired, processFile]
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // ── Drag-and-drop ──────────────────────────────────────
  const handleDragEnter = useCallback(
    (e) => {
      e.preventDefault();
      if (disabled) return;
      dragCounter.current += 1;
      setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragOver(false);
      if (disabled) return;
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      const file = e.dataTransfer?.files?.[0];
      processFile(file);
    },
    [disabled, isAuthenticated, onAuthRequired, processFile]
  );

  // ── Click-to-browse ────────────────────────────────────
  const handleZoneClick = useCallback(() => {
    // Don't open picker during an active drag
    if (disabled || dragCounter.current > 0) return;
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    fileInputRef.current?.click();
  }, [disabled, isAuthenticated, onAuthRequired]);

  const handleFileInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      processFile(file);
      // Reset so selecting the same file again still fires
      e.target.value = "";
    },
    [processFile]
  );

  return (
    <div
      onClick={handleZoneClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
        isDragOver
          ? "scale-[1.02] border-accent bg-accent/5 dark:bg-accent/10 shadow-[0_0_30px_rgba(196,245,110,0.15)]"
          : "border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
      }`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.txt,.md,.doc,.docx,.xls,.xlsx,.csv"
        className="hidden"
        onChange={handleFileInputChange}
        tabIndex={-1}
      />

      {/* Desktop view */}
      <div className="hidden sm:flex flex-col items-center">
        <kbd className="mb-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm">
          CTRL + V
        </kbd>
        <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
          Paste a screenshot or document
        </p>
        <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          or drag and drop a file here. Supported formats: .png, .jpg, .webp, .pdf, .docx, .txt
        </p>
      </div>

      {/* Mobile view */}
      <div className="flex sm:hidden flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-zinc-900 shadow-[0_0_15px_rgba(196,245,110,0.4)]">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
          Tap to upload
        </p>
        <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Select an image or document
        </p>
      </div>
    </div>
  );
}
