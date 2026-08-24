import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { enabled } = await req.json();

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { autoSaveEnabled: enabled },
    });

    return NextResponse.json({ autoSaveEnabled: user.autoSaveEnabled });
  } catch (err) {
    console.error("Auto-Save Toggle Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
