import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET ?testId= — check whether the current user has already submitted this test
export async function GET(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const testId = new URL(req.url).searchParams.get("testId");
  if (!testId) return NextResponse.json({ error: "testId required." }, { status: 400 });

  const mark = await prisma.marks.findFirst({
    where: { userId: session.user.id, testsId: testId },
    select: { marks: true },
  });

  if (!mark) return NextResponse.json({ submitted: false });

  const total = await prisma.questions.count({ where: { testsId: testId } });
  return NextResponse.json({ submitted: true, score: mark.marks, total });
}

// POST { testId, answers: { questionId: string; answer: string }[] }
// Scores server-side. The DB-level @@unique([userId, testsId]) on marks guards against
// race conditions — two simultaneous submissions hit P2002 and only one wins.
export async function POST(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { testId, answers } = (await req.json()) as {
      testId: string;
      answers: { questionId: string; answer: string }[];
    };

    if (!testId || !Array.isArray(answers))
      return NextResponse.json({ error: "testId and answers are required." }, { status: 400 });

    const userId = session.user.id;

    const questions = await prisma.questions.findMany({
      where: { testsId: testId },
      select: { id: true, answer: true },
    });
    if (questions.length === 0)
      return NextResponse.json({ error: "Test not found." }, { status: 404 });

    const correctMap = new Map(questions.map((q) => [q.id, q.answer]));

    let totalMarks = 0;
    const answerData = answers.map((a) => {
      const isCorrect = a.answer === (correctMap.get(a.questionId) ?? "");
      if (isCorrect) totalMarks++;
      return { answer: a.answer, questionsId: a.questionId, userId, marks: isCorrect ? 1 : 0 };
    });

    await prisma.$transaction([
      prisma.answers.createMany({ data: answerData }),
      prisma.marks.create({ data: { userId, testsId: testId, marks: totalMarks } }),
      prisma.user.update({ where: { id: userId }, data: { points: { increment: 10 } } }),
    ]);

    return NextResponse.json({ score: totalMarks, total: questions.length }, { status: 201 });
  } catch (err) {
    // P2002 = unique constraint violation — the marks row already exists,
    // meaning a concurrent request already committed a submission.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Already submitted.", alreadySubmitted: true }, { status: 409 });
    }
    console.error("[tests/submit]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
