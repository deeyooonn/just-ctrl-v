"use client";

export default function ActionButtons({ onReset, onSaveClick }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">

      <button
        onClick={onSaveClick}
        className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
      >
        Save to Folder
      </button>

      <button
        onClick={onReset}
        className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        Done
      </button>
    </div>
  );
}
