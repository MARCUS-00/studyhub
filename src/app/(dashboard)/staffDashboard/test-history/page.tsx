"use client";
import { SupaClient } from "@/utils/supabase";
import { useEffect, useMemo, useState } from "react";

interface ResultRow {
  id: string;
  marks: number;
  testTitle: string;
  totalQuestions: number;
  studentName: string;
  studentEmail: string;
}

export default function TestHistoryPage() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [testFilter, setTestFilter] = useState("all");

  useEffect(() => {
    SupaClient.from("marks")
      .select("id,marks,testsId,userId,tests(test_title,questions(id)),User(first_name,last_name,mail_id)")
      .then(({ data }) => {
        if (!data) return;
        const rows: ResultRow[] = data.map((r: any) => ({
          id: r.id,
          marks: r.marks ?? 0,
          testTitle: r.tests?.test_title ?? "Unknown",
          totalQuestions: r.tests?.questions?.length ?? 0,
          studentName: `${r.User?.first_name ?? ""} ${r.User?.last_name ?? ""}`.trim(),
          studentEmail: r.User?.mail_id ?? "",
        }));
        setResults(rows);
        setLoading(false);
      });
  }, []);

  const testTitles = useMemo(
    () => Array.from(new Set(results.map(r => r.testTitle))).sort(),
    [results]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return results.filter(r => {
      const matchSearch = !q ||
        r.studentName.toLowerCase().includes(q) ||
        r.studentEmail.toLowerCase().includes(q);
      const matchTest = testFilter === "all" || r.testTitle === testFilter;
      return matchSearch && matchTest;
    });
  }, [results, search, testFilter]);

  const inputCls = "rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald transition";

  const pctColor = (pct: number) => {
    if (pct >= 60) return "bg-emerald";
    if (pct >= 40) return "bg-amber-400";
    return "bg-red-400";
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted text-sm">Loading results…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by student name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`${inputCls} min-w-[220px] flex-1`}
        />
        <select value={testFilter} onChange={e => setTestFilter(e.target.value)} className={inputCls}>
          <option value="all">All Tests</option>
          {testTitles.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(search || testFilter !== "all") && (
          <button onClick={() => { setSearch(""); setTestFilter("all"); }}
            className="text-sm text-muted hover:text-ink border border-forest/15 rounded-xl px-3 py-2 transition-colors">
            Reset
          </button>
        )}
      </div>

      <div className="mb-4">
        <h2 className="font-display font-bold text-xl text-ink">Student Results</h2>
        <p className="text-sm text-muted mt-1">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">📊</span>
          <p className="text-muted text-sm">No results found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-forest/8 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest/8 bg-cream">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Test</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Score</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5">
              {filtered.map(r => {
                const pct = r.totalQuestions > 0 ? Math.round((r.marks / r.totalQuestions) * 100) : 0;
                return (
                  <tr key={r.id} className="hover:bg-cream transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{r.studentName || "—"}</p>
                      <p className="text-xs text-muted mt-0.5">{r.studentEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-ink">{r.testTitle}</td>
                    <td className="px-5 py-4 font-medium text-ink">{r.marks} / {r.totalQuestions}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-cream-dk overflow-hidden">
                          <div className={`h-full rounded-full ${pctColor(pct)}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-ink">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
