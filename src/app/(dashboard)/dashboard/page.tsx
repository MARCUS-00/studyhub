"use client";
import Test from "@/components/Test";
import NotesCard from "@/components/notesCard";
import { useAppSelector } from "@/store";
import { NotesSelector } from "@/store/notes.slice";
import { TestsSelector } from "@/store/tests.slice";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RecNote {
  id: string;
  title: string;
  unit_name: string;
  sem_no: string;
  branch_name: string;
  sub_code: string;
}
interface RecTest {
  id: string;
  test_title: string;
  subjectsSub_code: string | null;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const Notes = useAppSelector(NotesSelector.selectAll);
  const Tests = useAppSelector(TestsSelector.selectAll);
  const session = useSession();
  const firstName = session.data?.user?.name ?? "Student";

  const [recs, setRecs] = useState<{
    notes: RecNote[];
    tests: RecTest[];
    semester?: string;
  }>({ notes: [], tests: [] });
  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then((d) => {
        if (d.notes) setRecs(d);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-8 space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="text-muted text-sm mt-1">
          Here&apos;s what&apos;s available for you today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Notes", value: Notes.length, emoji: "📚" },
          { label: "Total Tests", value: Tests.length, emoji: "✏️" },
          { label: "Branch", value: "CSE", emoji: "💻" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-forest/8 shadow-card p-5 flex flex-col gap-1"
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="font-display font-bold text-2xl text-ink">
              {s.value}
            </span>
            <span className="text-xs text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Recent Tests */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-ink">
            Recently Added Tests
          </h2>
          <Link
            href="/dashboard/attendTest"
            className="text-sm text-emerald font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>
        {Tests.length === 0 ? (
          <p className="text-muted text-sm">No tests available yet.</p>
        ) : (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
            {Tests.slice(0, 4).map((feed) => (
              <Link
                key={feed.id}
                href={`/dashboard/attendTest/t/${feed.id}`}
                prefetch={false}
              >
                <Test feed={feed} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Notes */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-ink">
            Recently Uploaded Notes
          </h2>
          <Link
            href="/dashboard/notes"
            className="text-sm text-emerald font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>
        {Notes.length === 0 ? (
          <p className="text-muted text-sm">No notes available yet.</p>
        ) : (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
            {Notes.slice(0, 4).map((feed) => (
              <NotesCard key={feed.id} feed={feed} />
            ))}
          </div>
        )}
      </section>

      {/* Recommended for You */}
      {(recs.notes.length > 0 || recs.tests.length > 0) && (
        <section>
          <div className="mb-5">
            <h2 className="font-display font-bold text-xl text-ink">
              Recommended for You
            </h2>
            <p className="text-xs text-muted mt-1">
              Based on your semester &amp; branch
            </p>
          </div>

          {recs.notes.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                Notes
              </p>
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                {recs.notes.map((n) => (
                  <Link
                    key={n.id}
                    href={`/dashboard/notes/v/${n.id}`}
                    prefetch={false}
                  >
                    <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <p className="font-semibold text-ink text-sm truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{n.unit_name}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        <span className="text-[10px] font-medium bg-forest/8 text-forest rounded-full px-2 py-0.5">
                          Sem {n.sem_no}
                        </span>
                        <span className="text-[10px] font-medium bg-emerald/10 text-emerald rounded-full px-2 py-0.5">
                          {n.sub_code}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {recs.tests.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                Tests
              </p>
              <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
                {recs.tests.map((t) => (
                  <Link
                    key={t.id}
                    href={`/dashboard/attendTest/t/${t.id}`}
                    prefetch={false}
                  >
                    <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <p className="font-semibold text-ink text-sm">
                        {t.test_title}
                      </p>
                      {t.subjectsSub_code && (
                        <span className="text-[10px] font-medium bg-emerald/10 text-emerald rounded-full px-2 py-0.5 mt-2 inline-block">
                          {t.subjectsSub_code}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
