import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// GET ?testId= — returns questions with correct answers and the user's submitted answers.
// Used by the test-history detail page and the result page.
export async function GET(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const testId = new URL(req.url).searchParams.get("testId");
  if (!testId) return NextResponse.json({ error: "testId required." }, { status: 400 });

  try {
    const userId = session.user.id;

    const test = await prisma.tests.findUnique({
      where: { id: testId },
      select: { test_title: true },
    });
    if (!test) return NextResponse.json({ error: "Test not found." }, { status: 404 });

    const questions = await prisma.questions.findMany({
      where: { testsId: testId },
      select: {
        id: true,
        question: true,
        choices: true,
        answer: true,
        explanation: true,
        answers: {
          where: { userId },
          select: { answer: true },
          take: 1,
        },
      },
    });

    const payload = questions.map((q) => ({
      id: q.id,
      question: q.question,
      choices: q.choices,
      correctAnswer: q.answer,
      userAnswer: q.answers[0]?.answer ?? null,
      explanation: q.explanation ?? null,
    }));

    return NextResponse.json({ testTitle: test.test_title, questions: payload });
  } catch (err) {
    console.error("[tests/review]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
