"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineArrowLeft, AiOutlineEdit, AiOutlineUser } from "react-icons/ai";
import Link from "next/link";

export default function StaffProfilePage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ")[1] ?? "",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName }),
      });
      if (!res.ok) throw new Error();
      await updateSession();
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald transition";

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white border border-forest/10 flex items-center justify-center hover:bg-forest/5 transition-colors">
          <AiOutlineArrowLeft className="text-ink" />
        </button>
        <h1 className="font-display font-semibold text-ink">My Profile</h1>
      </div>

      {/* Header band */}
      <div className="bg-forest rounded-2xl p-8 mb-6 flex flex-col items-center gap-3 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald/20 flex items-center justify-center">
          <AiOutlineUser className="text-4xl text-emerald-lt" />
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-forest/30 text-white/80">
          STAFF
        </span>
        <h2 className="font-display font-bold text-xl text-white">{user?.name ?? "—"}</h2>
        <p className="text-sm text-white/60">{user?.email ?? "—"}</p>
      </div>

      {/* Edit card */}
      <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-ink text-sm">Personal Information</h3>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-emerald transition-colors">
              <AiOutlineEdit /> Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">First Name</label>
              {editing ? (
                <input value={form.firstName} onChange={e => update("firstName", e.target.value)} className={inputCls} />
              ) : (
                <p className="text-sm font-medium text-ink">{form.firstName || "—"}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Last Name</label>
              {editing ? (
                <input value={form.lastName} onChange={e => update("lastName", e.target.value)} className={inputCls} />
              ) : (
                <p className="text-sm font-medium text-ink">{form.lastName || "—"}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Email</label>
            <p className="text-sm text-muted">{user?.email ?? "—"}</p>
          </div>
        </div>

        {editing && (
          <div className="flex gap-3 mt-6">
            <button onClick={onSave} disabled={saving}
              className="flex-1 py-2.5 bg-forest text-white font-semibold rounded-xl hover:bg-forest-lt disabled:opacity-60 transition-colors text-sm">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button onClick={() => setEditing(false)}
              className="flex-1 py-2.5 border border-forest/20 text-ink font-semibold rounded-xl hover:bg-forest/5 transition-colors text-sm">
              Cancel
            </button>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-forest/5">
          <Link href="/forgot-password" className="text-sm text-muted hover:text-forest transition-colors">
            Change password →
          </Link>
        </div>
      </div>
    </div>
  );
}
