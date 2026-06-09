"use client";
import NotesCard from "@/components/notesCard";
import { useAppSelector } from "@/store/index";
import { NotesSelector, getNotes } from "@/store/notes.slice";
import { useAppDispatch } from "@/utils/hooks";
import Link from "next/link";
import { useEffect } from "react";
import { SlNote } from "react-icons/sl";

export default function NotesPage() {
  const dispatch = useAppDispatch();
  const Notes = useAppSelector(NotesSelector.selectAll);

  useEffect(() => {
    if (Notes.length === 0) dispatch(getNotes());
  }, [Notes.length, dispatch]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">All Notes</h2>
          <p className="text-sm text-muted mt-1">
            {Notes.length} notes available
          </p>
        </div>
        <Link
          href="/staffDashboard/new-notes"
          prefetch={false}
          className="flex items-center gap-2 bg-forest text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-forest-mid transition-colors"
        >
          <SlNote className="text-base" /> New Notes
        </Link>
      </div>
      {Notes.length === 0 ? (
        <p className="text-muted text-sm">No notes uploaded yet.</p>
      ) : (
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
          {Notes.map((feed) => (
            <NotesCard isStaff key={feed.id} feed={feed} />
          ))}
        </div>
      )}
    </div>
  );
}
