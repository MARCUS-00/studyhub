"use client";
import Link from "next/link";
import moment from "moment";
import { useEffect, useState } from "react";
import { BsBookHalf } from "react-icons/bs";

interface SavedNote {
  id: string;
  title: string;
  unit_name: string;
  sem_no: string;
  branch_name: string;
  uploaded_date: string | null;
  likes: number;
  sub_code: string;
}

export default function SavedPage() {
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notes/saved")
      .then((r) => r.json())
      .then((data) => {
        setNotes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted text-sm">Loading saved notes…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-ink">Saved Notes</h2>
        <p className="text-sm text-muted mt-1">{notes.length} saved</p>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">🔖</span>
          <p className="text-muted text-sm">
            No saved notes yet. Tap the bookmark on any note to save it.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
          {notes.map((note) => (
            <Link key={note.id} href={`/dashboard/notes/v/${note.id}`}>
              <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-5 hover:shadow-card-hover transition-shadow cursor-pointer">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center flex-shrink-0">
                    <BsBookHalf className="text-emerald" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">
                      {note.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {note.unit_name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] font-medium bg-forest/8 text-forest rounded-full px-2 py-0.5">
                    Sem {note.sem_no}
                  </span>
                  <span className="text-[10px] font-medium bg-forest/8 text-forest rounded-full px-2 py-0.5">
                    {note.branch_name}
                  </span>
                  <span className="text-[10px] font-medium bg-emerald/10 text-emerald rounded-full px-2 py-0.5">
                    {note.sub_code}
                  </span>
                </div>
                {note.uploaded_date && (
                  <p className="text-[10px] text-muted">
                    {moment(note.uploaded_date).fromNow()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
