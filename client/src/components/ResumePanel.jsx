import { FileText, Sparkles } from "lucide-react";
import React, { useMemo, useState } from "react";
import { api } from "../api";

const roleCatalog = {
  "Software Engineer": {
    requiredSkills: ["JavaScript", "Python", "Data Structures", "Algorithms", "Git", "REST API", "SQL", "Problem Solving"],
    keywords: ["software", "backend", "frontend", "api", "debugging", "testing", "database", "deployment"],
    learningPlan: ["Practice DSA daily", "Build two full-stack projects", "Add API testing and deployment links"]
  },
  "Full Stack Developer": {
    requiredSkills: ["HTML", "CSS", "JavaScript", "Frontend Framework", "Backend Framework", "Database", "REST API", "Git"],
    keywords: ["frontend", "backend", "component", "server", "database", "authentication", "deployment"],
    learningPlan: ["Create a MERN portfolio project", "Add authentication and CRUD APIs", "Deploy frontend and backend"]
  },
  "Data Analyst": {
    requiredSkills: ["Excel", "SQL", "Python", "Pandas", "Statistics", "Power BI", "Data Visualization"],
    keywords: ["dashboard", "analytics", "report", "cleaning", "insight", "visualization", "metrics"],
    learningPlan: ["Create SQL case studies", "Build Power BI dashboards", "Add data cleaning projects"]
  },
  "Data Scientist": {
    requiredSkills: ["Python", "Pandas", "NumPy", "Statistics", "Machine Learning", "SQL", "Model Evaluation"],
    keywords: ["prediction", "classification", "regression", "dataset", "model", "accuracy", "feature"],
    learningPlan: ["Add ML projects with metrics", "Explain model evaluation", "Publish notebooks and deployed demos"]
  },
  "AI Engineer": {
    requiredSkills: ["Python", "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch", "Model Deployment"],
    keywords: ["ai", "nlp", "neural", "training", "inference", "embedding", "pipeline"],
    learningPlan: ["Build one NLP project", "Add model deployment proof", "Mention training data and evaluation"]
  },
  "Cloud Engineer": {
    requiredSkills: ["Linux", "Networking", "AWS", "Docker", "CI/CD", "Kubernetes", "Monitoring"],
    keywords: ["cloud", "deployment", "server", "container", "pipeline", "scaling", "availability"],
    learningPlan: ["Deploy a project on cloud", "Learn Docker and CI/CD", "Add monitoring or logging experience"]
  },
  "Cybersecurity Analyst": {
    requiredSkills: ["Networking", "Linux", "Security", "OWASP", "SIEM", "Vulnerability Assessment", "Incident Response"],
    keywords: ["threat", "vulnerability", "firewall", "risk", "audit", "incident", "secure"],
    learningPlan: ["Practice OWASP labs", "Add security reports", "Earn an entry-level security certification"]
  },
  "Business Analyst": {
    requiredSkills: ["Excel", "SQL", "Communication", "Requirement Analysis", "Documentation", "Power BI", "Stakeholder Management"],
    keywords: ["requirement", "stakeholder", "process", "analysis", "report", "workflow", "business"],
    learningPlan: ["Add BRD/user story samples", "Build dashboard case studies", "Show stakeholder communication examples"]
  }
};

const skillBank = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "SQL", "MySQL",
  "PostgreSQL", "Python", "Java", "C", "C++", "Git", "REST API", "GraphQL", "Docker", "Kubernetes",
  "AWS", "Azure", "GCP", "Linux", "CI/CD", "Django", "Flask", "FastAPI", "Machine Learning", "Deep Learning", "NLP", "TensorFlow",
  "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Statistics", "Power BI", "Excel", "Data Visualization",
  "Networking", "Security", "OWASP", "SIEM", "Communication", "Leadership", "Teamwork", "Problem Solving",
  "Data Structures", "Algorithms", "Model Evaluation", "Model Deployment", "Requirement Analysis", "Documentation"
];

