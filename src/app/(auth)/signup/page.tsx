"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    semester: "1",
    branch: "CSE",
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong.");
      } else {
        toast.success("Account created! Please sign in.");
        router.replace("/signin");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "block w-full rounded-xl border border-forest/15 py-2 px-3 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-ink mb-1";

  return (
    <div className="block w-4/5 items-center">
      <h1 className="flex justify-center text-3xl font-display font-bold py-8 text-ink">
        Create Account
      </h1>

      <div className="h-fit w-full bg-white rounded-2xl border border-forest/8 shadow-card px-6 py-8 lg:px-8">
        <h2 className="text-center text-xl font-display font-semibold text-ink mb-6">
          Join StudyHub
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className={labelCls}>First Name *</label>
              <input
                id="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className={inputCls}
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelCls}>Last Name</label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className={inputCls}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className={labelCls}>Email *</label>
            <input
              id="signup-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className={labelCls}>Password * (min 6 chars)</label>
            <input
              id="signup-password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelCls}>Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="semester" className={labelCls}>Semester</label>
              <select
                id="semester"
                value={form.semester}
                onChange={(e) => update("semester", e.target.value)}
                className={inputCls}
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={String(s)}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="branch" className={labelCls}>Branch</label>
              <select
                id="branch"
                value={form.branch}
                onChange={(e) => update("branch", e.target.value)}
                className={inputCls}
              >
                {["CSE", "EC", "ME", "AE", "CE"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-white font-semibold py-2.5 rounded-xl hover:bg-forest-mid transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center text-sm text-muted pt-1">
            Already have an account?{" "}
            <Link href="/signin" className="text-emerald font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
