import axios from "axios";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";
import { requireAuth } from "../middleware/auth.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.resolve(__dirname, "../../uploads");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp"
    ];
    cb(allowed.includes(file.mimetype) ? null : new Error("Only PDF, DOCX, or image resumes are supported"), allowed.includes(file.mimetype));
  }
});

const roleCatalog = {
  "Software Engineer": {
    requiredSkills: ["JavaScript", "Python", "Data Structures", "Algorithms", "Git", "REST API", "SQL", "Problem Solving"],
    keywords: ["software", "backend", "frontend", "api", "debugging", "testing", "database", "deployment"],
    learningPlan: ["Practice DSA daily", "Build two full-stack projects", "Add API testing and deployment links"]
  },
  "Full Stack Developer": {
    requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "REST API", "Git"],
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

const freeCertificationCatalog = [
  { title: "freeCodeCamp Certifications", url: "https://www.freecodecamp.org/learn/" },
  { title: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
  { title: "Microsoft Learn", url: "https://learn.microsoft.com/training/" },
  { title: "AWS Skill Builder", url: "https://skillbuilder.aws/" },
  { title: "Google Skillshop", url: "https://skillshop.withgoogle.com/" },
  { title: "Cisco Skills For All", url: "https://skillsforall.com/" },
  { title: "IBM SkillsBuild", url: "https://skillsbuild.org/" }
];

function makeLearningResources(skills = []) {
  return [...new Set(skills.filter(Boolean))].slice(0, 8).map((skill) => {
    const query = encodeURIComponent(`${skill} full course for beginners`);
    const lowerSkill = skill.toLowerCase();
    const certifications = freeCertificationCatalog.filter((item) => {
      const title = item.title.toLowerCase();
      if (["react", "javascript", "html", "css", "node.js", "git", "rest api", "web"].some((word) => lowerSkill.includes(word))) {
        return title.includes("freecodecamp") || title.includes("microsoft");
      }
      if (["python", "sql", "statistics", "data", "machine learning", "ai", "pandas"].some((word) => lowerSkill.includes(word))) {
        return title.includes("kaggle") || title.includes("microsoft") || title.includes("ibm");
      }
      if (["aws", "cloud", "docker", "linux", "networking"].some((word) => lowerSkill.includes(word))) {
        return title.includes("aws") || title.includes("microsoft") || title.includes("cisco");
      }
      if (["security", "cyber", "owasp"].some((word) => lowerSkill.includes(word))) {
        return title.includes("cisco") || title.includes("microsoft") || title.includes("ibm");
      }
      return true;
    }).slice(0, 3);

    return {
      skill,
      youtube: `https://www.youtube.com/results?search_query=${query}`,
      certifications: certifications.length ? certifications : freeCertificationCatalog.slice(0, 3)
    };
  });
}

const skillCategories = {
  "Programming Languages": ["JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust", "Ruby", "PHP"],
  "Web Technologies": ["HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express", "Next.js", "Svelte", "Django", "Flask", "GraphQL", "REST API"],
  "Databases": ["SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle"],
  "AI/ML Skills": ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "NLP", "Computer Vision", "Data Science", "Pandas", "NumPy"],
  "Cloud Technologies": ["AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Terraform", "Jenkins"],
  "Soft Skills": ["Communication", "Leadership", "Teamwork", "Problem Solving", "Time Management", "Adaptability", "Creativity", "Critical Thinking"],
  "Certifications": ["certification", "certificate", "coursera", "udemy", "edx", "google certified", "aws certified", "microsoft certified"]
};

const jobDataset = [
  { title: "Backend Developer", company: "TechWave", location: "Remote", type: "Full time", skills: ["Node.js", "Express", "SQL", "REST API", "Git", "Docker"] },
  { title: "Full Stack Developer", company: "NexGen Solutions", location: "Bengaluru", type: "Full time", skills: ["React", "Node.js", "MongoDB", "HTML", "CSS", "REST API"] },
  { title: "Data Analyst", company: "Insight Labs", location: "Hyderabad", type: "Full time", skills: ["SQL", "Excel", "Power BI", "Python", "Pandas", "Data Visualization"] },
  { title: "Data Scientist", company: "ModelCraft", location: "Bengaluru", type: "Full time", skills: ["Python", "Machine Learning", "Statistics", "Pandas", "Scikit-learn", "SQL"] },
  { title: "AI Engineer", company: "CortexAI", location: "Pune", type: "Full time", skills: ["Python", "TensorFlow", "PyTorch", "NLP", "Deep Learning", "Model Deployment"] },
  { title: "Cloud Engineer", company: "CloudForge", location: "Mumbai", type: "Full time", skills: ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD", "Terraform"] }
];

const targetRoles = [
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "Software Engineer"
];

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanText(text) {
  return String(text || "")
    .replace(/\r/g, " ")
    .replace(/[\u2018\u2019\u201c\u201d]/g, " ")
    .replace(/[^\w\s\.#\-\/\+%]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(text) {
  return cleanText(text).toLowerCase();
}

function extractSkillMatches(text) {
  const lower = normalizeText(text);
  const found = new Set();
  const categories = new Set();

  for (const [category, list] of Object.entries(skillCategories)) {
    for (const skill of list) {
      const pattern = new RegExp(`\\b${escapeRegex(skill.toLowerCase())}\\b`, "i");
      if (pattern.test(lower)) {
        found.add(skill);
        categories.add(category);
      }
    }
  }

  return {
    skills: [...found].sort(),
    categories: [...categories].sort()
  };
}

function findLines(text) {
  return text
    .split(/[\n\r]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 6);
}

function parseEducation(resumeText) {
  const lines = findLines(resumeText);
  const degreeMatch = resumeText.match(/\b(bachelor(?:'s)?|b\.tech|btech|b\.sc|bsc|ba|master(?:'s)?|m\.tech|mtech|m\.sc|msc|mba|phd|doctorate)\b/i);
  const branchMatch = resumeText.match(/\b(computer science|cse|information technology|electronics|electrical|mechanical|civil|business administration|data science|artificial intelligence|machine learning|software engineering)\b/i);
  const cgpaMatch = resumeText.match(/(?:cgpa|gpa)[:\s]*([0-4](?:\.\d{1,2})?)\b/i) || resumeText.match(/([0-9]{2}(?:\.[0-9]{1,2})?)\s*%/i);
  const yearMatch = resumeText.match(/\b(20[1-3][0-9]|2024|2025|2026|2027|2028|2029|2030|199[5-9])\b/);
  const institutionLine = lines.find((line) => /\b(university|college|institute|school|academy|campus)\b/i.test(line));

  return {
    degree: degreeMatch?.[0] ? degreeMatch[0].replace(/\./g, "") : "",
    branch: branchMatch?.[0] || "",
    institution: institutionLine || "",
    cgpa: cgpaMatch?.[1] || "",
    graduationYear: yearMatch?.[0] || "",
    lines: [degreeMatch?.[0], branchMatch?.[0], institutionLine].filter(Boolean)
  };
}

function parseExperience(resumeText) {
  const lines = findLines(resumeText);
  const experienceMarkers = ["experience", "intern", "worked", "developed", "built", "implemented", "managed"];
  const experienceLines = lines.filter((line) => experienceMarkers.some((marker) => line.toLowerCase().includes(marker)));
  const roles = experienceLines
    .filter((line) => /\b(software engineer|developer|data scientist|analyst|intern|manager|consultant|designer|researcher)\b/i.test(line))
    .slice(0, 6);
  const companies = experienceLines
    .map((line) => {
      const match = line.match(/at\s+([A-Za-z0-9 &\-\.\,]+)/i) || line.match(/with\s+([A-Za-z0-9 &\-\.\,]+)/i);
      return match?.[1]?.trim();
    })
    .filter(Boolean);
  const durations = [];
  const durationRegex = /(\d+(?:\.\d+)?)\s*(years?|yrs?|months?|mos?)\b/gi;
  let durationMatch;
  while ((durationMatch = durationRegex.exec(resumeText))) {
    const value = parseFloat(durationMatch[1]);
    if (Number.isFinite(value)) {
      const unit = durationMatch[2].toLowerCase();
      durations.push(unit.startsWith("month") ? value / 12 : value);
    }
  }
  const totalYears = Math.round((durations.reduce((sum, value) => sum + value, 0) + Number.EPSILON) * 100) / 100;

  return {
    roles: [...new Set(roles)].slice(0, 5),
    companies: [...new Set(companies)].slice(0, 5),
    duration: durations.map((value) => `${Math.round(value * 10) / 10} years`),
    totalYears,
    lines: experienceLines.slice(0, 6)
  };
}

function parseProjects(resumeText) {
  const lines = findLines(resumeText);
  const projectCandidates = lines.filter((line) => /\b(project|built|designed|developed|created|deployed|launch)\b/i.test(line));

  return projectCandidates.slice(0, 6).map((line) => {
    const title = line.split(/[:\-–—]/)[0].slice(0, 120).trim() || "Project highlight";
    const technologies = [...new Set(Object.values(skillCategories).flat().filter((skill) => new RegExp(`\\b${escapeRegex(skill.toLowerCase())}\\b`, "i").test(line)))].slice(0, 6);
    return {
      title,
      description: line,
      technologies
    };
  });
}

function parseCertifications(resumeText) {
  const lines = findLines(resumeText);
  const certificationLines = lines.filter((line) => /\b(certification|certified|certificate|course|training|professional certificate)\b/i.test(line));
  return certificationLines.slice(0, 6);
}

function scoreSection(count, max, minScore = 20) {
  if (!count) return minScore;
  return Math.min(100, Math.round((count / max) * 100));
}

function computeResumeScores({ matchedSkills, missingSkills, projects, experience, education, certifications, keywordHits, roleData }) {
  const skillsScore = Math.min(100, Math.round((matchedSkills.length / Math.max(1, roleData.requiredSkills.length)) * 100));
  const projectsScore = Math.min(100, Math.round((projects.length * 20) + (projects.some((project) => project.technologies.some((tech) => /tensorflow|pytorch|machine learning|deep learning|nlp|ai/i.test(tech))) ? 15 : 0) + (projects.some((project) => project.technologies.some((tech) => /react|node\.js|express|django|flask|mongodb|sql|next\.js|vue|angular/i.test(tech))) ? 10 : 0)));
  const experienceScore = Math.min(100, Math.round(Math.min(5, experience.totalYears) / 5 * 100) + Math.min(20, experience.roles.length * 10));
  const educationScore = Math.min(100, education.degree ? 80 + (education.institution ? 10 : 0) + (education.graduationYear ? 5 : 0) : 25);
  const certificationsScore = Math.min(100, certifications.length * 20);
  const structureScore = Math.min(100, Math.round(((education.lines.length + experience.lines.length + projects.length + certifications.length) / 5) * 100) + Math.min(15, keywordHits.length * 3));
  const resumeScore = Math.round(
    skillsScore * 0.3 +
    projectsScore * 0.2 +
    experienceScore * 0.2 +
    educationScore * 0.1 +
    certificationsScore * 0.1 +
    structureScore * 0.1
  );
  const atsScore = Math.round(
    skillsScore * 0.3 +
    Math.min(100, keywordHits.length * 5) * 0.2 +
    projectsScore * 0.15 +
    experienceScore * 0.15 +
    educationScore * 0.1 +
    structureScore * 0.1
  );
  return {
    sectionScores: {
      skills: skillsScore,
      education: educationScore,
      experience: experienceScore,
      projects: projectsScore,
      keywords: Math.min(100, Math.round((keywordHits.length / Math.max(1, roleData.keywords.length)) * 100)),
      certifications: certificationsScore,
      structure: structureScore
    },
    resumeScore,
    atsScore
  };
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeArrayField(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeJobMatches(jobMatches = []) {
  const items = normalizeArrayField(jobMatches);
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      return {
        title: String(item.title || item.jobTitle || "").trim(),
        company: String(item.company || item.employer || "").trim(),
        location: String(item.location || item.city || item.region || "").trim(),
        type: String(item.type || item.employmentType || "Full time").trim(),
        matchPercent: Number.isFinite(Number(item.matchPercent)) ? Number(item.matchPercent) : 0,
        matchingSkills: normalizeStringArray(item.matchingSkills || item.skills || []),
        missingSkills: normalizeStringArray(item.missingSkills || [])
      };
    })
    .filter((item) => item && item.title && item.company);
}

function normalizeSimilarUsers(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      return {
        profileId: String(item.profileId || item.id || "").trim(),
        career: String(item.career || "").trim(),
        similarity: Number.isFinite(Number(item.similarity)) ? Number(item.similarity) : 0,
        matchedSkills: normalizeStringArray(item.matchedSkills || [])
      };
    })
    .filter(Boolean);
}

function normalizeCareerRecommendations(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      return {
        career: String(item.career || "").trim(),
        score: Number.isFinite(Number(item.score)) ? Number(item.score) : 0,
        confidence: Number.isFinite(Number(item.confidence)) ? Number(item.confidence) : 0,
        explanation: String(item.explanation || item.reason || "").trim()
      };
    })
    .filter(Boolean);
}

