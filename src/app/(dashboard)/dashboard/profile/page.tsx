"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineArrowLeft, AiOutlineEdit, AiOutlineUser } from "react-icons/ai";
import { SupaClient } from "@/utils/supabase";

const POLICY_HINT = "Min 8 chars, one number, one special character.";

function validatePasswordClient(p: string): string | null {
  if (p.length < 8) return "Password must be at least 8 characters.";
  if (!/\d/.test(p)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(p)) return "Password must contain at least one special character.";
  return null;
}

const labelCls = "block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.image ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ")[1] ?? "",
    branch: "CSE",
    semNo: "6",
    mobileNo: "",
  });

  const [points, setPoints] = useState<number | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [changingPw, setChangingPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });

  const inputCls = "w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald transition";

  // Load user details (reg_no, mobile_no, points, skills)
  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(d => {
        if (d.mobileNo) setForm(p => ({ ...p, mobileNo: d.mobileNo }));
        if (typeof d.points === "number") setPoints(d.points);
        if (Array.isArray(d.skills)) setSkills(d.skills);
      })
      .catch(() => undefined);
  }, []);

  const updateField = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const updatePwField = (k: string, v: string) => setPwForm(p => ({ ...p, [k]: v }));

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setAvatarUploading(true);
    try {
      // Requires an "avatars" bucket in Supabase Storage with an authenticated-user upload policy
      const path = `${user.id}/${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await SupaClient.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) { toast.error("Upload failed."); return; }
      const { data: { publicUrl } } = SupaClient.storage.from("avatars").getPublicUrl(path);
      await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profImage: publicUrl }),
      });
      setAvatarUrl(publicUrl);
      await updateSession();
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          branchName: form.branch,
          semNo: form.semNo,
          mobileNo: form.mobileNo || undefined,
        }),
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
        {/* Avatar with upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarUploading}
          className="relative w-20 h-20 rounded-full bg-emerald/20 flex items-center justify-center group overflow-hidden"
          title="Change profile picture"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <AiOutlineUser className="text-4xl text-emerald-lt" />
          )}
          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold rounded-full">
            {avatarUploading ? "…" : "Edit"}
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-forest/30 text-white/80">
          {user?.role ?? "STUDENT"}
        </span>
        <h2 className="font-display font-bold text-xl text-white">{user?.name ?? "—"}</h2>
        <p className="text-sm text-white/60">{user?.email ?? "—"}</p>
      </div>

      {/* Points + skills stats */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-5 text-center">
          <p className="font-display font-bold text-3xl text-emerald">{points ?? "—"}</p>
          <p className="text-xs text-muted mt-1 font-semibold uppercase tracking-wider">Study Points</p>
        </div>
        <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-5">
          <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Interests</p>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="text-[10px] font-semibold bg-emerald/10 text-emerald px-2 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted">None selected</p>
          )}
        </div>
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
              <label htmlFor="prof-first-name" className={labelCls}>First Name</label>
              {editing
                ? <input id="prof-first-name" value={form.firstName} onChange={e => updateField("firstName", e.target.value)} className={inputCls} />
                : <p className="text-sm font-medium text-ink">{form.firstName || "—"}</p>}
            </div>
            <div>
              <label htmlFor="prof-last-name" className={labelCls}>Last Name</label>
              {editing
                ? <input id="prof-last-name" value={form.lastName} onChange={e => updateField("lastName", e.target.value)} className={inputCls} />
                : <p className="text-sm font-medium text-ink">{form.lastName || "—"}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-branch" className={labelCls}>Branch</label>
              {editing
                ? <select id="prof-branch" value={form.branch} onChange={e => updateField("branch", e.target.value)} className={inputCls}>
                    {["CSE", "EC", "ME", "AE", "CE"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                : <p className="text-sm font-medium text-ink">{form.branch}</p>}
            </div>
            <div>
              <label htmlFor="prof-semester" className={labelCls}>Semester</label>
              {editing
                ? <select id="prof-semester" value={form.semNo} onChange={e => updateField("semNo", e.target.value)} className={inputCls}>
                    {[1,2,3,4,5,6].map(s => <option key={s} value={String(s)}>{s}</option>)}
                  </select>
                : <p className="text-sm font-medium text-ink">{form.semNo}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="prof-mobile" className={labelCls}>Mobile No.</label>
            {editing
              ? <input id="prof-mobile" type="tel" value={form.mobileNo} onChange={e => updateField("mobileNo", e.target.value)} placeholder="9876543210" className={inputCls} />
              : <p className="text-sm font-medium text-ink">{form.mobileNo || "—"}</p>}
          </div>

          {/* Email is read-only — no associated input, so we use a styled <p> heading */}
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
              <label htmlFor="pw-old" className={labelCls}>Current Password</label>
              <input id="pw-old" type="password" value={pwForm.old} onChange={e => updatePwField("old", e.target.value)}
                placeholder="Enter current password" className={inputCls} />
            </div>
            <div>
              <label htmlFor="pw-new" className={labelCls}>New Password</label>
              <input id="pw-new" type="password" value={pwForm.new} onChange={e => updatePwField("new", e.target.value)}
                placeholder="Min 8 chars, number, special char" className={inputCls} />
            </div>
            <div>
              <label htmlFor="pw-confirm" className={labelCls}>Confirm New Password</label>
              <input id="pw-confirm" type="password" value={pwForm.confirm} onChange={e => updatePwField("confirm", e.target.value)}
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
