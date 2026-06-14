import express from "express";
import axios from "axios";
import { requireAuth } from "../middleware/auth.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import TestResult from "../models/TestResult.js";
import UserProfile from "../models/UserProfile.js";

const router = express.Router();

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeRecommendation(recommendation) {
  if (!recommendation || typeof recommendation !== "object") return recommendation;
  return {
    ...recommendation,
    confidence: safeNumber(recommendation.confidence),
    alternatives: Array.isArray(recommendation.alternatives)
      ? recommendation.alternatives.map((item) => ({
          ...item,
          score: safeNumber(item.score)
        }))
      : recommendation.alternatives
  };
}

function normalizeProfileValues(features = {}) {
  return Object.fromEntries(
    Object.entries(features).map(([key, value]) => [key, safeNumber(value)])
  );
}

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

const jobCatalog = [
  { role: "Frontend Developer Intern", company: "TCS", location: "Bengaluru", type: "Internship", salary: "3-5 LPA", skills: "React, JavaScript, CSS" },
  { role: "Data Analyst Trainee", company: "Infosys", location: "Hyderabad", type: "Entry level", salary: "4-6 LPA", skills: "Excel, SQL, Python" },
  { role: "Business Analyst Intern", company: "Deloitte", location: "Remote", type: "Internship", salary: "3-5 LPA", skills: "Communication, process mapping, dashboards" },
  { role: "UX Designer", company: "Accenture", location: "Pune", type: "Entry level", salary: "4-6 LPA", skills: "Figma, prototyping, user research" },
  { role: "Full-Stack Developer", company: "Cognizant", location: "Chennai", type: "Entry level", salary: "5-8 LPA", skills: "React, Node.js, MongoDB" },
  { role: "Machine Learning Engineer", company: "IBM", location: "Bengaluru", type: "Mid level", salary: "8-12 LPA", skills: "Python, ML, TensorFlow" },
  { role: "Product Analyst", company: "Flipkart", location: "Bengaluru", type: "Entry level", salary: "6-9 LPA", skills: "SQL, analytics, stakeholder communication" },
  { role: "Cybersecurity Analyst", company: "Wipro", location: "Mumbai", type: "Entry level", salary: "5-7 LPA", skills: "Network security, incident response, risk assessment" },
  { role: "DevOps Engineer", company: "Dell", location: "Bengaluru", type: "Mid level", salary: "7-10 LPA", skills: "CI/CD, Docker, Kubernetes" },
  { role: "Digital Marketing Executive", company: "Zoho", location: "Chennai", type: "Entry level", salary: "3-5 LPA", skills: "SEO, social media, analytics" },
  { role: "QA Automation Tester", company: "HCL", location: "Noida", type: "Entry level", salary: "4-6 LPA", skills: "Selenium, test automation, Java" },
  { role: "Data Science Intern", company: "Byju's", location: "Bengaluru", type: "Internship", salary: "3-4 LPA", skills: "Python, machine learning, data visualization" },
  { role: "Mobile Developer", company: "Samsung", location: "Pune", type: "Entry level", salary: "5-8 LPA", skills: "Flutter, Dart, Android" },
  { role: "Cloud Support Engineer", company: "Oracle", location: "Bengaluru", type: "Entry level", salary: "6-9 LPA", skills: "AWS, Linux, scripting" },
  { role: "Blockchain Developer", company: "TCS", location: "Mumbai", type: "Mid level", salary: "9-12 LPA", skills: "Solidity, Web3, smart contracts" },
  { role: "AI Research Intern", company: "Siemens", location: "Bengaluru", type: "Internship", salary: "3-4 LPA", skills: "Python, PyTorch, research" },
  { role: "Technical Content Writer", company: "Freshworks", location: "Chennai", type: "Entry level", salary: "3-5 LPA", skills: "Writing, documentation, SEO" },
  { role: "Business Intelligence Analyst", company: "Capgemini", location: "Pune", type: "Entry level", salary: "4-7 LPA", skills: "Power BI, SQL, dashboards" },
  { role: "Systems Engineer", company: "Infosys", location: "Bengaluru", type: "Entry level", salary: "4-6 LPA", skills: "Java, Linux, system design" },
  { role: "Quality Analyst", company: "Wipro", location: "Hyderabad", type: "Entry level", salary: "3-5 LPA", skills: "Test cases, automation, bug reporting" }
];