function normalizeLearningResources(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const certifications = Array.isArray(item.certifications)
        ? item.certifications
            .map((cert) => {
              if (typeof cert === "string") return { title: cert.trim(), url: cert.trim() };
              if (cert && typeof cert === "object") {
                return {
                  title: String(cert.title || cert.url || "").trim(),
                  url: String(cert.url || cert.title || "").trim()
                };
              }
              return null;
            })
            .filter((cert) => cert && cert.title)
        : [];

      return {
        skill: String(item.skill || "").trim(),
        youtube: String(item.youtube || "").trim(),
        certifications
      };
    })
    .filter(Boolean);
}

function buildCareerRecommendationsStack(analysis = {}, weights = { resume: 0.5, test: 0.3, input: 0.2 }) {
  // sources expected as arrays of { career, score, confidence, explanation }
  const resumeRecs = Array.isArray(analysis.careerRecommendations) ? analysis.careerRecommendations : [];
  const testRecs = Array.isArray(analysis.testRecommendations) ? analysis.testRecommendations : [];
  const inputRecs = Array.isArray(analysis.inputRecommendations) ? analysis.inputRecommendations : [];

  const map = new Map();

  function addSource(items, sourceKey, weight) {
    for (const item of items) {
      const career = String(item.career || item.name || "").trim();
      if (!career) continue;
      const rawScore = Number.isFinite(Number(item.score)) ? Number(item.score) : (Number.isFinite(Number(item.confidence)) ? Number(item.confidence) : 0);
      const norm = Math.min(1, Math.max(0, rawScore / 100));
      const entry = map.get(career) || { career, score: 0, sources: {}, matchedSkills: new Set(), explanations: [] };
      entry.score += norm * weight;
      entry.sources[sourceKey] = norm;
      if (Array.isArray(item.matchedSkills)) item.matchedSkills.forEach((s) => entry.matchedSkills.add(String(s).trim()));
      if (item.explanation) entry.explanations.push(String(item.explanation));
      map.set(career, entry);
    }
  }

  addSource(resumeRecs, "resume", weights.resume);
  addSource(testRecs, "test", weights.test);
  addSource(inputRecs, "input", weights.input);

  // create array
  const arr = [...map.values()].map((entry) => ({
    career: entry.career,
    score: Math.min(1, entry.score),
    confidencePct: Math.round(Math.min(1, entry.score) * 100),
    explanation: entry.explanations.slice(0, 2).join(" ") || "Combined signals from multiple sources.",
    sourceContributions: Object.entries(entry.sources).map(([k, v]) => ({ source: k, score: Math.round(v * 100) })),
    matchedSkills: [...entry.matchedSkills].slice(0, 8)
  }));

  arr.sort((a, b) => b.score - a.score);

  // merged learning plan and jobMatches (simple union)
  const mergedLearningPlan = Array.from(new Set([...(analysis.learningPlan || []), ...(analysis.testLearningPlan || []), ...(analysis.inputLearningPlan || [])])).slice(0, 8);
  const mergedJobMatches = Array.isArray(analysis.jobMatches) ? analysis.jobMatches.slice(0, 8) : [];

  return { recommendations: arr.slice(0, 8), learningPlan: mergedLearningPlan, jobMatches: mergedJobMatches };
}

