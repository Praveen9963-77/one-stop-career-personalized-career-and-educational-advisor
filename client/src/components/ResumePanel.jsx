import { FileText, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { api, API_ORIGIN } from "../api";
function ResumePanel() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
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
      const token = localStorage.getItem("careerAdvisorToken");
      const response = await fetch(`${API_ORIGIN}/api/resumes/analyze-file`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
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
        <label>
          Upload PDF or image resume
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
            onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" onClick={analyze} disabled={loading}>
          {loading ? "Analyzing resume..." : "Analyze resume"}
          <Sparkles size={18} />
        </button>
        <button className="primary" onClick={analyzeFile} disabled={loading}>
          {loading ? "Extracting..." : "Analyze Uploaded Resume"}
          <FileText size={18} />
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
export default ResumePanel;

