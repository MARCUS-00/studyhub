"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) { toast.error("Please fill in all fields."); return; }
    setIsLoading(true);
    const result = await signIn("credentials", { userId: email, password, redirect: false });
    setIsLoading(false);
    if (result?.error) toast.error("Invalid email or password.");
    else if (result?.ok) window.location.href = "/";
  };

  const inputCls = "w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald transition";

  return (
    <div className="w-full max-w-md fade-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-1">Welcome back</h1>
        <p className="text-muted text-sm">Sign in to your StudyHub account</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Email address</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSubmit()} placeholder="you@college.edu" className={inputCls} />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Password</label>
          <div className="relative">
            <input id="password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSubmit()} placeholder="••••••••" className={`${inputCls} pr-10`} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
              {showPw ? <AiOutlineEyeInvisible size="1.1rem" /> : <AiOutlineEye size="1.1rem" />}
            </button>
          </div>
        </div>
        <button onClick={onSubmit} disabled={isLoading}
          className="w-full py-3 bg-forest text-white font-semibold rounded-xl hover:bg-forest-lt disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md text-sm mt-2">
          {isLoading ? "Signing in…" : "Sign In"}
        </button>
      </div>
      <div className="flex flex-col items-center gap-2 mt-6">
        <p className="text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-forest hover:text-emerald transition-colors">Create one</Link>
        </p>
        <Link href="/forgot-password" className="text-sm text-muted hover:text-ink transition-colors">Forgot your password?</Link>
      </div>
    </div>
  );
}
