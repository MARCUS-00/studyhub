"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineArrowLeft, AiOutlineEdit, AiOutlineUser } from "react-icons/ai";

const POLICY_HINT = "Min 8 chars, one number, one special character.";

function validatePasswordClient(p: string): string | null {
  if (p.length < 8) return "Password must be at least 8 characters.";
  if (!/\d/.test(p)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(p)) return "Password must contain at least one special character.";
  return null;
}

const labelCls = "block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5";

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

  const [changingPw, setChangingPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });

  const inputCls = "w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald transition";

  const updateField = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const updatePwField = (k: string, v: string) => setPwForm(p => ({ ...p, [k]: v }));

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName }),
      });
      if (!res.ok) throw new Error("Profile update failed.");
      await updateSession();
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    const err = validatePasswordClient(pwForm.new);
    if (err) { toast.error(err); return; }
    if (pwForm.new !== pwForm.confirm) { toast.error("Passwords do not match."); return; }
    setPwSaving(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: pwForm.old, newPassword: pwForm.new }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully!");
        setChangingPw(false);
        setPwForm({ old: "", new: "", confirm: "" });
      } else {
        toast.error(data.error ?? "Failed to change password.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setPwSaving(false);
    }
  };

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
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-forest/30 text-white/80">STAFF</span>
        <h2 className="font-display font-bold text-xl text-white">{user?.name ?? "—"}</h2>
        <p className="text-sm text-white/60">{user?.email ?? "—"}</p>
      </div>

      {/* Personal info card */}
      <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-8 mb-5">
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
              <label htmlFor="staff-first-name" className={labelCls}>First Name</label>
              {editing
                ? <input id="staff-first-name" value={form.firstName} onChange={e => updateField("firstName", e.target.value)} className={inputCls} />
                : <p className="text-sm font-medium text-ink">{form.firstName || "—"}</p>}
            </div>
            <div>
              <label htmlFor="staff-last-name" className={labelCls}>Last Name</label>
              {editing
                ? <input id="staff-last-name" value={form.lastName} onChange={e => updateField("lastName", e.target.value)} className={inputCls} />
                : <p className="text-sm font-medium text-ink">{form.lastName || "—"}</p>}
            </div>
          </div>

          {/* Email is read-only — no associated input, so styled as a plain paragraph */}
          <div>
            <p className={labelCls}>Email</p>
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
      </div>

      {/* Change password card */}
      <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-ink text-sm">Change Password</h3>
          {!changingPw && (
            <button onClick={() => setChangingPw(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-emerald transition-colors">
              <AiOutlineEdit /> Change
            </button>
          )}
        </div>

        {changingPw ? (
          <div className="space-y-3">
            <p className="text-xs text-muted">{POLICY_HINT}</p>
            <div>
              <label htmlFor="staff-pw-old" className={labelCls}>Current Password</label>
              <input id="staff-pw-old" type="password" value={pwForm.old} onChange={e => updatePwField("old", e.target.value)}
                placeholder="Enter current password" className={inputCls} />
            </div>
            <div>
              <label htmlFor="staff-pw-new" className={labelCls}>New Password</label>
              <input id="staff-pw-new" type="password" value={pwForm.new} onChange={e => updatePwField("new", e.target.value)}
                placeholder="Min 8 chars, number, special char" className={inputCls} />
            </div>
            <div>
              <label htmlFor="staff-pw-confirm" className={labelCls}>Confirm New Password</label>
              <input id="staff-pw-confirm" type="password" value={pwForm.confirm} onChange={e => updatePwField("confirm", e.target.value)}
                placeholder="Re-enter new password" className={inputCls} />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={onChangePassword} disabled={pwSaving}
                className="flex-1 py-2.5 bg-forest text-white font-semibold rounded-xl hover:bg-forest-lt disabled:opacity-60 transition-colors text-sm">
                {pwSaving ? "Saving…" : "Update Password"}
              </button>
              <button onClick={() => { setChangingPw(false); setPwForm({ old: "", new: "", confirm: "" }); }}
                className="flex-1 py-2.5 border border-forest/20 text-ink font-semibold rounded-xl hover:bg-forest/5 transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Click Change to update your account password.</p>
        )}
      </div>
    </div>
  );
}
