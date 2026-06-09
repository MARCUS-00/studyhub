import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET — returns the current user's test submissions with scores
export async function GET(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const rows = await prisma.marks.findMany({
      where: { userId: session.user.id },
      select: {
        testsId: true,
        marks: true,
        tests: {
          select: {
            test_title: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });

    const payload = rows.map((r) => ({
      testId: r.testsId,
      marks: r.marks,
      testTitle: r.tests?.test_title ?? "Unknown",
      totalQuestions: r.tests?._count?.questions ?? 0,
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[tests/history]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
