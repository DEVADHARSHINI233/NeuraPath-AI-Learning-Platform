import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center font-display font-bold text-ink text-sm">
            N
          </div>
          <span className="font-display font-semibold text-lg">NeuraPath</span>
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h1 className="font-display text-xl font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-muted mb-6">Start with your recommendations tailored from day one.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted font-medium">Full name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet"
                placeholder="Ananya Sharma"
              />
            </div>
            <div>
              <label className="text-xs text-muted font-medium">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-muted font-medium">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full mt-1 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="text-xs text-muted font-medium">I am a</label>
              <div className="flex gap-2 mt-1">
                {["student", "faculty"].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setForm({ ...form, role: r })}
                    className={`flex-1 text-sm capitalize py-2 rounded-lg border transition-colors ${
                      form.role === r
                        ? "bg-violet/15 text-violetSoft border-violet/40"
                        : "bg-surface2 text-muted border-border"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-rose">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet to-violetSoft text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-violetSoft hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
