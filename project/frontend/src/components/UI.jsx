import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-surface border border-border rounded-2xl p-5 ${className}`}>{children}</div>
  );
}

export function StatCard({ label, value, accent = "violet", sub }) {
  const accentMap = {
    violet: "text-violetSoft",
    cyan: "text-cyan",
    amber: "text-amber",
    rose: "text-rose",
  };
  return (
    <Card>
      <p className="text-xs uppercase tracking-wider text-muted font-medium mb-2">{label}</p>
      <p className={`font-display text-3xl font-semibold ${accentMap[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </Card>
  );
}

// Signature element: a radial "AI match" ring visualizing the cosine-similarity
// score the recommendation engine computed between the learner's profile and a course.
export function MatchRing({ score = 0, size = 56 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#243050" strokeWidth="5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#matchGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C5CE7" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[11px] font-medium text-ink2">{Math.round(clamped)}%</span>
      </div>
    </div>
  );
}

export function Badge({ children, tone = "violet" }) {
  const toneMap = {
    violet: "bg-violet/15 text-violetSoft border-violet/30",
    cyan: "bg-cyan/10 text-cyan border-cyan/30",
    amber: "bg-amber/10 text-amber border-amber/30",
    rose: "bg-rose/10 text-rose border-rose/30",
    muted: "bg-surface2 text-muted border-border",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${toneMap[tone]}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-violet to-violetSoft text-white hover:opacity-90",
    secondary: "bg-surface2 text-ink2 border border-border hover:border-violet/40",
    ghost: "text-muted hover:text-ink2",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-violet border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function DifficultyBadge({ level }) {
  const map = { Beginner: "cyan", Intermediate: "amber", Advanced: "rose" };
  return <Badge tone={map[level] || "muted"}>{level}</Badge>;
}
