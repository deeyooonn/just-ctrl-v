import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import SavesClient from "@/components/SavesClient";
import BackgroundCircuit from "@/components/BackgroundCircuit";
import Header from "@/components/Header";

export const metadata = {
  title: "My Saves - Just CTRL + V",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SavesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/saves");
  }

  // Fetch folders and user tier
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { planTier: true },
  });

  const folders = await prisma.folder.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

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

        <div className="relative z-10 mx-auto max-w-5xl">
        <Link 
          href="/"
          className="mb-8 w-fit inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
        >
          ← Back to Landing Page
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          My Saves
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your study folders, merge contents, and export your flashcards and tables.
        </p>

        <div className="mt-10">
          <SavesClient initialFolders={folders} planTier={user?.planTier || "FREE"} />
        </div>
        </div>
      </div>
    </>
  );
}
