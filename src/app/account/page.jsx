"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackgroundCircuit from "@/components/BackgroundCircuit";
import Header from "@/components/Header";

// ── Helper components ──────────────────────────────────

function Avatar({ user, size = "lg" }) {
  const dim =
    size === "lg"
      ? "h-16 w-16 text-xl"
      : size === "md"
      ? "h-10 w-10 text-sm"
      : "h-7 w-7 text-xs";

  if (user?.image) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={user.image}
        alt={user.name || "User avatar"}
        className={`${dim} rounded-full border-2 border-zinc-700 object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }
  const initial = (user?.name?.[0] || user?.email?.[0] || "?").toUpperCase();
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full border-2 border-zinc-700 bg-gradient-to-br from-indigo-800 to-indigo-600 font-bold text-white`}
    >
      {initial}
    </div>
  );
}

function PlanBadge({ tier }) {
  const styles = {
    FREE: "border-zinc-700 bg-zinc-800/80 text-zinc-400",
    PLUS: "border-indigo-700/60 bg-indigo-950/60 text-indigo-300",
    PRO: "border-amber-700/60 bg-amber-950/60 text-amber-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${
        styles[tier] || styles.FREE
      }`}
    >
      {tier || "FREE"}
    </span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-zinc-400">{label}</p>
      {sub && <p className="mt-1 text-[10px] text-zinc-600">{sub}</p>}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [conversions, setConversions] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch basic conversion count
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setConversions(d);
          setAutoSaveEnabled(d.autoSaveEnabled ?? true);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [status]);

  // Loading state
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
      </div>
    );
  }

  const user = session.user;
  const joinedDateRaw = conversions?.createdAt || session.user?.createdAt;
  const joinedDate = joinedDateRaw
    ? new Date(joinedDateRaw).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setNameError("Name cannot be empty.");
      return;
    }
    setNameSaving(true);
    setNameError("");
    try {
      const res = await fetch("/api/account/update-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNameError(data.error || "Failed to update name.");
      } else {
        await update({ name: newName.trim() });
        setIsEditingName(false);
      }
    } catch {
      setNameError("Something went wrong.");
    }
    setNameSaving(false);
  };

  const toggleAutoSave = async () => {
    const newVal = !autoSaveEnabled;
    setAutoSaveEnabled(newVal); // Optimistic UI update
    try {
      await fetch("/api/account/auto-save", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newVal }),
      });
    } catch (err) {
      console.error(err);
      setAutoSaveEnabled(!newVal); // revert on error
    }
  };

  return (
    <>
      <Header />
      <div className="relative min-h-[calc(100vh-65px)] bg-zinc-50 dark:bg-zinc-950 px-6 py-12 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-smoke dark:opacity-100 opacity-50 z-0 pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <BackgroundCircuit />
        </div>
        <div className="absolute inset-0 bg-grid dark:opacity-100 opacity-20 z-0 pointer-events-none" aria-hidden="true" />
        
        <div className="relative z-10 min-h-full">
          <main className="mx-auto max-w-2xl space-y-5">
            <Link 
              href="/"
              className="mb-8 w-fit inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
            >
              ← Back to Landing Page
            </Link>
        {/* ── Profile card ──────────────────────────── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center gap-4">
            <Avatar user={user} size="lg" />
            <div className="min-w-0 flex-1">
              {isEditingName ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Your name"
                    className="w-full max-w-[200px] rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={nameSaving}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
                    >
                      {nameSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNameError("");
                      }}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="truncate text-lg font-bold text-zinc-100">
                    {user.name || "No name set"}
                  </h1>
                  <button
                    onClick={() => {
                      setNewName(user.name || "");
                      setIsEditingName(true);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    Edit
                  </button>
                </div>
              )}
              {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}

              <p className="truncate text-sm text-zinc-400 mt-0.5">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <PlanBadge tier={user.planTier || "FREE"} />
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-red-900/60 hover:bg-red-950/20 hover:text-red-400"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* ── Daily Usage Limits ────────────────────── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Daily Usage Limits
            </h2>
            <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
              Resets daily at exactly 00:00 UTC
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              label="Images used today"
              value={loadingStats ? "—" : conversions?.dailyImagesUsed ?? 0}
              sub={`of ${loadingStats ? "—" : conversions?.imagesLimit ?? 3} limit`}
            />
            <StatCard
              label="Files used today"
              value={loadingStats ? "—" : conversions?.dailyFilesUsed ?? 0}
              sub={`of ${loadingStats ? "—" : conversions?.filesLimit ?? 1} limit`}
            />
          </div>

          <p className="text-xs text-zinc-500 text-center">
            You can convert up to <strong className="text-zinc-300">{loadingStats ? "—" : conversions?.imagesLimit ?? 3} images</strong> OR <strong className="text-zinc-300">{loadingStats ? "—" : conversions?.filesLimit ?? 1} file</strong> per day on your current plan.
          </p>
        </div>

        {/* ── Total Stats ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Conversions today"
            value={loadingStats ? "—" : conversions?.today ?? 0}
          />
          <StatCard
            label="Total conversions ever"
            value={loadingStats ? "—" : conversions?.total ?? 0}
          />
        </div>

        {/* ── Account Details ──────────────────────── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Account Details
          </h2>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b border-zinc-800/60">
              <span className="text-xs font-medium text-zinc-500">Email address</span>
              <span className="text-xs font-semibold text-zinc-200">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-zinc-800/60">
              <span className="text-xs font-medium text-zinc-500">Member since</span>
              <span className="text-xs font-semibold text-zinc-200">{joinedDate}</span>
            </div>
          </div>
        </div>

        {/* ── Preferences ──────────────────────────── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Preferences
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-200">Auto-Save Generated Content</span>
                {!["PRO", "ADMIN"].includes(user.planTier) && (
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500 border border-amber-500/20">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Automatically save flashcards and tables to a background folder.</p>
            </div>
            
            {["PRO", "ADMIN"].includes(user.planTier) ? (
              <button
                onClick={toggleAutoSave}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${autoSaveEnabled ? "bg-indigo-600" : "bg-zinc-700"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSaveEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            ) : (
              <Link
                href="/upgrade"
                className="shrink-0 flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                <span className="text-amber-500">🔒</span>
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {["PRO", "PLUS"].includes(user.planTier) ? (
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/lemonsqueezy/portal", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.open(data.url, "_blank");
                } catch (e) {
                  console.error(e);
                }
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-indigo-800/40 bg-indigo-950/30 px-4 py-3.5 text-xs font-semibold text-indigo-300 transition-all hover:border-indigo-700/60 hover:bg-indigo-900/30"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Subscription
            </button>
          ) : (
            <Link
              href="/upgrade"
              className="flex items-center justify-center gap-2 rounded-2xl border border-indigo-800/40 bg-indigo-950/30 px-4 py-3.5 text-xs font-semibold text-indigo-300 transition-all hover:border-indigo-700/60 hover:bg-indigo-900/30"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Upgrade plan
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3.5 text-xs font-semibold text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            New conversion
          </Link>
        </div>
          </main>
        </div>
      </div>
    </>
  );
}
