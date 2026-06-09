import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET — STAFF only: all student submissions with student info
export async function GET(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (session.user.role !== "STAFF") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  try {
    const rows = await prisma.marks.findMany({
      select: {
        id: true,
        marks: true,
        tests: {
          select: {
            test_title: true,
            _count: { select: { questions: true } },
          },
        },
        User: {
          select: { first_name: true, last_name: true, mail_id: true },
        },
      },
    });

    const payload = rows.map((r) => ({
      id: r.id,
      marks: r.marks,
      testTitle: r.tests?.test_title ?? "Unknown",
      totalQuestions: r.tests?._count?.questions ?? 0,
      studentName: `${r.User?.first_name ?? ""} ${r.User?.last_name ?? ""}`.trim(),
      studentEmail: r.User?.mail_id ?? "",
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[tests/staff-results]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
