import { useState, useRef, useCallback } from "react";

export function useImageProcessor(isAuthenticated, requireAuth, showToast) {
  const [stage, setStage] = useState("paste"); // "paste" | "choose" | "result"
  const [pendingFile, setPendingFile] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  const abortControllerRef = useRef(null);

  const handleImagePasted = useCallback((file) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    setPendingFile(file);
    setStage("choose");
    showToast("File received — choose your output", "success");
  }, [isAuthenticated, requireAuth, showToast]);

  const handleModeSelected = useCallback(async (mode) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    if (!pendingFile) return;

    setIsLoading(true);
    setError(null);
    setStage("result");
    showToast("Generating…", "loading");

    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("file", pendingFile);
      // Give fallback media type just in case
      let fileType = pendingFile.type;
      if (!fileType && pendingFile.name?.endsWith('.md')) {
        fileType = 'text/markdown';
      }
      formData.append("mediaType", fileType || "application/octet-stream");
      formData.append("mode", mode);

      const res = await fetch("/api/process-image", {
        method: "POST",
        body: formData, // Sending FormData instead of JSON Base64
        signal: abortControllerRef.current.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResultData(data);
      setIsSaved(data.autoSaved === true);
      showToast("✓ Done", "success");
    } catch (err) {
      if (err.name === "AbortError") {
        showToast("Processing cancelled", "success");
        setStage("paste");
        setPendingFile(null);
        return;
      }

      if (err.message.toLowerCase().includes("limit reached")) {
        setLimitMessage(err.message);
        setLimitModalOpen(true);
        setStage("paste");
        setPendingFile(null);
      } else {
        setError(err.message);
        const isDoc = pendingFile.type && !pendingFile.type.startsWith("image/");
        showToast(
          isDoc ? `✗ Couldn't process that document: ${err.message}` : `✗ Couldn't process that image: ${err.message}`,
          "error"
        );
        setPendingFile(null);
        setStage("paste");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isAuthenticated, pendingFile, requireAuth, showToast]);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleReset = useCallback(() => {
    setResultData(null);
    setPendingFile(null);
    setError(null);
    setIsSaved(false);
    setStage("paste");
  }, []);

  return {
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
    handleReset,
  };
}
