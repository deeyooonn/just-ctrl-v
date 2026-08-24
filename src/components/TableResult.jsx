"use client";

import React, { useState, useRef } from 'react';
import { exportToPng, exportTableToDocx } from "@/utils/exportUtils";

export default function TableResult({ rows, onReset, onSaveClick }) {
  // globalMode: "hide-all", "show-all", "hide-questions", "hide-answers"
  const [globalMode, setGlobalMode] = useState("hide-all");
  const [revealedCells, setRevealedCells] = useState(new Set());

  if (!rows || rows.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 mt-8 z-10 relative">
        <p className="text-center text-zinc-500">No data extracted.</p>
      </div>
    );
  }

  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef(null);

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      await exportTableToDocx(rows, "table_export");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      await exportToPng(printRef.current, "table_export");
    } finally {
      setIsExporting(false);
    }
  };

  const headers = Object.keys(rows[0]);

  const toggleCell = (rowIdx, colIdx) => {
    const key = `${rowIdx}-${colIdx}`;
    setRevealedCells(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isCellVisible = (rowIdx, colIdx) => {
    // Manual reveal overrides global blur
    if (revealedCells.has(`${rowIdx}-${colIdx}`)) return true;

    // Check global mode
    if (globalMode === "show-all") return true;
    if (globalMode === "hide-all") return false;
    
    // colIdx === 0 is the "Question", colIdx > 0 are the "Answers"
    if (globalMode === "hide-questions" && colIdx === 0) return false;
    if (globalMode === "hide-questions" && colIdx > 0) return true;
    
    if (globalMode === "hide-answers" && colIdx > 0) return false;
    if (globalMode === "hide-answers" && colIdx === 0) return true;

    return false;
  };

  const setMode = (mode) => {
    setGlobalMode(mode);
    setRevealedCells(new Set()); // Reset manual reveals on global change
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 z-10 relative">
      {/* Header & Main Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:backdrop-blur-md gap-4">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Interactive Table ({rows.length} rows)
        </h2>
        
        {/* Visibility Toggles */}
        <div className="flex flex-wrap gap-2 p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-lg border border-zinc-200 dark:border-zinc-800/50">
          <button 
            onClick={() => setMode("show-all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${globalMode === "show-all" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >
            Show All
          </button>
          <button 
            onClick={() => setMode("hide-answers")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${globalMode === "hide-answers" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >
            Show Words Only
          </button>
          <button 
            onClick={() => setMode("hide-questions")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${globalMode === "hide-questions" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >
            Show Definitions Only
          </button>
        </div>

        <div className="flex gap-2">

          <button onClick={onSaveClick} className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors cursor-pointer z-20">
            Save to Folder
          </button>
          <button onClick={onReset} className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer z-20">
            Done
          </button>
        </div>
      </div>
      {/* Mobile scroll hint */}
      <div className="flex sm:hidden justify-end mb-[-12px]">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 animate-pulse">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Swipe to view more
        </span>
      </div>

      <div className="relative">
        {/* Subtle gradient to indicate scrollability on mobile */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-zinc-200/50 dark:from-zinc-800/50 to-transparent pointer-events-none sm:hidden rounded-r-xl z-10" />
        
        <div className="overflow-x-auto overscroll-x-contain rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-1 touch-pan-x">
          <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300 border-collapse">
            <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-100">
              <tr>
                {headers.map((key, colIdx) => (
                  <th key={key} className="border border-zinc-200 dark:border-zinc-700 px-4 py-3 font-semibold whitespace-nowrap">
                    {key}
                    {colIdx === 0 ? <span className="ml-2 text-[10px] font-normal text-zinc-400">(Term)</span> : <span className="ml-2 text-[10px] font-normal text-zinc-400">(Definition)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  {headers.map((key, colIdx) => {
                    const visible = isCellVisible(rowIdx, colIdx);
                    return (
                      <td 
                        key={key} 
                        onClick={() => toggleCell(rowIdx, colIdx)}
                        className="border border-zinc-200 dark:border-zinc-800 px-4 py-3 cursor-pointer min-w-[140px] max-w-[300px] sm:max-w-none relative group overflow-hidden"
                      >
                        <div className={`transition-all duration-300 ${visible ? "filter-none opacity-100" : "blur-sm opacity-20 select-none bg-zinc-300/20 dark:bg-zinc-700/50 rounded pointer-events-none"}`}>
                          {row[key]}
                        </div>
                        
                        {/* Overlay that appears when hidden */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${visible ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                          <span className="text-[10px] font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase bg-white/80 dark:bg-zinc-900/80 px-2.5 py-1 rounded-md shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
                            Click to View
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Hidden printable container for pristine PNG export */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none opacity-0">
        <div id="table-print-container" ref={printRef} className="w-[1000px] bg-white p-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-6 border-b pb-4">Table Data</h1>
          <table className="w-full text-left text-sm text-zinc-800 border-collapse border border-zinc-300">
            <thead className="bg-zinc-100 text-zinc-900">
              <tr>
                {headers.map(key => (
                  <th key={key} className="border border-zinc-300 px-4 py-3 font-semibold">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {headers.map(key => (
                    <td key={key} className="border border-zinc-300 px-4 py-3">
                      {row[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-zinc-500 mt-2">
        Click any cell to manually reveal or hide its contents.
      </p>
    </div>
  );
}
