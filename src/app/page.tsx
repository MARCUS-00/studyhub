"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineInstagram } from "react-icons/ai";
import { CiFacebook } from "react-icons/ci";
import { FiTwitter } from "react-icons/fi";
import { CgMail } from "react-icons/cg";
import { HiArrowRight } from "react-icons/hi";

export default function Page() {
  const [contact, setContact] = useState({ name: "", email: "", message: "" });

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-cream font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-forest/8 h-16 flex items-center justify-between px-8 md:px-16">
        <span className="font-display font-bold text-xl text-ink">
          Study<span className="text-emerald">Hub</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="text-sm font-medium text-ink/70 hover:text-ink transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-forest text-white px-4 py-2 rounded-xl hover:bg-forest-mid transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-8 md:px-16 pt-20 pb-24">
        {/* blurred blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-forest/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left */}
          <div className="flex flex-col gap-6 fade-up">
            <span className="text-xs font-semibold tracking-widest text-emerald uppercase bg-emerald/10 rounded-full px-3 py-1 w-fit">
              Dayananda Sagar Institute of Technology
            </span>
            <h1 className="text-5xl font-display font-bold text-ink leading-tight">
              Study Smarter,<br />
              <span className="text-emerald">Learn Better</span>
            </h1>
            <p className="text-muted text-lg leading-relaxed max-w-md">
              Access semester notes, practice tests, and track your academic progress — all in one place built for DSIT students.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/signup"
                className="flex items-center gap-2 bg-forest text-white font-semibold px-6 py-3 rounded-xl hover:bg-forest-mid transition-all shadow-card hover:shadow-card-hover"
              >
                Get Started <HiArrowRight />
              </Link>
              <Link
                href="/signin"
                className="flex items-center gap-2 border border-forest/20 text-ink font-semibold px-6 py-3 rounded-xl hover:bg-forest/5 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right — stats grid */}
          <div className="grid grid-cols-2 gap-4 fade-up delay-1">
            {[
              { label: "Notes Uploaded", value: "500+", emoji: "📚" },
              { label: "Tests Available", value: "120+", emoji: "✏️" },
              { label: "Semesters Covered", value: "6", emoji: "🎓" },
              { label: "Access", value: "24 / 7", emoji: "🌐" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-forest/8 shadow-card p-6 flex flex-col gap-2"
              >
                <span className="text-2xl">{stat.emoji}</span>
                <span className="text-3xl font-display font-bold text-ink">{stat.value}</span>
                <span className="text-sm text-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-y border-forest/8 py-16 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-ink text-center mb-10">
            Everything You Need
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: "🔁",
                title: "Unlimited Revision",
                desc: "Revisit notes and concepts as many times as you need to master each topic.",
              },
              {
                emoji: "📖",
                title: "Comprehensive Materials",
                desc: "Curated study materials covering every subject and unit in your syllabus.",
              },
              {
                emoji: "🧠",
                title: "Adaptive Practice Tests",
                desc: "Chapter-wise tests that help you identify weak areas and improve fast.",
              },
              {
                emoji: "📱",
                title: "Study Anywhere",
                desc: "Access your materials on any device, anytime — no restrictions.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-cream rounded-2xl border border-forest/8 shadow-card p-6 flex flex-col gap-3 hover:shadow-card-hover transition-shadow"
              >
                <span className="text-3xl">{f.emoji}</span>
                <h3 className="font-display font-semibold text-ink">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="py-16 px-8 md:px-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-ink text-center mb-8">
            Contact Us
          </h2>
          <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={contact.name}
                  onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={contact.email}
                  onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="How can we help?"
                  value={contact.message}
                  onChange={(e) => setContact((p) => ({ ...p, message: e.target.value }))}
                  className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 resize-none"
                />
              </div>
              <button
                onClick={() => {
                  toast.success("Your message has been sent!");
                  setContact({ name: "", email: "", message: "" });
                }}
                className="w-full bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest-mid transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-forest text-white py-10 px-8 md:px-16 flex flex-col items-center gap-4">
        <span className="font-display font-bold text-xl">
          Study<span className="text-emerald-lt">Hub</span>
        </span>
        <p className="text-white/60 text-sm text-center max-w-sm">
          The best way to access study materials anytime, anywhere — built for DSIT students.
        </p>
        <div className="flex gap-3">
          {[CiFacebook, AiOutlineInstagram, FiTwitter, CgMail].map((Icon, i) => (
            <button
              key={i}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-emerald/40 flex items-center justify-center transition-colors"
            >
              <Icon className="text-white text-lg" />
            </button>
          ))}
        </div>
        <p className="text-white/30 text-xs mt-2">© {new Date().getFullYear()} StudyHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
