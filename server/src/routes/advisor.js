import express from "express";
import axios from "axios";
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

const collegeCatalog = [
  { name: "JNTU Hyderabad", course: "B.Tech CSE", location: "Hyderabad", fees: 120000, placement: "8.5 LPA avg", cutoff: 18000, rating: 4.3 },
  { name: "Osmania University", course: "B.Tech AI & DS", location: "Hyderabad", fees: 90000, placement: "7.8 LPA avg", cutoff: 22000, rating: 4.2 },
  { name: "VIT Vellore", course: "B.Tech CSE", location: "Vellore", fees: 198000, placement: "9.2 LPA avg", cutoff: 12000, rating: 4.5 },
  { name: "SRM Institute", course: "B.Tech IT", location: "Chennai", fees: 175000, placement: "7.2 LPA avg", cutoff: 35000, rating: 4.0 },
  { name: "CBIT", course: "B.Tech CSE", location: "Hyderabad", fees: 160000, placement: "8.0 LPA avg", cutoff: 16000, rating: 4.4 }
];

const learningCatalog = {
  "Web Development": ["HTML/CSS mastery", "JavaScript ES6", "React projects", "Node/Express APIs", "Deploy full-stack app"],
  "AI/ML": ["Python basics", "NumPy/Pandas", "Supervised learning", "Model evaluation", "ML mini project"],
  "Data Science": ["Statistics", "SQL", "Data cleaning", "Visualization", "Predictive modeling"],
  "Cloud Computing": ["Linux basics", "Networking", "AWS/Azure fundamentals", "Docker", "Deploy cloud project"],
  "Cybersecurity": ["Networking", "Linux", "Web security", "Threat analysis", "Security lab practice"],
  "Mobile Development": ["Dart/Flutter or React Native", "UI patterns", "API integration", "Local storage", "Publish demo app"]
};

const codingChallenges = [
  {
    title: "Two Sum",
    topic: "Arrays and Hashing",
    language: "Python",
    difficulty: "Easy",
    accuracy: 86,
    complexity: "O(n)",
    score: 20,
    question: "Given an integer array nums and a target, return indices of the two numbers that add up to target.",
    sampleInput: "nums = [2,7,11,15], target = 9",
    sampleOutput: "[0,1]",
    link: "https://leetcode.com/problems/two-sum/"
  },
  {
    title: "Valid Parentheses",
    topic: "Stack",
    language: "Java",
    difficulty: "Easy",
    accuracy: 78,
    complexity: "O(n)",
    score: 20,
    question: "Given a string containing brackets, determine if the brackets are closed in the correct order.",
    sampleInput: "s = \"()[]{}\"",
    sampleOutput: "true",
    link: "https://leetcode.com/problems/valid-parentheses/"
  },
  {
    title: "Merge Intervals",
    topic: "Sorting",
    language: "C++",
    difficulty: "Medium",
    accuracy: 64,
    complexity: "O(n log n)",
    score: 35,
    question: "Given an array of intervals, merge all overlapping intervals and return the non-overlapping result.",
    sampleInput: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
    sampleOutput: "[[1,6],[8,10],[15,18]]",
    link: "https://leetcode.com/problems/merge-intervals/"
  },
  {
    title: "Longest Substring Without Repeating Characters",
    topic: "Sliding Window",
    language: "C++",
    difficulty: "Medium",
    accuracy: 62,
    complexity: "O(n)",
    score: 35,
    question: "Given a string s, find the length of the longest substring without repeating characters.",
    sampleInput: "s = \"abcabcbb\"",
    sampleOutput: "3",
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
  },
  {
    title: "Number of Islands",
    topic: "Graphs and DFS",
    language: "C",
    difficulty: "Medium",
    accuracy: 51,
    complexity: "O(rows * cols)",
    score: 45,
    question: "Given a grid of 1s and 0s, count the number of separated islands.",
    sampleInput: "grid = [[1,1,0],[0,1,0],[1,0,1]]",
    sampleOutput: "3",
    link: "https://leetcode.com/problems/number-of-islands/"
  },
  {
    title: "Coin Change",
    topic: "Dynamic Programming",
    language: "Python",
    difficulty: "Medium",
    accuracy: 48,
    complexity: "O(amount * coins)",
    score: 50,
    question: "Given coin denominations and an amount, return the minimum number of coins needed to make that amount.",
    sampleInput: "coins = [1,2,5], amount = 11",
    sampleOutput: "3",
    link: "https://leetcode.com/problems/coin-change/"
  }
];

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
  const skillFilter = String(req.query.skills || "").toLowerCase();
  const location = req.query.location || "Remote";
  const experience = req.query.experience || "Entry level";
  const salary = req.query.salary || "3-8 LPA";
  res.json({
    career,
    jobs: catalog.jobs.map((role, index) => ({
      role,
      fit: `${88 - index * 7}%`,
      type: index === 0 ? "Internship" : experience,
      location,
      salary,
      remote: index !== 2,
      company: ["TCS", "Infosys", "Deloitte"][index] || "Partner Company",
      skills: catalog.skills.slice(index, index + 3).join(", "),
      missingSkills: catalog.skills.slice(index + 3, index + 5)
    })).filter((job) => !skillFilter || job.skills.toLowerCase().includes(skillFilter))
  });
});

