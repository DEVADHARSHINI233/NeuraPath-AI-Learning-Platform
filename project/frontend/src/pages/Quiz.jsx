import React, { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Card, Button, Spinner, Badge } from "../components/UI.jsx";

export default function Quiz() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.quizCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  async function startQuiz(cat) {
    setLoading(true);
    setResult(null);
    setAnswers({});
    const q = await api.getQuiz(cat, 8);
    setQuestions(q);
    setCategory(cat);
    setLoading(false);
  }

  function selectAnswer(qid, option) {
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await api.submitQuiz({ category, answers });
      setResult(res);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;

  if (!category) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Practice quiz</h1>
          <p className="text-muted text-sm mt-1">Pick a topic — your scores adapt future recommendations.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => startQuiz(c)}
              className="bg-surface border border-border rounded-2xl p-5 text-left hover:border-violet/40 transition-colors"
            >
              <h3 className="font-display font-medium text-sm">{c}</h3>
              <p className="text-xs text-muted mt-2">8 questions · Multiple choice</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-md space-y-5">
        <Card>
          <p className="text-xs uppercase tracking-wider text-muted font-medium mb-2">{category}</p>
          <p className="font-display text-4xl font-semibold text-violetSoft">{result.score_pct}%</p>
          <p className="text-sm text-muted mt-2">{result.correct} / {result.total} correct</p>
          <p className="text-sm text-ink2 mt-4 bg-surface2 border border-border rounded-lg p-3">{result.feedback}</p>
        </Card>
        <div className="flex gap-3">
          <Button onClick={() => startQuiz(category)}>Retake</Button>
          <Button variant="secondary" onClick={() => setCategory(null)}>Choose another topic</Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">{category}</h1>
        <Badge tone="muted">{answeredCount}/{questions.length} answered</Badge>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <Card key={q.id}>
            <p className="text-sm font-medium mb-3">{i + 1}. {q.question}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {[["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d]].map(([opt, text]) => (
                <button
                  key={opt}
                  onClick={() => selectAnswer(q.id, opt)}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                    answers[q.id] === opt
                      ? "bg-violet/15 border-violet/40 text-violetSoft"
                      : "bg-surface2 border-border text-ink2 hover:border-violet/30"
                  }`}
                >
                  <span className="font-mono text-xs text-muted mr-2">{opt}</span>{text}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={submit} disabled={submitting || answeredCount < questions.length}>
        {submitting ? "Submitting…" : "Submit quiz"}
      </Button>
    </div>
  );
}
