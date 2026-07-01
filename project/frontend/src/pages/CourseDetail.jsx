import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { Spinner, DifficultyBadge, Badge, Button, Card } from "../components/UI.jsx";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    api.getCourse(id).then(setCourse).finally(() => setLoading(false));
  }, [id]);

  async function handleEnroll() {
    setEnrolling(true);
    try {
      await api.enroll(id);
      setEnrolled(true);
    } catch (e) {
      alert(e.message);
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) return <Spinner />;
  if (!course) return <p className="text-sm text-muted">Course not found.</p>;

  const tags = (course.tags || "").split(" ").filter(Boolean).slice(0, 8);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/courses" className="text-xs text-muted hover:text-ink2">← Back to courses</Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge tone="muted">{course.category}</Badge>
            <DifficultyBadge level={course.difficulty} />
          </div>
          <h1 className="font-display text-2xl font-semibold leading-snug">{course.title}</h1>
          <p className="text-sm text-muted mt-2">
            {course.instructor} · {course.duration_hours}h · ★ {course.rating}
          </p>
        </div>
      </div>

      <Card>
        <h2 className="font-display font-semibold text-sm mb-2">About this course</h2>
        <p className="text-sm text-muted leading-relaxed">{course.description}</p>
      </Card>

      <Card>
        <h2 className="font-display font-semibold text-sm mb-3">Topics covered</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Badge key={t} tone="violet">{t}</Badge>
          ))}
        </div>
      </Card>

      <Button onClick={handleEnroll} disabled={enrolling || enrolled}>
        {enrolled ? "Enrolled ✓" : enrolling ? "Enrolling…" : "Enroll in this course"}
      </Button>
    </div>
  );
}
