import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { Spinner, DifficultyBadge, Badge, MatchRing } from "../components/UI.jsx";

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRecommendations().then(setRecs).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">For you</h1>
        <p className="text-muted text-sm mt-1">
          Ranked by cosine similarity between your profile (interests, skills, career goal) and each course's TF-IDF vector.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : recs.length === 0 ? (
        <p className="text-sm text-muted py-12 text-center">
          Add interests and skills to your <Link to="/profile" className="text-violetSoft underline">profile</Link> to unlock personalized picks.
        </p>
      ) : (
        <div className="space-y-3">
          {recs.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-violet/40 transition-colors"
            >
              <MatchRing score={c.match_score} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge tone="muted">{c.category}</Badge>
                  <DifficultyBadge level={c.difficulty} />
                </div>
                <h3 className="font-display font-medium text-sm truncate">{c.title}</h3>
                <p className="text-xs text-muted mt-1">{c.instructor} · {c.duration_hours}h · ★ {c.rating}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
