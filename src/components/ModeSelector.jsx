"use client";

// ── Mode options ───────────────────────────────────────
const MODES = [
  {
    id: "flashcards",
    icon: "⧉",
    label: "Flashcards",
    description: "Q&A pairs you can flip and study",
  },
  {
    id: "excel",
    icon: "⊞",
    label: "Interactive Table",
    description: "Structured rows that you can click to reveal",
  },
];

export default function ModeSelector({ onSelect, isDocument }) {
  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">
          Step 2 of 2
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Choose your output
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          How do you want this {isDocument ? "document" : "image"} turned into?
        </p>
      </div>

      {/* Mode cards */}
      <div className="flex flex-col gap-3">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 text-left transition-all duration-100 hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
          >
            {/* Icon */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-lg text-zinc-600 transition-colors group-hover:border-zinc-300 group-hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:group-hover:border-zinc-700 dark:group-hover:text-zinc-200">
              {mode.icon}
            </span>

            {/* Text */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-950 dark:text-zinc-200 dark:group-hover:text-zinc-100">
                {mode.label}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-400">
                {mode.description}
              </p>
            </div>

            {/* Arrow */}
            <span className="ml-auto shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
