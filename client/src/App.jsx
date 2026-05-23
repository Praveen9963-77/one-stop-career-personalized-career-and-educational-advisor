import {
  ArrowRight,
  Bell,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  Code2,
  Compass,
  FileText,
  Github,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  ListChecks,
  LogOut,
  Map,
  Medal,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api, API_ORIGIN } from "./api";

const defaultAnswers = {
  technical: 3,
  analytical: 3,
  creativity: 3,
  communication: 3,
  social: 3,
  business: 3,
  health_interest: 3,
  arts_interest: 3,
  problem_solving: 3,
  academic_score: 3,
};

function AuthPanel({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
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
      localStorage.setItem("careerAdvisorUser", JSON.stringify(data.user));
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function socialLogin(provider) {
    window.location.href = `${API_ORIGIN}/api/auth/${provider.toLowerCase()}`;
  }

  return (
    <main className="minimal-auth-shell">
      <section className="auth-card minimal-auth-card">
        <div className="landing-brand minimal-brand">
          <GraduationCap size={30} />
          <div>
            <strong>Career<span>Advisor</span></strong>
            <small>Discover. Plan. Achieve.</small>
          </div>
        </div>
        <div className="auth-heading">
          <p className="eyebrow">{mode === "login" ? "Continue your journey" : "Create your profile"}</p>
          <h2>{mode === "login" ? "Welcome back" : "Start career guidance"}</h2>
        </div>
        <div className="segmented">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button>
        </div>

        <div className="social-login">
          <button type="button" onClick={() => socialLogin("Google")}>
            <span className="google-mark">G</span>
            Continue with Google
          </button>
          <button type="button" onClick={() => socialLogin("GitHub")}>
            <Github size={18} />
            Continue with GitHub
          </button>
        </div>

        <div className="divider"><span>or use email</span></div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Full name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </label>
          {mode === "register" && (
            <label>
              Current stage
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="job-seeker">Job seeker</option>
              </select>
            </label>
          )}
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}

function TestPanel({ onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(defaultAnswers);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/tests/questions").then((data) => setQuestions(data.questions));
  }, []);

  const question = questions[active];
  const progress = questions.length ? Math.round(((active + 1) / questions.length) * 100) : 0;
  const selectedAnswer = question ? answers[question.id] : undefined;

  async function submit() {
    setLoading(true);
    const data = await api("/tests/submit", {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    onSaved(data.result);
    setLoading(false);
  }

  if (!question) {
    return <section className="panel">Loading test...</section>;
  }

  return (
    <section className="test-surface">
      <div className="test-header">
        <div>
          <p className="eyebrow">Aptitude test</p>
          <h2>{question.text}</h2>
        </div>
        <strong>{progress}%</strong>
      </div>
      <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      {question.options ? (
        <div className="option-row">
          {question.options.map((option) => (
            <button
              key={option}
              className={selectedAnswer === option ? "selected" : ""}
              onClick={() => setAnswers({ ...answers, [question.id]: option })}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="rating-row">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                className={answers[question.id] === value ? "selected" : ""}
                onClick={() => setAnswers({ ...answers, [question.id]: value })}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="scale-labels">
            <span>Strongly disagree</span>
            <span>Strongly agree</span>
          </div>
        </>
      )}
      <div className="actions">
        <button disabled={active === 0} onClick={() => setActive(active - 1)}>Back</button>
        {active < questions.length - 1 ? (
          <button className="primary" onClick={() => setActive(active + 1)} disabled={!selectedAnswer}>Next <ArrowRight size={18} /></button>
        ) : (
          <button className="primary" onClick={submit} disabled={loading || !selectedAnswer}>{loading ? "Analyzing..." : "Get recommendation"} <Sparkles size={18} /></button>
        )}
      </div>
    </section>
  );
}

function ResultPanel({ result }) {
  if (!result) {
    return (
      <section className="empty-state">
        <GraduationCap size={42} />
        <h2>No test result yet</h2>
        <p>Complete the profile test to generate your first career and education recommendation.</p>
      </section>
    );
  }

  const recommendation = result.recommendation;
  const scores = Object.fromEntries(Object.entries(result.scores || {}));

  return (
    <section className="result-grid">
      <div className="recommendation">
        <p className="eyebrow">Recommended path</p>
        <h2>{recommendation.career}</h2>
        <p>{recommendation.explanation}</p>
        <div className="confidence">
          <span>Confidence</span>
          <strong>{Math.round((recommendation.confidence || 0) * 100)}%</strong>
        </div>
      </div>
      <div className="panel">
        <h3>Education Path</h3>
        {recommendation.educationPath?.map((item) => <p className="path-item" key={item}>{item}</p>)}
      </div>
      <div className="panel">
        <h3>Skills To Build</h3>
        <div className="chips">
          {recommendation.skillsToBuild?.map((skill) => <span key={skill}>{skill}</span>)}
        </div>
      </div>
      <div className="panel score-panel">
        <h3>Profile Signals</h3>
        {Object.entries(scores).map(([name, value]) => (
          <div className="score" key={name}>
            <span>{name.replace("_", " ")}</span>
            <div><span style={{ width: `${Number(value) * 20}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResumePanel() {
  const [resumeText, setResumeText] = useState("");
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const latest = analyses[0]?.analysis;

  async function refresh() {
    const data = await api("/resumes/analyses");
    setAnalyses(data.analyses);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function analyze() {
    setError("");
    setLoading(true);
    try {
      const data = await api("/resumes/analyze", {
        method: "POST",
        body: JSON.stringify({ resumeText }),
      });
      setAnalyses([data.analysis, ...analyses]);
      setResumeText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="resume-panel">
      <div className="resume-copy">
        <p className="eyebrow">NLP resume analysis</p>
        <h2><FileText size={24} /> Resume fit scanner</h2>
        <textarea
          value={resumeText}
          onChange={(event) => setResumeText(event.target.value)}
          placeholder="Paste resume summary, skills, projects, internship experience, and education here..."
        />
        {error && <p className="error">{error}</p>}
        <button className="primary" onClick={analyze} disabled={loading}>
          {loading ? "Analyzing resume..." : "Analyze resume"}
          <Sparkles size={18} />
        </button>
      </div>

      <div className="resume-result">
        {!latest ? (
          <p>Paste resume text to extract skills, keywords, career fit, and missing skills.</p>
        ) : (
          <>
            <p className="eyebrow">Best resume match</p>
            <h3>{latest.matchedCareer}</h3>
            <strong>{Math.round((latest.matchScore || 0) * 100)}% fit</strong>
            <p>{latest.summary}</p>
            <div className="chips">
              {latest.extractedSkills?.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
            <h4>Missing Skills</h4>
            <div className="chips muted">
              {latest.missingSkills?.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

const sidebarFeatures = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "guidance", label: "Guidance", icon: Compass },
  { id: "aptitude", label: "Aptitude Test", icon: ListChecks },
  { id: "coding", label: "Coding Test", icon: Code2 },
  { id: "skills", label: "Input Skills", icon: BrainCircuit },
  { id: "resume", label: "Resume NLP", icon: FileText },
  { id: "jobs", label: "Job Finder", icon: BriefcaseBusiness },
  { id: "courses", label: "Roadmap", icon: Map },
  { id: "development", label: "Skill Development", icon: LineChart },
  { id: "mentor", label: "Expert Guidance", icon: UserRound },
  { id: "progress", label: "Track Progress", icon: Trophy },
  { id: "profile", label: "Profile Report", icon: UserRound }
];

const practiceTracks = [
  { title: "Aptitude Track", detail: "Quant, reasoning, data interpretation", level: "Core", color: "blue" },
  { title: "Coding Track", detail: "Logic, arrays, strings, problem solving", level: "Technical", color: "violet" },
  { title: "Verbal Track", detail: "Grammar, comprehension, communication", level: "Soft skill", color: "green" },
  { title: "Case Study Track", detail: "Business scenarios and decision making", level: "Career", color: "orange" }
];

const jobMatches = [
  { role: "Frontend Developer Intern", fit: "87%", skills: "React, JavaScript, UI basics" },
  { role: "Data Analyst Trainee", fit: "78%", skills: "Excel, SQL, Python" },
  { role: "Business Analyst Intern", fit: "74%", skills: "Communication, process, dashboards" }
];

const advisorFeatures = [
  ["Personalized Guidance", "AI algorithms analyze interests, skills and academics.", BrainCircuit, "guidance"],
  ["Education Roadmap", "Get recommended courses, colleges and certifications.", GraduationCap, "courses"],
  ["Skill Development", "Discover in-demand skills and learning resources.", LineChart, "development"],
  ["Career Opportunities", "Explore jobs, salary insights and future trends.", BriefcaseBusiness, "jobs"],
  ["Expert Guidance", "Connect progress with mentor-ready reports.", UserRound, "mentor"],
  ["Track Progress", "Save tests, resume analysis and milestones.", FileText, "progress"]
];

function SkillInputPanel() {
  const [skills, setSkills] = useState("React, Python, SQL, Communication");
  const [saved, setSaved] = useState(false);
  const parsed = skills.split(",").map((skill) => skill.trim()).filter(Boolean);

  async function saveSkills() {
    await api("/advisor/profile", {
      method: "PUT",
      body: JSON.stringify({ skills: parsed })
    });
    setSaved(true);
  }

  return (
    <section className="advisor-card skill-builder">
      <div>
        <p className="eyebrow">Input skills</p>
        <h2>Skill intelligence board</h2>
        <p>Add your current skills to compare them with test results, resume signals, and job-ready tracks.</p>
      </div>
      <textarea value={skills} onChange={(event) => setSkills(event.target.value)} />
      <div className="chips">
        {parsed.map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      <button className="primary" onClick={saveSkills}>{saved ? "Skills Saved" : "Save Skills"}</button>
    </section>
  );
}

function CodingPracticePanel() {
  return (
    <section className="advisor-card coding-panel">
      <div>
        <p className="eyebrow">Coding test</p>
        <h2>Practice challenges</h2>
      </div>
      {["Arrays and Strings", "Aptitude Logic", "Database Queries"].map((item, index) => (
        <div className="challenge-row" key={item}>
          <span className={`difficulty d${index}`}>{index === 0 ? "Easy" : index === 1 ? "Medium" : "Hard"}</span>
          <div>
            <strong>{item}</strong>
            <small>{12 + index * 4} questions • {30 + index * 10} mins</small>
          </div>
          <button>Solve Now</button>
        </div>
      ))}
    </section>
  );
}

function JobFinderPanel() {
  const [data, setData] = useState({ jobs: jobMatches });

  useEffect(() => {
    api("/advisor/jobs").then(setData).catch(() => setData({ jobs: jobMatches }));
  }, []);

  return (
    <section className="advisor-card job-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Job finder</p>
          <h2>Recommended opportunities</h2>
        </div>
        <Search size={22} />
      </div>
      {data.jobs.map((job) => (
        <div className="job-row" key={job.role}>
          <div>
            <strong>{job.role}</strong>
            <small>{job.skills || job.type}</small>
          </div>
          <span>{job.fit}</span>
        </div>
      ))}
    </section>
  );
}

function RoadmapPanel() {
  const [data, setData] = useState({ roadmap: [] });

  useEffect(() => {
    api("/advisor/roadmap").then(setData).catch(() => setData({ roadmap: [] }));
  }, []);

  const steps = data.roadmap.length
    ? data.roadmap.map((item) => item.title)
    : ["Complete aptitude baseline", "Upload resume for NLP analysis", "Finish two coding sets", "Apply to matched internships"];

  return (
    <section className="advisor-card roadmap-panel">
      <p className="eyebrow">Learning roadmap</p>
      <h2>Next 30 days</h2>
      {steps.map((step, index) => (
        <div className="road-step" key={step}>
          <span>{index + 1}</span>
          <p>{step}</p>
        </div>
      ))}
    </section>
  );
}

function GuidancePanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/advisor/guidance").then(setData);
  }, []);

  return (
    <section className="advisor-card roadmap-panel">
      <p className="eyebrow">Personalized guidance</p>
      <h2>{data?.career || "AI Career Suggestions"}</h2>
      {(data?.suggestions || ["Complete the test to unlock AI-based suggestions."]).map((item, index) => (
        <div className="road-step" key={item}>
          <span>{index + 1}</span>
          <p>{item}</p>
        </div>
      ))}
    </section>
  );
}

function SkillDevelopmentPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/advisor/skills").then(setData);
  }, []);

  return (
    <section className="advisor-card skill-builder">
      <p className="eyebrow">Skill development</p>
      <h2>{data?.career || "Learning Path"}</h2>
      <div className="chips">
        {(data?.recommendedSkills || ["JavaScript", "SQL", "Communication"]).map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      {(data?.learningPath || []).map((item) => (
        <div className="road-step" key={item.skill}>
          <span><BookOpen size={16} /></span>
          <p>{item.action}</p>
        </div>
      ))}
    </section>
  );
}

function MentorPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/advisor/mentor").then(setData);
  }, []);

  return (
    <section className="advisor-card roadmap-panel">
      <p className="eyebrow">Expert guidance</p>
      <h2>Mentor Support</h2>
      {(data?.mentorTips || ["Ask for resume review", "Prepare interview answers", "Discuss your roadmap"]).map((tip, index) => (
        <div className="road-step" key={tip}>
          <span>{index + 1}</span>
          <p>{tip}</p>
        </div>
      ))}
      <div className="chips">
        {(data?.chatPrompts || []).map((prompt) => <span key={prompt}>{prompt}</span>)}
      </div>
    </section>
  );
}

function ProgressPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/advisor/progress").then(setData);
  }, []);

  return (
    <section className="advisor-card roadmap-panel">
      <p className="eyebrow">Track progress</p>
      <h2>{data?.roadmapProgress || 0}% Roadmap Complete</h2>
      <div className="chips">
        {(data?.completedSkills?.length ? data.completedSkills : ["Complete skills to track progress"]).map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      {(data?.milestones || []).map((item) => (
        <div className="road-step" key={item.title}>
          <span>{item.done ? "✓" : "•"}</span>
          <p>{item.title}</p>
        </div>
      ))}
    </section>
  );
}

function ProfilePanel({ user }) {
  const [profile, setProfile] = useState(null);
  const [targetRole, setTargetRole] = useState("");

  useEffect(() => {
    api("/advisor/profile").then((data) => {
      setProfile(data.profile);
      setTargetRole(data.profile.targetRole || "");
    });
  }, []);

  async function saveProfile() {
    const data = await api("/advisor/profile", {
      method: "PUT",
      body: JSON.stringify({ targetRole })
    });
    setProfile(data.profile);
  }

  return (
    <section className="advisor-card skill-builder">
      <p className="eyebrow">User profile management</p>
      <h2>{user.name}</h2>
      <p>{user.email || user.role || "Student"}</p>
      <textarea value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Target role, interests, or career goal" />
      <button className="primary" onClick={saveProfile}>{profile ? "Save Profile" : "Create Profile"}</button>
    </section>
  );
}

function AdvisorHome({ onStartTest, onOpenJobs, onFeature }) {
  return (
    <section className="advisor-home">
      <div className="advisor-home-copy">
        <div className="landing-badges">
          <span>AI-Powered</span>
          <span>Personalized</span>
          <span>Smart Guidance</span>
        </div>
        <h2>One Stop Personalized <span>Career & Education</span> Advisor</h2>
        <p>Get personalized career recommendations, explore education paths, analyze skills, and choose your future with AI and smart analytics.</p>
        <div className="landing-cta">
          <button className="get-started" onClick={onStartTest}>
            Start Your Journey <ArrowRight size={18} />
          </button>
          <button className="explore-btn" onClick={onOpenJobs}>
            Explore Careers <Compass size={17} />
          </button>
        </div>
      </div>
      <div className="hero-visual-card advisor-visual-card">
        <img alt="Student planning career" src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=760&q=90" />
        <div className="floating-card card-one">
          <Target size={24} />
          <strong>Personalized Recommendations</strong>
          <small>AI matched careers for your profile</small>
        </div>
        <div className="floating-card card-two">
          <LineChart size={24} />
          <strong>Skill Analysis</strong>
          <small>Identify strengths and improve</small>
        </div>
        <div className="floating-card card-three">
          <BookOpen size={24} />
          <strong>Education Pathways</strong>
          <small>Best courses and degrees</small>
        </div>
      </div>
      <div className="landing-feature-panel advisor-feature-panel">
        <div className="landing-section-title">
          <h2>Everything You Need for the <span>Right Career Decisions</span></h2>
        </div>
        <div className="landing-feature-grid">
          {advisorFeatures.map(([title, text, Icon, featureId]) => (
            <article className="landing-feature" key={title} onClick={() => onFeature(featureId)} role="button" tabIndex={0}>
              <Icon size={28} />
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dashboard({ user, onLogout }) {
  const [results, setResults] = useState([]);
  const [activeFeature, setActiveFeature] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const latest = results[0];

  async function refresh() {
    const data = await api("/tests/results");
    setResults(data.results);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className={`portal-shell ${sidebarOpen ? "" : "sidebar-closed"}`}>
      {sidebarOpen && <aside className="portal-sidebar">
        <div className="portal-logo">
          <GraduationCap size={28} />
          <div>
            <strong>One Stop</strong>
            <span>Career Advisor</span>
          </div>
          <button className="sidebar-close" title="Close dashboard" onClick={() => setSidebarOpen(false)}>
            <ArrowRight size={18} />
          </button>
        </div>
        <nav>
          {sidebarFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activeFeature === item.id ? "active" : ""}
                onClick={() => setActiveFeature(item.id)}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-pro">
          <Medal size={24} />
          <strong>Career Score</strong>
          <span>{latest ? Math.round((latest.recommendation?.confidence || 0) * 100) : 54}% ready</span>
        </div>
      </aside>}

      <section className="portal-main">
        <header className="portal-topbar">
          <div className="topbar-title">
            {!sidebarOpen && (
              <button className="icon-button" title="Open dashboard" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
            )}
            <div>
              <p className="eyebrow">Welcome back</p>
              <h1>{user.name}</h1>
            </div>
          </div>
          <div className="top-account">
            <button className="icon-button" title="Notifications"><Bell size={19} /></button>
            <div className="account-pill">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{user.name?.[0] || "U"}</span>}
              <div>
                <strong>{user.name}</strong>
                <small>{user.email || user.role || "Student"}</small>
              </div>
            </div>
            <button className="icon-button" title="Logout" onClick={onLogout}><LogOut size={19} /></button>
          </div>
        </header>

        {activeFeature === "dashboard" && (
          <AdvisorHome
            onStartTest={() => setActiveFeature("aptitude")}
            onOpenJobs={() => setActiveFeature("jobs")}
            onFeature={setActiveFeature}
          />
        )}

        <section className="practice-grid">
          {practiceTracks.map((track) => (
            <button className={`track-card ${track.color}`} key={track.title} onClick={() => setActiveFeature(track.title.includes("Coding") ? "coding" : "aptitude")}>
              <span>{track.level}</span>
              <strong>{track.title}</strong>
              <small>{track.detail}</small>
            </button>
          ))}
        </section>

        <section className="portal-content">
          <div className="primary-workspace">
            {activeFeature === "aptitude" && <TestPanel onSaved={(result) => setResults([result, ...results])} />}
            {activeFeature === "coding" && <CodingPracticePanel />}
            {activeFeature === "skills" && <SkillInputPanel />}
            {activeFeature === "resume" && <ResumePanel />}
            {activeFeature === "jobs" && <JobFinderPanel />}
            {activeFeature === "courses" && <RoadmapPanel />}
            {activeFeature === "guidance" && <GuidancePanel />}
            {activeFeature === "development" && <SkillDevelopmentPanel />}
            {activeFeature === "mentor" && <MentorPanel />}
            {activeFeature === "progress" && <ProgressPanel />}
            {activeFeature === "profile" && <ProfilePanel user={user} />}
            <div className="history premium-history">
              <h3>Stored Results</h3>
              {results.length === 0 && <p>Results will appear here after your first test.</p>}
              {results.map((result) => (
                <button className="history-item" key={result._id}>
                  <span>{result.recommendation?.career}</span>
                  <small>{new Date(result.createdAt).toLocaleString()}</small>
                </button>
              ))}
            </div>
          </div>
          <aside className="insight-rail">
            <ResultPanel result={latest} />
            <div className="mini-calendar">
              <div className="section-title">
                <h3>May 2026</h3>
                <CalendarDays size={20} />
              </div>
              <div className="calendar-grid">
                {Array.from({ length: 14 }, (_, index) => (
                  <span className={index === 5 ? "today" : index > 8 ? "locked" : ""} key={index}>{index + 12}</span>
                ))}
              </div>
            </div>
            <RoadmapPanel />
          </aside>
        </section>
      </section>
    </main>
  );
}

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
