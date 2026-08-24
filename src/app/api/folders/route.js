import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const folders = await prisma.folder.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({ folders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, mode } = await req.json();
    if (!name || !mode) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const folder = await prisma.folder.create({
      data: {
        userId: session.user.id,
        name,
        mode,
        contentJson: []
      }
    });

    return NextResponse.json({ folder });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
