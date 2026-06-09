"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";

interface ReviewQuestion {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  userAnswer: string | null;
  explanation: string | null;
}

interface ReviewData {
  testTitle: string;
  questions: ReviewQuestion[];
}

export default function ViewTestHistoryPage() {
  const router = useRouter();
  const id = useParams().tid as string;
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tests/review?testId=${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex p-10 justify-center">
        <p className="text-muted text-sm">Loading review…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex p-10 justify-center">
        <p className="text-muted text-sm">Could not load review.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white border border-forest/10 flex items-center justify-center hover:bg-forest/5 transition-colors"
        >
          <AiOutlineArrowLeft className="text-ink" />
        </button>
        <h1 className="font-display font-semibold text-ink">{data.testTitle}</h1>
      </div>

      <div className="space-y-5">
        {data.questions.map((q, index) => {
          const isCorrect = q.userAnswer === q.correctAnswer;
          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-6 ${
                isCorrect ? "border-emerald/30" : "border-red-200"
              }`}
            >
              <h2 className="font-medium text-ink mb-4">
                <span className="text-muted font-normal mr-2">{index + 1}.</span>
                {q.question}
              </h2>
              <div className="grid sm:grid-cols-2 gap-2 mb-3">
                {q.choices.map((choice) => {
                  const isUser = q.userAnswer === choice;
                  const isAnswer = q.correctAnswer === choice;
                  let cls = "border-forest/10 bg-white";
                  if (isAnswer) cls = "border-emerald/50 bg-emerald/8 text-emerald-700";
                  else if (isUser && !isAnswer) cls = "border-red-300 bg-red-50 text-red-600";
                  return (
                    <div
                      key={choice}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${cls}`}
                    >
                      <span className="flex-1">{choice}</span>
                      {isAnswer && <span className="text-xs font-bold text-emerald">Correct</span>}
                      {isUser && !isAnswer && <span className="text-xs font-bold text-red-500">Your answer</span>}
                    </div>
                  );
                })}
              </div>
              {q.explanation && (
                <p className="text-xs text-muted mt-2 italic">
                  <span className="font-semibold text-ink">Explanation:</span> {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
