"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import PasteZone from "@/components/PasteZone";
import ModeSelector from "@/components/ModeSelector";
import FlashcardGrid from "@/components/FlashcardGrid";
import AuthModal from "@/components/AuthModal";
import TableResult from "@/components/TableResult";
import BackgroundCircuit from "@/components/BackgroundCircuit";
import LimitReachedModal from "@/components/LimitReachedModal";
import SaveToFolderModal from "@/components/SaveToFolderModal";
import DiscardWarningModal from "@/components/DiscardWarningModal";
import { useImageProcessor } from "@/hooks/useImageProcessor";

// ── How it works row ───────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "1", label: "Paste a screenshot or drag a file" },
    { n: "2", label: "Choose your document" },
  ];

  return (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 text-[10px] font-semibold text-zinc-600 dark:text-zinc-500 bg-white dark:bg-transparent">
            {step.n}
          </span>
          <span className="text-sm text-zinc-600 dark:text-zinc-500">{step.label}</span>
          {i < steps.length - 1 && (
            <span className="hidden text-zinc-400 dark:text-zinc-700 sm:inline">→</span>
          )}
        </div>
      ))}
    </div>
  );
}



// ── Main page ──────────────────────────────────────────
export default function HomePage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [pendingNavDest, setPendingNavDest] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const [toastExiting, setToastExiting] = useState(false);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type) => {
    clearTimeout(toastTimer.current);
    setToastExiting(false);
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToastExiting(true);
    toastTimer.current = setTimeout(() => setToast(null), 220);
  }, []);

  useEffect(() => {
    if (toast && toast.type !== "loading") {
      toastTimer.current = setTimeout(dismissToast, 3000);
    }
    return () => clearTimeout(toastTimer.current);
  }, [toast, dismissToast]);

  const requireAuth = useCallback(() => {
    setAuthModalOpen(true);
    showToast("Please sign in first", "error");
  }, [showToast]);

  const {
    stage,
    pendingFile,
    resultData,
    isLoading,
    error,
    isSaved,
    setIsSaved,
    limitModalOpen,
    setLimitModalOpen,
    limitMessage,
    handleImagePasted,
    handleModeSelected,
    handleCancel,
    handleReset: resetWorkspace
  } = useImageProcessor(isAuthenticated, requireAuth, showToast);

  const handleReset = () => {
    if (resultData && !isSaved) {
      setDiscardModalOpen(true);
      return;
    }
    executeReset();
  };

  const handleNavClick = (dest, e) => {
    if (resultData && !isSaved) {
      e.preventDefault();
      setPendingNavDest(dest);
      setDiscardModalOpen(true);
    }
  };

  const executeReset = () => {
    resetWorkspace();
    setDiscardModalOpen(false);
    
    if (pendingNavDest) {
      window.location.href = pendingNavDest;
      setPendingNavDest(null);
    }
  };

  return (
    <>
      <Header onNavClick={handleNavClick} />
      {/* Background layers */}
      <div className="bg-smoke dark:opacity-100 opacity-50" aria-hidden="true" />
      <BackgroundCircuit />
      <div className="bg-grid dark:opacity-100 opacity-20" aria-hidden="true" />

      <main className="relative z-10 flex min-h-[calc(100vh-65px)] flex-col items-center justify-center gap-6 px-6 py-12 pb-32">
        {/* How it works */}
        {!resultData && (
          <div className="text-center">
            <HowItWorks />
          </div>
        )}

        {/* ── Stage: paste ── */}
        {stage === "paste" && (
          <div className="w-full max-w-2xl">
            <PasteZone
              onImagePasted={handleImagePasted}
              onError={(msg) => showToast(msg, "error")}
              disabled={false}
              isAuthenticated={isAuthenticated}
              onAuthRequired={requireAuth}
            />
          </div>
        )}

        {/* ── Stage: choose ── */}
        {stage === "choose" && (
          <div className="mt-10 flex w-full flex-col items-center gap-6">
            <ModeSelector 
              onSelect={handleModeSelected} 
              isDocument={pendingFile && !pendingFile.type.startsWith("image/")} 
            />
            {/* Back link */}
            <button
              onClick={handleReset}
              className="text-xs text-zinc-500 dark:text-zinc-600 transition-colors hover:text-zinc-900 dark:hover:text-zinc-400"
            >
              ← paste a different {pendingFile && !pendingFile.type.startsWith("image/") ? "document" : "image"}
            </button>
          </div>
        )}

        {/* ── Stage: result (loading or cards) ── */}
        {stage === "result" && (
          <>
            {isLoading && (
              <div className="mt-16 flex w-full max-w-md flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                  Generating your results...
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div className="h-full bg-accent shadow-[0_0_10px_rgba(196,245,110,0.5)] animate-progressFill" />
                </div>
                <button
                  onClick={handleCancel}
                  className="mt-2 text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Cancel processing
                </button>
              </div>
            )}

            {error && (
              <p className="mt-6 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            {!isLoading && resultData && (
              <div className="w-full max-w-5xl animate-flipIn">
                {!isSaved && ["PRO", "ADMIN"].includes(session?.user?.planTier) && (
                  <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 shadow-sm">
                    <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p>
                      <strong>Heads up:</strong> Your Auto-Save is currently turned <strong>OFF</strong>. Remember to manually save this to a folder before leaving!
                    </p>
                  </div>
                )}
                {resultData.mode === "flashcards" && (
                  <FlashcardGrid flashcards={resultData.flashcards} onReset={handleReset} onSaveClick={() => setSaveModalOpen(true)} />
                )}
                {resultData.mode === "excel" && (
                  <TableResult rows={resultData.rows} onReset={handleReset} onSaveClick={() => setSaveModalOpen(true)} />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Limit Reached Modal */}
      <LimitReachedModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        message={limitMessage}
      />

      {/* Save to Folder Modal */}
      {resultData && (
        <SaveToFolderModal
          isOpen={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          mode={resultData.mode}
          contentData={resultData.mode === "flashcards" ? resultData.flashcards : resultData.rows}
          onSaveSuccess={() => {
            setIsSaved(true);
            showToast("Saved to folder!", "success");
          }}
        />
      )}

      {/* Discard Warning Modal */}
      <DiscardWarningModal
        isOpen={discardModalOpen}
        onClose={() => {
          setDiscardModalOpen(false);
          setPendingNavDest(null);
        }}
        onConfirm={executeReset}
      />

      {/* Toast */}
      {toast && (
        <div className={toastExiting ? "toast toast-exit" : "toast"}>
          <div className="flex items-center gap-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 shadow-lg shadow-black/10 dark:shadow-black/40">
            {toast.type === "loading" && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400 shrink-0" />
            )}
            {toast.type === "success" && (
              <span className="text-emerald-400 shrink-0 text-xs">✓</span>
            )}
            {toast.type === "error" && (
              <span className="text-red-400 shrink-0 text-xs">✗</span>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
