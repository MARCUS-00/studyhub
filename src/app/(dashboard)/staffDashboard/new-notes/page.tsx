"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineArrowLeft, AiOutlineCloudUpload } from "react-icons/ai";
import { SupaClient } from "@/utils/supabase";
import { useSession } from "next-auth/react";

const Subjects = [
  { value: "20CS21P", name: "Operating Systems" },
  { value: "20CS23P", name: "Software Engineering" },
  { value: "20CS24P", name: "Hardware" },
];

const inputCls =
  "block w-full rounded-xl border border-forest/15 py-2.5 px-4 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white";
const labelCls = "block text-sm font-medium text-ink mb-1";

export default function NewNotes() {
  const router = useRouter();
  const [state, setState] = useState({
    title: "",
    unitNo: "",
    unitName: "",
    semester: "",
    subjectName: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const session = useSession();

  const update = (key: string, value: string) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file.");
      return;
    }
    setLoading(true);
    try {
      // Upload PDF to Supabase Storage ("notes" bucket needs authenticated-upload policy).
      const { data: uploadData, error: uploadError } = await SupaClient.storage
        .from("notes")
        .upload(`f/${file.name}-${Date.now()}.pdf`, file);

      if (uploadError || !uploadData?.path) {
        toast.error("File upload failed.");
        return;
      }

      // Insert DB row server-side with the returned storage path.
      const res = await fetch("/api/notes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: state.title,
          fileUrl: uploadData.path,
          unitNo: state.unitNo,
          unitName: state.unitName,
          subCode: state.subjectName,
          semester: state.semester,
          branchName: session.data?.user
            ? (session.data.user as { branch_name?: string }).branch_name ??
              "CSE"
            : "CSE",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save note.");
        return;
      }

      toast.success("Notes uploaded successfully!");
      setState({
        title: "",
        unitNo: "",
        unitName: "",
        semester: "",
        subjectName: "",
      });
      setFile(null);
      router.push("/staffDashboard/notes");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white border border-forest/10 flex items-center justify-center hover:bg-forest/5 transition-colors"
        >
          <AiOutlineArrowLeft className="text-ink" />
        </button>
        <h1 className="font-display font-semibold text-ink">Upload Notes</h1>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl border border-forest/8 shadow-card p-8 space-y-5"
      >
        {/* File upload */}
        <div>
          <label className={labelCls}>PDF File *</label>
          <label
            className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors ${
              file
                ? "border-emerald bg-emerald/5"
                : "border-forest/20 hover:border-emerald/40 hover:bg-emerald/5"
            }`}
          >
            <AiOutlineCloudUpload
              className={`text-3xl ${file ? "text-emerald" : "text-muted"}`}
            />
            <span
              className={`text-sm font-medium ${
                file ? "text-emerald" : "text-muted"
              }`}
            >
              {file ? file.name : "Click to select a PDF file"}
            </span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className={labelCls}>
            Title *
          </label>
          <input
            id="title"
            required
            value={state.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. OS Week 1 Notes"
            className={inputCls}
          />
        </div>

        {/* Unit No + Unit Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="unitNo" className={labelCls}>
              Unit No *
            </label>
            <input
              id="unitNo"
              required
              value={state.unitNo}
              onChange={(e) => update("unitNo", e.target.value)}
              placeholder="e.g. 1"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="unitName" className={labelCls}>
              Unit Name *
            </label>
            <input
              id="unitName"
              required
              value={state.unitName}
              onChange={(e) => update("unitName", e.target.value)}
              placeholder="e.g. Process Management"
              className={inputCls}
            />
          </div>
        </div>

        {/* Semester + Subject */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="semester" className={labelCls}>
              Semester *
            </label>
            <select
              id="semester"
              required
              value={state.semester}
              onChange={(e) => update("semester", e.target.value)}
              className={inputCls}
            >
              <option value="">Select semester</option>
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <option key={s} value={String(s)}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subject" className={labelCls}>
              Subject *
            </label>
            <select
              id="subject"
              required
              value={state.subjectName}
              onChange={(e) => update("subjectName", e.target.value)}
              className={inputCls}
            >
              <option value="">Select subject</option>
              {Subjects.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest-mid transition-colors disabled:opacity-60"
        >
          <AiOutlineCloudUpload className="text-lg" />
          {loading ? "Uploading…" : "Upload Notes"}
        </button>
      </form>
    </div>
  );
}
