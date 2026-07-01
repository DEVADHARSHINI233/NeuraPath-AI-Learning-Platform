import React, { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Card, Button, Spinner, Badge } from "../components/UI.jsx";

const CAREER_GOALS = [
  "Full Stack Development", "Data Science", "Machine Learning", "Cloud Computing",
  "Cyber Security", "DevOps", "Android Development", "Web Development",
];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [interestInput, setInterestInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getProfile().then(setProfile);
  }, []);

  if (!profile) return <Spinner />;

  function addTag(list, setter, value, key) {
    if (!value.trim()) return;
    setProfile({ ...profile, [key]: [...profile[key], value.trim()] });
    setter("");
  }

  function removeTag(key, tag) {
    setProfile({ ...profile, [key]: profile[key].filter((t) => t !== tag) });
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await api.updateProfile({
        career_goal: profile.career_goal,
        skill_level: profile.skill_level,
        interests: profile.interests,
        skills: profile.skills,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="text-muted text-sm mt-1">These signals drive your AI recommendations — keep them current.</p>
      </div>

      <Card>
        <p className="text-xs text-muted mb-1">Name</p>
        <p className="text-sm font-medium">{profile.name}</p>
        <p className="text-xs text-muted mt-3 mb-1">Email</p>
        <p className="text-sm font-medium">{profile.email}</p>
      </Card>

      <Card>
        <label className="text-xs text-muted font-medium">Career goal</label>
        <select
          value={profile.career_goal || ""}
          onChange={(e) => setProfile({ ...profile, career_goal: e.target.value })}
          className="w-full mt-1 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet"
        >
          <option value="">Select a goal</option>
          {CAREER_GOALS.map((g) => <option key={g}>{g}</option>)}
        </select>

        <label className="text-xs text-muted font-medium mt-4 block">Skill level</label>
        <div className="flex gap-2 mt-1">
          {SKILL_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setProfile({ ...profile, skill_level: lvl })}
              className={`flex-1 text-xs py-2 rounded-lg border ${
                profile.skill_level === lvl ? "bg-violet/15 text-violetSoft border-violet/40" : "bg-surface2 text-muted border-border"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <label className="text-xs text-muted font-medium">Interests</label>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {profile.interests.map((t) => (
            <Badge key={t} tone="violet">
              {t} <button onClick={() => removeTag("interests", t)} className="ml-1 opacity-60 hover:opacity-100">×</button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(profile.interests, setInterestInput, interestInput, "interests"))}
            placeholder="e.g. React, Neural Networks"
            className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet"
          />
          <Button variant="secondary" onClick={() => addTag(profile.interests, setInterestInput, interestInput, "interests")}>Add</Button>
        </div>
      </Card>

      <Card>
        <label className="text-xs text-muted font-medium">Skills</label>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {profile.skills.map((t) => (
            <Badge key={t} tone="cyan">
              {t} <button onClick={() => removeTag("skills", t)} className="ml-1 opacity-60 hover:opacity-100">×</button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(profile.skills, setSkillInput, skillInput, "skills"))}
            placeholder="e.g. Python, SQL"
            className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet"
          />
          <Button variant="secondary" onClick={() => addTag(profile.skills, setSkillInput, skillInput, "skills")}>Add</Button>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
        {saved && <span className="text-xs text-cyan">Saved ✓</span>}
      </div>
    </div>
  );
}
