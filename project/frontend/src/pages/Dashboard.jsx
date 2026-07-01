import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Card, StatCard, Spinner, Badge } from "../components/UI.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.dashboardStats(), api.getRecommendations()])
      .then(([s, r]) => {
        setStats(s);
        setRecs(r.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const chartData = (stats.recent_quiz_attempts || [])
    .slice()
    .reverse()
    .map((a) => ({ name: a.category.split(" ")[0], score: a.score_pct }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-muted text-sm mt-1">Here's where your learning stands right now.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Enrolled courses" value={stats.enrolled_courses} accent="violet" />
        <StatCard label="Completed" value={stats.completed_courses} accent="cyan" />
        <StatCard label="Avg. quiz score" value={`${stats.avg_quiz_score}%`} accent="amber" />
        <StatCard label="Streak" value={`${stats.streak}d`} sub={`${stats.xp} XP`} accent="rose" />
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <Card className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm">Recent quiz performance</h2>
            <Link to="/quiz" className="text-xs text-violetSoft hover:underline">
              Take a quiz →
            </Link>
          </div>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">No quiz attempts yet — take your first quiz to see trends here.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243050" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#8A93B2", fontSize: 11 }} axisLine={{ stroke: "#243050" }} tickLine={false} />
                <YAxis tick={{ fill: "#8A93B2", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#182338", border: "1px solid #243050", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#E7EAF3" }}
                />
                <Bar dataKey="score" fill="#6C5CE7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="md:col-span-2">
          <h2 className="font-display font-semibold text-sm mb-4">Topics to reinforce</h2>
          {(stats.weak_topics || []).length === 0 ? (
            <p className="text-sm text-muted">Take a few quizzes and we'll flag topics worth revisiting.</p>
          ) : (
            <div className="space-y-3">
              {stats.weak_topics.map((t) => (
                <div key={t.category} className="flex items-center justify-between">
                  <span className="text-sm text-ink2">{t.category}</span>
                  <Badge tone={t.avg_score < 50 ? "rose" : "amber"}>{Math.round(t.avg_score)}%</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-sm">Top picks for you</h2>
          <Link to="/recommendations" className="text-xs text-violetSoft hover:underline">
            See all recommendations →
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {recs.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="bg-surface border border-border rounded-2xl p-4 hover:border-violet/40 transition-colors block"
            >
              <Badge tone="muted">{c.category}</Badge>
              <h3 className="font-display font-medium text-sm mt-3 leading-snug">{c.title}</h3>
              <p className="text-xs text-muted mt-2">{c.match_score}% match · {c.duration_hours}h</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