const collegeCatalog = [
  { name: "IIT Bombay", course: "B.Tech CSE", location: "Mumbai", fees: 240000, placement: "32 LPA avg", cutoff: 98, rating: 4.9, acceptedExams: ["JEE"] },
  { name: "IIT Delhi", course: "B.Tech EE", location: "New Delhi", fees: 220000, placement: "31 LPA avg", cutoff: 97, rating: 4.9, acceptedExams: ["JEE"] },
  { name: "IIIT Hyderabad", course: "B.Tech CSE", location: "Hyderabad", fees: 260000, placement: "35 LPA avg", cutoff: 96, rating: 4.8, acceptedExams: ["JEE"] },
  { name: "NIT Trichy", course: "B.Tech Mechanical", location: "Trichy", fees: 150000, placement: "14 LPA avg", cutoff: 93, rating: 4.7, acceptedExams: ["JEE"] },
  { name: "BITS Pilani", course: "B.E. Computer Science", location: "Pilani", fees: 270000, placement: "28 LPA avg", cutoff: 94, rating: 4.7, acceptedExams: ["JEE"] },
  { name: "VIT Vellore", course: "B.Tech CSE", location: "Vellore", fees: 198000, placement: "9.2 LPA avg", cutoff: 85, rating: 4.5, acceptedExams: ["JEE", "CET"] },
  { name: "NIT Warangal", course: "B.Tech CSE", location: "Warangal", fees: 155000, placement: "13 LPA avg", cutoff: 92, rating: 4.7, acceptedExams: ["JEE", "EAMCET TS"] },
  { name: "JNTU Hyderabad", course: "B.Tech CSE", location: "Hyderabad", fees: 120000, placement: "8.5 LPA avg", cutoff: 72, rating: 4.3, acceptedExams: ["EAMCET TS"] },
  { name: "Osmania University", course: "B.Tech AI & DS", location: "Hyderabad", fees: 90000, placement: "7.8 LPA avg", cutoff: 68, rating: 4.2, acceptedExams: ["EAMCET TS"] },
  { name: "RV College of Engineering", course: "B.E. CSE", location: "Bengaluru", fees: 170000, placement: "15 LPA avg", cutoff: 83, rating: 4.4, acceptedExams: ["CET", "OTHER CET"] },
  { name: "PES University", course: "B.Tech CSE", location: "Bengaluru", fees: 210000, placement: "16 LPA avg", cutoff: 88, rating: 4.3, acceptedExams: ["CET", "JEE"] },
  { name: "COEP Pune", course: "B.Tech Civil", location: "Pune", fees: 140000, placement: "11 LPA avg", cutoff: 82, rating: 4.3, acceptedExams: ["CET", "OTHER CET"] },
  { name: "IIT Kharagpur", course: "B.Tech Electrical", location: "Kharagpur", fees: 230000, placement: "27 LPA avg", cutoff: 96, rating: 4.8, acceptedExams: ["JEE"] },
  { name: "NIT Durgapur", course: "B.Tech ECE", location: "Durgapur", fees: 145000, placement: "12 LPA avg", cutoff: 90, rating: 4.4, acceptedExams: ["JEE"] },
  { name: "IIIT Bhubaneswar", course: "B.Tech Data Science", location: "Bhubaneswar", fees: 160000, placement: "12.5 LPA avg", cutoff: 91, rating: 4.5, acceptedExams: ["JEE"] },
  { name: "KL University", course: "B.Tech CSE", location: "Vijayawada", fees: 140000, placement: "9 LPA avg", cutoff: 76, rating: 4.1, acceptedExams: ["EAMCET TS", "OTHER CET"] }
];

const learningCatalog = {
  "Web Development": ["HTML/CSS mastery", "JavaScript ES6", "React projects", "Node/Express APIs", "Deploy full-stack app"],
  "AI/ML": ["Python basics", "NumPy/Pandas", "Supervised learning", "Model evaluation", "ML mini project"],
  "Data Science": ["Statistics", "SQL", "Data cleaning", "Visualization", "Predictive modeling"],
  "Cloud Computing": ["Linux basics", "Networking", "AWS/Azure fundamentals", "Docker", "Deploy cloud project"],
  "Cybersecurity": ["Networking", "Linux", "Web security", "Threat analysis", "Security lab practice"],
  "Mobile Development": ["Dart/Flutter or React Native", "UI patterns", "API integration", "Local storage", "Publish demo app"]
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

const skillVideoMap = {
  javascript: "W6NZfCO5SIk",
  react: "w7ejDZ8SWv8",
  "node.js": "Oe421EPjeBE",
  python: "rfscVS0vtbw",
  sql: "HXV3zeQKqGY",
  excel: "K2k9f7URVn0",
  statistics: "qhwdex0oX0c",
  "machine learning": "GwIo3gDZCVQ",
  aws: "ulprqHHWlng",
  docker: "YFl2mCHdv24",
  cybersecurity: "oS5Ggyit6fY",
  "data visualization": "0NtoHmorG4g"
};

function makeLearningResources(skills = []) {
  return [...new Set(skills.filter(Boolean))].slice(0, 8).map((skill) => {
    const lowerSkill = skill.toLowerCase();
    const videoId = skillVideoMap[lowerSkill] || "w7ejDZ8SWv8";
    const query = encodeURIComponent(`${skill} full course for beginners`);
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
      videoId,
      youtube: `https://www.youtube.com/watch?v=${videoId}`,
      searchUrl: `https://www.youtube.com/results?search_query=${query}`,
      certifications: certifications.length ? certifications : freeCertificationCatalog.slice(0, 3)
    };
  });
}

