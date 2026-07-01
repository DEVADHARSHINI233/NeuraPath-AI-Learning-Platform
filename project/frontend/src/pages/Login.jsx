import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role) {
    const creds = {
      student: { email: "student@demo.edu", password: "student123" },
      faculty: { email: "faculty@demo.edu", password: "faculty123" },
      admin: { email: "admin@demo.edu", password: "admin123" },
    };
    setForm(creds[role]);
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center font-display font-bold text-ink text-sm">
            N
          </div>
          <span className="font-display font-semibold text-lg">NeuraPath</span>
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h1 className="font-display text-xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-muted mb-6">Sign in to continue your learning path.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full mt-1 bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-xs text-rose">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet to-violetSoft text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs text-muted mb-2">Quick demo access:</p>
            <div className="flex gap-2">
              {["student", "faculty", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => fillDemo(r)}
                  className="text-xs capitalize px-2.5 py-1.5 rounded-md bg-surface2 border border-border text-muted hover:text-ink2 hover:border-violet/40"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-5">
          New here?{" "}
          <Link to="/register" className="text-violetSoft hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