const certificationLinks = [
  { title: "freeCodeCamp Certifications", url: "https://www.freecodecamp.org/learn/" },
  { title: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
  { title: "Microsoft Learn", url: "https://learn.microsoft.com/training/" },
  { title: "AWS Skill Builder", url: "https://skillbuilder.aws/" },
  { title: "Cisco Skills For All", url: "https://skillsforall.com/" },
  { title: "IBM SkillsBuild", url: "https://skillsbuild.org/" }
];

const jobDataset = [
  { title: "Backend Developer", company: "TechWave", location: "Remote", type: "Full time", skills: ["Node.js", "Express", "SQL", "REST API", "Git", "Docker"] },
  { title: "Full Stack Developer", company: "NexGen Solutions", location: "Bengaluru", type: "Full time", skills: ["React", "Node.js", "MongoDB", "HTML", "CSS", "REST API"] },
  { title: "Data Analyst", company: "Insight Labs", location: "Hyderabad", type: "Full time", skills: ["SQL", "Excel", "Power BI", "Python", "Pandas", "Data Visualization"] },
  { title: "Data Scientist", company: "ModelCraft", location: "Bengaluru", type: "Full time", skills: ["Python", "Machine Learning", "Statistics", "Pandas", "Scikit-learn", "SQL"] },
  { title: "AI Engineer", company: "CortexAI", location: "Pune", type: "Full time", skills: ["Python", "TensorFlow", "PyTorch", "NLP", "Deep Learning", "Model Deployment"] },
  { title: "Cloud Engineer", company: "CloudForge", location: "Mumbai", type: "Full time", skills: ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD", "Terraform"] }
];

const skillEquivalents = {
  "Frontend Framework": ["React", "Angular", "Vue", "Next.js"],
  "Backend Framework": ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot"],
  "Database": ["MongoDB", "SQL", "MySQL", "PostgreSQL", "SQLite", "Oracle"],
  "REST API": ["REST API", "API", "Django REST Framework", "Express", "FastAPI"],
  "JavaScript": ["JavaScript", "TypeScript"],
  "Python": ["Python", "Django", "Flask", "FastAPI"],
  "SQL": ["SQL", "MySQL", "PostgreSQL", "SQLite", "Oracle"]
};

const learningLinks = {
  "HTML": "https://www.youtube.com/results?search_query=html+full+course+for+beginners",
  "CSS": "https://www.youtube.com/results?search_query=css+full+course+for+beginners",
  "JavaScript": "https://www.youtube.com/results?search_query=javascript+full+course+for+beginners",
  "Frontend Framework": "https://www.youtube.com/results?search_query=react+frontend+framework+full+course",
  "Backend Framework": "https://www.youtube.com/results?search_query=django+express+backend+full+course",
  "Database": "https://www.youtube.com/results?search_query=sql+mongodb+database+full+course",
  "REST API": "https://www.youtube.com/results?search_query=rest+api+development+full+course",
  "Git": "https://www.youtube.com/results?search_query=git+github+full+course",
  "MongoDB": "https://www.mongodb.com/docs/",
  "SQL": "https://www.khanacademy.org/computing/computer-programming/sql",
  "Django": "https://docs.djangoproject.com/en/stable/intro/tutorial01/",
  "Python": "https://www.youtube.com/results?search_query=python+full+course+for+beginners"
};

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[^\w\s.#/+%-]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function getLines(text) {
  return cleanText(text).split(/\n+/).map((line) => line.trim()).filter((line) => line.length > 6);
}

function includesSkill(text, skill) {
  return new RegExp(`\\b${escapeRegex(skill.toLowerCase())}\\b`, "i").test(text.toLowerCase());
}

function hasSkillOrEquivalent(extractedSkills, requiredSkill) {
  const accepted = skillEquivalents[requiredSkill] || [requiredSkill];
  return accepted.some((skill) => extractedSkills.some((found) => found.toLowerCase() === skill.toLowerCase()));
}

function matchedEquivalentLabel(extractedSkills, requiredSkill) {
  const accepted = skillEquivalents[requiredSkill] || [requiredSkill];
  return accepted.find((skill) => extractedSkills.some((found) => found.toLowerCase() === skill.toLowerCase())) || "";
}

function extractSkills(text) {
  return skillBank.filter((skill) => includesSkill(text, skill)).sort();
}

function extractSectionLines(text, markers) {
  return getLines(text).filter((line) => markers.some((marker) => line.toLowerCase().includes(marker))).slice(0, 6);
}

function buildLearningResources(skills) {
  return [...new Set(skills)].slice(0, 8).map((skill) => ({
    skill,
    youtube: learningLinks[skill] || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} full course for beginners`)}`,
    certifications: certificationLinks.slice(0, 3)
  }));
}

function analyzeResumeLocally(text, targetRole) {
  const cleaned = cleanText(text);
  const lower = cleaned.toLowerCase();
  const roleData = roleCatalog[targetRole] || roleCatalog["Software Engineer"];
  const extractedSkills = extractSkills(cleaned);
  const matchedSkills = roleData.requiredSkills.filter((skill) => hasSkillOrEquivalent(extractedSkills, skill));
  const matchedSkillEvidence = matchedSkills.map((skill) => {
    const evidence = matchedEquivalentLabel(extractedSkills, skill);
    return evidence && evidence !== skill ? `${skill} (${evidence})` : skill;
  });
  const missingSkills = roleData.requiredSkills.filter((skill) => !hasSkillOrEquivalent(extractedSkills, skill));
  const keywordHits = roleData.keywords.filter((keyword) => lower.includes(keyword));
  const educationLines = extractSectionLines(cleaned, ["b.tech", "btech", "degree", "university", "college", "cgpa", "gpa", "school"]);
  const experienceLines = extractSectionLines(cleaned, ["experience", "intern", "worked", "company", "developed", "managed", "implemented"]);
  const projectLines = extractSectionLines(cleaned, ["project", "built", "created", "deployed", "designed", "developed"]);
  const certificationLines = extractSectionLines(cleaned, ["certificate", "certification", "certified", "course", "training"]);

  const skillsScore = Math.round((matchedSkills.length / Math.max(1, roleData.requiredSkills.length)) * 100);
  const keywordsScore = Math.round((keywordHits.length / Math.max(1, roleData.keywords.length)) * 100);
  const educationScore = educationLines.length ? Math.min(100, 55 + educationLines.length * 15) : 25;
  const experienceScore = experienceLines.length ? Math.min(100, 35 + experienceLines.length * 12) : 20;
  const projectsScore = projectLines.length ? Math.min(100, 40 + projectLines.length * 15) : 20;
  const certificationsScore = certificationLines.length ? Math.min(100, certificationLines.length * 25) : 10;
  const structureScore = Math.min(100, Math.round((educationLines.length + experienceLines.length + projectLines.length + certificationLines.length) * 12));
  const atsScore = Math.round(skillsScore * 0.32 + keywordsScore * 0.18 + projectsScore * 0.18 + experienceScore * 0.14 + educationScore * 0.1 + structureScore * 0.08);

  const careerRecommendations = Object.entries(roleCatalog)
    .map(([career, data]) => {
      const equivalentMatches = data.requiredSkills.filter((skill) => hasSkillOrEquivalent(extractedSkills, skill));
      return {
        career,
        score: Math.round((equivalentMatches.length / data.requiredSkills.length) * 100),
        confidence: Math.round((equivalentMatches.length / data.requiredSkills.length) * 100),
        explanation: `Matched ${equivalentMatches.length} required skills for ${career}.`
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const targetRecommendation = careerRecommendations.find((item) => item.career === targetRole) || {
    career: targetRole,
    score: skillsScore,
    confidence: skillsScore,
    explanation: `Matched ${matchedSkills.length} required skills for ${targetRole}.`
  };
  const orderedRecommendations = [
    targetRecommendation,
    ...careerRecommendations.filter((item) => item.career !== targetRole)
  ].slice(0, 4);
  const matchedCareer = targetRole;
  const jobMatches = jobDataset.map((job) => {
    const matchingSkills = job.skills.filter((skill) => extractedSkills.some((found) => found.toLowerCase() === skill.toLowerCase()));
    return {
      ...job,
      matchingSkills,
      missingSkills: job.skills.filter((skill) => !matchingSkills.includes(skill)),
      matchPercent: Math.round((matchingSkills.length / job.skills.length) * 100)
    };
  }).sort((a, b) => b.matchPercent - a.matchPercent).slice(0, 5);

  const suggestions = [
    matchedSkills.length < 4 ? `Add stronger proof for ${missingSkills.slice(0, 3).join(", ")}.` : "",
    projectLines.length < 2 ? "Add at least two projects with tech stack, problem solved, result, and GitHub/deployed links." : "",
    experienceLines.length < 2 ? "Add internship/work bullets with action verbs and measurable impact." : "",
    certificationLines.length < 1 ? "Add relevant free certifications or course completion links." : "",
    keywordHits.length < 3 ? `Use more ${targetRole} keywords in summary and project bullets.` : ""
  ].filter(Boolean);

  return {
    targetRole,
    matchedCareer,
    matchScore: skillsScore / 100,
    resumeScore: atsScore,
    atsScore,
    extractedSkills,
    matchedSkills: matchedSkillEvidence,
    missingSkills,
    weakSkills: missingSkills.slice(0, 6),
    roleRequiredSkills: roleData.requiredSkills,
    education: { lines: educationLines },
    experience: { lines: experienceLines },
    projects: projectLines.map((line) => ({ title: line.slice(0, 50), description: line, technologies: extractedSkills.filter((skill) => includesSkill(line, skill)) })),
    certifications: certificationLines,
    sectionScores: {
      skills: skillsScore,
      education: educationScore,
      experience: experienceScore,
      projects: projectsScore,
      keywords: keywordsScore,
      certifications: certificationsScore,
      structure: structureScore
    },
    suggestions: suggestions.length ? suggestions : ["Resume has a good base. Add measurable project outcomes and direct proof links to improve it further."],
    learningPlan: roleData.learningPlan,
    learningResources: buildLearningResources(missingSkills),
    jobMatches,
    careerRecommendations: orderedRecommendations,
    similarUsers: orderedRecommendations.slice(0, 3).map((item, index) => ({
      profileId: `NLP Profile ${index + 1}`,
      career: item.career,
      similarity: Math.max(50, item.score),
      matchedSkills: matchedSkills.slice(0, 4)
    })),
    summary: `Local NLP analysis completed for ${targetRole}. Detected ${extractedSkills.length} skills, ${matchedSkills.length} target-role matches, and ${missingSkills.length} skill gaps.`
  };
}

async function readFileAsText(file) {
  const raw = await file.text().catch(async () => {
    const buffer = await file.arrayBuffer();
    return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  });
  return cleanText(raw);
}

function ResumePanel({ onNavigate }) {
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const roles = useMemo(() => Object.keys(roleCatalog), []);
  const [analyses, setAnalyses] = useState([]);
  const [lastResumeText, setLastResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const latest = analyses[0]?.analysis;
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [fbOutcome, setFbOutcome] = useState("Got Job");
  const [fbRoleTitle, setFbRoleTitle] = useState("");
  const [fbMonths, setFbMonths] = useState(0);
  const [fbNotes, setFbNotes] = useState("");
  const [fbSubmitting, setFbSubmitting] = useState(false);

  async function runLocalAnalysis(text, sourceName = "pasted resume", role = targetRole) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned.length < 80) {
      throw new Error(`Could not extract enough text from ${sourceName}. Paste resume text into the text box and analyze again.`);
    }
    const analysis = analyzeResumeLocally(cleaned, role);
    setLastResumeText(cleaned);
    setAnalyses([{ _id: `${Date.now()}`, analysis }, ...analyses]);
    return analysis;
  }

  function changeTargetRole(role) {
    setTargetRole(role);
    setError("");
    if (lastResumeText) {
      const analysis = analyzeResumeLocally(lastResumeText, role);
      setAnalyses([{ _id: `${Date.now()}`, analysis }, ...analyses]);
    }
  }

  async function analyze() {
    setError("");
    setLoading(true);
    try {
      await runLocalAnalysis(resumeText);
      setResumeText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeFile() {
    if (!resumeFile) {
      setError("Upload a resume first");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const text = await readFileAsText(resumeFile);
      await runLocalAnalysis(text, resumeFile.name);
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
        <p className="eyebrow">Local NLP resume analysis</p>
        <h2><FileText size={24} /> Resume fit scanner</h2>
        <label>
          Target role you want to apply for
          <select value={targetRole} onChange={(event) => changeTargetRole(event.target.value)}>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </label>
        <textarea
          value={resumeText}
          onChange={(event) => setResumeText(event.target.value)}
          placeholder="Paste resume summary, skills, projects, internship experience, and education here..."
        />
        <label>
          Upload resume text/PDF/DOCX/image
          <input
            type="file"
            accept=".txt,.pdf,.doc,.docx,image/png,image/jpeg,image/jpg,image/webp"
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
          {latest?.suggestions?.length ? latest.suggestions.map((item) => <p key={item}>{item}</p>) : (
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
          <p>Select your target role, then paste or upload your resume to extract skills, find gaps, calculate ATS score, and get improvement suggestions. This version runs locally without backend API calls.</p>
        ) : (
          <>
            <div className="resume-result-header">
              <div>
                <p className="eyebrow">Resume dashboard</p>
                <h3>{latest.targetRole || targetRole}</h3>
                <strong>{latest.atsScore}% ATS score</strong>
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
                <small>Target role fit based on accepted equivalent skills</small>
              </div>
              <span>{Math.round((latest.matchScore || 0) * 100)}%</span>
            </div>

            <h4>Career Recommendations</h4>
            {latest.careerRecommendations?.map((item) => (
              <div className="job-row" key={item.career}>
                <div>
                  <strong>{item.career}</strong>
                  <small>{item.explanation}</small>
                </div>
                <span>{item.score}%</span>
              </div>
            ))}

            <h4>Matched Skills</h4>
            <div className="chips">
              {(latest.matchedSkills?.length ? latest.matchedSkills : latest.extractedSkills)?.map((skill) => <span key={skill}>{skill}</span>)}
            </div>

            <h4>Missing Skills</h4>
            <div className="chips muted">
              {latest.missingSkills?.map((skill) => <span key={skill}>{skill}</span>)}
            </div>

            {latest.learningResources?.length > 0 && (
              <>
                <h4>Learn Missing Skills</h4>
                {latest.learningResources.map((resource) => (
                  <div className="job-row" key={resource.skill}>
                    <div>
                      <strong>{resource.skill}</strong>
                      <small>Free learning resources and certifications</small>
                    </div>
                    <a href={resource.youtube} target="_blank" rel="noreferrer">Open</a>
                  </div>
                ))}
              </>
            )}

            <h4>Required Skills for {latest.targetRole || targetRole}</h4>
            <div className="chips">
              {latest.roleRequiredSkills?.map((skill) => <span key={skill}>{skill}</span>)}
            </div>

            <h4>Education / Experience / Projects Detected</h4>
            {[...(latest.education?.lines || []), ...(latest.experience?.lines || []), ...(latest.projects?.map((project) => project.description) || [])].slice(0, 8).map((item, idx) => (
              <div className="job-row" key={`${item}-${idx}`}>
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

            {latest.jobMatches?.length > 0 && (
              <>
                <h4>Suggested Job Matches</h4>
                {latest.jobMatches.map((job) => (
                  <div className="job-row" key={`${job.title}-${job.company}`}>
                    <div>
                      <strong>{job.title} at {job.company}</strong>
                      <small>{job.location} | {job.type}</small>
                    </div>
                    <span>{job.matchPercent}% match</span>
                  </div>
                ))}
              </>
            )}

            {latest.similarUsers?.length > 0 && (
              <>
                <h4>Similar Profile Matches</h4>
                {latest.similarUsers.map((profile) => (
                  <div
                    className="job-row"
                    key={profile.profileId}
                    onClick={async () => {
                      // open profile details (local or server)
                      const id = profile.profileId;
                      setProfileLoading(true);
                      try {
                        // if looks like an ObjectId, try server fetch
                        if (/^[0-9a-fA-F]{24}$/.test(id)) {
                          const data = await api(`/resumes/profile/${id}`);
                          setSelectedProfile(data.profile);
                          setFbRoleTitle(data.profile.analysis?.matchedCareer || data.profile.targetRole || data.profile.career || "");
                          setFbOutcome("Got Job");
                          setFbMonths(0);
                          setFbNotes("");
                        } else {
                          setSelectedProfile({ profile });
                          setFbRoleTitle(profile.career || "");
                          setFbOutcome("Got Job");
                          setFbMonths(0);
                          setFbNotes("");
                        }
                      } catch (err) {
                        setSelectedProfile({ profile });
                        setFbRoleTitle(profile.career || "");
                        setFbOutcome("Got Job");
                        setFbMonths(0);
                        setFbNotes("");
                      } finally {
                        setProfileLoading(false);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <strong>{profile.career}</strong>
                      <small>{profile.matchedSkills.join(", ") || "Profile similarity"}</small>
                    </div>
                    <span>{profile.similarity}%</span>
                  </div>
                ))}
              </>
            )}

            {selectedProfile && (
              <div className="feedback-modal-overlay" onClick={() => setSelectedProfile(null)}>
                <div className="feedback-modal-card" onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>Profile details</h3>
                    <button onClick={() => setSelectedProfile(null)} className="secondary">Close</button>
                  </div>
                  {profileLoading ? (
                    <p>Loading profile...</p>
                  ) : (
                    (() => {
                      const p = selectedProfile.profile || selectedProfile;
                      async function submitFeedback() {
                        setFbSubmitting(true);
                        try {
                          const payload = {
                            testResultId: null,
                            userFeatures: {},
                            recommendedCareers: (p.analysis?.careerRecommendations || []).map((r) => ({ career: r.career, confidence: r.score || r.confidence || 0 })),
                            selectedCareer: fbRoleTitle || (p.analysis?.matchedCareer || p.career),
                            outcome: fbOutcome,
                            roleTitle: fbRoleTitle,
                            timeTakenMonths: Number(fbMonths) || 0,
                            feedbackNotes: fbNotes
                          };
                          await api("/advisor/feedback", { method: "POST", body: JSON.stringify(payload) });
                          alert("Feedback submitted — thank you!");
                          setSelectedProfile(null);
                        } catch (err) {
                          alert("Failed to submit feedback: " + (err.message || err));
                        } finally {
                          setFbSubmitting(false);
                        }
                      }
                      return (
                        <div>
                          <p><strong>Career:</strong> {p.career || p.analysis?.matchedCareer || "—"}</p>
                          <p><strong>Similarity:</strong> {p.similarity ?? (p.analysis?.similarity ?? "—")}%</p>
                          <p><strong>Matched skills:</strong> {(p.matchedSkills || p.analysis?.extractedSkills || []).slice(0, 12).join(", ")}</p>
                          {p.analysis && (
                            <>
                              <h4>Scores</h4>
                              <div className="subject-score-grid">
                                {Object.entries(p.analysis.sectionScores || {}).map(([name, score]) => (
                                  <div className="subject-score-card" key={name}>
                                    <small>{name}</small>
                                    <strong>{score}%</strong>
                                    <div><span style={{ width: `${score}%` }} /></div>
                                  </div>
                                ))}
                              </div>
                              <h4>Top job matches</h4>
                              {(p.analysis.jobMatches || []).slice(0, 5).map((job) => (
                                <div className="job-row" key={`${job.title}-${job.company}`}>
                                  <div>
                                    <strong>{job.title} at {job.company}</strong>
                                    <small>{job.location} | {job.type}</small>
                                  </div>
                                  <span>{job.matchPercent}%</span>
                                </div>
                              ))}
                              <h4 style={{ marginTop: 12 }}>Submit feedback about this recommendation</h4>
                              <label>
                                Outcome
                                <select value={fbOutcome} onChange={(e) => setFbOutcome(e.target.value)}>
                                  <option>Got Job</option>
                                  <option>Got Internship</option>
                                  <option>Still Learning</option>
                                  <option>Not Interested</option>
                                </select>
                              </label>
                              <label>
                                Role title (what you applied / achieved)
                                <input value={fbRoleTitle} onChange={(e) => setFbRoleTitle(e.target.value)} />
                              </label>
                              <label>
                                Months to achieve
                                <input type="number" value={fbMonths} onChange={(e) => setFbMonths(e.target.value)} />
                              </label>
                              <label>
                                Notes
                                <textarea value={fbNotes} onChange={(e) => setFbNotes(e.target.value)} />
                              </label>
                              <div className="modal-footer">
                                <button className="primary" onClick={submitFeedback} disabled={fbSubmitting}>{fbSubmitting ? 'Submitting...' : 'Submit feedback'}</button>
                                <button className="secondary" onClick={() => setSelectedProfile(null)}>Cancel</button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ResumePanel;
