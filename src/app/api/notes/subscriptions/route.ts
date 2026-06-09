import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET — returns the subCodes the current user is subscribed to
export async function GET(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const rows = await prisma.subscriptions.findMany({
    where: { userId: session.user.id },
    select: { subCode: true },
  });

  return NextResponse.json(rows.map((r) => r.subCode));
}

// POST { subCode } — toggle subscription (subscribe if absent, unsubscribe if present)
export async function POST(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { subCode } = await req.json();
    if (!subCode) return NextResponse.json({ error: "subCode required." }, { status: 400 });

    const userId = session.user!.id;

    const existing = await prisma.subscriptions.findUnique({
      where: { userId_subCode: { userId, subCode } },
    });

    if (existing) {
      await prisma.subscriptions.delete({ where: { id: existing.id } });
      return NextResponse.json({ subscribed: false });
    }

    await prisma.subscriptions.create({ data: { userId, subCode } });
    return NextResponse.json({ subscribed: true });
  } catch (err) {
    console.error("[notes/subscriptions]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
