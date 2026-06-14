import axios from "axios";
import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";
import { requireAuth } from "../middleware/auth.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
    cb(allowed.includes(file.mimetype) ? null : new Error("Only PDF or image resumes are supported"), allowed.includes(file.mimetype));
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

const skillAliases = {
  "Data Structures": ["data structures", "dsa", "arrays", "linked list", "stack", "queue", "tree", "graph"],
  "REST API": ["rest api", "api", "express api", "backend api"],
  "Node.js": ["node.js", "nodejs", "node"],
  "React": ["react", "react.js", "reactjs"],
  "MongoDB": ["mongodb", "mongo db", "mongoose"],
  "Machine Learning": ["machine learning", "ml", "sklearn", "scikit"],
  "Deep Learning": ["deep learning", "neural network", "tensorflow", "pytorch"],
  "Power BI": ["power bi", "powerbi"],
  "CI/CD": ["ci/cd", "github actions", "jenkins", "pipeline"],
  "Kubernetes": ["kubernetes", "k8s"],
  "Requirement Analysis": ["requirement analysis", "requirements", "brd", "user stories"]
};

function sentenceMatches(resumeText, patterns) {
  const sentences = resumeText
    .replace(/\r/g, "\n")
    .split(/[\n.!?]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 12);

  return sentences.filter((sentence) => patterns.some((pattern) => sentence.toLowerCase().includes(pattern))).slice(0, 5);
}

function hasSkill(text, skill) {
  const aliases = skillAliases[skill] || [skill.toLowerCase()];
  return aliases.some((alias) => text.includes(alias.toLowerCase()));
}

function detectGeneralSkills(text) {
  const allSkills = [...new Set(Object.values(roleCatalog).flatMap((role) => role.requiredSkills))];
  const extraSkills = ["C", "C++", "Java", "HTML", "CSS", "Leadership", "Teamwork", "Communication", "GitHub", "Flask", "Express"];
  return [...new Set([...allSkills, ...extraSkills].filter((skill) => hasSkill(text, skill)))];
}

function analyzeResumeLocally(resumeText, targetRole = "Software Engineer") {
  const text = resumeText.toLowerCase();
  const role = roleCatalog[targetRole] ? targetRole : "Software Engineer";
  const roleData = roleCatalog[role];
  const extractedSkills = detectGeneralSkills(text);
  const matchedSkills = roleData.requiredSkills.filter((skill) => hasSkill(text, skill));
  const missingSkills = roleData.requiredSkills.filter((skill) => !matchedSkills.includes(skill));
  const keywordHits = roleData.keywords.filter((keyword) => text.includes(keyword));
  const education = sentenceMatches(resumeText, ["education", "degree", "b.tech", "btech", "bachelor", "university", "college", "gpa", "cgpa"]);
  const experience = sentenceMatches(resumeText, ["experience", "intern", "worked", "developed", "built", "implemented", "managed"]);
  const projects = sentenceMatches(resumeText, ["project", "github", "deployed", "portfolio", "application", "website", "model"]);
  const skillsScore = Math.round((matchedSkills.length / Math.max(1, roleData.requiredSkills.length)) * 100);
  const educationScore = education.length ? 80 : 35;
  const experienceScore = Math.min(100, experience.length * 22);
  const projectsScore = Math.min(100, projects.length * 28);
  const keywordsScore = Math.round((keywordHits.length / Math.max(1, roleData.keywords.length)) * 100);
  const atsScore = Math.round(
    skillsScore * 0.38 +
    keywordsScore * 0.22 +
    projectsScore * 0.18 +
    experienceScore * 0.14 +
    educationScore * 0.08
  );
  const matchedCareer = Object.entries(roleCatalog)
    .map(([career, data]) => ({
      career,
      score: data.requiredSkills.filter((skill) => hasSkill(text, skill)).length / data.requiredSkills.length
    }))
    .sort((a, b) => b.score - a.score)[0]?.career || role;
  const suggestions = [
    missingSkills.length ? `Add proof for missing role skills: ${missingSkills.slice(0, 5).join(", ")}.` : "Your required skill coverage is strong for this role.",
    projects.length ? "Make project bullets measurable with tools used, result, and deployment/GitHub link." : "Add 2-3 project bullets related to the target role.",
    experience.length ? "Rewrite experience bullets with action verb + technology + measurable outcome." : "Add internship, freelance, academic project, or open-source experience.",
    keywordHits.length < 4 ? `Use more role keywords naturally: ${roleData.keywords.slice(0, 5).join(", ")}.` : "Your resume has useful role keywords.",
    "Add a 2-3 line professional summary that mentions target role, strongest skills, and one measurable achievement.",
    "Add links to GitHub, LinkedIn, portfolio, deployed projects, or certificates near the top of the resume.",
    "For each project, add problem statement, tech stack, your contribution, outcome, and live/demo link.",
    "Use numbers wherever possible: accuracy, users, response time, marks improved, data size, or project duration.",
    "Keep formatting ATS-friendly: clear section headings, no heavy tables, no decorative icons, and simple bullet points."
  ];

  return {
    targetRole: role,
    matchedCareer,
    matchScore: Math.round((skillsScore / 100) * 100) / 100,
    atsScore,
    extractedSkills,
    keywords: keywordHits,
    missingSkills,
    matchedSkills,
    weakSkills: missingSkills.slice(0, 4),
    roleRequiredSkills: roleData.requiredSkills,
    education,
    experience,
    projects,
    keywordDensity: Math.round((keywordHits.length / Math.max(1, roleData.keywords.length)) * 100),
    sectionScores: {
      skills: skillsScore,
      education: educationScore,
      experience: experienceScore,
      projects: projectsScore,
      keywords: keywordsScore
    },
    suggestions,
    learningPlan: roleData.learningPlan,
    learningResources: makeLearningResources(missingSkills),
    summary: `Resume analyzed for ${role}. Skill coverage is ${skillsScore}% and ATS readiness is ${atsScore}%.`
  };
}