router.get("/aptitude-analytics", requireAuth, async (req, res) => {
  const results = await TestResult.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10);
  const latest = results[0];
  const scores = latest?.scores ? Object.fromEntries(latest.scores) : {};
  const values = Object.values(scores).map(Number);
  const total = values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 20) : 0;
  const sorted = Object.entries(scores).sort((a, b) => Number(b[1]) - Number(a[1]));

  res.json({
    totalScore: total,
    percentile: Math.min(99, Math.max(45, total + 12)),
    sections: {
      quantitative: Math.round(((scores.analytical || 3) / 5) * 100),
      logical: Math.round(((scores.problem_solving || 3) / 5) * 100),
      verbal: Math.round(((scores.communication || 3) / 5) * 100),
      dataInterpretation: Math.round(((scores.Data_Analysis || scores.analytical || 3) / 5) * 100)
    },
    strengths: sorted.slice(0, 3).map(([name]) => name.replaceAll("_", " ")),
    weaknesses: sorted.slice(-3).map(([name]) => name.replaceAll("_", " ")),
    history: results.map((result, index) => ({
      label: `Test ${results.length - index}`,
      score: Math.round(
        (Object.values(Object.fromEntries(result.scores || [])).reduce((sum, value) => sum + Number(value), 0) /
          Math.max(1, Object.values(Object.fromEntries(result.scores || [])).length)) * 20
      )
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
    })),
    charts: {
      aptitudeGrowth: [48, 56, 62, 71, latestTest ? 78 : 64],
      codingGrowth: [35, 42, 55, 61, 70],
      skillGrowth: [30, 45, 52, 66, 74],
      weeklyPerformance: [52, 68, 64, 72, 81, 78, 86],
      radar: [
        { label: "Aptitude", value: latestTest ? 78 : 55 },
        { label: "Coding", value: 70 },
        { label: "Skills", value: 74 },
        { label: "Resume", value: latestResume ? 82 : 40 },
        { label: "Roadmap", value: profile?.roadmapProgress || 25 }
      ]
    },
    readinessScore: Math.round(((profile?.roadmapProgress || 25) + (latestTest ? 78 : 55) + (latestResume ? 82 : 40)) / 3)
  });
});

router.get("/coding", requireAuth, async (req, res) => {
  const { profile, latestTest, career, catalog } = await getContext(req.user.id);
  const skills = new Set([...(profile?.skills || []), ...catalog.skills].map((skill) => skill.toLowerCase()));
  const preferredLanguage =
    skills.has("java") ? "Java" :
    skills.has("c++") ? "C++" :
    skills.has("javascript") || skills.has("react") ? "JavaScript" :
    "Python";
  const readiness = Math.round(((latestTest?.recommendation?.confidence || 0.62) * 60) + 28);

  res.json({
    languages: ["Java", "Python", "C", "C++"],
    preferredLanguage,
    career,
    challenges: codingChallenges,
    recommendations: [
      `Start with ${codingChallenges[0].title} and ${codingChallenges[1].title} to build speed.`,
      `Because your target is ${career}, practice ${catalog.skills.slice(0, 2).join(" and ")} with coding problems.`,
      "After solving a problem, write down the time complexity and one alternate approach."
    ],
    leaderboard: [
      { name: "You", score: 420 },
      { name: "Asha", score: 510 },
      { name: "Rahul", score: 470 }
    ],
    metrics: { accuracy: 72, timeComplexityScore: 68, totalScore: 420, readiness }
  });
});

