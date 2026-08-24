"use client";

import { useState } from "react";

export default function Flashcard({ question, answer }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`flip-card h-44 w-full cursor-pointer animate-flipIn ${
        flipped ? "is-flipped" : ""
      }`}
      onClick={() => setFlipped((prev) => !prev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setFlipped((prev) => !prev);
      }}
    >
      <div className="flip-card-inner">
        {/* Front — question */}
        <div className="flip-card-face flex flex-col justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{question}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Question
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Click to flip</span>
          </div>
        </div>

        {/* Back — answer */}
        <div className="flip-card-face flip-card-back flex flex-col justify-between rounded-xl border border-accent/40 dark:border-accent/30 bg-zinc-50 dark:bg-zinc-900 p-4 shadow-sm">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{answer}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
              Answer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
