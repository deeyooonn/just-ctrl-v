import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

const LIMITS = {
  FREE: { images: 3, files: 1 },
  PLUS: { images: 10, files: 5 },
  PRO:  { images: 50, files: 20 },
  ADMIN: { images: 999999, files: 999999 },
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      planTier: true,
      dailyImagesUsed: true,
      dailyFilesUsed: true,
      usageResetAt: true,
      autoSaveEnabled: true,
      createdAt: true,
      _count: { select: { conversions: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const tier = user.planTier || "FREE";
  const limits = LIMITS[tier] ?? LIMITS.FREE;

  // Next reset = next 00:00 UTC
  const now = new Date();
  const nextReset = new Date();
  nextReset.setUTCHours(24, 0, 0, 0); // midnight tonight UTC

  // Conversions created today (since 00:00 UTC)
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const todayCount = await prisma.conversion.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: startOfDay },
    },
  });

  return NextResponse.json({
    total: user._count.conversions,
    today: todayCount,
    dailyImagesUsed: user.dailyImagesUsed ?? 0,
    dailyFilesUsed: user.dailyFilesUsed ?? 0,
    imagesLimit: limits.images,
    filesLimit: limits.files,
    planTier: tier,
    autoSaveEnabled: user.autoSaveEnabled ?? true,
    createdAt: user.createdAt,
    resetAt: nextReset.toISOString(), // always next 00:00 UTC
  });
}
