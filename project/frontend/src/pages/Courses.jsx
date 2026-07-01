import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { Spinner, DifficultyBadge, Badge } from "../components/UI.jsx";

const CATEGORIES = [
  "Full Stack Development", "Data Science", "Machine Learning", "Cloud Computing",
  "Cyber Security", "DevOps", "Android Development", "Web Development",
  "UI UX Design", "Game Development", "Artificial Intelligence",
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    setLoading(true);
    api.listCourses({ q, category, difficulty }).then(setCourses).finally(() => setLoading(false));
  }, [q, category, difficulty]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Course catalog</h1>
        <p className="text-muted text-sm mt-1">Search and filter across every course NeuraPath offers.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or tag…"
          className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet"
        >
          <option value="">All levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : courses.length === 0 ? (
        <p className="text-sm text-muted py-12 text-center">No courses match your filters.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="bg-surface border border-border rounded-2xl p-4 hover:border-violet/40 transition-colors flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge tone="muted">{c.category}</Badge>
                <DifficultyBadge level={c.difficulty} />
              </div>
              <h3 className="font-display font-medium text-sm leading-snug mb-2">{c.title}</h3>
              <p className="text-xs text-muted line-clamp-2 flex-1">{c.description}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-muted">
                <span>★ {c.rating}</span>
                <span>{c.duration_hours}h · {c.instructor}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
