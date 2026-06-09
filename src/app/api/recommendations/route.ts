import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET — heuristic recommendations: notes and tests matching the user's branch + semester.
// This is a simple filter heuristic, not ML — the label in the UI makes that clear.
export async function GET(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { branch_name: true, sem_no: true },
    });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const [notes, tests] = await Promise.all([
      prisma.notes.findMany({
        where: { branch_name: user.branch_name, sem_no: user.sem_no },
        take: 6,
        orderBy: { uploaded_date: "desc" },
        select: {
          id: true,
          title: true,
          unit_name: true,
          sem_no: true,
          branch_name: true,
          uploaded_date: true,
          likes: true,
          sub_code: true,
        },
      }),
      prisma.tests.findMany({
        where: { subjects: { sem_no: user.sem_no } },
        take: 4,
        select: {
          id: true,
          test_title: true,
          subjectsSub_code: true,
        },
      }),
    ]);

    return NextResponse.json({ notes, tests, branch: user.branch_name, semester: user.sem_no });
  } catch (err) {
    console.error("[recommendations]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
