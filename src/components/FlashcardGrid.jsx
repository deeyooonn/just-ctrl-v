"use client";

import Flashcard from "./Flashcard";
import ActionButtons from "./ActionButtons";
import { useState, useRef } from "react";
import { exportToPng, exportFlashcardsToDocx } from "@/utils/exportUtils";

export default function FlashcardGrid({ flashcards, onReset, onSaveClick }) {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "single"
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef(null);

  if (!flashcards || flashcards.length === 0) return null;

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      await exportFlashcardsToDocx(flashcards, "flashcards_export");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      await exportToPng(printRef.current, "flashcards_export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:backdrop-blur-md gap-4">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {flashcards.length} card{flashcards.length !== 1 ? "s" : ""} generated
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-2 rounded-lg bg-zinc-100 dark:bg-zinc-950/50 p-1 border border-zinc-200 dark:border-zinc-800/50">
            <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === "grid" 
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("single")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === "single" 
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Single
          </button>
        </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flashcards.map((card, index) => (
            <Flashcard
              key={index}
              question={card.question}
              answer={card.answer}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl">
            <Flashcard
              key={activeIndex}
              question={flashcards[activeIndex].question}
              answer={flashcards[activeIndex].answer}
            />
          </div>
          <div className="mt-6 flex items-center gap-6">
            <button 
              onClick={prevCard}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Previous card"
            >
              ←
            </button>
            <span className="text-sm font-medium text-zinc-500">
              {activeIndex + 1} / {flashcards.length}
            </span>
            <button 
              onClick={nextCard}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Next card"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Hidden printable container for pristine PNG export */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none opacity-0">
        <div id="flashcards-print-container" ref={printRef} className="w-[800px] bg-white p-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-6 border-b pb-4">Flashcards</h1>
          <div className="flex flex-col gap-4">
            {flashcards.map((card, idx) => (
              <div key={idx} className="flex gap-6 border-b border-zinc-200 pb-4">
                <div className="w-1/2 font-semibold text-zinc-900 break-words">{card.question}</div>
                <div className="w-1/2 text-zinc-700 break-words">{card.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ActionButtons 
        onReset={onReset} 
        onSaveClick={onSaveClick} 
        onExportDocx={handleExportDocx}
        onExportPng={handleExportPng}
        isExporting={isExporting}
      />
    </div>
  );
}
