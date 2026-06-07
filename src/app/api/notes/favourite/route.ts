import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST { noteId } — toggle save/unsave; returns { saved: boolean }
export async function POST(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { noteId } = await req.json();
    if (!noteId) {
      return NextResponse.json({ error: "noteId is required." }, { status: 400 });
    }

    const userId = session.user.id;

    const existing = await prisma.favourites.findUnique({
      where: { usersId_notes_id: { usersId: userId, notes_id: noteId } },
    });

    if (existing) {
      await prisma.favourites.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }

    await prisma.favourites.create({ data: { usersId: userId, notes_id: noteId } });
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// GET ?noteId=… — returns { saved: boolean } for the current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get("noteId");
  if (!noteId) {
    return NextResponse.json({ error: "noteId is required." }, { status: 400 });
  }

  const existing = await prisma.favourites.findUnique({
    where: { usersId_notes_id: { usersId: session.user.id, notes_id: noteId } },
  });

  return NextResponse.json({ saved: !!existing });
}
