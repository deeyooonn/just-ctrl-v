"use client";

import { useState, useEffect } from "react";

export default function SaveToFolderModal({ isOpen, onClose, mode, contentData, onSaveSuccess }) {
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen]);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/folders", { cache: "no-store" });
      const data = await res.json();
      // Filter folders to match the current mode (flashcards vs excel)
      if (res.ok) {
        setFolders(data.folders.filter(f => f.mode.toLowerCase() === mode.toLowerCase()));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName, mode: mode.toUpperCase() }),
      });
      if (res.ok) {
        setNewFolderName("");
        fetchFolders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveToFolder = async (folderId) => {
    setIsSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/folders/${folderId}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentData }),
      });
      if (res.ok) {
        onSaveSuccess();
        onClose();
      } else {
        setErrorMsg("Failed to save to folder.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-flipIn rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/50 dark:backdrop-blur-xl">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Save to Folder</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Merge these {mode === "excel" ? "table rows" : "flashcards"} into a study folder. Duplicates will be ignored.
        </p>

        {errorMsg && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            {errorMsg}
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Your Folders</h4>
          
          {isLoading ? (
            <div className="text-sm text-zinc-500 py-2">Loading folders...</div>
          ) : folders.length === 0 ? (
            <div className="text-sm text-zinc-500 py-2">No folders found for this format.</div>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleSaveToFolder(folder.id)}
                  disabled={isSaving}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 py-3.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50 min-h-[48px]"
                >
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{folder.name}</span>
                  <span className="text-xs text-zinc-500">{folder.contentJson?.length || 0} items</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleCreateFolder} className="mt-6 flex items-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Create New Folder
            </label>
            <input
              type="text"
              required
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g., Math 101"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 min-h-[44px]"
          >
            Create
          </button>
        </form>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
