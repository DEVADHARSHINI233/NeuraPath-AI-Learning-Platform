import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "◈" },
  { to: "/recommendations", label: "For You", icon: "✦" },
  { to: "/courses", label: "Courses", icon: "▤" },
  { to: "/careers", label: "Career Paths", icon: "◆" },
  { to: "/quiz", label: "Practice Quiz", icon: "◎" },
  { to: "/resume", label: "Resume Analyzer", icon: "▦" },
  { to: "/profile", label: "Profile", icon: "●" },
];

export default function Shell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = user?.role === "admin" ? [...NAV, { to: "/admin", label: "Admin", icon: "⚙" }] : NAV;

  return (
    <div className="min-h-screen flex bg-ink">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col hidden md:flex">
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center font-display font-bold text-ink text-sm">
              N
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">NeuraPath</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-violet/15 text-violetSoft border border-violet/30"
                    : "text-muted hover:text-ink2 hover:bg-surface2 border border-transparent"
                }`
              }
            >
              <span className="text-base w-4 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber to-rose flex items-center justify-center text-xs font-bold text-ink">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full text-xs font-medium text-muted hover:text-rose border border-border hover:border-rose/40 rounded-lg py-2 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <span className="font-display font-semibold">NeuraPath</span>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="text-xs text-muted"
          >
            Sign out
          </button>
        </div>
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
