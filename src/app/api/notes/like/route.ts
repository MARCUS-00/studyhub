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
    if (type !== "like" && type !== "dislike") {
      return NextResponse.json({ error: "Invalid type." }, { status: 400 });
    }

    const field = type === "like" ? "likes" : "dislikes";
    const userId = session.user.id;

    const note = await prisma.notes.findUnique({
      where: { id: noteId },
      select: { likes: true, dislikes: true },
    });
    if (!note) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    if (action === "remove") {
      await prisma.$transaction([
        prisma.note_likes.deleteMany({ where: { userId, noteId, type } }),
        prisma.notes.update({
          where: { id: noteId },
          data: { [field]: Math.max(0, (note[field] ?? 0) - 1) },
        }),
      ]);
    } else {
      // Prevent duplicate reaction of the same type
      const existing = await prisma.note_likes.findUnique({
        where: { userId_noteId_type: { userId, noteId, type } },
      });
      if (existing) {
        return NextResponse.json({ error: "Already reacted." }, { status: 409 });
      }
      await prisma.$transaction([
        prisma.note_likes.create({ data: { userId, noteId, type } }),
        prisma.notes.update({
          where: { id: noteId },
          data: { [field]: (note[field] ?? 0) + 1 },
        }),
      ]);
    }

    const updated = await prisma.notes.findUnique({
      where: { id: noteId },
      select: { likes: true, dislikes: true },
    });

    return NextResponse.json({ likes: updated?.likes, dislikes: updated?.dislikes });
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Already reacted." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
