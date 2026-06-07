"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";

type Step = "email" | "otp" | "reset" | "done";

const POLICY_HINT = "Min 8 chars, one number, one special character.";

function validatePasswordClient(p: string): string | null {
  if (p.length < 8) return "Password must be at least 8 characters.";
  if (!/\d/.test(p)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(p)) return "Password must contain at least one special character.";
  return null;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const inputCls =
    "w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald transition";

  const onEmailSubmit = async () => {
    if (!email) { toast.error("Please enter your email."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("If that email exists, an OTP has been sent.");
        setStep("otp");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error("Enter the 6-digit OTP from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok && data.resetToken) {
        setResetToken(data.resetToken);
        setStep("reset");
      } else {
        toast.error(data.error ?? "Invalid or expired OTP.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async () => {
    const policyError = validatePasswordClient(password);
    if (policyError) { toast.error(policyError); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, resetToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("done");
      } else {
        toast.error(data.error ?? "Failed to reset password.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="w-full max-w-md fade-up text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Password reset!</h1>
        <p className="text-muted text-sm mb-8">Your password has been updated successfully.</p>
        <Link
          href="/signin"
          className="inline-block w-full py-3 bg-forest text-white font-semibold rounded-xl hover:bg-forest-lt transition-colors text-sm text-center"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="w-full max-w-md fade-up">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-ink mb-1">Set new password</h1>
          <p className="text-muted text-sm">
            Enter a new password for <span className="font-medium text-ink">{email}</span>
          </p>
          <p className="text-xs text-muted mt-1">{POLICY_HINT}</p>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onResetSubmit()}
              placeholder="Re-enter password"
              className={inputCls}
            />
          </div>
          <button
            onClick={onResetSubmit}
            disabled={loading}
            className="w-full py-3 bg-forest text-white font-semibold rounded-xl hover:bg-forest-lt disabled:opacity-60 transition-all text-sm"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="w-full max-w-md fade-up">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-ink mb-1">Enter OTP</h1>
          <p className="text-muted text-sm">
            We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>.
            It expires in 10 minutes.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="otp-input" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              One-Time Password
            </label>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && onOtpSubmit()}
              placeholder="123456"
              className={inputCls}
            />
          </div>
          <button
            onClick={onOtpSubmit}
            disabled={loading}
            className="w-full py-3 bg-forest text-white font-semibold rounded-xl hover:bg-forest-lt disabled:opacity-60 transition-all text-sm"
          >
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
          <button
            onClick={() => { setOtp(""); setStep("email"); }}
            className="w-full py-2 text-sm text-muted hover:text-ink transition-colors"
          >
            ← Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md fade-up">
      <Link
        href="/signin"
        className="flex items-center gap-2 text-muted hover:text-ink text-sm mb-6 transition-colors"
      >
        ← Back to sign in
      </Link>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink mb-1">Forgot password?</h1>
        <p className="text-muted text-sm">Enter your email and we&apos;ll send you an OTP.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="fp-email" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
            Email address
          </label>
          <input
            id="fp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onEmailSubmit()}
            placeholder="you@college.edu"
            className={inputCls}
          />
        </div>
        <button
          onClick={onEmailSubmit}
          disabled={loading}
          className="w-full py-3 bg-forest text-white font-semibold rounded-xl hover:bg-forest-lt disabled:opacity-60 transition-all text-sm"
        >
          {loading ? "Sending OTP…" : "Send OTP"}
        </button>
      </div>
      <p className="text-center text-sm text-muted mt-6">
        Remember your password?{" "}
        <Link href="/signin" className="font-semibold text-forest hover:text-emerald transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
