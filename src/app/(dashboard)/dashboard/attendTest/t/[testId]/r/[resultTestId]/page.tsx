"use client";
import { useAppSelector } from "@/store/index";
import { TestsSelector } from "@/store/tests.slice";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { SupaClient } from "@/utils/supabase";

type AnswerRow = { marks: number; userId: string | null };

function getMedal(pct: number) {
  if (pct >= 90) return "🏆";
  if (pct >= 70) return "🎯";
  if (pct >= 50) return "📚";
  return "💪";
}

async function fetchScore(testId: string, userId: string) {
  const { data } = await SupaClient.from("questions")
    .select("answers(marks,userId)")
    .eq("testsId", testId);
  if (!data) return { gain: 0, total: 0 };

  let gain = 0;
  for (const q of data) {
    const mine = (q.answers as AnswerRow[]).find((a) => a.userId === userId);
    gain += mine?.marks ?? 0;
  }
  return { gain, total: data.length };
}

export default function TestResultPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.resultTestId ?? "");
  const feed = useAppSelector((state) => TestsSelector.selectById(state, id));
  const session = useSession();
  const [gain, setGain] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const userId = session.data?.user?.id;
    if (!userId || !id) return;
    fetchScore(id, userId).then(({ gain: g, total: t }) => {
      setGain(g);
      setTotal(t);
    });
  }, [id, session.data?.user?.id]);

  const pct = total > 0 ? Math.round((gain / total) * 100) : 0;
  const circumference = 251;
  const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl border border-forest/8 shadow-card-hover p-12 w-full max-w-md text-center">
        <span className="text-6xl block mb-4">{getMedal(pct)}</span>

        <h1 className="font-display font-bold text-2xl text-ink mb-1">Test Complete!</h1>
        {feed && <p className="text-sm text-muted mb-8">{feed.test_title}</p>}

        {/* SVG Score Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="40" fill="none" stroke="#f3f3ef" strokeWidth="8" />
              <circle
                cx="45" cy="45" r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-2xl text-ink">{pct}%</span>
              <span className="text-xs text-muted">score</span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald/8 rounded-2xl p-4">
            <div className="font-display font-bold text-2xl text-emerald">{gain}</div>
            <div className="text-xs text-muted mt-0.5">Correct</div>
          </div>
          <div className="bg-red-50 rounded-2xl p-4">
            <div className="font-display font-bold text-2xl text-red-400">{total - gain}</div>
            <div className="text-xs text-muted mt-0.5">Incorrect</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.replace("/dashboard/testHistory")}
            className="flex-1 border border-forest/20 text-ink font-semibold py-3 rounded-xl hover:bg-forest/5 transition-colors text-sm"
          >
            View History
          </button>
          <button
            onClick={() => router.replace("/dashboard/attendTest")}
            className="flex-1 bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest-mid transition-colors text-sm"
          >
            More Tests
          </button>
        </div>
      </div>
    </div>
  );
}
