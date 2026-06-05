import { ArrowRight, BrainCircuit, FileText, Github, GraduationCap, LineChart, ShieldCheck, UserRound } from "lucide-react";
import React, { useState } from "react";
import { api, API_ORIGIN } from "../api";
function AuthPanel({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      localStorage.setItem("careerAdvisorToken", data.token);
      localStorage.setItem(
        "careerAdvisorUser",
        JSON.stringify(data.user)
      );

      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function socialLogin(provider) {
    window.location.href =
      `${API_ORIGIN}/api/auth/${provider.toLowerCase()}`;
  }

  return (
    <main
      className="minimal-auth-shell"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg,#0f172a 0%,#1d4ed8 45%,#38bdf8 100%)",
        padding: "30px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* background circles */}
      {/* Background decorative images */}

<img
  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
  alt="Students learning"
  style={{
    position: "absolute",
    top: "60px",
    left: "60px",
    width: "260px",
    height: "180px",
    objectFit: "cover",
    borderRadius: "24px",
    opacity: 0.18,
    transform: "rotate(-8deg)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  }}
/>

<img
  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80"
  alt="Career planning"
  style={{
    position: "absolute",
    bottom: "70px",
    right: "70px",
    width: "260px",
    height: "180px",
    objectFit: "cover",
    borderRadius: "24px",
    opacity: 0.18,
    transform: "rotate(8deg)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  }}
/>

<div
  style={{
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "50%",
    top: "-180px",
    right: "-120px",
    filter: "blur(20px)",
  }}
/>

<div
  style={{
    position: "absolute",
    width: "420px",
    height: "420px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "50%",
    bottom: "-160px",
    left: "-120px",
    filter: "blur(20px)",
  }}
/>
      <div
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "50%",
          bottom: "-160px",
          left: "-120px",
          filter: "blur(20px)",
        }}
      />

      <section
        className="auth-card minimal-auth-card"
        style={{
          width: "100%",
          maxWidth: "470px",
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(16px)",
          borderRadius: "28px",
          padding: "38px",
          color: "#fff",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "82px",
              height: "82px",
              margin: "0 auto 18px",
              borderRadius: "22px",
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GraduationCap size={40} />
          </div>

          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "800",
              lineHeight: "1.3",
              marginBottom: "10px",
            }}
          >
            One Stop Personalized <br />
            Career & Educational Advisor
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.96rem",
            }}
          >
            Discover careers, improve skills, and build your future with AI guidance.
          </p>
        </div>

        {/* Toggle */}
        <div
          className="segmented"
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.08)",
            padding: "6px",
            borderRadius: "14px",
            marginBottom: "22px",
          }}
        >
          <button
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700",
              background:
                mode === "login" ? "#ffffff" : "transparent",
              color:
                mode === "login" ? "#1d4ed8" : "#ffffff",
            }}
          >
            Login
          </button>

          <button
            onClick={() => setMode("register")}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700",
              background:
                mode === "register"
                  ? "#ffffff"
                  : "transparent",
              color:
                mode === "register"
                  ? "#1d4ed8"
                  : "#ffffff",
            }}
          >
            Register
          </button>
        </div>

        {/* Social Login */}
        <div
          className="social-login"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => socialLogin("Google")}
            style={socialBtnWhite}
          >
            <GoogleLogo />
            Continue with Google
          </button>
        </div>

        <div
          style={{
            textAlign: "center",
            marginBottom: "18px",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          or continue with email
        </div>

        {/* Form */}
        <form
          onSubmit={submit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {mode === "register" && (
            <label style={labelStyle}>
              Full Name
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
                style={inputStyle}
              />
            </label>
          )}

          <label style={labelStyle}>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
              minLength={6}
              style={inputStyle}
            />
          </label>

          {mode === "register" && (
            <label style={labelStyle}>
              Current Stage
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                style={inputStyle}
              >
                <option value="student">Student</option>
                <option value="job-seeker">Job Seeker</option>
              </select>
            </label>
          )}

          {error && (
            <p
              style={{
                background: "rgba(239,68,68,0.18)",
                color: "#fecaca",
                padding: "12px",
                borderRadius: "12px",
                fontSize: "0.92rem",
              }}
            >
              {error}
            </p>
          )}

          <button
            className="primary"
            disabled={loading}
            style={{
              marginTop: "6px",
              padding: "15px",
              borderRadius: "14px",
              border: "none",
              background: "#ffffff",
              color: "#1d4ed8",
              fontWeight: "800",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create Account"}

            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontSize: "0.95rem",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  outline: "none",
  fontSize: "0.96rem",
};

const socialBtnWhite = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  background: "#fff",
  color: "#111",
  fontWeight: "700",
  cursor: "pointer",
};
export default AuthPanel;

