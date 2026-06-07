"use client";
import NotesCard from "@/components/notesCard";
import { useAppSelector } from "@/store/index";
import { NotesSelector } from "@/store/notes.slice";
import { useMemo, useState } from "react";

export default function NotesPage() {
  const allNotes = useAppSelector(NotesSelector.selectAll);
  const [search, setSearch] = useState("");
  const [semFilter, setSemFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");

  const semesters = useMemo(
    () => Array.from(new Set(allNotes.map(n => n.sem_no).filter(Boolean))).sort(),
    [allNotes]
  );
  const subjects = useMemo(
    () => Array.from(new Set(allNotes.map(n => n.subjects?.sub_code).filter(Boolean))).sort(),
    [allNotes]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allNotes.filter(n => {
      const matchSearch = !q ||
        n.title?.toLowerCase().includes(q) ||
        n.subjects?.sub_name?.toLowerCase().includes(q);
      const matchSem = semFilter === "all" || n.sem_no === semFilter;
      const matchSub = subFilter === "all" || n.subjects?.sub_code === subFilter;
      return matchSearch && matchSem && matchSub;
    });
  }, [allNotes, search, semFilter, subFilter]);

  const hasFilter = search !== "" || semFilter !== "all" || subFilter !== "all";

  const inputCls = "rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald transition";

  return (
    <div className="p-8">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <input
          type="text"
          placeholder="Search notes or subjects…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`${inputCls} min-w-[200px] flex-1`}
        />
        <select value={semFilter} onChange={e => setSemFilter(e.target.value)} className={inputCls}>
          <option value="all">All Semesters</option>
          {semesters.map(s => <option key={s} value={s!}>Semester {s}</option>)}
        </select>
        <select value={subFilter} onChange={e => setSubFilter(e.target.value)} className={inputCls}>
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s} value={s!}>{s}</option>)}
        </select>
        {hasFilter && (
          <button
            onClick={() => { setSearch(""); setSemFilter("all"); setSubFilter("all"); }}
            className="text-sm text-muted hover:text-ink border border-forest/15 rounded-xl px-3 py-2 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-ink">All Notes</h2>
        <p className="text-sm text-muted">
          {filtered.length} of {allNotes.length} notes
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">🔍</span>
          <p className="text-muted text-sm">No notes match your filters.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
          {filtered.map(feed => (
            <NotesCard key={feed.id} feed={feed} />
          ))}
        </div>
      )}
    </div>
  );
}
