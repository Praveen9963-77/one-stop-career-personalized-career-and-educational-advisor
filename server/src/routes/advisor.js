import express from "express";
import axios from "axios";
import { requireAuth } from "../middleware/auth.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import TestResult from "../models/TestResult.js";
import UserProfile from "../models/UserProfile.js";
import RecommendationFeedback from "../models/RecommendationFeedback.js";
import CareerAnalytics from "../models/CareerAnalytics.js";

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
  },
  "Data Scientist": {
    skills: ["Python", "Statistics", "SQL", "Machine Learning", "Data Visualization"],
    roadmap: ["Python and statistics", "SQL and data cleaning", "ML model building", "Portfolio notebooks", "Deploy one ML app"],
    jobs: ["Data Science Intern", "Junior Data Scientist", "ML Analyst"]
  },
  "AI Engineer": {
    skills: ["Python", "Machine Learning", "Deep Learning", "NLP", "Model Deployment"],
    roadmap: ["Python and ML basics", "Deep learning projects", "NLP or computer vision", "Model evaluation", "Deploy AI service"],
    jobs: ["AI Engineer Intern", "ML Engineer", "NLP Engineer"]
  },
  "Cybersecurity Analyst": {
    skills: ["Networking", "Linux", "OWASP", "SIEM", "Incident Response"],
    roadmap: ["Networking fundamentals", "Linux and scripting", "Web security labs", "Threat monitoring", "Security report portfolio"],
    jobs: ["SOC Analyst", "Security Analyst Intern", "Cybersecurity Trainee"]
  },
  "Blockchain Developer": {
    skills: ["Solidity", "Smart Contracts", "Web3.js", "Cryptography", "Security"],
    roadmap: ["Blockchain fundamentals", "Solidity basics", "Smart contract projects", "Web3 frontend", "Audit and deploy demo"],
    jobs: ["Blockchain Developer Intern", "Web3 Developer", "Smart Contract Developer"]
  },
  "Cloud Engineer": {
    skills: ["AWS", "Linux", "Networking", "Docker", "Monitoring"],
    roadmap: ["Linux and networking", "AWS/Azure basics", "Docker deployment", "Monitoring and logs", "Cloud project portfolio"],
    jobs: ["Cloud Support Engineer", "Junior Cloud Engineer", "Cloud Operations Trainee"]
  },
  "DevOps Engineer": {
    skills: ["CI/CD", "Docker", "Kubernetes", "Linux", "Automation"],
    roadmap: ["Linux and Git", "CI/CD pipelines", "Docker containers", "Kubernetes basics", "Deploy monitored app"],
    jobs: ["DevOps Intern", "Release Engineer", "Cloud DevOps Trainee"]
  },
  "Mobile App Developer": {
    skills: ["Flutter", "React Native", "API Integration", "Mobile UI", "Local Storage"],
    roadmap: ["Mobile UI basics", "State management", "API integration", "Local storage", "Publish demo app"],
    jobs: ["Mobile Developer Intern", "Flutter Developer", "React Native Developer"]
  },
  "Product Manager": {
    skills: ["User Research", "Analytics", "Roadmapping", "Communication", "Prioritization"],
    roadmap: ["Product thinking", "User research", "Analytics dashboards", "PRD writing", "Case study portfolio"],
    jobs: ["Product Analyst", "Associate Product Manager", "Product Intern"]
  },
  "Digital Marketing Specialist": {
    skills: ["SEO", "Content Marketing", "Campaign Analytics", "Social Media", "Copywriting"],
    roadmap: ["SEO basics", "Content strategy", "Ad campaign analytics", "Portfolio campaigns", "Marketing certification"],
    jobs: ["Digital Marketing Executive", "SEO Analyst", "Growth Marketing Intern"]
  },
  "QA Automation Engineer": {
    skills: ["Manual Testing", "Selenium", "API Testing", "Test Cases", "Bug Reporting"],
    roadmap: ["Testing fundamentals", "Test case design", "Automation scripting", "API testing", "QA project portfolio"],
    jobs: ["QA Tester", "Automation Tester", "QA Analyst Intern"]
  },
  "Database Administrator": {
    skills: ["SQL", "MongoDB", "Indexing", "Backups", "Performance Tuning"],
    roadmap: ["SQL fundamentals", "Database design", "Indexing and queries", "Backup/recovery", "Performance tuning project"],
    jobs: ["Database Administrator Trainee", "SQL Developer", "Data Operations Analyst"]
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
  { name: "IIT Madras", course: "B.Tech CSE", location: "Chennai", fees: 220000, placement: "30 LPA avg", cutoff: 99.7, eamcetRank: null, rating: 4.9, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 1" },
  { name: "IIT Delhi", course: "B.Tech CSE", location: "New Delhi", fees: 220000, placement: "31 LPA avg", cutoff: 99.6, eamcetRank: null, rating: 4.9, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 2" },
  { name: "IIT Bombay", course: "B.Tech CSE", location: "Mumbai", fees: 240000, placement: "32 LPA avg", cutoff: 99.6, eamcetRank: null, rating: 4.9, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 3" },
  { name: "IIT Kanpur", course: "B.Tech CSE", location: "Kanpur", fees: 220000, placement: "29 LPA avg", cutoff: 99.4, eamcetRank: null, rating: 4.8, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 4" },
  { name: "IIT Kharagpur", course: "B.Tech CSE", location: "Kharagpur", fees: 230000, placement: "27 LPA avg", cutoff: 99.2, eamcetRank: null, rating: 4.8, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 5" },
  { name: "IIT Roorkee", course: "B.Tech CSE", location: "Roorkee", fees: 220000, placement: "26 LPA avg", cutoff: 99.1, eamcetRank: null, rating: 4.8, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 6" },
  { name: "IIT Guwahati", course: "B.Tech CSE", location: "Guwahati", fees: 220000, placement: "25 LPA avg", cutoff: 98.9, eamcetRank: null, rating: 4.7, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 7" },
  { name: "IIT Hyderabad", course: "B.Tech CSE", location: "Hyderabad", fees: 220000, placement: "24 LPA avg", cutoff: 98.8, eamcetRank: null, rating: 4.8, acceptedExams: ["JEE"], type: "Hyderabad/National", source: "NIRF 2024 Engineering Rank 8" },
  { name: "NIT Trichy", course: "B.Tech CSE", location: "Tiruchirappalli", fees: 150000, placement: "18 LPA avg", cutoff: 98.0, eamcetRank: null, rating: 4.7, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 9" },
  { name: "IIT BHU Varanasi", course: "B.Tech CSE", location: "Varanasi", fees: 220000, placement: "24 LPA avg", cutoff: 98.3, eamcetRank: null, rating: 4.7, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 10" },
  { name: "VIT Vellore", course: "B.Tech CSE", location: "Vellore", fees: 198000, placement: "9.5 LPA avg", cutoff: 88.0, eamcetRank: null, rating: 4.5, acceptedExams: ["JEE", "OTHER CET"], type: "National", source: "NIRF 2024 Engineering Rank 11" },
  { name: "Jadavpur University", course: "B.Tech CSE", location: "Kolkata", fees: 12000, placement: "14 LPA avg", cutoff: 95.0, eamcetRank: null, rating: 4.6, acceptedExams: ["JEE", "OTHER CET"], type: "National", source: "NIRF 2024 Engineering Rank 12" },
  { name: "SRM Institute of Science and Technology", course: "B.Tech CSE", location: "Chennai", fees: 250000, placement: "8 LPA avg", cutoff: 82.0, eamcetRank: null, rating: 4.2, acceptedExams: ["JEE", "OTHER CET"], type: "National", source: "NIRF 2024 Engineering Rank 13" },
  { name: "Anna University", course: "B.Tech IT", location: "Chennai", fees: 60000, placement: "8.5 LPA avg", cutoff: 92.0, eamcetRank: null, rating: 4.5, acceptedExams: ["OTHER CET", "JEE"], type: "National", source: "NIRF 2024 Engineering Rank 14" },
  { name: "IIT ISM Dhanbad", course: "B.Tech CSE", location: "Dhanbad", fees: 220000, placement: "20 LPA avg", cutoff: 97.5, eamcetRank: null, rating: 4.6, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 15" },
  { name: "IIT Indore", course: "B.Tech CSE", location: "Indore", fees: 220000, placement: "22 LPA avg", cutoff: 97.6, eamcetRank: null, rating: 4.6, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 16" },
  { name: "NIT Surathkal", course: "B.Tech CSE", location: "Surathkal", fees: 150000, placement: "18 LPA avg", cutoff: 97.4, eamcetRank: null, rating: 4.6, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 17" },
  { name: "IIT Gandhinagar", course: "B.Tech CSE", location: "Gandhinagar", fees: 220000, placement: "19 LPA avg", cutoff: 97.0, eamcetRank: null, rating: 4.5, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 18" },
  { name: "NIT Rourkela", course: "B.Tech CSE", location: "Rourkela", fees: 150000, placement: "15 LPA avg", cutoff: 96.5, eamcetRank: null, rating: 4.5, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 19" },
  { name: "BITS Pilani", course: "B.E. Computer Science", location: "Pilani", fees: 270000, placement: "28 LPA avg", cutoff: 94.0, eamcetRank: null, rating: 4.7, acceptedExams: ["JEE", "OTHER CET"], type: "National", source: "NIRF 2024 Engineering Rank 20" },
  { name: "NIT Warangal", course: "B.Tech CSE", location: "Warangal", fees: 155000, placement: "18 LPA avg", cutoff: 97.0, eamcetRank: null, rating: 4.7, acceptedExams: ["JEE"], type: "Telangana/National", source: "NIRF 2024 Engineering Rank 21" },
  { name: "DTU Delhi", course: "B.Tech CSE", location: "New Delhi", fees: 220000, placement: "16 LPA avg", cutoff: 96.0, eamcetRank: null, rating: 4.5, acceptedExams: ["JEE"], type: "National", source: "NIRF 2024 Engineering Rank 27" },
  { name: "IIIT Hyderabad", course: "B.Tech CSE", location: "Hyderabad", fees: 360000, placement: "32 LPA avg", cutoff: 98.5, eamcetRank: null, rating: 4.8, acceptedExams: ["JEE"], type: "Hyderabad/National", source: "Institute admissions/JEE-mode catalog" },
  { name: "University College of Engineering, Osmania University", course: "B.E. CSE", location: "Hyderabad", fees: 50000, placement: "8 LPA avg", cutoff: null, eamcetRank: 1200, rating: 4.4, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "JNTUH College of Engineering Hyderabad", course: "B.Tech CSE", location: "Hyderabad", fees: 50000, placement: "8.5 LPA avg", cutoff: null, eamcetRank: 1800, rating: 4.4, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "CBIT Hyderabad", course: "B.E. CSE", location: "Hyderabad", fees: 160000, placement: "8 LPA avg", cutoff: null, eamcetRank: 3500, rating: 4.3, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "Vasavi College of Engineering", course: "B.E. CSE", location: "Hyderabad", fees: 150000, placement: "7.5 LPA avg", cutoff: null, eamcetRank: 5000, rating: 4.3, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "VNR VJIET", course: "B.Tech CSE", location: "Hyderabad", fees: 135000, placement: "7.5 LPA avg", cutoff: null, eamcetRank: 6500, rating: 4.2, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "GRIET Hyderabad", course: "B.Tech CSE", location: "Hyderabad", fees: 125000, placement: "6.8 LPA avg", cutoff: null, eamcetRank: 8500, rating: 4.1, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "Muffakham Jah College of Engineering", course: "B.E. CSE", location: "Hyderabad", fees: 125000, placement: "6.5 LPA avg", cutoff: null, eamcetRank: 11000, rating: 4.0, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "MGIT Hyderabad", course: "B.Tech CSE", location: "Hyderabad", fees: 110000, placement: "6.2 LPA avg", cutoff: null, eamcetRank: 14000, rating: 4.0, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "CVR College of Engineering", course: "B.Tech CSE", location: "Hyderabad", fees: 130000, placement: "6.5 LPA avg", cutoff: null, eamcetRank: 15000, rating: 4.1, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "BVRIT Narsapur", course: "B.Tech CSE", location: "Hyderabad Region", fees: 120000, placement: "6 LPA avg", cutoff: null, eamcetRank: 17000, rating: 4.0, acceptedExams: ["EAMCET TS"], type: "Hyderabad Region", source: "TG EAPCET-style cutoff catalog" },
  { name: "Anurag University", course: "B.Tech CSE", location: "Hyderabad", fees: 250000, placement: "6 LPA avg", cutoff: null, eamcetRank: 19000, rating: 4.0, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "Institute of Aeronautical Engineering", course: "B.Tech CSE", location: "Hyderabad", fees: 115000, placement: "5.8 LPA avg", cutoff: null, eamcetRank: 22000, rating: 3.9, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "CMR College of Engineering & Technology", course: "B.Tech CSE", location: "Hyderabad", fees: 105000, placement: "5.5 LPA avg", cutoff: null, eamcetRank: 25000, rating: 3.9, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "CMR Institute of Technology Hyderabad", course: "B.Tech CSE", location: "Hyderabad", fees: 100000, placement: "5.2 LPA avg", cutoff: null, eamcetRank: 30000, rating: 3.8, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "Malla Reddy Engineering College", course: "B.Tech CSE", location: "Hyderabad", fees: 100000, placement: "5 LPA avg", cutoff: null, eamcetRank: 35000, rating: 3.8, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "MLR Institute of Technology", course: "B.Tech CSE", location: "Hyderabad", fees: 95000, placement: "5 LPA avg", cutoff: null, eamcetRank: 38000, rating: 3.8, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "St. Martin's Engineering College", course: "B.Tech CSE", location: "Hyderabad", fees: 85000, placement: "4.5 LPA avg", cutoff: null, eamcetRank: 45000, rating: 3.6, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "Sreenidhi Institute of Science and Technology", course: "B.Tech CSE", location: "Hyderabad", fees: 135000, placement: "6.4 LPA avg", cutoff: null, eamcetRank: 12500, rating: 4.0, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "Keshav Memorial Institute of Technology", course: "B.Tech CSE", location: "Hyderabad", fees: 103000, placement: "6 LPA avg", cutoff: null, eamcetRank: 9000, rating: 4.1, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "Neil Gogte Institute of Technology", course: "B.Tech CSE", location: "Hyderabad", fees: 90000, placement: "5.2 LPA avg", cutoff: null, eamcetRank: 28000, rating: 3.8, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "Gokaraju Rangaraju Institute of Engineering and Technology", course: "B.Tech AI & ML", location: "Hyderabad", fees: 125000, placement: "6.8 LPA avg", cutoff: null, eamcetRank: 10500, rating: 4.1, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "VNR VJIET", course: "B.Tech AI & DS", location: "Hyderabad", fees: 135000, placement: "7 LPA avg", cutoff: null, eamcetRank: 9000, rating: 4.2, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "CBIT Hyderabad", course: "B.E. ECE", location: "Hyderabad", fees: 160000, placement: "7 LPA avg", cutoff: null, eamcetRank: 9000, rating: 4.2, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" },
  { name: "Vasavi College of Engineering", course: "B.E. IT", location: "Hyderabad", fees: 150000, placement: "7.2 LPA avg", cutoff: null, eamcetRank: 7000, rating: 4.2, acceptedExams: ["EAMCET TS"], type: "Hyderabad", source: "TG EAPCET-style cutoff catalog" }
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
  const defaultVideos = ["w7ejDZ8SWv8", "rfscVS0vtbw", "W6NZfCO5SIk", "HXV3zeQKqGY"];
  return [...new Set(skills.filter(Boolean))].slice(0, 8).map((skill, idx) => {
    const lowerSkill = skill.toLowerCase();
    const videoId = skillVideoMap[lowerSkill] || defaultVideos[idx % defaultVideos.length];
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
    mentors: [
      {
        name: "Placement Mentor",
        focus: "Resume review, internship strategy, interview preparation",
        availability: "Today 7:00 PM",
        match: 92
      },
      {
        name: `${career} Expert`,
        focus: `${catalog.skills.slice(0, 3).join(", ")} roadmap and project review`,
        availability: "Tomorrow 6:30 PM",
        match: 88
      },
      {
        name: "Alumni Guide",
        focus: "College choices, learning plan, portfolio feedback",
        availability: "Weekend slot",
        match: 84
      }
    ],
    mentorTips: [
      `Prepare a short introduction explaining why you want to become a ${career}.`,
      `Build proof for ${catalog.skills.slice(0, 2).join(" and ")} before applying.`,
      "Ask mentors to review your resume, project explanation, and interview answers."
    ],
    sessionPlan: [
      "Share your target role, current skills, and latest test or resume result.",
      `Ask the mentor to review one ${career} project idea before you build it.`,
      "End the session with three action items and one deadline."
    ],
    bookingSlots: ["Today 7:00 PM", "Tomorrow 6:30 PM", "Saturday 11:00 AM"],
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
    eamcetMarks = 80,
    eamcetRank = 0,
    budget = 200000,
    location = "",
    course = "CSE",
    category = "General"
  } = req.body;

  const jeePercentile = Math.min(100, Math.max(0, Number(examScore) || 0));
  const eamcetMarksValue = Math.min(160, Math.max(0, Number(eamcetMarks) || 0));
  const eamcetRankValue = Math.max(0, Number(eamcetRank) || 0);
  const estimatedEamcetRank = eamcetRankValue || Math.max(500, Math.round(85000 - (eamcetMarksValue / 160) * 83500));
  const normalizedLocation = String(location || "").trim().toLowerCase();
  const normalizedCourse = String(course || "").trim().toLowerCase();
  const budgetValue = Number(budget) || 0;
  const usesEamcet = examType === "EAMCET TS";

  const recommendations = collegeCatalog
    .filter((college) => college.fees <= budgetValue || budgetValue === 0)
    .filter((college) => college.acceptedExams.includes(examType) || (examType === "OTHER CET" && college.acceptedExams.some((exam) => exam.includes("CET"))))
    .map((college) => {
      const examFit = usesEamcet
        ? Math.max(0, Math.min(100, 100 - ((estimatedEamcetRank - (college.eamcetRank || 85000)) / Math.max(1, college.eamcetRank || 85000)) * 70))
        : Math.max(0, 100 - Math.abs((college.cutoff || 60) - jeePercentile) * 2.2);
      const budgetFit = Math.min(1, budgetValue / Math.max(1, college.fees));
      const locationMatch = normalizedLocation && college.location.toLowerCase().includes(normalizedLocation) ? 1 : 0.85;
      const courseMatch = normalizedCourse && college.course.toLowerCase().includes(normalizedCourse) ? 1 : 0.9;
      const casteBonus = category === "General" ? 0 : usesEamcet ? 8 : 4;
      const admissionChance = Math.round(
        Math.min(98, Math.max(20,
          examFit * 0.62 + budgetFit * 16 + locationMatch * 10 + courseMatch * 8 + casteBonus
        ))
      );
      const cutoffTrend = usesEamcet
        ? estimatedEamcetRank <= (college.eamcetRank || 0) ? "Within expected EAMCET rank range" : "Above expected EAMCET rank range"
        : jeePercentile >= (college.cutoff || 0) ? "Within expected JEE percentile range" : "Below expected JEE percentile range";

      return {
        ...college,
        admissionChance,
        cutoffTrend,
        userExamMetric: usesEamcet ? `Rank used: ${estimatedEamcetRank}` : `Percentile used: ${jeePercentile}`,
        model: usesEamcet ? "weighted_eamcet_rank_match" : "weighted_jee_percentile_match"
      };
    })
    .sort((a, b) => b.admissionChance - a.admissionChance)
    .slice(0, 50);

  res.json({
    recommendations,
    source: "Curated from NIRF 2024 engineering rankings plus Hyderabad/Telangana EAMCET-style cutoff catalog",
    algorithm: usesEamcet ? "Weighted rank-fit scoring using EAMCET rank/marks estimate" : "Weighted percentile-fit scoring using JEE percentile"
  });
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

function buildLocalChatAnswer(userInput, context) {
  const text = userInput.toLowerCase();
  const career = context.career;
  const skills = context.catalog.skills.slice(0, 5);
  const roadmap = context.catalog.roadmap.slice(0, 4);
  const resumeMissing = context.latestResume?.analysis?.missingSkills || [];
  const testSkills = context.latestTest?.recommendation?.skillsToBuild || [];
  const focusSkills = [...new Set([...resumeMissing, ...testSkills, ...skills])].slice(0, 5);
  const skillPlans = {
    html: "Learn HTML in this order: document structure, headings/paragraphs, links/images, lists/tables, forms, semantic tags like header/nav/main/section/footer, then accessibility basics. Practice by building a personal profile page, a resume page, and a simple landing page.",
    css: "Learn CSS in this order: selectors, box model, colors/fonts, flexbox, grid, responsive media queries, transitions, then clean component styling. Practice by styling your HTML profile page for mobile and desktop.",
    javascript: "Learn JavaScript in this order: variables, functions, arrays, objects, DOM manipulation, events, fetch API, promises/async-await, then small projects. Build a calculator, quiz app, and API-based weather/search app.",
    react: "Learn React after basic JavaScript. Start with components, props, state, events, forms, conditional rendering, lists, useEffect, API calls, routing, then project structure. Build a todo app, dashboard page, and portfolio project.",
    node: "Learn Node.js after JavaScript basics. Start with npm, modules, Express routes, middleware, REST APIs, MongoDB connection, authentication, and error handling. Build a CRUD API and connect it to React.",
    mongodb: "Learn MongoDB with collections, documents, CRUD queries, schemas with Mongoose, relationships by id, indexes, and aggregation basics. Practice by storing users, tests, resume analyses, and recommendations."
  };
  const mentionedSkill = Object.keys(skillPlans).find((skill) => text.includes(skill));
  const roleMatch = Object.keys(careerCatalog).find((role) => text.includes(role.toLowerCase()));

  if (roleMatch && (text.includes("become") || text.includes("how") || text.includes("roadmap") || text.includes("learn"))) {
    const rolePlan = careerCatalog[roleMatch];
    return [
      `To become a ${roleMatch}, follow this path:`,
      rolePlan.roadmap.map((step, index) => `${index + 1}. ${step}`).join(" "),
      `Focus skills: ${rolePlan.skills.join(", ")}.`,
      "Build at least two proof projects and add them to your resume with GitHub or deployed links."
    ].join(" ");
  }

  if (/^(hi|hello|hey|how are you|good morning|good evening|good afternoon)\b/.test(text)) {
    return "I’m doing well and ready to help. Tell me what you want to work on: learning a skill, building a project, improving your resume, preparing for interviews, or choosing the next career step.";
  }

  if (text.includes("thank")) {
    return "You’re welcome. Keep the next step small and visible: learn one concept, practice it once, and add proof of it to your portfolio or resume.";
  }

  if (mentionedSkill && (text.includes("learn") || text.includes("study") || text.includes("start") || text.includes("how"))) {
    return skillPlans[mentionedSkill];
  }

  if (text.includes("how should i follow") || text.includes("how to follow") || text.includes("what should i do") || text.includes("next step")) {
    return [
      `Follow this simple weekly plan for ${career}:`,
      `1. Pick one skill: ${focusSkills[0] || skills[0]}.`,
      "2. Watch one beginner course/video and take short notes.",
      "3. Practice the same concept in a small task the same day.",
      "4. Build one mini project by the weekend.",
      "5. Add the project link and 2-3 bullet points to your resume.",
      `Then repeat with ${focusSkills.slice(1, 4).join(", ")}.`
    ].join(" ");
  }

  if (text.includes("resume") || text.includes("ats") || text.includes("cv")) {
    return [
      `For a ${career} resume, keep the first half page very strong.`,
      `Add these skills with proof: ${focusSkills.join(", ")}.`,
      "For each project, write: problem solved, tech stack, your contribution, measurable result, and GitHub/deployed link.",
      "Use simple ATS-friendly headings: Summary, Skills, Projects, Education, Experience, Certifications."
    ].join(" ");
  }

  if (text.includes("project") || text.includes("portfolio")) {
    return [
      `Build 2-3 portfolio projects for ${career}.`,
      `Start with a project using ${skills.slice(0, 3).join(", ")}.`,
      "Make every project public on GitHub, add screenshots, and write a short README explaining features, setup, and learning outcome."
    ].join(" ");
  }

  if (text.includes("interview") || text.includes("placement")) {
    return [
      `For ${career} interviews, prepare fundamentals plus project explanation.`,
      `Revise these areas first: ${focusSkills.join(", ")}.`,
      "Practice one technical question, one project explanation, and one HR answer daily for the next two weeks."
    ].join(" ");
  }

  if (text.includes("roadmap") || text.includes("learn") || text.includes("study")) {
    return [
      `Your current roadmap for ${career}:`,
      roadmap.map((step, index) => `${index + 1}. ${step}`).join(" "),
      `After that, strengthen ${focusSkills.slice(0, 3).join(", ")} with one mini project. If you ask about a specific skill like HTML, CSS, JavaScript, React, or Node, I can give a step-by-step plan.`
    ].join(" ");
  }

  return [
    "I can help with that, but I need one specific direction.",
    `You can ask: "How should I learn ${skills[0] || "HTML"}?", "Suggest a project", "Improve my resume", "Prepare me for interview", or "Give me a weekly plan".`,
    `Your current career context is ${career}, so I’ll tailor answers around that path.`
  ].join(" ");
}

router.post("/chat", requireAuth, async (req, res) => {
  const userInput = String(req.body.text || "").trim();
  const context = await getContext(req.user.id);

  if (!userInput) {
    return res.status(400).json({ answer: "Please send a non-empty chat message." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      answer: buildLocalChatAnswer(userInput, context),
      source: "local"
    });
  }

  try {
    const systemPrompt = buildChatSystemPrompt(context);
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: userInput }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.75
      }
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "I couldn't generate a response right now. Please try again.";
    res.json({ answer });
  } catch (error) {
    console.error("Gemini chat error", error?.response?.data || error.message || error);
    res.json({
      answer: buildLocalChatAnswer(userInput, context),
      source: "local-fallback"
    });
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

// KNN Recommendation endpoint
router.post("/knn-recommend", requireAuth, async (req, res) => {
  try {
    const { features, k = 5, num_recommendations = 3 } = req.body;

    if (!features || Object.keys(features).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No user features provided",
        knn_recommendations: [],
        similar_profiles: [],
        roadmaps: {}
      });
    }

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
    
    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/knn-recommend`,
        { features, k, num_recommendations },
        { timeout: 10000 }
      );
      
      return res.json(response.data);
    } catch (mlError) {
      console.warn("ML service KNN call failed, using fallback:", mlError.message);
      
      // Fallback: Generate basic recommendations from existing model
      const fallbackRecommendations = await generateFallbackKNNRecommendations(features);
      return res.json(fallbackRecommendations);
    }
  } catch (error) {
    console.error("Error in KNN endpoint:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      knn_recommendations: [],
      similar_profiles: [],
      roadmaps: {}
    });
  }
});

// Fallback function for KNN recommendations
async function generateFallbackKNNRecommendations(features) {
  const profile = normalizeProfileValues(features);
  
  // Generate recommendations using local logic
  const careers = [
    {
      career: "Data Scientist",
      score: (profile.Data_Analysis || 0) * 0.4 + (profile.AI_Interest || 0) * 0.3 + (profile.Math_Interest || 0) * 0.2 + Math.random() * 0.1,
      skills: ["Python", "Statistics", "SQL", "Machine Learning"]
    },
    {
      career: "Software Engineer",
      score: (profile.Coding_Skill || 0) * 0.4 + (profile.Problem_Solving || 0) * 0.3 + (profile.Web_Development || 0) * 0.2 + Math.random() * 0.1,
      skills: ["JavaScript", "System Design", "Git", "Testing"]
    },
    {
      career: "AI Engineer",
      score: (profile.AI_Interest || 0) * 0.4 + (profile.Coding_Skill || 0) * 0.3 + (profile.Research_Interest || 0) * 0.2 + Math.random() * 0.1,
      skills: ["Python", "Deep Learning", "TensorFlow", "ML Deployment"]
    },
    {
      career: "Web Developer",
      score: (profile.Web_Development || 0) * 0.4 + (profile.Coding_Skill || 0) * 0.3 + (profile.Creativity || 0) * 0.2 + Math.random() * 0.1,
      skills: ["React", "JavaScript", "HTML/CSS", "Backend APIs"]
    },
    {
      career: "Cybersecurity Analyst",
      score: (profile.Cybersecurity_Interest || 0) * 0.4 + (profile.Problem_Solving || 0) * 0.3 + (profile.Attention_To_Detail || 0) * 0.2 + Math.random() * 0.1,
      skills: ["Networking", "Linux", "Security", "Risk Assessment"]
    }
  ];

  // Sort by score and get top 3
  const sorted = careers.sort((a, b) => b.score - a.score).slice(0, 3);
  
  // Normalize scores to percentages
  const totalScore = sorted.reduce((sum, c) => sum + c.score, 0);
  const recommendations = sorted.map(c => ({
    career: c.career,
    score: parseFloat((c.score / totalScore).toFixed(3)),
    confidence: Math.round((c.score / totalScore) * 100),
    similar_profile_count: Math.floor(Math.random() * 4) + 1
  }));

  // Generate similar profiles
  const similarProfiles = [
    {
      profile_id: "Profile 1",
      career: recommendations[0]?.career || "Data Scientist",
      similarity_score: Math.round(Math.random() * 10 + 85)
    },
    {
      profile_id: "Profile 2",
      career: recommendations[1]?.career || "Software Engineer",
      similarity_score: Math.round(Math.random() * 10 + 80)
    },
    {
      profile_id: "Profile 3",
      career: recommendations[2]?.career || "AI Engineer",
      similarity_score: Math.round(Math.random() * 10 + 75)
    }
  ];

  // Basic roadmaps
  const roadmaps = {
    "Data Scientist": ["Statistics & Probability", "Python + SQL", "Data Visualization", "Machine Learning basics", "Build portfolio projects"],
    "Software Engineer": ["Data Structures", "System Design", "Code Quality", "Version Control", "Testing practices"],
    "AI Engineer": ["Python & ML basics", "Deep Learning", "NLP or Computer Vision", "Model Deployment", "Production pipelines"],
    "Web Developer": ["HTML, CSS, JavaScript", "Frontend frameworks (React)", "Backend basics (Node.js)", "Full stack projects", "Deployment"],
    "Cybersecurity Analyst": ["Networking fundamentals", "Linux & scripting", "Web security", "Threat monitoring", "Security audits"]
  };

  return {
    knn_recommendations: recommendations,
    similar_profiles: similarProfiles,
    roadmaps: roadmaps,
    status: "success",
    source: "fallback"
  };
}

// Feedback endpoints
router.post("/feedback", requireAuth, async (req, res) => {
  try {
    const { testResultId, userFeatures, recommendedCareers, selectedCareer, outcome, roleTitle, timeTakenMonths, feedbackNotes } = req.body;

    if (!outcome || !selectedCareer) {
      return res.status(400).json({ message: "outcome and selectedCareer are required" });
    }

    const feedback = await RecommendationFeedback.create({
      user: req.user.id,
      testResult: testResultId,
      userFeatures: userFeatures || {},
      recommendedCareers: recommendedCareers || [],
      selectedCareer,
      outcome,
      roleTitle,
      timeTakenMonths,
      feedbackNotes
    });

    // Update career analytics
    await updateCareerAnalytics(selectedCareer, outcome, timeTakenMonths, roleTitle, feedback._id);

    res.status(201).json({ feedback, message: "Feedback saved successfully" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ message: "Error saving feedback", error: error.message });
  }
});

router.get("/feedback", requireAuth, async (req, res) => {
  try {
    const feedback = await RecommendationFeedback.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Error fetching feedback" });
  }
});

// Public/anonymized feedback by career (for chooser influence)
router.get("/feedback/career/:career", requireAuth, async (req, res) => {
  try {
    const { career } = req.params;
    const entries = await RecommendationFeedback.find({ selectedCareer: career })
      .sort({ createdAt: -1 })
      .limit(200)
      .select("outcome roleTitle timeTakenMonths feedbackNotes createdAt -_id");

    // Return anonymized summary and a few samples
    const summary = entries.reduce((acc, e) => {
      acc.total += 1;
      acc[e.outcome] = (acc[e.outcome] || 0) + 1;
      if (e.timeTakenMonths) acc.totalTime += e.timeTakenMonths;
      return acc;
    }, { total: 0, totalTime: 0 });

    res.json({
      career,
      summary: {
        total: summary.total,
        averageTimeMonths: summary.total ? Math.round(summary.totalTime / summary.total) : 0,
        distribution: Object.fromEntries(["Got Job", "Got Internship", "Still Learning", "Not Interested"].map(k => [k, summary[k] || 0]))
      },
      samples: entries.slice(0, 10).map((e) => ({ outcome: e.outcome, roleTitle: e.roleTitle, timeTakenMonths: e.timeTakenMonths, feedbackNotes: e.feedbackNotes, createdAt: e.createdAt }))
    });
  } catch (error) {
    console.error("Error fetching career feedback:", error);
    res.status(500).json({ message: "Error fetching career feedback" });
  }
});

// Analytics endpoints
router.get("/analytics", requireAuth, async (req, res) => {
  try {
    const analytics = await CareerAnalytics.find().sort({ successRate: -1 });
    res.json({ analytics });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Error fetching analytics" });
  }
});

router.get("/analytics/:career", requireAuth, async (req, res) => {
  try {
    const { career } = req.params;
    const analytics = await CareerAnalytics.findOne({ career });
    
    if (!analytics) {
      return res.status(404).json({ message: "Analytics not found for this career" });
    }

    res.json({ analytics });
  } catch (error) {
    console.error("Error fetching career analytics:", error);
    res.status(500).json({ message: "Error fetching career analytics" });
  }
});

// Helper function to update career analytics
async function updateCareerAnalytics(career, outcome, timeTakenMonths, roleTitle, feedbackId) {
  try {
    let analytics = await CareerAnalytics.findOne({ career });

    if (!analytics) {
      analytics = new CareerAnalytics({ career });
    }

    // Update counters
    analytics.totalUsers += 1;

    if (outcome === "Got Job" || outcome === "Got Internship") {
      analytics.successCount += 1;
    }

    if (outcome === "Got Job") {
      analytics.jobCount += 1;
    } else if (outcome === "Got Internship") {
      analytics.internshipCount += 1;
    } else if (outcome === "Still Learning") {
      analytics.stillLearningCount += 1;
    } else if (outcome === "Not Interested") {
      analytics.notInterestedCount += 1;
    }

    // Update time tracking
    if (timeTakenMonths) {
      analytics.totalTimeMonths += timeTakenMonths;
      analytics.averageTimeTakenMonths = Math.round(analytics.totalTimeMonths / analytics.totalUsers);
    }

    // Calculate success rate
    analytics.successRate = Math.round((analytics.successCount / analytics.totalUsers) * 100);

    // Determine most common outcome
    const outcomes = {
      "Job": analytics.jobCount,
      "Internship": analytics.internshipCount,
      "Learning": analytics.stillLearningCount,
      "Not Interested": analytics.notInterestedCount
    };
    analytics.mostCommonOutcome = Object.keys(outcomes).reduce((a, b) => outcomes[a] > outcomes[b] ? a : b);

    // Add feedback entry
    analytics.feedback.push({
      feedbackId,
      outcome,
      timeTakenMonths,
      roleTitle
    });

    // Keep only last 100 feedbacks for space efficiency
    if (analytics.feedback.length > 100) {
      analytics.feedback = analytics.feedback.slice(-100);
    }

    await analytics.save();
  } catch (error) {
    console.error("Error updating career analytics:", error);
  }
}

export default router;