function normalizeResumeAnalysis(analysis = {}) {
  return {
    ...analysis,
    extractedSkills: normalizeStringArray(analysis.extractedSkills),
    skills: normalizeStringArray(analysis.skills),
    skillCategories: normalizeStringArray(analysis.skillCategories),
    keywords: normalizeStringArray(analysis.keywords),
    missingSkills: normalizeStringArray(analysis.missingSkills),
    matchedSkills: normalizeStringArray(analysis.matchedSkills),
    weakSkills: normalizeStringArray(analysis.weakSkills),
    roleRequiredSkills: normalizeStringArray(analysis.roleRequiredSkills),
    certifications: normalizeStringArray(analysis.certifications),
    suggestions: normalizeStringArray(analysis.suggestions),
    learningPlan: normalizeStringArray(analysis.learningPlan),
    jobMatches: normalizeJobMatches(analysis.jobMatches),
    similarUsers: normalizeSimilarUsers(analysis.similarUsers),
    careerRecommendations: normalizeCareerRecommendations(analysis.careerRecommendations),
    learningResources: normalizeLearningResources(analysis.learningResources),
    education: {
      degree: String(analysis?.education?.degree || "").trim(),
      branch: String(analysis?.education?.branch || "").trim(),
      institution: String(analysis?.education?.institution || "").trim(),
      cgpa: String(analysis?.education?.cgpa || "").trim(),
      graduationYear: String(analysis?.education?.graduationYear || "").trim(),
      lines: normalizeStringArray(analysis?.education?.lines)
    },
    experience: {
      roles: normalizeStringArray(analysis?.experience?.roles),
      companies: normalizeStringArray(analysis?.experience?.companies),
      duration: normalizeStringArray(analysis?.experience?.duration),
      totalYears: Number.isFinite(Number(analysis?.experience?.totalYears)) ? Number(analysis?.experience?.totalYears) : 0,
      lines: normalizeStringArray(analysis?.experience?.lines)
    },
    projects: Array.isArray(analysis.projects)
      ? analysis.projects
          .filter((item) => item && typeof item === "object")
          .map((project) => ({
            title: String(project.title || "").trim(),
            description: String(project.description || "").trim(),
            technologies: normalizeStringArray(project.technologies)
          }))
          .filter((project) => project.title || project.description)
      : [],
    sectionScores: analysis.sectionScores && typeof analysis.sectionScores === "object" ? {
      skills: Number.isFinite(Number(analysis.sectionScores.skills)) ? Number(analysis.sectionScores.skills) : 0,
      education: Number.isFinite(Number(analysis.sectionScores.education)) ? Number(analysis.sectionScores.education) : 0,
      experience: Number.isFinite(Number(analysis.sectionScores.experience)) ? Number(analysis.sectionScores.experience) : 0,
      projects: Number.isFinite(Number(analysis.sectionScores.projects)) ? Number(analysis.sectionScores.projects) : 0,
      keywords: Number.isFinite(Number(analysis.sectionScores.keywords)) ? Number(analysis.sectionScores.keywords) : 0,
      certifications: Number.isFinite(Number(analysis.sectionScores.certifications)) ? Number(analysis.sectionScores.certifications) : 0,
      structure: Number.isFinite(Number(analysis.sectionScores.structure)) ? Number(analysis.sectionScores.structure) : 0
    } : {},
    resumeBreakdown: analysis.resumeBreakdown && typeof analysis.resumeBreakdown === "object" ? {
      skills: Number.isFinite(Number(analysis.resumeBreakdown.skills)) ? Number(analysis.resumeBreakdown.skills) : 0,
      projects: Number.isFinite(Number(analysis.resumeBreakdown.projects)) ? Number(analysis.resumeBreakdown.projects) : 0,
      experience: Number.isFinite(Number(analysis.resumeBreakdown.experience)) ? Number(analysis.resumeBreakdown.experience) : 0,
      education: Number.isFinite(Number(analysis.resumeBreakdown.education)) ? Number(analysis.resumeBreakdown.education) : 0,
      certifications: Number.isFinite(Number(analysis.resumeBreakdown.certifications)) ? Number(analysis.resumeBreakdown.certifications) : 0,
      structure: Number.isFinite(Number(analysis.resumeBreakdown.structure)) ? Number(analysis.resumeBreakdown.structure) : 0
    } : {},
    summary: String(analysis.summary || "").trim()
  };
}

