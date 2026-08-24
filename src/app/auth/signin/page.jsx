"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BackgroundCircuit from "@/components/BackgroundCircuit";

// ── SVG icons ─────────────────────────────────────────
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



function EyeIcon({ open }) {
  return open ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ── Input component ────────────────────────────────────
function Input({ label, id, type = "text", value, onChange, placeholder, error, rightElement }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={id}
          className={`w-full rounded-xl border bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${error
              ? "border-red-700/70 focus:border-red-600"
              : "border-zinc-800 focus:border-zinc-600"
            } ${rightElement ? "pr-10" : ""}`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── Divider ────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div className="relative flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-800" />
      <span className="text-[10px] font-medium tracking-wider text-zinc-600 uppercase">{label}</span>
      <div className="h-px flex-1 bg-zinc-800" />
    </div>
  );
}

// ── Main content (must be inside Suspense due to useSearchParams) ─
function AuthContent() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  // Surface NextAuth OAuth errors (e.g. missing GOOGLE_CLIENT_ID)
  const oauthError = params.get("error");

  const [mode, setMode] = useState(initialMode); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(
    oauthError === "OAuthSignin" || oauthError === "OAuthCallback"
      ? "Google sign-in failed. Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env, then restart the dev server."
      : oauthError
      ? `Sign-in error: ${oauthError}`
      : ""
  );

  const validate = () => {
    const e = {};
    if (mode === "signup" && !name.trim()) e.name = "Name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address.";
    if (!password || password.length < 8)
      e.password = "Password must be at least 8 characters.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setGlobalError(data.error || "Sign up failed."); setLoading(false); return; }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setGlobalError("Incorrect email or password.");
        setLoading(false);
        return;
      }

      // Hard navigate so the browser re-fetches the session cookie from the server.
      // router.push() does a soft navigation and useSession may not pick up the
      // new database session without a full page reload.
      window.location.href = callbackUrl;
    } catch {
      setGlobalError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    // Always return to landing page after OAuth
    await signIn(provider, { callbackUrl: "/" });
  };

  const switchMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setErrors({});
    setGlobalError("");
  };

  const isSignIn = mode === "signin";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to app
        </Link>
      </div>

      {/* Wordmark */}
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/80 font-mono text-xs font-bold text-zinc-100 shadow-inner transition-all group-hover:border-zinc-600">
          ⌘V
        </span>
        <span className="font-semibold tracking-tight text-zinc-300 group-hover:text-zinc-100 transition-colors">
          Just CTRL + V
        </span>
      </Link>

      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Tab switcher */}
        <div className="mb-7 flex rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
          {["signin", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setErrors({}); setGlobalError(""); }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${mode === m
                  ? "bg-zinc-800 text-zinc-100 shadow"
                  : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {/* ── OAuth providers ───────────────────── */}
          <div className="space-y-2.5">
            <button
              onClick={() => handleOAuth("google")}
              disabled={!!oauthLoading}
              className="relative flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-700 bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-900 shadow-sm transition-all hover:bg-white hover:shadow-md active:scale-[0.98] disabled:opacity-60"
            >
              {oauthLoading === "google" ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

          </div>

          <Divider label="or continue with email" />

          {/* ── Email/password form ───────────────── */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {!isSignIn && (
              <Input
                id="name"
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Smith"
                error={errors.name}
              />
            )}
            <Input
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
            />
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignIn ? "Your password" : "Min. 8 characters"}
              error={errors.password}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPass} />
                </button>
              }
            />

            {globalError && (
              <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-xs text-red-400">
                {globalError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-900/40 transition-all hover:bg-indigo-500 hover:shadow-indigo-800/50 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-300 border-t-white" />
              ) : null}
              {isSignIn ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-[10px] text-zinc-600">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button onClick={switchMode} className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200 transition-colors">
              {isSignIn ? "Sign up for free" : "Sign in"}
            </button>
          </p>

          {!isSignIn && (
            <p className="text-center text-[10px] text-zinc-700">
              By creating an account you agree to our terms and privacy policy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page (wraps in Suspense for useSearchParams) ───────
export default function SignInPage() {
  return (
    <>
      {/* Shared Background Layers */}
      <div className="bg-smoke" aria-hidden="true" />
      <BackgroundCircuit />
      <div className="bg-grid" aria-hidden="true" />
      <div className="relative z-10">
        <Suspense fallback={<div />}>
          <AuthContent />
        </Suspense>
      </div>
    </>
  );
}
