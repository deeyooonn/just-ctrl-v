"use client";

import { useState } from "react";
import Link from "next/link";
import FlashcardGrid from "./FlashcardGrid";
import TableResult from "./TableResult";
import DialogModal from "./DialogModal";
import PromptModal from "./PromptModal";
import ExportDropdown from "./ExportDropdown";
import { exportFlashcardsToDocx, exportTableToDocx, exportToPng } from "@/utils/exportUtils";

export default function SavesClient({ initialFolders, planTier }) {
  const [folders, setFolders] = useState(initialFolders);
  const [activeFolderId, setActiveFolderId] = useState(null);

  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null, onCancel: null, confirmText: "OK", isDestructive: false });
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: "", defaultValue: "", onConfirm: null });

  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));
  const closePrompt = () => setPromptModal(prev => ({ ...prev, isOpen: false }));
  
  const refreshFolders = async () => {
    const res = await fetch("/api/folders");
    if (res.ok) {
      const data = await res.json();
      setFolders(data.folders);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const triggerUpgrade = () => {
    setDialog({
      isOpen: true,
      title: "Upgrade Required",
      message: "Exporting requires a Plus or Pro subscription. Please upgrade to unlock this feature!",
      confirmText: "Upgrade Now",
      onConfirm: () => {
        window.location.href = "/upgrade";
      },
      onCancel: closeDialog
    });
  };

  const handleExportDocx = async (folder) => {
    const content = folder.contentJson || [];
    if (content.length === 0) return;
    setIsExporting(true);
    try {
      if (folder.mode === "FLASHCARDS") {
        await exportFlashcardsToDocx(content, `${folder.name}_export`);
      } else {
        await exportTableToDocx(content, `${folder.name}_export`);
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = async (folder) => {
    if (activeFolderId !== folder.id) {
      setActiveFolderId(folder.id);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const elementId = folder.mode === "FLASHCARDS" ? "flashcards-print-container" : "table-print-container";
    const element = document.getElementById(elementId);
    if (!element) return;
    
    setIsExporting(true);
    try {
      await exportToPng(element, `${folder.name}_export`);
    } catch (err) {
      console.error("PNG export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = (id) => {
    setDialog({
      isOpen: true,
      title: "Delete Folder",
      message: "Are you sure you want to delete this folder? This action cannot be undone.",
      confirmText: "Delete",
      isDestructive: true,
      onCancel: closeDialog,
      onConfirm: async () => {
        closeDialog();
        await fetch(`/api/folders/${id}`, { method: "DELETE" });
        refreshFolders();
        if (activeFolderId === id) setActiveFolderId(null);
      }
    });
  };

  const handleUndo = async (id) => {
    const res = await fetch(`/api/folders/${id}/undo`, { method: "POST" });
    if (res.ok) {
      setDialog({ isOpen: true, title: "Success", message: "Undo successful!", confirmText: "OK", onConfirm: closeDialog });
      refreshFolders();
    } else {
      setDialog({ isOpen: true, title: "Error", message: "Failed to undo or nothing to undo.", confirmText: "OK", onConfirm: closeDialog });
    }
  };

  const handleRename = (id, currentName) => {
    setPromptModal({
      isOpen: true,
      title: "Rename Folder",
      defaultValue: currentName,
      onCancel: closePrompt,
      onConfirm: async (newName) => {
        closePrompt();
        if (newName && newName !== currentName) {
          await fetch(`/api/folders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName })
          });
          refreshFolders();
        }
      }
    });
  };

  const activeFolder = folders.find(f => f.id === activeFolderId);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar: Folder List */}
      <div className="w-full md:w-1/3 flex flex-col gap-3">
        {folders.length === 0 ? (
          <p className="text-sm text-zinc-500">No folders yet. Generate some content and save it!</p>
        ) : (
          folders.map((folder) => {
            const itemCount = folder.contentJson?.length || 0;
            const canUndo = !!folder.previousContent;
            
            return (
              <div 
                key={folder.id} 
                className={`p-4 rounded-xl border transition-all cursor-pointer ${activeFolderId === folder.id ? "border-accent bg-accent/5 dark:bg-accent/10" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                onClick={() => setActiveFolderId(folder.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{folder.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {folder.mode === "FLASHCARDS" ? "Flashcards" : "Table"} • {itemCount} items
                    </p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    {planTier === "FREE" ? (
                      <button 
                        onClick={triggerUpgrade}
                        className="flex items-center gap-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-3 py-1.5 rounded-md font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <span className="font-bold">🔒</span> Export
                      </button>
                    ) : (
                      <ExportDropdown 
                        onExportDocx={() => handleExportDocx(folder)}
                        onExportPng={() => handleExportPng(folder)}
                        isExporting={isExporting}
                      />
                    )}
                  </div>
                </div>

                {activeFolderId === folder.id && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleRename(folder.id, folder.name); }} className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">Rename</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(folder.id); }} className="text-xs font-medium text-red-500 hover:text-red-600">Delete</button>
                    {canUndo && (
                      <div className="ml-auto group relative">
                        <button onClick={(e) => { e.stopPropagation(); handleUndo(folder.id); }} className="text-xs font-medium text-amber-500 hover:text-amber-600">
                          Undo Merge
                        </button>
                        <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block w-48 p-2 bg-zinc-900 text-white text-[10px] rounded-lg shadow-xl text-center z-50 pointer-events-none">
                          Reverts the most recent merge action.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-full md:w-2/3 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50 p-6 min-h-[500px]">
        {!activeFolder ? (
          <div className="h-full flex items-center justify-center text-sm text-zinc-500">
            Select a folder to view its contents
          </div>
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{activeFolder.name}</h2>
            </div>
            
            {activeFolder.contentJson?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Folder is empty</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                  Save some flashcards or interactive tables to this folder to see them here.
                </p>
              </div>
            ) : activeFolder.mode === "FLASHCARDS" ? (
              <FlashcardGrid flashcards={activeFolder.contentJson} onReset={() => setActiveFolderId(null)} onSaveClick={() => {}} />
            ) : (
              <TableResult rows={activeFolder.contentJson} onReset={() => setActiveFolderId(null)} onSaveClick={() => {}} />
            )}
          </div>
        )}
      </div>

      <DialogModal {...dialog} />
      <PromptModal {...promptModal} />
    </div>
  );
}
