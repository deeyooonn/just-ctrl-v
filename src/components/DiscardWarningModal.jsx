"use client";

import { useState, useEffect } from "react";

export default function DiscardWarningModal({ isOpen, onConfirm, onClose }) {
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(3);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-flipIn rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/50 dark:backdrop-blur-xl">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 mb-4">
          <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Unsaved Work</h3>
        </div>
        
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Warning: If you leave without saving, you will lose this content and have to re-scan your file or screenshot.
        </p>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={timeLeft > 0}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              timeLeft > 0
                ? "bg-red-500/50 text-white/70 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {timeLeft > 0 ? `Wait ${timeLeft}s...` : "Yes, discard"}
          </button>
        </div>
      </div>
    </div>
  );
}
