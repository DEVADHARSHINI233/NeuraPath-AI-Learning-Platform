import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../lib/api.js";
import { Card, StatCard, Spinner } from "../components/UI.jsx";

const COLORS = ["#6C5CE7", "#22D3EE", "#F5A623", "#FB7185", "#8B7CF6", "#4CC9F0", "#F97316"];

export default function Admin() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.adminStats().then(setStats);
  }, []);

  if (!stats) return <Spinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Admin dashboard</h1>
        <p className="text-muted text-sm mt-1">Platform-wide statistics and course popularity.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Students" value={stats.total_students} accent="violet" />
        <StatCard label="Faculty" value={stats.total_faculty} accent="cyan" />
        <StatCard label="Courses" value={stats.total_courses} accent="amber" />
        <StatCard label="Enrollments" value={stats.total_enrollments} accent="rose" />
        <StatCard label="Quiz attempts" value={stats.total_quiz_attempts} accent="violet" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display font-semibold text-sm mb-4">Courses by category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.courses_by_category} dataKey="c" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {stats.courses_by_category.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#182338", border: "1px solid #243050", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {stats.courses_by_category.map((c, i) => (
              <div key={c.category} className="flex items-center gap-2 text-xs text-muted">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {c.category} ({c.c})
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-sm mb-4">Most enrolled courses</h2>
          <div className="space-y-3">
            {stats.top_courses.map((c) => (
              <div key={c.title}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink2 truncate pr-3">{c.title}</span>
                  <span className="text-muted shrink-0">{c.enrollments}</span>
                </div>
                <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet to-cyan"
                    style={{ width: `${Math.min(100, (c.enrollments / (stats.top_courses[0]?.enrollments || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
