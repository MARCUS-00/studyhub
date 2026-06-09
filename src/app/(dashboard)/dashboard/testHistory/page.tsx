"use client";
import { useAppSelector } from "@/store/index";
import { TestsSelector } from "@/store/tests.slice";
import Link from "next/link";
import { useEffect, useState } from "react";
import Test from "@/components/Test";

interface HistoryRow {
  testId: string | null;
  marks: number;
  testTitle: string;
  totalQuestions: number;
}

export default function TestHistoryPage() {
  const allTests = useAppSelector(TestsSelector.selectAll);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [scoreMap, setScoreMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tests/history")
      .then((r) => r.json())
      .then((data: HistoryRow[]) => {
        const ids = new Set<string>();
        const scores: Record<string, number> = {};
        (data ?? []).forEach((row) => {
          if (row.testId) {
            ids.add(row.testId);
            scores[row.testId] = row.marks;
          }
        });
        setSubmittedIds(ids);
        setScoreMap(scores);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const attempted = allTests.filter((t) => submittedIds.has(t.id));

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted text-sm">Loading test history…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-ink">My Test History</h2>
        <p className="text-sm text-muted mt-1">
          {attempted.length} test{attempted.length === 1 ? "" : "s"} completed
        </p>
      </div>

      {attempted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">📋</span>
          <p className="text-muted text-sm">You have not completed any tests yet.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
          {attempted.map((feed) => (
            <Link key={feed.id} href={`/dashboard/testHistory/t/${feed.id}`}>
              <Test
                isViewTest
                feed={feed}
                score={scoreMap[feed.id]}
                totalQuestions={feed.questions.length}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