function analyzeResumeText(resumeText, targetRole = "Software Engineer") {
  const cleanedText = cleanText(resumeText);
  const normalized = normalizeText(cleanedText);
  const role = roleCatalog[targetRole] ? targetRole : "Software Engineer";
  const roleData = roleCatalog[role];
  const { skills: extractedSkills, categories: extractedCategories } = extractSkillMatches(cleanedText);
  const matchedSkills = roleData.requiredSkills.filter((skill) => extractedSkills.some((found) => found.toLowerCase() === skill.toLowerCase()));
  const missingSkills = roleData.requiredSkills.filter((skill) => !matchedSkills.includes(skill));
  const keywordHits = roleData.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
  const education = parseEducation(cleanedText);
  const experience = parseExperience(cleanedText);
  const projects = parseProjects(cleanedText);
  const certifications = parseCertifications(cleanedText);
  const scoreResult = computeResumeScores({ matchedSkills, missingSkills, projects, experience, education, certifications, keywordHits, roleData });
  const matchedCareer = Object.entries(roleCatalog)
    .map(([career, data]) => ({
      career,
      score: data.requiredSkills.filter((skill) => extractedSkills.some((found) => found.toLowerCase() === skill.toLowerCase())).length / data.requiredSkills.length
    }))
    .sort((a, b) => b.score - a.score)[0]?.career || role;

  const careerRecommendations = Object.entries(roleCatalog)
    .map(([career, data]) => ({
      career,
      score: Math.round((data.requiredSkills.filter((skill) => extractedSkills.some((found) => found.toLowerCase() === skill.toLowerCase())).length / data.requiredSkills.length) * 100),
      confidence: Math.round((data.requiredSkills.filter((skill) => extractedSkills.some((found) => found.toLowerCase() === skill.toLowerCase())).length / data.requiredSkills.length) * 100),
      explanation: `This career fits the top skills detected in your resume.`
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const jobMatches = jobDataset
    .map((job) => {
      const matchingSkills = job.skills.filter((skill) => extractedSkills.some((found) => found.toLowerCase() === skill.toLowerCase()));
      const missingSkills = job.skills.filter((skill) => !matchingSkills.some((matched) => matched.toLowerCase() === skill.toLowerCase()));
      return {
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        matchPercent: Math.min(100, Math.round((matchingSkills.length / Math.max(1, job.skills.length)) * 100)),
        matchingSkills,
        missingSkills
      };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 5);

  const aiFeedback = [];
  if (!education.degree) aiFeedback.push("Add a clear education section with degree, institution, and graduation year.");
  if (!experience.roles.length) aiFeedback.push("Add internship or work experience bullets with company, role, and outcome.");
  if (!projects.length) aiFeedback.push("Add at least one project with technical stack and measurable results.");
  if (!certifications.length) aiFeedback.push("List certifications or training programs relevant to your target role.");
  if (matchedSkills.length < Math.max(3, Math.round(roleData.requiredSkills.length * 0.6))) aiFeedback.push(`Show evidence for at least ${Math.max(3, Math.round(roleData.requiredSkills.length * 0.6))} required ${role} skills.`);
  if (keywordHits.length < 3) aiFeedback.push("Use more role-specific keywords in your summary and experience descriptions.");
  if (extractedCategories.length < 3) aiFeedback.push("Highlight skills across multiple categories such as Web, Cloud, AI, and Soft Skills.");

  return {
    targetRole: role,
    matchedCareer,
    matchScore: Math.round((scoreResult.sectionScores.skills / 100) * 100) / 100,
    resumeScore: scoreResult.resumeScore,
    atsScore: scoreResult.atsScore,
    extractedSkills,
    skillCategories: extractedCategories,
    keywords: keywordHits,
    missingSkills,
    matchedSkills,
    weakSkills: missingSkills.slice(0, 6),
    roleRequiredSkills: roleData.requiredSkills,
    education,
    experience,
    projects,
    certifications,
    keywordDensity: Math.min(100, Math.round((keywordHits.length / Math.max(1, roleData.keywords.length)) * 100)),
    sectionScores: scoreResult.sectionScores,
    suggestions: aiFeedback,
    learningPlan: roleData.learningPlan,
    learningResources: makeLearningResources(missingSkills),
    jobMatches,
    careerRecommendations,
    resumeBreakdown: {
      skills: scoreResult.sectionScores.skills,
      projects: scoreResult.sectionScores.projects,
      experience: scoreResult.sectionScores.experience,
      education: scoreResult.sectionScores.education,
      certifications: scoreResult.sectionScores.certifications,
      structure: scoreResult.sectionScores.structure
    },
    summary: `Resume analyzed for ${role}. Score ${scoreResult.resumeScore} and ATS ${scoreResult.atsScore}.`
  };
}

async function computeSimilarUsers(userId, extractedSkills, targetRole) {
  const candidates = await ResumeAnalysis.find({ user: { $ne: userId }, "analysis.matchedCareer": { $exists: true } }).limit(60);
  return candidates
    .map((item) => {
      const otherSkills = item.analysis?.extractedSkills || [];
      const commonSkills = extractedSkills.filter((skill) => otherSkills.some((other) => other.toLowerCase() === skill.toLowerCase()));
      const sameCareer = item.analysis?.matchedCareer === targetRole ? 1 : 0;
      const similarity = Math.round(((commonSkills.length * 2 + sameCareer) / Math.max(1, Math.max(extractedSkills.length, otherSkills.length))) * 100);
      return {
        profileId: item._id.toString(),
        career: item.analysis?.matchedCareer || "Unknown",
        similarity,
        matchedSkills: commonSkills.slice(0, 6)
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

async function analyzeAndSave(userId, resumeText, targetRole, fileMeta = {}) {
  let analysis = analyzeResumeText(resumeText, targetRole);
  const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";

  try {
    const ml = await axios.post(`${mlServiceUrl}/analyze-resume`, { resumeText, targetRole }, { timeout: 7000 });
    const safeJobMatches = Array.isArray(ml.data.jobMatches) ? ml.data.jobMatches : analysis.jobMatches;
    const safeSimilarUsers = Array.isArray(ml.data.similarUsers) ? ml.data.similarUsers : analysis.similarUsers;
    const safeCareerRecommendations = Array.isArray(ml.data.careerRecommendations) ? ml.data.careerRecommendations : analysis.careerRecommendations;
    const safeLearningResources = Array.isArray(ml.data.learningResources)
      ? ml.data.learningResources
      : makeLearningResources(ml.data.missingSkills || analysis.missingSkills || []);

    analysis = normalizeResumeAnalysis({
      ...analysis,
      ...ml.data,
      targetRole,
      jobMatches: safeJobMatches,
      similarUsers: safeSimilarUsers,
      careerRecommendations: safeCareerRecommendations,
      learningResources: safeLearningResources
    });
  } catch {
    analysis = normalizeResumeAnalysis(analysis);
  }

  analysis.similarUsers = await computeSimilarUsers(userId, analysis.extractedSkills, targetRole);
  analysis.skillGaps = targetRoles.map((roleName) => {
    const roleSkills = roleCatalog[roleName]?.requiredSkills || [];
    const missing = roleSkills.filter((skill) => !analysis.extractedSkills.some((found) => found.toLowerCase() === skill.toLowerCase()));
    return {
      role: roleName,
      missingSkills: missing.slice(0, 6),
      learningRoadmap: roleCatalog[roleName]?.learningPlan || []
    };
  }).slice(0, 5);

  // Build stacked career recommendations combining multiple sources (resume, test, user input)
  try {
    analysis.careerRecommendationsStack = buildCareerRecommendationsStack(analysis);
  } catch (err) {
    console.warn("Failed to build careerRecommendationsStack", err.message || err);
    analysis.careerRecommendationsStack = analysis.careerRecommendations || [];
  }

  if (!Array.isArray(analysis.jobMatches)) {
    console.warn("normalizeResumeAnalysis: jobMatches is not an array", {
      type: typeof analysis.jobMatches,
      value: analysis.jobMatches && analysis.jobMatches.toString?.().slice(0, 200)
    });
  } else if (analysis.jobMatches.length && typeof analysis.jobMatches[0] !== "object") {
    console.warn("normalizeResumeAnalysis: jobMatches contains non-object items", {
      type: typeof analysis.jobMatches[0],
      value: analysis.jobMatches[0]
    });
  }

  const saved = await ResumeAnalysis.create({
    user: userId,
    targetRole,
    resumeText,
    ...fileMeta,
    analysis
  });

  return saved;
}

async function extractTextFromFile(file) {
  if (file.mimetype === "application/pdf") {
    const parsed = await pdfParse(file.buffer);
    return parsed.text || "";
  }

  if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.mimetype === "application/msword") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value || "";
  }

  if (file.mimetype.startsWith("image/")) {
    const worker = await createWorker("eng");
    try {
      const { data } = await worker.recognize(file.buffer);
      return data.text || "";
    } finally {
      await worker.terminate();
    }
  }

  return "";
}

async function saveUploadedFile(file) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
  const timestamp = Date.now();
  const safeName = `${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9\.\-_]/g, "-")}`;
  const filePath = path.join(uploadDirectory, safeName);
  fs.writeFileSync(filePath, file.buffer);
  return filePath;
}

router.post("/upload_resume", requireAuth, upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Upload a PDF or DOCX resume file." });
  }

  const savedPath = await saveUploadedFile(req.file);
  res.status(201).json({
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    filePath: savedPath
  });
});

async function handleResumeAnalysisRequest(req, res) {
  const targetRole = String(req.body.targetRole || "Software Engineer").trim();
  let resumeText = String(req.body.resumeText || "").trim();
  const fileMeta = {};

  if (req.file) {
    const filePath = await saveUploadedFile(req.file);
    fileMeta.resumeFileName = req.file.originalname;
    fileMeta.resumeFileType = req.file.mimetype;
    fileMeta.resumeFilePath = filePath;
    resumeText = (await extractTextFromFile(req.file)).trim();
  }

  if (!resumeText || resumeText.length < 80) {
    return res.status(400).json({ message: "Provide resume text or upload a resume with at least 80 characters of extracted content." });
  }

  const saved = await analyzeAndSave(req.user.id, resumeText, targetRole, fileMeta);
  res.status(201).json({ analysis: saved });
}

router.post("/analyze_resume", requireAuth, upload.single("resume"), async (req, res) => {
  await handleResumeAnalysisRequest(req, res);
});

router.post("/analyze", requireAuth, upload.single("resume"), async (req, res) => {
  await handleResumeAnalysisRequest(req, res);
});

router.get("/profile/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await ResumeAnalysis.findById(id).select("analysis createdAt user targetRole resumeFileName resumeFilePath");
    if (!doc) return res.status(404).json({ message: "Profile not found" });
    const analysis = doc.analysis || {};
    if (!analysis.careerRecommendationsStack) {
      analysis.careerRecommendationsStack = buildCareerRecommendationsStack(analysis);
    }
    res.json({ profile: { id: doc._id, user: doc.user, targetRole: doc.targetRole, createdAt: doc.createdAt, resumeFileName: doc.resumeFileName, analysis } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/resume_score", requireAuth, async (req, res) => {
  const latest = await ResumeAnalysis.findOne({ user: req.user.id }).sort({ createdAt: -1 });
  if (!latest) return res.json({ resume_score: null });
  res.json({ resume_score: latest.analysis?.resumeScore ?? null, breakdown: latest.analysis?.resumeBreakdown ?? {} });
});

router.get("/ats_score", requireAuth, async (req, res) => {
  const latest = await ResumeAnalysis.findOne({ user: req.user.id }).sort({ createdAt: -1 });
  if (!latest) return res.json({ ats_score: null });
  res.json({ ats_score: latest.analysis?.atsScore ?? null, keywordDensity: latest.analysis?.keywordDensity ?? null });
});

router.get("/skill_gap", requireAuth, async (req, res) => {
  const latest = await ResumeAnalysis.findOne({ user: req.user.id }).sort({ createdAt: -1 });
  if (!latest) return res.json({ skill_gap: [] });
  res.json({ skill_gap: latest.analysis?.skillGaps || [] });
});

router.get("/job_matches", requireAuth, async (req, res) => {
  const latest = await ResumeAnalysis.findOne({ user: req.user.id }).sort({ createdAt: -1 });
  if (!latest) return res.json({ job_matches: [] });
  res.json({ job_matches: latest.analysis?.jobMatches || [] });
});

router.get("/similar_users", requireAuth, async (req, res) => {
  const latest = await ResumeAnalysis.findOne({ user: req.user.id }).sort({ createdAt: -1 });
  if (!latest) return res.json({ similar_users: [] });
  res.json({ similar_users: latest.analysis?.similarUsers || [] });
});

router.get("/resume_feedback", requireAuth, async (req, res) => {
  const latest = await ResumeAnalysis.findOne({ user: req.user.id }).sort({ createdAt: -1 });
  if (!latest) return res.json({ ai_feedback: [] });
  res.json({ ai_feedback: latest.analysis?.suggestions || [] });
});

router.get("/roles", requireAuth, (_req, res) => {
  res.json({ roles: Object.keys(roleCatalog) });
});

router.get("/analyses", requireAuth, async (req, res) => {
  const analyses = await ResumeAnalysis.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
  res.json({ analyses });
});

export default router;
