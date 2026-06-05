import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import AuthPanel from "./components/AuthPanel";
import Dashboard from "./components/Dashboard";
import "./styles.css";

export default function App() {
  const storedUser = useMemo(() => {
    const raw = localStorage.getItem("careerAdvisorUser");
    return raw ? JSON.parse(raw) : null;
  }, []);
  const [user, setUser] = useState(storedUser);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const rawUser = params.get("user");

    if (token && rawUser) {
      const parsedUser = JSON.parse(rawUser);
      localStorage.setItem("careerAdvisorToken", token);
      localStorage.setItem("careerAdvisorUser", JSON.stringify(parsedUser));
      setUser(parsedUser);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (localStorage.getItem("careerAdvisorToken")) {
      api("/auth/me")
        .then((data) => {
          localStorage.setItem("careerAdvisorUser", JSON.stringify(data.user));
          setUser(data.user);
        })
        .catch(logout);
    }
  }, []);

  function logout() {
    localStorage.removeItem("careerAdvisorToken");
    localStorage.removeItem("careerAdvisorUser");
    setUser(null);
  }

  return user ? <Dashboard user={user} onLogout={logout} /> : <AuthPanel onAuth={setUser} />;
}
