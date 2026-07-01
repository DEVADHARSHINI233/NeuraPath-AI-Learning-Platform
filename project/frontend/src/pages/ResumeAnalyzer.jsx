import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { Card, Badge, Button, MatchRing } from "../components/UI.jsx";

const ROLES = [
  "Full Stack Development", "Data Science", "Machine Learning",
  "Cloud Computing", "Cyber Security", "DevOps", "Android Development",
];

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState(ROLES[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return setError("Please choose a resume file (PDF or .txt).");
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("target_role", role);
      const data = await api.analyzeResume(formData);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">Resume analyzer</h1>
        <p className="text-muted text-sm mt-1">Upload your resume to get an ATS score and a targeted skill gap analysis.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted font-medium">Target role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-1 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet"
            >
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted font-medium">Resume file (PDF or .txt)</label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full mt-1 text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-violet/15 file:text-violetSoft file:text-xs file:font-medium"
            />
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? "Analyzing…" : "Analyze resume"}</Button>
        </form>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card className="flex items-center gap-5">
            <MatchRing score={result.ats_score} size={72} />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-medium">ATS score for {result.target_role}</p>
              <p className="font-display text-2xl font-semibold mt-1">{result.ats_score}/100</p>
              <p className="text-xs text-muted mt-1">{result.word_count} words detected</p>
            </div>
          </Card>

          <Card>
            <h2 className="font-display font-semibold text-sm mb-3">Skills detected</h2>
            <div className="flex flex-wrap gap-2">
              {result.found_skills.length ? result.found_skills.map((s) => <Badge key={s} tone="cyan">{s}</Badge>)
                : <p className="text-xs text-muted">No recognized skills found in the document.</p>}
            </div>
          </Card>

          <Card>
            <h2 className="font-display font-semibold text-sm mb-3">Missing skills for this role</h2>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.length ? result.missing_skills.map((s) => <Badge key={s} tone="rose">{s}</Badge>)
                : <p className="text-xs text-muted">You cover all the core skills we check for this role. 🎉</p>}
            </div>
          </Card>

          <Card>
            <h2 className="font-display font-semibold text-sm mb-3">Suggestions</h2>
            <ul className="space-y-2 text-sm text-muted list-disc list-inside">
              {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </Card>

          {result.recommended_courses?.length > 0 && (
            <Card>
              <h2 className="font-display font-semibold text-sm mb-3">Recommended courses</h2>
              <div className="space-y-2">
                {result.recommended_courses.map((c) => (
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