function makeLocalCareerRecommendation(features = {}) {
  const profile = Object.fromEntries(Object.entries(features).map(([key, value]) => [key, Number(value || 0)]));
  const careerRules = [
    {
      career: "Software Engineer",
      score: profile.Coding_Skill + profile.Problem_Solving + profile.Web_Development + profile.Math_Score / 10,
      skills: ["Data Structures", "JavaScript", "System Design", "Git"],
      path: ["DSA foundation", "Build full-stack projects", "Practice coding interviews"]
    },
    {
      career: "Data Scientist",
      score: profile.Data_Analysis + profile.AI_Interest + profile.Analytical_Thinking + profile.Math_Score / 10,
      skills: ["Python", "Statistics", "SQL", "Machine Learning"],
      path: ["Python analytics", "Statistics and SQL", "ML model projects"]
    },
    {
      career: "AI Engineer",
      score: profile.AI_Interest + profile.Coding_Skill + profile.Research_Interest + profile.Math_Score / 10,
      skills: ["Python", "Machine Learning", "Deep Learning", "Model Evaluation"],
      path: ["ML basics", "Neural networks", "Deploy AI mini projects"]
    },
    {
      career: "Web Developer",
      score: profile.Web_Development + profile.Coding_Skill + profile.Creativity + profile.Attention_To_Detail,
      skills: ["HTML", "CSS", "React", "Node.js"],
      path: ["Responsive UI", "React apps", "Backend APIs"]
    },
    {
      career: "Business Analyst",
      score: profile.Communication + profile.Data_Analysis + profile.Analytical_Thinking + profile.Leadership,
      skills: ["Excel", "SQL", "Dashboards", "Requirements Analysis"],
      path: ["Business process basics", "SQL reports", "Case study portfolio"]
    }
  ].sort((a, b) => b.score - a.score);
  const top = careerRules[0];
  const maxScore = Math.max(...careerRules.map((item) => item.score), 1);

  return {
    career: top.career,
    confidence: Math.min(0.94, Math.max(0.58, top.score / maxScore)),
    educationPath: top.path,
    skillsToBuild: top.skills,
    explanation: `This recommendation is based on your strongest scores in ${top.skills.slice(0, 3).join(", ")}.`,
    alternatives: careerRules.slice(1, 4).map((item) => ({
      career: item.career,
      score: Math.min(0.9, Math.max(0.45, item.score / maxScore))
    })),
    learningResources: makeLearningResources(top.skills),
    model: "express-fallback",
    dataset: "rule-based profile scoring"
  };
}

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
  const learningSkills = latestTest?.recommendation?.skillsToBuild || latestResume?.analysis?.missingSkills || catalog.skills;
  const learningResources = makeLearningResources(learningSkills);

  res.json({
    career,
    confidence: latestTest?.recommendation?.confidence || latestResume?.analysis?.matchScore || 0.72,
    suggestions: [
      `Your current profile aligns well with ${career}.`,
      `Strengthen ${catalog.skills.slice(0, 3).join(", ")} for better opportunities.`,
      profile?.targetRole ? `Keep your target role focused on ${profile.targetRole}.` : "Set a target role to make recommendations sharper."
    ],
    learningPath: latestTest?.recommendation?.educationPath || catalog.roadmap.slice(0, 5),
    learningResources
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
  const search = String(req.query.skills || "").toLowerCase();
  const locationQuery = String(req.query.location || "").toLowerCase();
  const experience = String(req.query.experience || "Entry level").toLowerCase();

  const jobs = jobCatalog
    .filter((job) => {
      const matchesSearch = !search || [job.role, job.company, job.skills, job.type].some((value) =>
        value.toLowerCase().includes(search)
      );
      const matchesLocation = !locationQuery || job.location.toLowerCase().includes(locationQuery) || job.location.toLowerCase() === "remote";
      const matchesExperience = !experience || job.type.toLowerCase().includes(experience);
      return matchesSearch && matchesLocation && matchesExperience;
    })
    .map((job, index) => ({
      ...job,
      fit: `${Math.max(55, 95 - index * 2)}%`,
      salary: job.salary || "4-8 LPA",
      missingSkills: job.skills.split(", ").slice(0, 2)
    }));

  res.json({
    career,
    jobs: jobs.length ? jobs : jobCatalog.slice(0, 12).map((job, index) => ({
      ...job,
      fit: `${Math.max(55, 95 - index * 2)}%`,
      salary: job.salary || "4-8 LPA",
      missingSkills: job.skills.split(", ").slice(0, 2)
    }))
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
  const {
    examType = "JEE",
    examScore = 60,
    budget = 200000,
    location = "",
    course = "CSE",
    category = "General"
  } = req.body;

  const scoreValue = Math.min(100, Math.max(0, Number(examScore) || 0));
  const normalizedLocation = String(location || "").trim().toLowerCase();
  const normalizedCourse = String(course || "").trim().toLowerCase();

  const recommendations = collegeCatalog
    .filter((college) => college.fees <= Number(budget) || Number(budget) === 0)
    .filter((college) => college.acceptedExams.includes(examType) || (examType === "OTHER CET" && college.acceptedExams.some((exam) => exam.includes("CET"))))
    .map((college) => {
      const examFit = Math.max(0, 100 - Math.abs((college.cutoff || 60) - scoreValue));
      const budgetFit = Math.min(1, Number(budget) / Math.max(1, college.fees));
      const locationMatch = normalizedLocation && college.location.toLowerCase().includes(normalizedLocation) ? 1 : 0.85;
      const courseMatch = normalizedCourse && college.course.toLowerCase().includes(normalizedCourse) ? 1 : 0.9;
      const casteBonus = category === "General" ? 0 : 5;
      const admissionChance = Math.round(
        Math.min(98, Math.max(20,
          examFit * 0.6 + budgetFit * 20 + locationMatch * 10 + courseMatch * 8 + casteBonus
        ))
      );

      return {
        ...college,
        admissionChance,
        cutoffTrend: scoreValue >= college.cutoff ? "Within expected cutoff" : "Above expected cutoff"
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

function buildChatSystemPrompt(context) {
  const skills = context.catalog.skills.slice(0, 4).join(", ");
  return `You are an AI career coach for a student using a career advisory platform. The user is currently aligned with the career path ${context.career} and should focus on skills like ${skills}. Provide concise, practical advice for career planning, study strategies, project ideas, interview preparation, or resume improvement. Keep the response friendly and actionable.`;
}

router.post("/chat", requireAuth, async (req, res) => {
  const userInput = String(req.body.text || "").trim();
  const context = await getContext(req.user.id);

  if (!userInput) {
    return res.status(400).json({ answer: "Please send a non-empty chat message." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      answer: "Career chat is not available because OPENAI_API_KEY is not configured on the server."
    });
  }

  try {
    const payload = {
      model: "gpt-3.5-turbo",
      temperature: 0.75,
      messages: [
        { role: "system", content: buildChatSystemPrompt(context) },
        { role: "user", content: userInput }
      ]
    };

    const response = await axios.post("https://api.openai.com/v1/chat/completions", payload, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    });

    const answer = response.data?.choices?.[0]?.message?.content?.trim() || "I couldn't generate a response right now. Please try again.";
    res.json({ answer });
  } catch (error) {
    console.error("OpenAI chat error", error?.response?.data || error.message || error);
    res.status(500).json({ answer: "The career chat service failed. Please try again later." });
  }
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

  const normalizedFeatures = normalizeProfileValues(features);
  try {
    const ml = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, { features: normalizedFeatures }, { timeout: 7000 });
    const recommendation = normalizeRecommendation({
      ...ml.data,
      learningResources: makeLearningResources(ml.data.skillsToBuild || ml.data.educationPath || [])
    });
    const result = await TestResult.create({
      user: req.user.id,
      answers: normalizedFeatures,
      scores: normalizedFeatures,
      recommendation
    });
    res.status(201).json({ recommendation, result });
  } catch (error) {
    const recommendation = normalizeRecommendation(makeLocalCareerRecommendation(normalizedFeatures));
    const result = await TestResult.create({
      user: req.user.id,
      answers: normalizedFeatures,
      scores: normalizedFeatures,
      recommendation
    });
    res.status(201).json({ recommendation, result, warning: "ML service unavailable, saved Express fallback prediction." });
  }
});

export default router;
