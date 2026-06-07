"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    semester: "1", branch: "CSE", regNo: "", mobileNo: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password === form.confirmPassword) {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
            semester: form.semester,
            branch: form.branch,
            regNo: form.regNo || undefined,
            mobileNo: form.mobileNo || undefined,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Account created! Please sign in.");
          router.replace("/signin");
        } else {
          toast.error(data.error || "Something went wrong.");
        }
      } catch { toast.error("Something went wrong."); }
      finally { setLoading(false); }
    } else {
      toast.error("Passwords do not match.");
    }
  };

  const inputCls = "block w-full rounded-xl border border-forest/15 py-2.5 px-4 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-transparent bg-white";
  const labelCls = "block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5";

  return (
    <div className="w-full fade-up">
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-ink mb-1">Create account</h1>
        <p className="text-muted text-sm">Join StudyHub — free for students</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className={labelCls}>First Name *</label>
            <input id="firstName" type="text" required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className={inputCls} placeholder="John" />
          </div>
          <div>
            <label htmlFor="lastName" className={labelCls}>Last Name</label>
            <input id="lastName" type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className={inputCls} placeholder="Doe" />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className={labelCls}>Email *</label>
          <input id="signup-email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} placeholder="you@example.com" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="signup-regNo" className={labelCls}>Registration No.</label>
            <input id="signup-regNo" type="text" value={form.regNo} onChange={(e) => update("regNo", e.target.value)} className={inputCls} placeholder="REG2024001" />
          </div>
          <div>
            <label htmlFor="signup-mobileNo" className={labelCls}>Mobile No.</label>
            <input id="signup-mobileNo" type="tel" value={form.mobileNo} onChange={(e) => update("mobileNo", e.target.value)} className={inputCls} placeholder="9876543210" />
          </div>
        </div>

        <div>
          <label htmlFor="signup-password" className={labelCls}>Password * (min 8 chars, number, special char)</label>
          <input id="signup-password" type="password" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} className={inputCls} placeholder="••••••••" />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelCls}>Confirm Password *</label>
          <input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className={inputCls} placeholder="••••••••" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="semester" className={labelCls}>Semester</label>
            <select id="semester" value={form.semester} onChange={(e) => update("semester", e.target.value)} className={inputCls}>
              {[1,2,3,4,5,6].map((s) => <option key={s} value={String(s)}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="branch" className={labelCls}>Branch</label>
            <select id="branch" value={form.branch} onChange={(e) => update("branch", e.target.value)} className={inputCls}>
              {["CSE","EC","ME","AE","CE"].map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest-mid transition-colors disabled:opacity-60 mt-2">
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/signin" className="text-emerald font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