router.get("/learning-plan", requireAuth, async (req, res) => {
  const { career, catalog } = await getContext(req.user.id);
  res.json({
    career,
    categories: Object.entries(learningCatalog).map(([category, steps]) => ({
      category,
      courses: steps.map((step, index) => ({
        title: step,
        provider: ["Coursera", "freeCodeCamp", "NPTEL", "Udemy", "YouTube"][index] || "Open resource",
        certification: index > 2,
        completed: false
      }))
    })),
    recommended: catalog.skills,
    streak: 5
  });
});

router.post("/college-recommend", requireAuth, async (req, res) => {
  const { gpa = 7, rank = 30000, budget = 200000, location = "", course = "CSE", category = "General" } = req.body;
  const recommendations = collegeCatalog
    .filter((college) => college.fees <= Number(budget) || Number(budget) === 0)
    .filter((college) => !location || college.location.toLowerCase().includes(String(location).toLowerCase()))
    .map((college) => {
      const rankScore = Math.max(0, 100 - (Number(rank) / Math.max(1, college.cutoff)) * 40);
      const gpaScore = Number(gpa) * 8;
      const admissionChance = Math.round(Math.min(95, Math.max(15, (rankScore + gpaScore) / 2 + (category !== "General" ? 8 : 0))));
      return {
        ...college,
        course: college.course.includes(course) ? college.course : college.course,
        admissionChance,
        cutoffTrend: Number(rank) <= college.cutoff ? "Within recent cutoff" : "Above recent cutoff"
      };
    })
    .sort((a, b) => b.admissionChance - a.admissionChance);

  res.json({ recommendations });
});

router.get("/report", requireAuth, async (req, res) => {
  const { profile, latestTest, latestResume, career, catalog } = await getContext(req.user.id);
  res.json({
    academicAnalysis: profile || {},
    careerPrediction: latestTest?.recommendation || { career, confidence: 0.65 },
    aptitudePerformance: latestTest?.scores || {},
    codingPerformance: { accuracy: 72, score: 420 },
    skillAnalysis: catalog.skills,
    recommendedCareers: [career, ...Object.keys(careerCatalog).filter((item) => item !== career).slice(0, 3)],
    recommendedColleges: collegeCatalog.slice(0, 3),
    learningRoadmap: catalog.roadmap,
    readinessScore: latestTest ? Math.round((latestTest.recommendation?.confidence || 0.65) * 100) : 54,
    resumeAnalysis: latestResume?.analysis || null
  });
});

router.get("/report.csv", requireAuth, async (req, res) => {
  const { career, catalog } = await getContext(req.user.id);
  const rows = [
    ["Section", "Value"],
    ["Predicted Career", career],
    ["Required Skills", catalog.skills.join(" | ")],
    ["Roadmap", catalog.roadmap.join(" | ")]
  ];
  res.header("Content-Type", "text/csv");
  res.attachment("profile-report.csv");
  res.send(rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n"));
});

router.post("/predict-profile", requireAuth, async (req, res) => {
  const features = req.body.features || {};

  try {
    const ml = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, { features }, { timeout: 7000 });
    const result = await TestResult.create({
      user: req.user.id,
      answers: features,
      scores: features,
      recommendation: ml.data
    });
    res.status(201).json({ recommendation: ml.data, result });
  } catch (error) {
    res.status(502).json({
      message: "Prediction service unavailable",
      detail: error.response?.data?.message || error.message
    });
  }
});

export default router;
