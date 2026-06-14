import { FileText, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { api, API_ORIGIN } from "../api";
function ResumePanel({ onNavigate }) {
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [roles, setRoles] = useState([
    "Software Engineer",
    "Full Stack Developer",
    "Data Analyst",
    "Data Scientist",
    "AI Engineer",
    "Cloud Engineer",
    "Cybersecurity Analyst",
    "Business Analyst"
  ]);
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
    api("/resumes/roles").then((data) => setRoles(data.roles)).catch(() => {});
  }, []);

  async function analyze() {
    setError("");
    setLoading(true);
    try {
      const data = await api("/resumes/analyze", {
        method: "POST",
        body: JSON.stringify({ resumeText, targetRole }),
      });
      setAnalyses([data.analysis, ...analyses]);
      setResumeText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeFile() {
    if (!resumeFile) {
      setError("Upload a PDF or image resume first");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("targetRole", targetRole);
      const token = localStorage.getItem("careerAdvisorToken");
      const response = await fetch(`${API_ORIGIN}/api/resumes/analyze-file`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Resume file analysis failed");
      setAnalyses([data.analysis, ...analyses]);
      setResumeFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const extractYoutubeId = (url) => {
    try {
      const parsed = new URL(url);
      const id = parsed.searchParams.get("v");
      if (id) return id;
      const path = parsed.pathname.split("/").pop();
      return path;
    } catch {
      return null;
    }
  };

  return (
    <section className="resume-panel">
      <div className="resume-copy">
        <p className="eyebrow">NLP resume analysis</p>
        <h2><FileText size={24} /> Resume fit scanner</h2>
        <label>
          Target role you want to apply for
          <select value={targetRole} onChange={(event) => setTargetRole(event.target.value)}>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </label>
        <textarea
          value={resumeText}
          onChange={(event) => setResumeText(event.target.value)}
          placeholder="Paste resume summary, skills, projects, internship experience, and education here..."
        />
        <label>
          Upload PDF or image resume
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
            onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="resume-actions-row">
          <button className="primary" onClick={analyze} disabled={loading}>
            {loading ? "Analyzing resume..." : "Analyze resume"}
            <Sparkles size={18} />
          </button>
          <button className="primary" onClick={analyzeFile} disabled={loading}>
            {loading ? "Extracting..." : "Analyze Uploaded Resume"}
            <FileText size={18} />
          </button>
        </div>
        <button className="secondary" onClick={() => onNavigate?.("guidance")}>Go to Guidance Path</button>

        <div className="resume-guidance-panel">
          <h4>Make your resume stand out</h4>
          {latest?.suggestions?.length ? (
            latest.suggestions.map((item) => (
              <p key={item}>{item}</p>
            ))
          ) : (
            <>
              <p>Add a short summary with target role, strongest skills, and one achievement.</p>
              <p>Add GitHub, LinkedIn, portfolio, deployed project, and certificate links.</p>
              <p>Use measurable project bullets: action, tech stack, result, and proof link.</p>
            </>
          )}
        </div>

      </div>

      <div className="resume-result">
        {!latest ? (
          <p>Select your target role, then paste or upload your resume to extract skills, find gaps, calculate ATS score, and get improvement suggestions.</p>
        ) : (
          <>
            <div className="resume-result-header">
              <div>
                <p className="eyebrow">Resume dashboard</p>
                <h3>{latest.targetRole || targetRole}</h3>
                <strong>{latest.atsScore || Math.round((latest.matchScore || 0) * 100)}% ATS score</strong>
                <p>{latest.summary}</p>
              </div>
              <button className="primary" onClick={() => onNavigate?.("guidance")}>Open guidance path</button>
            </div>

            <div className="subject-score-grid">
              {Object.entries(latest.sectionScores || {}).map(([name, score]) => (
                <div className="subject-score-card" key={name}>
                  <small>{name}</small>
                  <strong>{score}%</strong>
                  <div><span style={{ width: `${score}%` }} /></div>
                </div>
              ))}
            </div>

            <h4>Role Match</h4>
            <div className="job-row">
              <div>
                <strong>{latest.matchedCareer}</strong>
                <small>Closest career detected from resume content</small>
              </div>
              <span>{Math.round((latest.matchScore || 0) * 100)}%</span>
            </div>

            <h4>Matched Skills</h4>
            <div className="chips">
              {(latest.matchedSkills?.length ? latest.matchedSkills : latest.extractedSkills)?.map((skill) => <span key={skill}>{skill}</span>)}
            </div>

            <h4>Missing Skills</h4>
            <div className="chips muted">
              {latest.missingSkills?.map((skill) => <span key={skill}>{skill}</span>)}
            </div>

            <h4>Required Skills for {latest.targetRole || targetRole}</h4>
            <div className="chips">
              {latest.roleRequiredSkills?.map((skill) => <span key={skill}>{skill}</span>)}
            </div>

            <h4>Education / Experience / Projects Detected</h4>
            {[...(latest.education || []), ...(latest.experience || []), ...(latest.projects || [])].slice(0, 8).map((item) => (
              <div className="job-row" key={item}>
                <div>
                  <strong>{item}</strong>
                  <small>Extracted from resume text</small>
                </div>
              </div>
            ))}

            <h4>Skill Gap Learning Plan</h4>
            {latest.learningPlan?.map((item) => (
              <div className="job-row" key={item}>
                <div>
                  <strong>{item}</strong>
                  <small>Next step for target role</small>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
export default ResumePanel;

