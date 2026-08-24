"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}



export default function AuthModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleOAuth = (provider) => {
    onClose();
    signIn(provider, { callbackUrl: "/" });
  };

  const goToAuth = (mode = "signin") => {
    onClose();
    router.push(`/auth/signin?mode=${mode}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-600 transition-colors hover:text-zinc-300"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 font-mono text-xs font-bold text-zinc-100 mb-3.5 shadow-inner">
            ⌘V
          </div>

          <h3 className="text-base font-semibold tracking-tight text-zinc-100">
            Sign in to continue
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Convert screenshots and save your history.
          </p>

          {/* Fast OAuth */}
          <div className="mt-5 flex w-full flex-col gap-2">
            <button
              onClick={() => handleOAuth("google")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-900 transition-all hover:bg-white active:scale-[0.98]"
            >
              <GoogleIcon /> Continue with Google
            </button>

          </div>

          {/* Divider */}
          <div className="my-4 flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] uppercase tracking-wider text-zinc-600">or</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Email options */}
          <div className="flex w-full flex-col gap-2">
            <button
              onClick={() => goToAuth("signin")}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-2.5 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 active:scale-[0.98]"
            >
              Sign in with email
            </button>
            <button
              onClick={() => goToAuth("signup")}
              className="w-full rounded-xl border border-indigo-800/40 bg-indigo-950/40 px-4 py-2.5 text-xs font-medium text-indigo-300 transition-all hover:border-indigo-700/60 hover:bg-indigo-900/40 active:scale-[0.98]"
            >
              Create account for free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
