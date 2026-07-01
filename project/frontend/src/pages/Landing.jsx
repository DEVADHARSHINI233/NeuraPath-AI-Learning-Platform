import React from "react";
import { Link } from "react-router-dom";

const PILLARS = [
  { title: "Content-based AI recommendations", desc: "TF-IDF + cosine similarity match your interests and skills against every course in the catalog, live.", icon: "✦" },
  { title: "Resume intelligence", desc: "Upload a resume to get an ATS score, a skill gap analysis, and a targeted learning path.", icon: "▦" },
  { title: "Career roadmaps", desc: "Structured paths for 7 in-demand tracks — required skills, salary bands, and hiring companies.", icon: "◆" },
  { title: "Adaptive practice", desc: "Quiz performance feeds back into your recommendations, surfacing your weak topics first.", icon: "◎" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center font-display font-bold text-ink text-sm">
            N
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">NeuraPath</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted hover:text-ink2 px-3 py-2">
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-gradient-to-r from-violet to-violetSoft text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-mono text-cyan border border-cyan/30 bg-cyan/5 px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan glow-dot" /> similarity engine: live
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight mb-6">
            One learning path,<br /> computed <span className="text-violetSoft">just for you.</span>
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-8 max-w-md">
            NeuraPath reads your interests, skills, resume and quiz history, then recommends the
            exact courses, career track and practice you need next — recalculated every time you learn something new.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="bg-gradient-to-r from-violet to-violetSoft text-white px-6 py-3 rounded-lg font-medium hover:opacity-90"
            >
              Create free account
            </Link>
            <Link to="/login" className="text-sm text-muted hover:text-ink2 underline underline-offset-4">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-br from-violet/20 via-transparent to-cyan/10 blur-3xl rounded-full" />
          <div className="relative bg-surface border border-border rounded-2xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted font-medium">Match preview</p>
            {[
              { t: "Machine Learning: Model Deployment", s: 94 },
              { t: "Data Science: Statistics Foundations", s: 87 },
              { t: "Full Stack: React & Flask APIs", s: 71 },
            ].map((r) => (
              <div key={r.t} className="flex items-center justify-between border border-border bg-surface2 rounded-xl px-4 py-3">
                <span className="text-sm text-ink2">{r.t}</span>
                <span className="font-mono text-xs text-violetSoft">{r.s}% match</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map((p) => (
            <div key={p.title} className="border border-border bg-surface rounded-2xl p-5">
              <div className="w-9 h-9 rounded-lg bg-violet/10 text-violetSoft flex items-center justify-center mb-4 text-base">
                {p.icon}
              </div>
              <h3 className="font-display font-semibold text-sm mb-2">{p.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-border text-xs text-muted flex justify-between">
        <span>NeuraPath — AI Learning Intelligence Platform</span>
        <span>Final Year CSE Project</span>
      </footer>
    </div>
  );
}
