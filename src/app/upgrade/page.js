"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import BackgroundCircuit from "@/components/BackgroundCircuit";
import Link from "next/link";

export default function UpgradePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState(null);
  const [error, setError] = useState(null);

  const handleUpgrade = async (tier) => {
    if (status !== "authenticated") {
      router.push("/api/auth/signin");
      return;
    }
    
    setLoadingTier(tier);
    setError(null);

    try {
      // Pass the requested tier to the backend if you support multiple tiers
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create checkout");
      }
      const { url } = await res.json();
      window.open(url, "_blank");
      setLoadingTier(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to initiate checkout. Please try again.");
      setLoadingTier(null);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-smoke" aria-hidden="true" />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundCircuit />
      </div>
      <div className="bg-grid" aria-hidden="true" />

      <main className="relative z-10 flex min-h-[calc(100vh-65px)] flex-col items-center py-16 px-6">
        <div className="w-full max-w-5xl mb-8 flex flex-col items-center">
          <Link 
            href="/"
            className="fixed top-24 left-8 z-[100] inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            ← Back to Landing Page
          </Link>
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-base font-semibold leading-7 text-accent">Pricing</h1>
            <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              Supercharge your workflow.
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            Choose the plan that fits your needs. Upgrade anytime.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl items-stretch">
          {/* FREE TIER */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold leading-8 text-zinc-900 dark:text-white">Free</h3>
              <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                Perfect for getting started and casual use.
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">$0</span>
                <span className="text-sm font-semibold leading-6 text-zinc-500 dark:text-zinc-400">/mo</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span> 3 Images / day
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span> 1 Document / day
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span> Max 5MB file upload
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span> Create Study Folders
                </li>
                <li className="flex gap-x-3 text-zinc-400 dark:text-zinc-500">
                  <span className="font-bold">🔒</span> Locked: Folder Exports (Word & PNG)
                </li>
                <li className="flex gap-x-3 text-zinc-400 dark:text-zinc-500">
                  <span className="font-bold">🔒</span> Locked: Background Auto-Saves
                </li>
              </ul>
            </div>
            <button
              disabled
              className="mt-8 block w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-center text-sm font-semibold leading-6 text-zinc-400 dark:text-zinc-500 opacity-70 cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* PLUS TIER */}
          <div className="flex flex-col justify-between rounded-2xl border border-accent bg-accent/5 p-8 shadow-md relative transform scale-105 z-10">
            <div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent px-3 py-1 text-[10px] sm:text-xs font-semibold text-black uppercase tracking-widest whitespace-nowrap">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-accent mt-2">Plus</h3>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">$6.99</span>
                <span className="text-sm font-semibold leading-6 text-zinc-500 dark:text-zinc-400">/mo</span>
              </p>
              <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                Perfect for students and daily usage.
              </p>
              <ul className="mt-8 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span> 10 Images / day
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span> 5 Documents / day
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span> Max 10MB file upload
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span> Create Study Folders
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span> Unlimited Folder Exports (Word .docx & Image .png)
                </li>
                <li className="flex gap-x-3 text-zinc-400 dark:text-zinc-500">
                  <span className="font-bold">🔒</span> Locked: Background Auto-Saves
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade("PLUS")}
              disabled={loadingTier !== null}
              className="mt-8 block w-full rounded-lg bg-accent hover:bg-[#b0f56e] transition-colors px-3 py-2 text-center text-sm font-semibold leading-6 text-black"
            >
              {loadingTier === "PLUS" ? "Processing..." : "Upgrade to Plus"}
            </button>
          </div>

          {/* PRO TIER */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold leading-8 text-zinc-900 dark:text-white">Pro</h3>
              <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                For power users who need maximum limits.
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">$12.99</span>
                <span className="text-sm font-semibold leading-6 text-zinc-500 dark:text-zinc-400">/mo</span>
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>50 Images / day</span>
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>20 Files / day</span>
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Max 25MB file upload</span>
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Create Study Folders</span>
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Unlimited Folder Exports (Word .docx & Image .png)</span>
                </li>
                <li className="flex gap-x-3">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Automatic Background Auto-Saves</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade("PRO")}
              disabled={loadingTier === "PRO"}
              className="mt-8 block w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors px-3 py-2 text-center text-sm font-semibold leading-6 text-zinc-900 dark:text-white"
            >
              {loadingTier === "PRO" ? "Processing..." : "Upgrade to Pro"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
