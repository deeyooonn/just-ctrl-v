import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const folderId = (await params).id;
    
    const folder = await prisma.folder.findUnique({
      where: { id: folderId }
    });

    if (!folder || folder.userId !== session.user.id) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    if (!folder.previousContent) {
      return NextResponse.json({ error: "Nothing to undo" }, { status: 400 });
    }

    const updated = await prisma.folder.update({
      where: { id: folderId },
      data: {
        contentJson: folder.previousContent,
        previousContent: null // Can only undo once
      }
    });

    return NextResponse.json({ folder: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
