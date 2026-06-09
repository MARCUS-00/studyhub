import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET ?noteId= — returns all reviews + average rating for a note
export async function GET(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const noteId = new URL(req.url).searchParams.get("noteId");
  if (!noteId)
    return NextResponse.json({ error: "noteId required." }, { status: 400 });

  const reviews = await prisma.note_reviews.findMany({
    where: { noteId },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      userId: true,
      rating: true,
      text: true,
      created_at: true,
      User: { select: { first_name: true, last_name: true } },
    },
  });

  const userId = session.user.id;
  const userReview = reviews.find((review) => review.userId === userId);

  const avg =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10,
        ) / 10
      : null;

  return NextResponse.json({
    average: avg,
    count: reviews.length,
    userRating: userReview?.rating ?? null,
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text ?? null,
      createdAt: r.created_at,
      authorName: r.User
        ? `${r.User.first_name} ${r.User.last_name}`.trim()
        : "Anonymous",
    })),
  });
}

// POST { noteId, rating, text? } — upsert (one review per user per note)
export async function POST(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { noteId, rating, text } = await req.json();
    if (!noteId || rating == null)
      return NextResponse.json(
        { error: "noteId and rating are required." },
        { status: 400 },
      );
    if (rating < 1 || rating > 5)
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 },
      );

    const userId = session.user!.id;

    const review = await prisma.note_reviews.upsert({
      where: { userId_noteId: { userId, noteId } },
      update: { rating, text: text?.trim() ?? null },
      create: { userId, noteId, rating, text: text?.trim() ?? null },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("[notes/reviews]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
