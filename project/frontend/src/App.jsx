import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Shell from "./components/Shell.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import CareerGuidance from "./pages/CareerGuidance.jsx";
import Quiz from "./pages/Quiz.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import ChatWidget from "./components/ChatWidget.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <Protected>
              <Shell />
            </Protected>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/careers" element={<CareerGuidance />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/profile" element={<Profile />} />
          {user?.role === "admin" && <Route path="/admin" element={<Admin />} />}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <ChatWidget />}
    </>
  );
}
