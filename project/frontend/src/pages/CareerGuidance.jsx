import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { Card, Badge, Spinner } from "../components/UI.jsx";

export default function CareerGuidance() {
  const [careers, setCareers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listCareers().then((list) => {
      setCareers(list);
      setSelected(list[0]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) api.getCareer(selected).then(setDetail);
  }, [selected]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Career guidance</h1>
        <p className="text-muted text-sm mt-1">Explore structured roadmaps for in-demand tech careers.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {careers.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              selected === c ? "bg-violet/15 text-violetSoft border-violet/40" : "bg-surface2 text-muted border-border"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {detail && (
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="md:col-span-2">
            <h2 className="font-display font-semibold text-sm mb-4">Roadmap</h2>
            <div className="space-y-3">
              {detail.roadmap.map((step, i) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-violet/15 text-violetSoft text-xs font-mono flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-ink2 pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-display font-semibold text-sm mb-3">Core skills</h2>
            <div className="flex flex-wrap gap-2">
              {detail.skills.map((s) => <Badge key={s} tone="cyan">{s}</Badge>)}
            </div>
          </Card>

          <Card>
            <h2 className="font-display font-semibold text-sm mb-3">Roles &amp; salary</h2>
            <p className="text-xs text-muted mb-2">Typical roles</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {detail.roles.map((r) => <Badge key={r} tone="amber">{r}</Badge>)}
            </div>
            <p className="text-xs text-muted">Salary range</p>
            <p className="font-display text-lg font-semibold text-violetSoft">{detail.salary_range_inr}</p>
          </Card>

          <Card>
            <h2 className="font-display font-semibold text-sm mb-3">Companies hiring</h2>
            <div className="flex flex-wrap gap-2">
              {detail.companies.map((c) => <Badge key={c} tone="muted">{c}</Badge>)}
            </div>
          </Card>

          {detail.recommended_courses?.length > 0 && (
            <Card>
              <h2 className="font-display font-semibold text-sm mb-3">Start learning</h2>
              <div className="space-y-2">
                {detail.recommended_courses.map((c) => (
                  <Link key={c.id} to={`/courses/${c.id}`} className="flex justify-between text-sm hover:text-violetSoft">
                    <span>{c.title}</span>
                    <span className="text-muted">★ {c.rating}</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
