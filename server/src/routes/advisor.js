import express from "express";
import { requireAuth } from "../middleware/auth.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import TestResult from "../models/TestResult.js";
import UserProfile from "../models/UserProfile.js";

const router = express.Router();

const careerCatalog = {
  "Software Developer": {
    skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
    roadmap: ["HTML/CSS foundation", "JavaScript problem solving", "React projects", "Backend APIs", "Portfolio deployment"],
    jobs: ["Frontend Developer Intern", "MERN Stack Trainee", "Junior Software Developer"]
  },
  "Data Analyst": {
    skills: ["Excel", "SQL", "Python", "Statistics", "Power BI"],
    roadmap: ["Excel dashboards", "SQL queries", "Python analytics", "Visualization projects", "Case study portfolio"],
    jobs: ["Data Analyst Trainee", "Business Intelligence Intern", "Reporting Analyst"]
  },
  "Business Analyst": {
    skills: ["Requirements Analysis", "Excel", "SQL", "Communication", "Process Mapping"],
    roadmap: ["Business process basics", "Requirement documents", "SQL reporting", "Stakeholder communication", "Case studies"],
    jobs: ["Business Analyst Intern", "Product Analyst Trainee", "Operations Analyst"]
  },
  "UX Designer": {
    skills: ["Figma", "User Research", "Wireframing", "Accessibility", "Prototyping"],
    roadmap: ["Design basics", "User interviews", "Wireframes", "Interactive prototypes", "Portfolio case study"],
    jobs: ["UX Design Intern", "Product Design Trainee", "UI Designer"]
  }
};

async function getContext(userId) {
  const [profile, latestTest, latestResume] = await Promise.all([
    UserProfile.findOne({ user: userId }),
    TestResult.findOne({ user: userId }).sort({ createdAt: -1 }),
    ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 })
  ]);

  const career =
    latestTest?.recommendation?.career ||
    latestResume?.analysis?.matchedCareer ||
    profile?.targetRole ||
    "Software Developer";
  const catalog = careerCatalog[career] || careerCatalog["Software Developer"];

  return { profile, latestTest, latestResume, career, catalog };
}

router.get("/profile", requireAuth, async (req, res) => {
  const profile = await UserProfile.findOneAndUpdate(
    { user: req.user.id },
    { $setOnInsert: { user: req.user.id, interests: [], skills: [], completedSkills: [] } },
    { upsert: true, new: true }
  );
  res.json({ profile });
});

router.put("/profile", requireAuth, async (req, res) => {
  const allowed = ["educationLevel", "interests", "skills", "targetRole", "completedSkills", "roadmapProgress"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const profile = await UserProfile.findOneAndUpdate(
    { user: req.user.id },
    { $set: updates, $setOnInsert: { user: req.user.id } },
    { upsert: true, new: true }
  );
  res.json({ profile });
});

router.get("/guidance", requireAuth, async (req, res) => {
  const { profile, latestTest, latestResume, career, catalog } = await getContext(req.user.id);
  res.json({
    career,
    confidence: latestTest?.recommendation?.confidence || latestResume?.analysis?.matchScore || 0.72,
    suggestions: [
      `Your current profile aligns well with ${career}.`,
      `Strengthen ${catalog.skills.slice(0, 3).join(", ")} for better opportunities.`,
      profile?.targetRole ? `Keep your target role focused on ${profile.targetRole}.` : "Set a target role to make recommendations sharper."
    ],
    educationPath: latestTest?.recommendation?.educationPath || catalog.roadmap.slice(0, 3)
  });
});

router.get("/roadmap", requireAuth, async (req, res) => {
  const { profile, career, catalog } = await getContext(req.user.id);
  res.json({
    career,
    progress: profile?.roadmapProgress || 0,
    roadmap: catalog.roadmap.map((title, index) => ({
      title,
      status: index < Math.round(((profile?.roadmapProgress || 0) / 100) * catalog.roadmap.length) ? "completed" : "pending"
    }))
  });
});

router.get("/skills", requireAuth, async (req, res) => {
  const { profile, latestResume, career, catalog } = await getContext(req.user.id);
  const currentSkills = [...new Set([...(profile?.skills || []), ...(latestResume?.analysis?.extractedSkills || [])])];
  const missingSkills = catalog.skills.filter(
    (skill) => !currentSkills.map((item) => item.toLowerCase()).includes(skill.toLowerCase())
  );

  res.json({
    career,
    currentSkills,
    recommendedSkills: missingSkills,
    learningPath: missingSkills.map((skill) => ({
      skill,
      action: `Complete one mini project or certification focused on ${skill}.`
    }))
  });
});

router.get("/jobs", requireAuth, async (req, res) => {
  const { career, catalog } = await getContext(req.user.id);
  res.json({
    career,
    jobs: catalog.jobs.map((role, index) => ({
      role,
      fit: `${88 - index * 7}%`,
      type: index === 0 ? "Internship" : "Entry level",
      skills: catalog.skills.slice(index, index + 3).join(", ")
    }))
  });
});

router.get("/mentor", requireAuth, async (req, res) => {
  const { career, catalog } = await getContext(req.user.id);
  res.json({
    career,
    mentorTips: [
      `Prepare a short introduction explaining why you want to become a ${career}.`,
      `Build proof for ${catalog.skills.slice(0, 2).join(" and ")} before applying.`,
      "Ask mentors to review your resume, project explanation, and interview answers."
    ],
    chatPrompts: ["Review my career path", "Suggest a project", "Prepare interview questions"]
  });
});

router.get("/progress", requireAuth, async (req, res) => {
  const { profile, latestTest, latestResume, career, catalog } = await getContext(req.user.id);
  const completedSkills = profile?.completedSkills || [];
  res.json({
    career,
    completedSkills,
    roadmapProgress: profile?.roadmapProgress || 0,
    testsCompleted: latestTest ? 1 : 0,
    resumeAnalyzed: Boolean(latestResume),
    milestones: catalog.roadmap.map((title) => ({
      title,
      done: completedSkills.some((skill) => title.toLowerCase().includes(skill.toLowerCase()))
    }))
  });
});

export default router;
