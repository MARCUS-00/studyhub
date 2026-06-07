import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { noteId, type, action } = await req.json();
    if (!noteId || !type || !action) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const field = type === "like" ? "likes" : "dislikes";
    const delta = action === "remove" ? -1 : 1;

    const note = await prisma.notes.findUnique({
      where: { id: noteId },
      select: { likes: true, dislikes: true },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const current = note[field] ?? 0;
    const next = Math.max(0, current + delta);

    const updated = await prisma.notes.update({
      where: { id: noteId },
      data: { [field]: next },
      select: { likes: true, dislikes: true },
    });

    return NextResponse.json({ likes: updated.likes, dislikes: updated.dislikes });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
