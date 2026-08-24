"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export default function LimitReachedModal({ isOpen, onClose, message }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-center shadow-2xl shadow-black/10 dark:shadow-black/60">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Daily Limit Reached</h3>
        
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {message || "You've exhausted your daily free quota for this file type."}
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Please wait until tomorrow for your limits to reset, or upgrade your plan to continue processing immediately.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/upgrade"
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-black hover:bg-[#b0f56e] transition-colors shadow-[0_0_15px_rgba(196,245,110,0.4)] animate-pulse"
          >
            Upgrade Plan
          </Link>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Wait until tomorrow
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
