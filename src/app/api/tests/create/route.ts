import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (session.user.role !== "STAFF") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  try {
    const body = await req.json();
    const { title, subCode, durationMinutes, instructions, questions } = body as {
      title: string;
      subCode: string;
      durationMinutes?: number | null;
      instructions?: string | null;
      questions: { question: string; choices: string[]; answerIdx: number; explanation?: string | null }[];
    };

    if (!title?.trim())
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (!Array.isArray(questions) || questions.length === 0)
      return NextResponse.json({ error: "At least one question is required." }, { status: 400 });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question?.trim())
        return NextResponse.json({ error: `Question ${i + 1} text is empty.` }, { status: 400 });
      if (!q.choices?.length || q.choices.some((c: string) => !c?.trim()))
        return NextResponse.json({ error: `All choices in question ${i + 1} must be filled.` }, { status: 400 });
      if (q.answerIdx < 0 || q.answerIdx >= q.choices.length)
        return NextResponse.json({ error: `Invalid answer index for question ${i + 1}.` }, { status: 400 });
    }

    const userId = session.user!.id;

    const test = await prisma.$transaction(async (tx) => {
      const newTest = await tx.tests.create({
        data: {
          test_title: title.trim(),
          subjectsSub_code: subCode || null,
          userId,
          duration_minutes: durationMinutes ?? null,
          instructions: instructions?.trim() || null,
        },
      });

      for (const q of questions) {
        await tx.questions.create({
          data: {
            question: q.question,
            choices: q.choices,
            answer: q.choices[q.answerIdx],
            testsId: newTest.id,
            explanation: q.explanation?.trim() || null,
          },
        });
      }

      return newTest;
    });

    return NextResponse.json({ testId: test.id }, { status: 201 });
  } catch (err) {
    console.error("[tests/create]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
