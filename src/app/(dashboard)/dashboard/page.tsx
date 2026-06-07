"use client";
import Test from "@/components/Test";
import NotesCard from "@/components/notesCard";
import { useAppSelector } from "@/store";
import { NotesSelector } from "@/store/notes.slice";
import { TestsSelector } from "@/store/tests.slice";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

  return (
    <div className="p-8 space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="text-muted text-sm mt-1">Here&apos;s what&apos;s available for you today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Notes", value: Notes.length, emoji: "📚" },
          { label: "Total Tests", value: Tests.length, emoji: "✏️" },
          { label: "Semester", value: "6", emoji: "🎓" },
          { label: "Department", value: "CSE", emoji: "💻" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-forest/8 shadow-card p-5 flex flex-col gap-1">
            <span className="text-2xl">{s.emoji}</span>
            <span className="font-display font-bold text-2xl text-ink">{s.value}</span>
            <span className="text-xs text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Recent Tests */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-ink">Recently Added Tests</h2>
          <Link href="/dashboard/attendTest" className="text-sm text-emerald font-semibold hover:underline">
            View all →
          </Link>
        </div>
        {Tests.length === 0 ? (
          <p className="text-muted text-sm">No tests available yet.</p>
        ) : (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
            {Tests.slice(0, 4).map(feed => (
              <Link key={feed.id} href={`/dashboard/attendTest/t/${feed.id}`}>
                <Test feed={feed} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Notes */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-ink">Recently Uploaded Notes</h2>
          <Link href="/dashboard/notes" className="text-sm text-emerald font-semibold hover:underline">
            View all →
          </Link>
        </div>
        {Notes.length === 0 ? (
          <p className="text-muted text-sm">No notes available yet.</p>
        ) : (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
            {Notes.slice(0, 4).map(feed => (
              <NotesCard key={feed.id} feed={feed} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
