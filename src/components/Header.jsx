"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";

function GoogleIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

// Avatar: shows Google profile photo or initials fallback
function Avatar({ user }) {
  if (user?.image) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={user.image}
        alt={user.name || "User avatar"}
        className="h-7 w-7 rounded-full border border-zinc-600 object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  const initials =
    (user?.name?.[0] || user?.email?.[0] || "?").toUpperCase();
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-gradient-to-br from-indigo-800 to-indigo-600 text-[11px] font-bold text-white">
      {initials}
    </div>
  );
}

function PlanPill({ tier }) {
  if (!tier || tier === "FREE") return null;
  return (
    <span className="rounded-full border border-indigo-700/50 bg-indigo-950/60 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-indigo-300">
      {tier}
    </span>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-8 w-8" />; // placeholder

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function Header({ onNavClick }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const isLoggedIn = status === "authenticated";
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 px-6 py-3.5 backdrop-blur-md">
      {/* Wordmark */}
      <Link href="/" onClick={(e) => onNavClick && onNavClick("/", e)} className="flex items-center gap-2 group">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 transition-all group-hover:border-zinc-300 dark:group-hover:border-zinc-600">
          ⌘V
        </span>
        <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-zinc-100 transition-colors text-sm sm:text-base">
          Just CTRL + V
        </span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Loading skeleton — prevents layout shift */}
        {isLoading && (
          <div className="h-7 w-7 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        )}

        {/* ── Signed-in state ─────────────────────────── */}
        {isLoggedIn && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1 transition-all hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              aria-label="Account menu"
              aria-expanded={open}
            >
              <Avatar user={session.user} />
              <span className="hidden max-w-[130px] truncate text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:inline">
                {session.user?.name || session.user?.email}
              </span>
              <PlanPill tier={session.user?.planTier} />
              <svg
                className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {open && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-2xl shadow-black/10 dark:shadow-black/60 backdrop-blur-xl">
                {/* User summary */}
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
                  <Avatar user={session.user} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {session.user?.name || "No name set"}
                    </p>
                    <p className="truncate text-[10px] text-zinc-500">{session.user?.email}</p>
                  </div>
                </div>

                {/* Nav links */}
                <div className="p-1.5">
                  <Link
                    href="/saves"
                    onClick={(e) => {
                      setOpen(false);
                      if (onNavClick) onNavClick("/saves", e);
                    }}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    My saves
                  </Link>
                  <Link
                    href="/account"
                    onClick={(e) => {
                      setOpen(false);
                      if (onNavClick) onNavClick("/account", e);
                    }}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My account
                  </Link>
                  <Link
                    href="/upgrade"
                    onClick={(e) => {
                      setOpen(false);
                      if (onNavClick) onNavClick("/upgrade", e);
                    }}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-accent transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-[0_0_15px_rgba(196,245,110,0.1)] animate-pulse"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Upgrade plan
                  </Link>

                  <div className="my-1.5 h-px bg-zinc-200 dark:bg-zinc-800" />

                  <button
                    onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Signed-out state ─────────────────────────── */}
        {!isLoading && !isLoggedIn && (
          <div className="flex items-center gap-2">
            <Link
              href="/auth/signin"
              onClick={(e) => onNavClick && onNavClick("/auth/signin", e)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Sign in
            </Link>
            <button
              onClick={(e) => {
                if (onNavClick) onNavClick("/auth/signin", e);
                if (!e.defaultPrevented) signIn("google", { callbackUrl: "/" });
              }}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <GoogleIcon />
              Get started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
