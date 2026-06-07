"use client";
import NotesCard from "@/components/notesCard";
import { useAppSelector } from "@/store";
import { NotesSelector } from "@/store/notes.slice";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { HiOutlinePlus } from "react-icons/hi";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardStaffPage() {
  const Notes = useAppSelector(NotesSelector.selectAll);
  const session = useSession();
  const firstName = session.data?.user?.name ?? "Staff";

  const sems = new Set(Notes.map(n => n.sem_no).filter(Boolean));

  return (
    <div className="p-8 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="text-muted text-sm mt-1">Manage your notes and tests from here.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Uploads", value: Notes.length, emoji: "📤" },
          { label: "Semesters Covered", value: sems.size, emoji: "🎓" },
          { label: "Department", value: "CSE", emoji: "💻" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-forest/8 shadow-card p-5 flex flex-col gap-1">
            <span className="text-2xl">{s.emoji}</span>
            <span className="font-display font-bold text-2xl text-ink">{s.value}</span>
            <span className="text-xs text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Upload CTA */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-ink">Your Uploads</h2>
        <Link
          href="/staffDashboard/new-notes"
          className="flex items-center gap-2 bg-forest text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-forest-lt transition-colors"
        >
          <HiOutlinePlus className="text-base" /> Upload Notes
        </Link>
      </div>

      {Notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">📭</span>
          <p className="text-muted text-sm">No notes uploaded yet.</p>
          <Link
            href="/staffDashboard/new-notes"
            className="bg-forest text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-forest-lt transition-colors"
          >
            Upload your first note
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
          {Notes.map(feed => (
            <NotesCard key={feed.id} feed={feed} isStaff />
          ))}
        </div>
      )}
    </div>
  );
}