async function analyzeAndSave(userId, resumeText, targetRole) {
  let analysis;
  try {
    const ml = await axios.post(`${process.env.ML_SERVICE_URL}/analyze-resume`, { resumeText, targetRole }, { timeout: 7000 });
    const localAnalysis = analyzeResumeLocally(resumeText, targetRole);
    analysis = {
      ...localAnalysis,
      ...ml.data,
      targetRole,
      learningResources: makeLearningResources(ml.data.missingSkills || localAnalysis.missingSkills || [])
    };
  } catch {
    analysis = analyzeResumeLocally(resumeText, targetRole);
  }

  const saved = await ResumeAnalysis.create({
    user: userId,
    targetRole,
    resumeText,
    analysis
  });

  return saved;
}

async function extractTextFromFile(file) {
  if (file.mimetype === "application/pdf") {
    const parsed = await pdfParse(file.buffer);
    return parsed.text || "";
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

router.post("/analyze", requireAuth, async (req, res) => {
  const resumeText = String(req.body.resumeText || "").trim();
  const targetRole = String(req.body.targetRole || "Software Engineer").trim();

  if (resumeText.length < 80) {
    return res.status(400).json({ message: "Paste at least 80 characters of resume content" });
  }

  const saved = await analyzeAndSave(req.user.id, resumeText, targetRole);
  res.status(201).json({ analysis: saved });
});

router.post("/analyze-file", requireAuth, upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Upload a PDF or image resume" });
  }
  const targetRole = String(req.body.targetRole || "Software Engineer").trim();

  const resumeText = (await extractTextFromFile(req.file)).trim();
  if (resumeText.length < 80) {
    return res.status(400).json({ message: "Could not extract enough text from the uploaded resume" });
  }

  const saved = await analyzeAndSave(req.user.id, resumeText, targetRole);
  res.status(201).json({ analysis: saved, extractedTextLength: resumeText.length });
});

router.get("/roles", requireAuth, (_req, res) => {
  res.json({ roles: Object.keys(roleCatalog) });
});

router.get("/analyses", requireAuth, async (req, res) => {
  const analyses = await ResumeAnalysis.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
  res.json({ analyses });
});

export default router;
