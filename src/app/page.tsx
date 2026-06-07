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
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-cream font-sans">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-forest/8 h-16 flex items-center justify-between px-8 md:px-16">
        <span className="font-display font-bold text-xl text-ink">
          Study<span className="text-emerald">Hub</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/signin" className="text-sm font-medium text-ink/70 hover:text-ink transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="text-sm font-semibold bg-forest text-white px-4 py-2 rounded-xl hover:bg-forest-mid transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-8 md:px-16 pt-20 pb-24">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-forest/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="flex flex-col gap-6 fade-up">
            <span className="text-xs font-semibold tracking-widest text-emerald uppercase bg-emerald/10 rounded-full px-3 py-1 w-fit">
              Academic Learning Platform
            </span>
            <h1 className="text-5xl font-display font-bold text-ink leading-tight">
              Study Smarter,<br />
              <span className="text-emerald">Learn Better</span>
            </h1>
            <p className="text-muted text-lg leading-relaxed max-w-md">
              Access semester notes, practice tests, and track your academic
              progress — all in one place.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/signup" className="flex items-center gap-2 bg-forest text-white font-semibold px-6 py-3 rounded-xl hover:bg-forest-mid transition-all shadow-card hover:shadow-card-hover">
                Get Started <HiArrowRight />
              </Link>
              <Link href="/signin" className="flex items-center gap-2 border border-forest/20 text-ink font-semibold px-6 py-3 rounded-xl hover:bg-forest/5 transition-all">
                Sign In
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 fade-up delay-1">
            {[
              { label: "Notes Uploaded",    value: "500+",  emoji: "📚" },
              { label: "Tests Available",   value: "120+",  emoji: "✏️" },
              { label: "Semesters Covered", value: "6",     emoji: "🎓" },
              { label: "Access",            value: "24 / 7", emoji: "🌐" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-forest/8 shadow-card p-6 flex flex-col gap-2">
                <span className="text-2xl">{stat.emoji}</span>
                <span className="text-3xl font-display font-bold text-ink">{stat.value}</span>
                <span className="text-sm text-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-8 md:px-16 bg-white border-y border-forest/8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-ink text-center mb-2">How it works</h2>
          <p className="text-muted text-center mb-10">Three simple steps to get started</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Create your account",  desc: "Sign up as a student or staff member in under a minute." },
              { step: "02", title: "Access materials",      desc: "Browse notes and tests uploaded by your faculty." },
              { step: "03", title: "Track your progress",   desc: "Attend mock tests and see your scores and history." },
            ].map((item) => (
              <div key={item.step} className="bg-cream rounded-2xl border border-forest/8 p-6 flex flex-col gap-3">
                <span className="text-4xl font-display font-bold text-emerald/30">{item.step}</span>
                <h3 className="font-display font-semibold text-ink">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-ink text-center mb-10">
            Everything You Need
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: "🔁", title: "Unlimited Revision",       desc: "Revisit notes as many times as you need." },
              { emoji: "📖", title: "Comprehensive Materials",  desc: "Curated notes covering every subject and unit." },
              { emoji: "🧠", title: "Adaptive Practice Tests",  desc: "Chapter-wise tests that help you improve fast." },
              { emoji: "📱", title: "Study Anywhere",           desc: "Access on any device, anytime — no restrictions." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-forest/8 shadow-card p-6 flex flex-col gap-3 hover:shadow-card-hover transition-shadow">
                <span className="text-3xl">{f.emoji}</span>
                <h3 className="font-display font-semibold text-ink">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="py-16 px-8 md:px-16 bg-white border-t border-forest/8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-ink text-center mb-2">Contact Us</h2>
          <p className="text-muted text-center mb-8">Have a question or feedback? We would love to hear from you.</p>
          {sent ? (
            <div className="bg-emerald/10 border border-emerald/20 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-display font-semibold text-forest text-lg">Message sent!</p>
              <p className="text-muted text-sm mt-1">We will get back to you soon.</p>
            </div>
          ) : (
            <div className="bg-cream rounded-2xl border border-forest/8 shadow-card p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Name</label>
                  <input type="text" placeholder="Your name" value={contact.name}
                    onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Email</label>
                  <input type="email" placeholder="you@example.com" value={contact.email}
                    onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Message</label>
                <textarea rows={4} placeholder="How can we help?" value={contact.message}
                  onChange={(e) => setContact((p) => ({ ...p, message: e.target.value }))}
                  className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 resize-none bg-white" />
              </div>
              <button
                onClick={() => { if (contact.name && contact.email && contact.message) setSent(true); else toast.error("Please fill in all fields."); }}
                className="w-full bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest-mid transition-colors">
                Send Message
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-forest text-white py-10 px-8 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-display font-bold text-xl">
              Study<span className="text-emerald-lt">Hub</span>
            </span>
            <p className="text-white/40 text-xs mt-1">© {new Date().getFullYear()} StudyHub. All rights reserved.</p>
          </div>
          <div className="flex gap-3">
            {[CiFacebook, AiOutlineInstagram, FiTwitter, CgMail].map((Icon, i) => (
              <button key={i} className="w-9 h-9 rounded-full bg-white/10 hover:bg-emerald/40 flex items-center justify-center transition-colors">
                <Icon className="text-white text-lg" />
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
