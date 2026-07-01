import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("np_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  function login(token, userObj) {
    localStorage.setItem("np_token", token);
    localStorage.setItem("np_user", JSON.stringify(userObj));
    setUser(userObj);
  }

  function logout() {
    localStorage.removeItem("np_token");
    localStorage.removeItem("np_user");
    setUser(null);
  }

  async function register(payload) {
    const data = await api.register(payload);
    login(data.token, data.user);
    return data;
  }

  async function doLogin(payload) {
    const data = await api.login(payload);
    login(data.token, data.user);
    return data;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login: doLogin, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
