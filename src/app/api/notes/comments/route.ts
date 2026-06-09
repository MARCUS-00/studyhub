import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET ?noteId= — returns comments for a note (author name + relative timestamp data)
export async function GET(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const noteId = new URL(req.url).searchParams.get("noteId");
  if (!noteId) return NextResponse.json({ error: "noteId required." }, { status: 400 });

  const comments = await prisma.note_comments.findMany({
    where: { noteId },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      text: true,
      created_at: true,
      User: { select: { first_name: true, last_name: true } },
    },
  });

  const payload = comments.map((c) => ({
    id: c.id,
    text: c.text,
    createdAt: c.created_at,
    authorName: c.User
      ? `${c.User.first_name} ${c.User.last_name}`.trim()
      : "Anonymous",
  }));

  return NextResponse.json(payload);
}

// POST { noteId, text } — create a comment; awards +2 points to the commenter
export async function POST(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { noteId, text } = await req.json();
    if (!noteId || !text?.trim())
      return NextResponse.json({ error: "noteId and text are required." }, { status: 400 });

    const userId = session.user.id;

    const [comment] = await prisma.$transaction([
      prisma.note_comments.create({
        data: { noteId, userId, text: text.trim() },
        select: { id: true, text: true, created_at: true },
      }),
      // Award +2 virtual points for posting a comment (Phase 6)
      prisma.user.update({
        where: { id: userId },
        data: { points: { increment: 2 } },
      }),
    ]);

    return NextResponse.json({
      id: comment.id,
      text: comment.text,
      createdAt: comment.created_at,
      authorName: session.user.name ?? "You",
    }, { status: 201 });
  } catch (err) {
    console.error("[notes/comments]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
