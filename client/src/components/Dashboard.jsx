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
  GraduationCap,
  LayoutDashboard,
  LineChart,
  ListChecks,
  LogOut,
  Map,
  Medal,
  MessageSquare,
  Menu,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
  UserRound
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_ORIGIN, api } from "../api";
import { skillQuizDataset } from "../data/skillQuizDataset";
import ResumePanel from "./ResumePanel";
import ResultPanel from "./ResultPanel";
const sidebarFeatures = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "career-profile", label: "Career Profiling", icon: Target },
  { id: "manual-profile", label: "Manual Skills", icon: SlidersHorizontal },
  { id: "guidance", label: "Guidance", icon: Compass },
  { id: "chat", label: "Career Chat", icon: MessageSquare },
  { id: "skills", label: "Input Skills", icon: BrainCircuit },
  { id: "resume", label: "Resume NLP", icon: FileText },
  { id: "jobs", label: "Job Finder", icon: BriefcaseBusiness },
  { id: "courses", label: "Roadmap", icon: Map },
  { id: "development", label: "Skill Development", icon: LineChart },
  { id: "mentor", label: "Expert Guidance", icon: UserRound },
  { id: "progress", label: "Track Progress", icon: Trophy },
  { id: "profile", label: "Profile Report", icon: UserRound }
];

const jobMatches = [
  { role: "Frontend Developer Intern", company: "TCS", location: "Bengaluru", fit: "87%", salary: "3-5 LPA", type: "Internship", skills: "React, JavaScript, CSS" },
  { role: "Data Analyst Trainee", company: "Infosys", location: "Hyderabad", fit: "82%", salary: "4-6 LPA", type: "Entry level", skills: "Excel, SQL, Python" },
  { role: "Business Analyst Intern", company: "Deloitte", location: "Remote", fit: "78%", salary: "3-5 LPA", type: "Internship", skills: "Communication, process mapping, dashboards" },
  { role: "UX Designer", company: "Accenture", location: "Pune", fit: "81%", salary: "4-6 LPA", type: "Entry level", skills: "Figma, prototyping, user research" },
  { role: "Full-Stack Developer", company: "Cognizant", location: "Chennai", fit: "79%", salary: "5-8 LPA", type: "Entry level", skills: "React, Node.js, MongoDB" },
  { role: "Machine Learning Engineer", company: "IBM", location: "Bengaluru", fit: "76%", salary: "8-12 LPA", type: "Mid level", skills: "Python, ML, TensorFlow" },
  { role: "Product Analyst", company: "Flipkart", location: "Bengaluru", fit: "80%", salary: "6-9 LPA", type: "Entry level", skills: "SQL, analytics, stakeholder communication" },
  { role: "Cybersecurity Analyst", company: "Wipro", location: "Mumbai", fit: "75%", salary: "5-7 LPA", type: "Entry level", skills: "Network security, incident response, risk assessment" },
  { role: "DevOps Engineer", company: "Dell", location: "Bengaluru", fit: "74%", salary: "7-10 LPA", type: "Mid level", skills: "CI/CD, Docker, Kubernetes" },
  { role: "Digital Marketing Executive", company: "Zoho", location: "Chennai", fit: "72%", salary: "3-5 LPA", type: "Entry level", skills: "SEO, social media, analytics" },
  { role: "QA Automation Tester", company: "HCL", location: "Noida", fit: "77%", salary: "4-6 LPA", type: "Entry level", skills: "Selenium, test automation, Java" },
  { role: "Data Science Intern", company: "Byju's", location: "Bengaluru", fit: "83%", salary: "3-4 LPA", type: "Internship", skills: "Python, machine learning, data visualization" }
];

const careerRoleMap = {
  "Software Engineer": ["Full Stack Developer", "Backend Developer", "Frontend Developer", "DevOps Engineer"],
  "Data Scientist": ["Data Science Intern", "Junior Data Scientist", "Analytics Engineer", "ML Researcher"],
  "AI Engineer": ["AI Research Intern", "ML Engineer", "NLP Engineer", "Computer Vision Engineer"],
  "Web Developer": ["Frontend Developer", "Full Stack Developer", "UI Engineer", "Web App Developer"],
  "Business Analyst": ["Business Analyst Intern", "Product Analyst", "Operations Analyst", "Strategy Analyst"],
  "Cybersecurity Analyst": ["SOC Analyst", "Security Engineer", "Vulnerability Analyst", "Incident Response Analyst"],
  "Blockchain Developer": ["Smart Contract Developer", "Web3 Engineer", "Blockchain Intern", "DApp Developer"],
  "Cloud Engineer": ["Cloud Support Engineer", "Cloud Operations Associate", "Site Reliability Engineer", "AWS Engineer"],
  "DevOps Engineer": ["Release Engineer", "Build Engineer", "Infrastructure Engineer", "Automation Engineer"],
  "Mobile App Developer": ["React Native Developer", "Flutter Developer", "Android Developer", "iOS Developer"],
  "UI/UX Designer": ["UX Designer", "Product Designer", "Interaction Designer", "Visual Designer"],
  "Product Manager": ["Product Analyst", "Associate Product Manager", "Product Owner", "Strategy Analyst"]
};

function makeGuidanceSimilarProfiles(career) {
  return [
    {
      profile_id: "Anon profile 01",
      career,
      similarity_score: Math.round(88 + Math.random() * 8)
    },
    {
      profile_id: "Anon profile 02",
      career,
      similarity_score: Math.round(82 + Math.random() * 10)
    },
    {
      profile_id: "Anon profile 03",
      career,
      similarity_score: Math.round(78 + Math.random() * 12)
    }
  ];
}

const profileFeatureFields = [
  ["Math_Interest", "Math Interest", 1, 10],
  ["Physics_Interest", "Physics Interest", 1, 10],
  ["Chemistry_Interest", "Chemistry Interest", 1, 10],
  ["Biology_Interest", "Biology Interest", 1, 10],
  ["English_Interest", "English Interest", 1, 10],
  ["GPA", "GPA", 0, 10],
  ["Coding_Skill", "Coding Skill", 1, 10],
  ["Problem_Solving", "Problem Solving", 1, 10],
  ["Data_Analysis", "Data Analysis", 1, 10],
  ["Web_Development", "Web Development", 1, 10],
  ["AI_Interest", "AI Interest", 1, 10],
  ["Communication", "Communication", 1, 10],
  ["Leadership", "Leadership", 1, 10],
  ["Teamwork", "Teamwork", 1, 10],
  ["Public_Speaking", "Public Speaking", 1, 10],
  ["Creativity", "Creativity", 1, 10],
  ["Analytical_Thinking", "Analytical Thinking", 1, 10],
  ["Attention_To_Detail", "Attention To Detail", 1, 10],
  ["Stress_Handling", "Stress Handling", 1, 10],
  ["Research_Interest", "Research Interest", 1, 10],
  ["Social_Service_Interest", "Social Service Interest", 1, 10],
  ["Cybersecurity_Interest", "Cybersecurity Interest", 1, 10],
  ["Blockchain_Interest", "Blockchain Interest", 1, 10],
  ["Cloud_Computing", "Cloud Computing", 1, 10],
  ["DevOps_Interest", "DevOps Interest", 1, 10],
  ["Mobile_Development", "Mobile Development", 1, 10],
  ["UI_UX_Design", "UI/UX Design", 1, 10],
  ["Product_Management", "Product Management", 1, 10],
  ["Digital_Marketing", "Digital Marketing", 1, 10],
  ["Testing_QA", "Testing / QA", 1, 10],
  ["Database_Management", "Database Management", 1, 10]
];

const defaultProfileFeatures = Object.fromEntries(
  profileFeatureFields.map(([key, _label, min, max]) => [key, key === "GPA" ? 7 : Math.round((min + max) / 2)])
);

const ratingChoices = [
  ["Poor", 1],
  ["Average", 3],
  ["Medium", 5],
  ["Good", 7],
  ["High", 9],
  ["Expert", 10]
];

function shuffleArray(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const CAREER_LEARNING_PLANS = {
  "Software Engineer": {
    resources: [
      { title: "React Full Course for Beginners", videoId: "w7ejDZ8SWv8", url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8", description: "End-to-end React app development tutorial." },
      { title: "Python for Everybody", videoId: "8DvywoWv6fI", url: "https://www.youtube.com/watch?v=8DvywoWv6fI", description: "Complete Python beginner course." },
      { title: "Git & GitHub Crash Course", videoId: "RGOj5yH7evk", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", description: "Version control basics for developers." }
    ],
    certifications: [
      { title: "freeCodeCamp Responsive Web Design", url: "https://www.freecodecamp.org/learn/" },
      { title: "Google IT Support Professional", url: "https://grow.google/programs/it-support/" }
    ]
  },
  "Data Scientist": {
    resources: [
      { title: "Data Science Full Course", videoId: "ua-CiDNNj30", url: "https://www.youtube.com/watch?v=ua-CiDNNj30", description: "Python, statistics, and ML workflow." },
      { title: "Machine Learning Tutorial", videoId: "Gv9_4yMHFhI", url: "https://www.youtube.com/watch?v=Gv9_4yMHFhI", description: "Complete machine learning crash course." },
      { title: "SQL Tutorial", videoId: "HXV3zeQKqGY", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", description: "SQL querying for beginners." }
    ],
    certifications: [
      { title: "Google Data Analytics Professional", url: "https://grow.google/data-analytics/" },
      { title: "IBM Data Science Professional", url: "https://www.coursera.org/professional-certificates/ibm-data-science" }
    ]
  },
  "AI Engineer": {
    resources: [
      { title: "Deep Learning Full Course", videoId: "tPYj3fFJGjk", url: "https://www.youtube.com/watch?v=tPYj3fFJGjk", description: "Neural networks and TensorFlow basics." },
      { title: "TensorFlow Tutorial", videoId: "z_8bCaM4F2c", url: "https://www.youtube.com/watch?v=z_8bCaM4F2c", description: "Build models with TensorFlow." },
      { title: "NLP Crash Course", videoId: "bR7Y8YtFSb0", url: "https://www.youtube.com/watch?v=bR7Y8YtFSb0", description: "Natural language processing introduction." }
    ],
    certifications: [
      { title: "Google Machine Learning", url: "https://cloud.google.com/training/machinelearning-ai" },
      { title: "IBM AI Engineering Professional", url: "https://www.coursera.org/professional-certificates/ai-engineer" }
    ]
  },
  "Web Developer": {
    resources: [
      { title: "HTML, CSS & JavaScript Course", videoId: "qz0aGYrrlhU", url: "https://www.youtube.com/watch?v=qz0aGYrrlhU", description: "Build modern websites from scratch." },
      { title: "React JS Crash Course", videoId: "w7ejDZ8SWv8", url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8", description: "React fundamentals and project building." },
      { title: "Frontend Developer Roadmap", videoId: "nB8P8w8L4Iw", url: "https://www.youtube.com/watch?v=nB8P8w8L4Iw", description: "Frontend career path guidance." }
    ],
    certifications: [
      { title: "freeCodeCamp Front End Libraries", url: "https://www.freecodecamp.org/learn/" },
      { title: "Microsoft Certified: Power Platform App Maker", url: "https://learn.microsoft.com/en-us/certifications/power-platform-app-maker/" }
    ]
  },
  "Business Analyst": {
    resources: [
      { title: "Business Analysis Tutorial", videoId: "9B7mqO6CBWc", url: "https://www.youtube.com/watch?v=9B7mqO6CBWc", description: "Requirements gathering and documentation." },
      { title: "Excel for Business Analysts", videoId: "8vAJXHjq4CI", url: "https://www.youtube.com/watch?v=8vAJXHjq4CI", description: "Excel tools for analysis." },
      { title: "SQL for Analysts", videoId: "7S_tz1z_5bA", url: "https://www.youtube.com/watch?v=7S_tz1z_5bA", description: "Querying databases for reporting." }
    ],
    certifications: [
      { title: "Google Data Analytics Professional", url: "https://grow.google/data-analytics/" },
      { title: "Certified Business Analyst Professional", url: "https://www.iiba.org/certification/" }
    ]
  },
  "Healthcare / Biology Track": {
    resources: [
      { title: "Biology Basics", videoId: "2JTpIr8yDiI", url: "https://www.youtube.com/watch?v=2JTpIr8yDiI", description: "Core biology concepts for career readiness." },
      { title: "Medical Research Methods", videoId: "M8Cf3owWg7w", url: "https://www.youtube.com/watch?v=M8Cf3owWg7w", description: "Research skills for healthcare careers." },
      { title: "Communication for Healthcare", videoId: "EfqXxN-8ON4", url: "https://www.youtube.com/watch?v=EfqXxN-8ON4", description: "Patient communication fundamentals." }
    ],
    certifications: [
      { title: "Coursera Medical Research", url: "https://www.coursera.org/" },
      { title: "LinkedIn Learning Healthcare", url: "https://www.linkedin.com/learning/" }
    ]
  }
};

const academicFeatureKeys = new Set(["GPA"]);

const featureSections = [
  {
    title: "Subject Interests",
    helper: "Rate your interest in each subject on a scale of 1-10.",
    keys: ["Math_Interest", "Physics_Interest", "Chemistry_Interest", "Biology_Interest", "English_Interest"]
  },
  {
    title: "Technical Skills",
    helper: "Select your current level honestly. These are converted to 1-10 values for the model.",
    keys: ["Coding_Skill", "Problem_Solving", "Data_Analysis", "Web_Development", "AI_Interest"]
  },
  {
    title: "Market Role Skills",
    helper: "Rate modern job-market skills so the model can recommend cybersecurity, blockchain, cloud, DevOps, mobile, product, and related careers.",
    keys: ["Cybersecurity_Interest", "Blockchain_Interest", "Cloud_Computing", "DevOps_Interest", "Mobile_Development", "UI_UX_Design", "Product_Management", "Digital_Marketing", "Testing_QA", "Database_Management"]
  },
  {
    title: "Communication & Team Skills",
    helper: "Rate your soft skills based on classroom, project, or activity experience.",
    keys: ["Communication", "Leadership", "Teamwork", "Public_Speaking"]
  },
  {
    title: "Thinking Style & Interests",
    helper: "These help the model distinguish creative, analytical, research, service, and high-pressure career paths.",
    keys: ["Creativity", "Analytical_Thinking", "Attention_To_Detail", "Stress_Handling", "Research_Interest", "Social_Service_Interest"]
  }
];

const profilingQuestions = [
  { id: "math_1", feature: "Math_Interest", question: "If 25% of a number is 40, what is the number?", options: [["100", 40], ["120", 55], ["160", 100], ["200", 45]] },
  { id: "math_2", feature: "Math_Interest", question: "The average of 8, 12, 15 and 25 is:", options: [["12", 45], ["15", 55], ["18", 100], ["20", 50]] },
  { id: "math_3", feature: "Math_Interest", question: "If x + 7 = 19, then x is:", options: [["10", 50], ["11", 55], ["12", 100], ["13", 50]] },
  { id: "math_4", feature: "Math_Interest", question: "A ratio 2:3 has total 50. The larger part is:", options: [["20", 55], ["25", 50], ["30", 100], ["35", 45]] },
  { id: "physics_1", feature: "Physics_Interest", question: "The SI unit of force is:", options: [["Joule", 45], ["Newton", 100], ["Watt", 45], ["Pascal", 55]] },
  { id: "physics_2", feature: "Physics_Interest", question: "Speed is calculated as:", options: [["Distance / Time", 100], ["Time / Distance", 40], ["Mass x Acceleration", 55], ["Force / Area", 45]] },
  { id: "physics_3", feature: "Physics_Interest", question: "A simple electric circuit must have:", options: [["Only a bulb", 40], ["Only a wire", 40], ["Closed path and source", 100], ["Only a switch", 45]] },
  { id: "chemistry_1", feature: "Chemistry_Interest", question: "Water is represented by the formula:", options: [["CO2", 40], ["H2O", 100], ["O2", 45], ["NaCl", 40]] },
  { id: "chemistry_2", feature: "Chemistry_Interest", question: "A pH less than 7 usually indicates:", options: [["Acid", 100], ["Base", 40], ["Salt only", 45], ["Metal", 40]] },
  { id: "biology_1", feature: "Biology_Interest", question: "The basic unit of life is:", options: [["Atom", 40], ["Cell", 100], ["Tissue only", 55], ["Organ", 60]] },
  { id: "biology_2", feature: "Biology_Interest", question: "Which system transports blood in the body?", options: [["Digestive", 45], ["Circulatory", 100], ["Respiratory only", 55], ["Nervous", 50]] },
  { id: "english_1", feature: "English_Interest", question: "Choose the correctly spelled word:", options: [["Recieve", 40], ["Receive", 100], ["Receeve", 40], ["Receve", 40]] },
  { id: "english_2", feature: "English_Interest", question: "Choose the best synonym for concise:", options: [["Lengthy", 40], ["Brief", 100], ["Confused", 45], ["Delayed", 40]] },
  { id: "coding_1", feature: "Coding_Skill", question: "Which data structure follows FIFO?", options: [["Stack", 3], ["Queue", 10], ["Tree", 5], ["Graph", 5]] },
  { id: "coding_2", feature: "Coding_Skill", question: "In programming, a loop is mainly used to:", options: [["Repeat instructions", 10], ["Store images", 3], ["Delete variables", 2], ["Compile hardware", 2]] },
  { id: "coding_3", feature: "Coding_Skill", question: "Which symbol is commonly used for strict equality in JavaScript?", options: [["=", 2], ["==", 5], ["===", 10], ["!=", 3]] },
  { id: "cs_1", feature: "Coding_Skill", question: "Which one is an operating system?", options: [["MongoDB", 3], ["Windows", 10], ["React", 3], ["HTML", 2]] },
  { id: "problem_1", feature: "Problem_Solving", question: "Find the next term: 3, 6, 12, 24, ?", options: [["30", 3], ["36", 5], ["48", 10], ["60", 4]] },
  { id: "problem_2", feature: "Problem_Solving", question: "If all roses are flowers and some flowers fade, which is definitely true?", options: [["All flowers are roses", 2], ["All roses are flowers", 10], ["No roses fade", 3], ["All fading things are roses", 2]] },
  { id: "problem_3", feature: "Analytical_Thinking", question: "A bug appears only after login. Best first step?", options: [["Rewrite the app", 2], ["Check login-related logs and state", 10], ["Ignore it", 1], ["Change colors", 1]] },
  { id: "data_1", feature: "Data_Analysis", question: "Which tool/query is used to retrieve rows from a database?", options: [["SELECT", 10], ["PAINT", 1], ["PRINT only", 3], ["STYLE", 1]] },
  { id: "data_2", feature: "Data_Analysis", question: "A bar chart is best used to:", options: [["Compare categories", 10], ["Store passwords", 1], ["Run code", 2], ["Compress images", 2]] },
  { id: "data_3", feature: "Data_Analysis", question: "If a dataset has missing values, a good first action is to:", options: [["Inspect and clean them", 10], ["Delete the project", 1], ["Ignore always", 2], ["Change font", 1]] },
  { id: "web_1", feature: "Web_Development", question: "HTML is mainly used to define:", options: [["Page structure", 10], ["Database indexes", 2], ["Server memory", 1], ["Network cables", 1]] },
  { id: "web_2", feature: "Web_Development", question: "CSS is mainly used for:", options: [["Styling web pages", 10], ["Training models", 2], ["Writing SQL", 2], ["Managing batteries", 1]] },
  { id: "web_3", feature: "Web_Development", question: "React is commonly used to build:", options: [["User interfaces", 10], ["Operating systems", 2], ["Antivirus hardware", 1], ["Physical circuits", 1]] },
  { id: "web_4", feature: "Web_Development", question: "An API is used to:", options: [["Let software systems communicate", 10], ["Only draw icons", 2], ["Charge a laptop", 1], ["Replace CSS", 2]] },
  { id: "ai_1", feature: "AI_Interest", question: "Machine learning models learn patterns from:", options: [["Data", 10], ["Keyboard color", 1], ["Monitor size only", 1], ["Random guesses only", 3]] },
  { id: "ai_2", feature: "AI_Interest", question: "A classifier is used to:", options: [["Predict categories/classes", 10], ["Only play audio", 1], ["Format text only", 2], ["Charge batteries", 1]] },
  { id: "ai_3", feature: "AI_Interest", question: "Training data is important because it:", options: [["Teaches model patterns", 10], ["Deletes the model", 1], ["Only changes UI", 2], ["Stops prediction", 1]] },
  { id: "comm_1", feature: "Communication", question: "A project explanation should be:", options: [["Clear and structured", 10], ["Random and long", 2], ["Silent", 1], ["Only copied text", 2]] },
  { id: "comm_2", feature: "Public_Speaking", question: "While presenting, eye contact helps to:", options: [["Engage audience", 10], ["Hide content", 1], ["Reduce clarity", 2], ["Avoid speaking", 1]] },
  { id: "lead_1", feature: "Leadership", question: "A good team leader should first:", options: [["Understand tasks and assign fairly", 10], ["Blame teammates", 1], ["Avoid planning", 2], ["Do nothing", 1]] },
  { id: "team_1", feature: "Teamwork", question: "In group work, the best behavior is:", options: [["Collaborate and communicate", 10], ["Ignore messages", 1], ["Hide progress", 2], ["Refuse feedback", 1]] },
  { id: "creative_1", feature: "Creativity", question: "A creative solution usually involves:", options: [["Trying a new useful approach", 10], ["Copying without thinking", 2], ["Avoiding ideas", 1], ["Stopping early", 1]] },
  { id: "detail_1", feature: "Attention_To_Detail", question: "Before submitting code, you should:", options: [["Test and review it", 10], ["Never run it", 1], ["Delete comments only", 2], ["Ignore errors", 1]] },
  { id: "stress_1", feature: "Stress_Handling", question: "When a deadline is close, the best response is:", options: [["Prioritize tasks calmly", 10], ["Panic and stop", 1], ["Blame others", 2], ["Ignore deadline", 1]] },
  { id: "research_1", feature: "Research_Interest", question: "A good research habit is to:", options: [["Compare credible sources", 10], ["Use one random source", 2], ["Avoid reading", 1], ["Never cite", 1]] },
  { id: "social_1", feature: "Social_Service_Interest", question: "A career focused on public impact requires:", options: [["Empathy and service mindset", 10], ["Ignoring people", 1], ["No ethics", 1], ["Avoiding communication", 2]] },
  { id: "math_5", feature: "Math_Interest", question: "A shopkeeper gives 20% discount on an item marked at 2500. Selling price is:", options: [["1800", 55], ["2000", 100], ["2100", 50], ["2300", 40]] },
  { id: "math_6", feature: "Math_Interest", question: "If the probability of an event is 0.25, the probability that it does not occur is:", options: [["0.25", 45], ["0.50", 50], ["0.75", 100], ["1.25", 35]] },
  { id: "aptitude_1", feature: "Problem_Solving", question: "A train covers 180 km in 3 hours. What is its average speed?", options: [["45 km/h", 4], ["50 km/h", 5], ["60 km/h", 10], ["90 km/h", 3]] },
  { id: "aptitude_2", feature: "Math_Interest", question: "Simple interest on 5000 at 10% per year for 2 years is:", options: [["500", 4], ["750", 5], ["1000", 10], ["1500", 3]] },
  { id: "logic_1", feature: "Analytical_Thinking", question: "Find the odd one out: 2, 4, 8, 16, 31, 64", options: [["8", 3], ["16", 3], ["31", 10], ["64", 3]] },
  { id: "logic_2", feature: "Problem_Solving", question: "If A is taller than B and B is taller than C, who is tallest?", options: [["A", 10], ["B", 4], ["C", 2], ["Cannot say", 3]] },
  { id: "physics_4", feature: "Physics_Interest", question: "According to Ohm's law, if voltage doubles and resistance stays same, current:", options: [["Halves", 45], ["Doubles", 100], ["Becomes zero", 35], ["Stays same", 50]] },
  { id: "physics_5", feature: "Physics_Interest", question: "A body moving with constant velocity has acceleration:", options: [["Zero", 100], ["Increasing", 40], ["Negative always", 45], ["Equal to speed", 35]] },
  { id: "chemistry_3", feature: "Chemistry_Interest", question: "Which bond involves sharing of electron pairs?", options: [["Ionic bond", 55], ["Covalent bond", 100], ["Metallic sound", 35], ["Gravity bond", 30]] },
  { id: "chemistry_4", feature: "Chemistry_Interest", question: "Oxidation generally means:", options: [["Gain of electrons", 45], ["Loss of electrons", 100], ["No electron change", 35], ["Only melting", 30]] },
  { id: "biology_3", feature: "Biology_Interest", question: "DNA mainly stores:", options: [["Genetic information", 100], ["Blood pressure only", 40], ["Oxygen only", 35], ["Digestive enzymes only", 45]] },
  { id: "biology_4", feature: "Biology_Interest", question: "Photosynthesis mainly converts light energy into:", options: [["Chemical energy", 100], ["Sound energy", 35], ["Mechanical energy", 40], ["Nuclear energy", 30]] },
  { id: "english_3", feature: "English_Interest", question: "Choose the sentence with correct grammar:", options: [["She go to college daily.", 35], ["She goes to college daily.", 100], ["She going college daily.", 40], ["She gone to college daily.", 45]] },
  { id: "english_4", feature: "English_Interest", question: "A paragraph conclusion should usually:", options: [["Introduce unrelated topic", 35], ["Summarize or close the idea", 100], ["Remove the main point", 35], ["Repeat random words", 30]] },
  { id: "coding_4", feature: "Coding_Skill", question: "What is the time complexity of binary search on a sorted array?", options: [["O(n)", 50], ["O(log n)", 10], ["O(n²)", 35], ["O(1) always", 45]] },
  { id: "coding_5", feature: "Coding_Skill", question: "A function calling itself is known as:", options: [["Iteration only", 45], ["Recursion", 10], ["Compilation", 35], ["Indexing", 40]] },
  { id: "problem_4", feature: "Problem_Solving", question: "A system fails only for large inputs. Best likely issue to check first:", options: [["Color palette", 1], ["Algorithm efficiency or memory", 10], ["Button text", 2], ["Logo size", 1]] },
  { id: "data_4", feature: "Data_Analysis", question: "In data analysis, correlation is used to measure:", options: [["Relationship between variables", 10], ["Image resolution", 2], ["Keyboard speed", 1], ["CSS color", 1]] },
  { id: "data_5", feature: "Data_Analysis", question: "Which metric is best for average numeric value?", options: [["Mean", 10], ["Mode of colors only", 3], ["File path", 1], ["IP address", 2]] },
  { id: "web_5", feature: "Web_Development", question: "HTTP status code 404 usually means:", options: [["Server success", 3], ["Page/resource not found", 10], ["Unauthorized always", 5], ["Database full", 2]] },
  { id: "web_6", feature: "Web_Development", question: "Which React concept stores changing component data?", options: [["State", 10], ["Only CSS", 2], ["HTML title", 3], ["DNS", 1]] },
  { id: "ai_4", feature: "AI_Interest", question: "In supervised learning, the training data includes:", options: [["Inputs and labels", 10], ["Only colors", 1], ["Only random noise", 2], ["No examples", 1]] },
  { id: "ai_5", feature: "AI_Interest", question: "A confusion matrix helps evaluate:", options: [["Classification performance", 10], ["Website font size", 1], ["Battery health only", 1], ["Router speed only", 2]] },
  { id: "comm_3", feature: "Communication", question: "When explaining a technical project to non-technical people, you should:", options: [["Use simple examples", 10], ["Use only jargon", 2], ["Avoid structure", 1], ["Skip the goal", 1]] },
  { id: "lead_2", feature: "Leadership", question: "If two teammates disagree, a leader should:", options: [["Listen and align on facts", 10], ["Ignore both", 1], ["Pick randomly", 2], ["Cancel all work", 1]] },
  { id: "team_2", feature: "Teamwork", question: "Best way to handle delayed team work:", options: [["Communicate blockers early", 10], ["Hide the delay", 1], ["Blame silently", 2], ["Delete the task", 1]] },
  { id: "creative_2", feature: "Creativity", question: "During product design, brainstorming is useful because it:", options: [["Creates multiple possible solutions", 10], ["Prevents ideas", 1], ["Removes users", 2], ["Stops testing", 1]] },
  { id: "detail_2", feature: "Attention_To_Detail", question: "A small decimal error in a finance report shows weak:", options: [["Attention to detail", 10], ["Public speaking", 2], ["Graphic design only", 2], ["Team size", 1]] },
  { id: "stress_2", feature: "Stress_Handling", question: "Under exam pressure, the best strategy is:", options: [["Prioritize known questions first", 10], ["Spend all time on one unknown", 2], ["Stop reading", 1], ["Randomly mark all", 1]] },
  { id: "research_2", feature: "Research_Interest", question: "A good literature review should:", options: [["Compare multiple credible sources", 10], ["Use one random post", 2], ["Avoid evidence", 1], ["Only copy text", 1]] },
  { id: "social_2", feature: "Social_Service_Interest", question: "Which project best reflects social service interest?", options: [["Accessibility tool for students", 10], ["Private game score only", 3], ["Personal wallpaper app", 2], ["Random calculator with no user need", 2]] },
  { id: "cyber_1", feature: "Cybersecurity_Interest", question: "Which practice helps prevent unauthorized account access?", options: [["Weak reusable passwords", 1], ["Multi-factor authentication", 10], ["Sharing OTPs", 1], ["Disabling updates", 2]] },
  { id: "cyber_2", feature: "Cybersecurity_Interest", question: "OWASP mainly relates to:", options: [["Web application security risks", 10], ["Graphic design", 2], ["Video editing", 1], ["Spreadsheet formulas only", 2]] },
  { id: "blockchain_1", feature: "Blockchain_Interest", question: "A blockchain is best described as:", options: [["A distributed immutable ledger", 10], ["A normal image file", 1], ["A CSS library", 1], ["A laptop battery", 1]] },
  { id: "blockchain_2", feature: "Blockchain_Interest", question: "Smart contracts are programs that usually run on:", options: [["Blockchain networks", 10], ["Only PowerPoint", 1], ["A printer driver", 1], ["Keyboard firmware", 2]] },
  { id: "cloud_1", feature: "Cloud_Computing", question: "Cloud computing mainly provides:", options: [["On-demand computing resources", 10], ["Only offline notebooks", 1], ["Manual paperwork", 1], ["Cable management", 2]] },
  { id: "devops_1", feature: "DevOps_Interest", question: "CI/CD pipelines are used to:", options: [["Automate build, test, and deployment", 10], ["Draw icons only", 1], ["Replace requirements", 2], ["Format resumes", 1]] },
  { id: "mobile_1", feature: "Mobile_Development", question: "Flutter and React Native are commonly used for:", options: [["Mobile app development", 10], ["Database indexing only", 2], ["Network cabling", 1], ["Video compression only", 2]] },
  { id: "uiux_1", feature: "UI_UX_Design", question: "A wireframe is used to:", options: [["Plan screen layout and user flow", 10], ["Encrypt passwords", 1], ["Train a model only", 2], ["Compile C code", 1]] },
  { id: "product_1", feature: "Product_Management", question: "A product manager mainly balances:", options: [["User needs, business goals, and feasibility", 10], ["Only font colors", 2], ["Only server logs", 2], ["Only exam marks", 1]] },
  { id: "marketing_1", feature: "Digital_Marketing", question: "SEO is used to improve:", options: [["Search visibility", 10], ["Battery life", 1], ["Compiler speed", 2], ["Password strength only", 2]] },
  { id: "qa_1", feature: "Testing_QA", question: "Regression testing checks whether:", options: [["Old features still work after changes", 10], ["Only colors changed", 2], ["The logo is large", 1], ["The code is deleted", 1]] },
  { id: "db_1", feature: "Database_Management", question: "A database index is mainly used to:", options: [["Speed up data lookup", 10], ["Create UI icons", 1], ["Charge a phone", 1], ["Replace backups", 2]] }
];

const profileFeatureLabels = Object.fromEntries(profileFeatureFields.map(([key, label]) => [key, label]));

const profilingSubjectGroups = [
  {
    title: "Section 1: Aptitude & Logical Reasoning",
    description: "Math ability, problem solving, and analytical thinking.",
    features: ["Math_Interest", "Problem_Solving", "Analytical_Thinking"]
  },
  {
    title: "Section 2: Verbal & Communication",
    description: "English, communication, public speaking, and teamwork signals.",
    features: ["English_Interest", "Communication", "Public_Speaking", "Teamwork"]
  },
  {
    title: "Section 3: Web & Coding Fundamentals",
    description: "Coding basics, web development, detail focus, and practical debugging.",
    features: ["Coding_Skill", "Web_Development", "Attention_To_Detail"]
  },
  {
    title: "Section 4: AI, Data & Research",
    description: "AI interest, data analysis, research orientation, and technical reasoning.",
    features: ["AI_Interest", "Data_Analysis", "Research_Interest"]
  },
  {
    title: "Section 5: Science & Work Style",
    description: "Science knowledge, leadership, creativity, stress handling, and service mindset.",
    features: ["Physics_Interest", "Chemistry_Interest", "Biology_Interest", "Leadership", "Creativity", "Stress_Handling", "Social_Service_Interest"]
  },
  {
    title: "Section 6: Emerging Technologies & Market Skills",
    description: "Cybersecurity, blockchain, cloud, DevOps, mobile, UI/UX, product, marketing, QA, and database interests.",
    features: ["Cybersecurity_Interest", "Blockchain_Interest", "Cloud_Computing", "DevOps_Interest", "Mobile_Development", "UI_UX_Design", "Product_Management", "Digital_Marketing", "Testing_QA", "Database_Management"]
  }
];

function deriveAcademicScore(features) {
  const interestKeys = ["Math_Interest", "Physics_Interest", "Chemistry_Interest", "Biology_Interest", "English_Interest"];
  const average = interestKeys.reduce((sum, key) => sum + Number(features[key] || 0), 0) / interestKeys.length;
  return Math.round(average * 10) / 10;
}

function normalizeProfileFeatures(features) {
  return {
    ...features,
    GPA: deriveAcademicScore(features)
  };
}

function computeGuidedProfile(mcqAnswers) {
  const totals = {};
  const counts = {};

  for (const question of profilingQuestions) {
    const answer = mcqAnswers[question.id];
    if (!answer) continue;
    totals[question.feature] = (totals[question.feature] || 0) + answer.value;
    counts[question.feature] = (counts[question.feature] || 0) + 1;
  }

  const features = { ...defaultProfileFeatures };
  for (const feature of Object.keys(totals)) {
    features[feature] = Math.round((totals[feature] / counts[feature]) * 100) / 100;
  }

  return normalizeProfileFeatures(features);
}

function makeLocalRecommendation(features) {
  const profile = Object.fromEntries(
    Object.entries(features).map(([key, value]) => [key, Number(value || 0)])
  );
  const careerRules = [
    {
      career: "Software Engineer",
      score: profile.Coding_Skill + profile.Problem_Solving + profile.Web_Development + profile.Math_Interest,
      skills: ["Data Structures", "JavaScript or Python", "System Design", "Git"],
      path: ["DSA foundation", "Build full-stack projects", "Practice coding interviews"]
    },
    {
      career: "Data Scientist",
      score: profile.Data_Analysis + profile.AI_Interest + profile.Analytical_Thinking + profile.Math_Interest,
      skills: ["Python", "Statistics", "SQL", "Machine Learning"],
      path: ["Python analytics", "Statistics and SQL", "ML model projects"]
    },
    {
      career: "AI Engineer",
      score: profile.AI_Interest + profile.Coding_Skill + profile.Research_Interest + profile.Math_Interest,
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
    },
    {
      career: "Cybersecurity Analyst",
      score: profile.Cybersecurity_Interest + profile.Attention_To_Detail + profile.Problem_Solving + profile.Stress_Handling,
      skills: ["Networking", "Linux", "OWASP", "SIEM"],
      path: ["Networking basics", "Linux practice", "OWASP labs", "Security report portfolio"]
    },
    {
      career: "Blockchain Developer",
      score: profile.Blockchain_Interest + profile.Coding_Skill + profile.Problem_Solving + profile.Database_Management,
      skills: ["Solidity", "Smart Contracts", "Web3", "Security"],
      path: ["Blockchain basics", "Solidity practice", "Smart contract project", "Web3 deployment"]
    },
    {
      career: "Cloud Engineer",
      score: profile.Cloud_Computing + profile.DevOps_Interest + profile.Problem_Solving + profile.Coding_Skill,
      skills: ["AWS", "Linux", "Docker", "Monitoring"],
      path: ["Linux and networking", "Cloud fundamentals", "Docker deployment", "Cloud portfolio project"]
    },
    {
      career: "DevOps Engineer",
      score: profile.DevOps_Interest + profile.Cloud_Computing + profile.Testing_QA + profile.Stress_Handling,
      skills: ["CI/CD", "Docker", "Kubernetes", "Automation"],
      path: ["Git and Linux", "CI/CD pipeline", "Docker containers", "Kubernetes basics"]
    },
    {
      career: "Mobile App Developer",
      score: profile.Mobile_Development + profile.Coding_Skill + profile.UI_UX_Design + profile.Creativity,
      skills: ["Flutter", "React Native", "APIs", "Mobile UI"],
      path: ["Mobile UI basics", "API integration", "Local storage", "Publish demo app"]
    },
    {
      career: "UI/UX Designer",
      score: profile.UI_UX_Design + profile.Creativity + profile.Communication + profile.Research_Interest,
      skills: ["Figma", "Wireframes", "User Research", "Prototyping"],
      path: ["Design basics", "Wireframes", "User research", "Portfolio case study"]
    },
    {
      career: "Product Manager",
      score: profile.Product_Management + profile.Leadership + profile.Communication + profile.Data_Analysis,
      skills: ["Roadmapping", "User Research", "Analytics", "PRD Writing"],
      path: ["Product thinking", "User research", "Analytics", "Case study portfolio"]
    },
    {
      career: "QA Automation Engineer",
      score: profile.Testing_QA + profile.Attention_To_Detail + profile.Coding_Skill + profile.Problem_Solving,
      skills: ["Manual Testing", "Selenium", "API Testing", "Bug Reports"],
      path: ["Testing basics", "Test cases", "Automation scripts", "API testing"]
    },
    {
      career: "Healthcare / Biology Track",
      score: profile.Biology_Interest + profile.Chemistry_Interest + profile.Social_Service_Interest + profile.Research_Interest,
      skills: ["Biology", "Research", "Communication", "Attention to Detail"],
      path: ["Biology fundamentals", "Healthcare entrance preparation", "Research projects"]
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
    learningResources: makeLearningResources(top.skills),
    alternatives: careerRules.slice(1, 4).map((item) => ({
      career: item.career,
      score: Math.min(0.9, Math.max(0.45, item.score / maxScore))
    }))
  };
}

function makeLearningResources(skills = []) {
  const certifications = [
    { title: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/" },
    { title: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
    { title: "Microsoft Learn", url: "https://learn.microsoft.com/training/" },
    { title: "AWS Skill Builder", url: "https://skillbuilder.aws/" },
    { title: "Google Skillshop", url: "https://skillshop.withgoogle.com/" },
    { title: "Cisco Skills For All", url: "https://skillsforall.com/" },
    { title: "IBM SkillsBuild", url: "https://skillsbuild.org/" }
  ];

  return [...new Set(skills.filter(Boolean))].slice(0, 8).map((skill) => ({
    skill,
    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} full course for beginners`)}`,
    certifications: certifications.slice(0, 3)
  }));
}

function featuresFromSkillList(skills = []) {
  const text = skills.join(" ").toLowerCase();
  const hasAny = (words) => words.some((word) => text.includes(word));
  const boosted = { ...defaultProfileFeatures };

  boosted.Coding_Skill = hasAny(["javascript", "python", "java", "c++", "react", "node", "coding", "programming"]) ? 9 : 4;
  boosted.Web_Development = hasAny(["html", "css", "react", "node", "express", "frontend", "backend", "mern", "web"]) ? 9 : 3;
  boosted.Data_Analysis = hasAny(["sql", "excel", "power bi", "tableau", "data", "pandas", "analytics"]) ? 9 : 3;
  boosted.AI_Interest = hasAny(["machine learning", "ml", "ai", "deep learning", "nlp", "tensorflow", "pytorch"]) ? 9 : 3;
  boosted.Problem_Solving = hasAny(["dsa", "algorithm", "problem", "leetcode", "logic"]) ? 9 : 5;
  boosted.Communication = hasAny(["communication", "presentation", "english", "speaking"]) ? 8 : 5;
  boosted.Leadership = hasAny(["leadership", "management", "team lead"]) ? 8 : 5;
  boosted.Teamwork = hasAny(["team", "collaboration", "group"]) ? 8 : 5;
  boosted.Public_Speaking = hasAny(["public speaking", "presentation", "seminar"]) ? 8 : 4;
  boosted.Creativity = hasAny(["design", "figma", "ui", "ux", "creative"]) ? 8 : 5;
  boosted.Analytical_Thinking = hasAny(["analysis", "analytics", "research", "statistics", "math"]) ? 8 : 5;
  boosted.Attention_To_Detail = hasAny(["testing", "debugging", "quality", "detail"]) ? 8 : 5;
  boosted.Research_Interest = hasAny(["research", "paper", "experiment", "study"]) ? 8 : 4;
  boosted.Social_Service_Interest = hasAny(["social", "ngo", "volunteer", "community"]) ? 8 : 3;
  boosted.Cybersecurity_Interest = hasAny(["cyber", "security", "owasp", "network", "linux", "siem"]) ? 9 : 3;
  boosted.Blockchain_Interest = hasAny(["blockchain", "web3", "solidity", "smart contract", "crypto"]) ? 9 : 3;
  boosted.Cloud_Computing = hasAny(["cloud", "aws", "azure", "gcp", "docker", "deploy"]) ? 9 : 3;
  boosted.DevOps_Interest = hasAny(["devops", "ci/cd", "pipeline", "docker", "kubernetes", "jenkins"]) ? 9 : 3;
  boosted.Mobile_Development = hasAny(["mobile", "flutter", "react native", "android", "ios"]) ? 9 : 3;
  boosted.UI_UX_Design = hasAny(["ui", "ux", "figma", "wireframe", "prototype"]) ? 9 : 3;
  boosted.Product_Management = hasAny(["product", "roadmap", "prd", "user research", "analytics"]) ? 9 : 3;
  boosted.Digital_Marketing = hasAny(["seo", "marketing", "ads", "campaign", "content"]) ? 9 : 3;
  boosted.Testing_QA = hasAny(["testing", "qa", "selenium", "automation", "bug"]) ? 9 : 3;
  boosted.Database_Management = hasAny(["database", "sql", "mongodb", "mysql", "postgres", "indexing"]) ? 9 : 3;

  return normalizeProfileFeatures(boosted);
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const mainOptions = [
  {
    id: "career-profile",
    color: "blue",
    badge: "Recommended",
    title: "Take Career Profiling Test",
    detail: "Answer academic, skill, and interest questions for Random Forest recommendations."
  },
  {
    id: "manual-profile",
    color: "violet",
    badge: "Quick input",
    title: "Input Skills Manually",
    detail: "Use a simple questionnaire and get three to four suitable career paths."
  },
  {
    id: "skill-quiz",
    color: "green",
    badge: "Dynamic quiz",
    title: "Test Your Skills",
    detail: "Load dataset questions or generate a fresh topic-wise quiz dynamically."
  },
  {
    id: "college",
    color: "orange",
    badge: "College match",
    title: "College Recommendations",
    detail: "Get college matches based on GPA, rank, budget, and course preferences."
  },
  {
    id: "resume",
    color: "blue",
    badge: "NLP analysis",
    title: "Have a Resume?",
    detail: "Paste your resume and get skill extraction, missing skills, and career fit analysis."
  }
];

const advisorFeatures = [
  ["Personalized Guidance", "AI algorithms analyze interests, skills and academics.", BrainCircuit, "guidance"],
  ["Education Roadmap", "Get recommended courses, colleges and certifications.", GraduationCap, "courses"],
  ["Skill Development", "Discover in-demand skills and learning resources.", LineChart, "development"],
  ["Career Opportunities", "Explore jobs, salary insights and future trends.", BriefcaseBusiness, "jobs"],
  ["Expert Guidance", "Connect progress with mentor-ready reports.", UserRound, "mentor"],
  ["Track Progress", "Save tests, resume analysis and milestones.", FileText, "progress"]
];

function RecommendationPanel({ recommendation, onNavigate }) {
  if (!recommendation) return null;

  // Support stacked recommendations: if `recommendation.recommendations` exists, use it.
  const stacked = Array.isArray(recommendation.recommendations) ? recommendation.recommendations : null;
  const careers = stacked
    ? stacked.map((r) => ({ career: r.career, score: (r.confidencePct || r.score || 0) / 100 }))
    : [
        { career: recommendation.career, score: recommendation.confidence },
        ...(recommendation.alternatives || [])
      ].slice(0, 4);

  return (
      <div className="roadmap-panel career-recommendation-panel">
      <div className="recommendation-head">
        <div>
          <p className="eyebrow">Recommended career</p>
          <h2>{stacked ? "Top career recommendations" : recommendation.career}</h2>
          <p>{stacked ? "Aggregated from resume, test, and input signals." : recommendation.explanation}</p>
        </div>
        <div className="recommendation-score">
          <span>Fit score</span>
          <strong>{Math.round(((stacked && stacked[0]) ? (stacked[0].confidencePct || Math.round((stacked[0].score || 0) * 100)) : (recommendation.confidence || 0) * 100) || 0)}%</strong>
        </div>
      </div>
      <div className="recommendation-list">
        {careers.map((item, index) => (
          <div className="job-row" key={`${item.career}-${index}`}>
            <div>
              <strong>{index + 1}. {item.career}</strong>
              <small>{index === 0 ? "Best match" : "Alternative recommendation"}</small>
            </div>
            <span>{Math.round(Number(item.score || 0) * 100)}%</span>
          </div>
        ))}
      </div>
      <div className="chips">
        {recommendation.skillsToBuild?.map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      <div className="recommendation-action">
        <p>To explore the full learning path, certifications, and free videos, go to the guidance section.</p>
        <button className="primary" onClick={() => onNavigate?.("guidance")}>Open guidance path</button>
      </div>
    </div>
  );
}

function CareerProfileForm({ mode, profile, onSaved, onNavigate, onRecommend }) {
  const [features, setFeatures] = useState(defaultProfileFeatures);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(0);

  useEffect(() => {
    if (profile?.skills?.length) {
      const derivedFeatures = featuresFromSkillList(profile.skills);
      setFeatures((current) => {
        const isDefault = Object.keys(defaultProfileFeatures).every(
          (key) => current[key] === defaultProfileFeatures[key]
        );
        return isDefault ? derivedFeatures : current;
      });
    }
  }, [profile?.skills]);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [recommendation, setRecommendation] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recommendationRef = useRef(null);

  const isGuided = mode === "guided";
  const visibleFields = profileFeatureFields;
  const [questions] = useState(() => isGuided ? shuffleArray(profilingQuestions) : profilingQuestions);
  const answeredCount = Object.keys(mcqAnswers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const currentQuestion = questions[activeQuestion];
  const currentSection = profilingSubjectGroups.find((group) => group.features.includes(currentQuestion.feature)) || profilingSubjectGroups[0];
  const answeredAll = answeredCount === questions.length;
  const hasCompletedTest = answeredAll;
  const sectionProgress = profilingSubjectGroups.map((group) => {
    const questionsForGroup = questions.filter((question) => group.features.includes(question.feature));
    const answered = questionsForGroup.filter((question) => mcqAnswers[question.id]).length;
    const firstQuestionIndex = questions.findIndex((question) => group.features.includes(question.feature));
    return { ...group, questions: questionsForGroup, answered, firstQuestionIndex };
  });
  const guidedFeatures = useMemo(
    () => computeGuidedProfile(mcqAnswers),
    [mcqAnswers]
  );
  const subjectResults = useMemo(
    () =>
      profilingSubjectGroups.map((group) => {
        const values = group.features.map((feature) => Number(guidedFeatures[feature] || 0));
        const score = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
        return { ...group, score };
      }),
    [guidedFeatures]
  );

  function updateFeature(key, value) {
    setFeatures({ ...features, [key]: Number(value) });
  }

  function buildGuidedFeatures() {
    return guidedFeatures;
  }

  async function submitProfile() {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const payloadFeatures = isGuided
        ? buildGuidedFeatures()
        : normalizeProfileFeatures(features);
      const data = await api("/advisor/predict-profile", {
        method: "POST",
        body: JSON.stringify({ features: payloadFeatures })
      });
      setRecommendation(data.recommendation);
      setTestResult({ ...data.result, sectionResults: isGuided ? subjectResults : [] });
      if (!isGuided) {
        onRecommend?.(data.recommendation, data.result);
      }

      onSaved?.({ recommendation: data.recommendation, scores: data.result?.scores || payloadFeatures, profile: { ...profile, targetRole: data.recommendation.career } });

      try {
        await api("/advisor/profile", {
          method: "PUT",
          body: JSON.stringify({ targetRole: data.recommendation.career })
        });
      } catch (profileError) {
        console.warn("Unable to persist career profile target:", profileError.message || profileError);
      }
    } catch (err) {
      const payloadFeatures = isGuided
        ? buildGuidedFeatures()
        : normalizeProfileFeatures(features);
      const fallbackRecommendation = makeLocalRecommendation(payloadFeatures);
      setRecommendation(fallbackRecommendation);
      setTestResult({ scores: payloadFeatures, recommendation: fallbackRecommendation, sectionResults: isGuided ? subjectResults : [] });
      onSaved?.({ recommendation: fallbackRecommendation, scores: payloadFeatures, profile: { ...profile, targetRole: fallbackRecommendation.career } });
      setError("ML service is not responding, so a local recommendation is shown for testing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isGuided || recommendation) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isGuided, recommendation]);

  useEffect(() => {
    if (isGuided && secondsLeft === 0 && answeredCount > 0 && !recommendation && !loading) {
      submitProfile();
    }
  }, [secondsLeft, isGuided, answeredCount, recommendation, loading]);

  useEffect(() => {
    if (isGuided && answeredAll && !recommendation && !loading) {
      submitProfile();
    }
  }, [isGuided, answeredAll, recommendation, loading]);

  function selectAnswer(labelText, value) {
    const wasAnswered = Boolean(mcqAnswers[currentQuestion.id]);
    setMcqAnswers({
      ...mcqAnswers,
      [currentQuestion.id]: { label: labelText, value }
    });
    if (!wasAnswered && activeQuestion < profilingQuestions.length - 1) {
      window.setTimeout(() => setActiveQuestion((index) => Math.min(index + 1, profilingQuestions.length - 1)), 180);
    }
  }

  function openResultDialog() {
    if (!recommendation) return;
    const result = testResult || { scores: buildGuidedFeatures(), recommendation, sectionResults };
    onRecommend?.(recommendation, result);
  }

  return (
    <section className="advisor-card skill-builder">
      <p className="eyebrow">{isGuided ? "Career profiling test" : "Manual skills input"}</p>
      <h2>{isGuided ? "Complete your career profile" : "Enter your skills manually"}</h2>
      <p>{isGuided ? "Answer the five-section MCQ test. Your answers are converted into the 21 model features, academic score is derived automatically, and recommendations appear automatically after the final answer." : "Update skill and interest levels, then generate recommendations."}</p>
      {error && <p className="error">{error}</p>}
      {isGuided ? (
        <div className="profile-test-shell">
          <aside className="profile-test-sidebar">
            <div className="profile-round">
              <span>Round 1</span>
              <strong>{hasCompletedTest ? "Completed" : "MCQ"}</strong>
              {!hasCompletedTest && (
                <>
                  <div className="progress"><span style={{ width: `${progress}%` }} /></div>
                  <small>{progress}% Completed</small>
                </>
              )}
            </div>
            {hasCompletedTest ? (
              <div className="profile-complete-card">
                <p className="eyebrow">Test completed</p>
                <h3>Your profile recommendation is ready</h3>
                <p>Click View Results to see career recommendations, similar profiles, and feedback from other users.</p>
                <div className="profile-complete-metrics">
                  <div>
                    <span>Completion</span>
                    <strong>100%</strong>
                  </div>
                  <div>
                    <span>Fit score</span>
                    <strong>{Math.round((recommendation?.confidence || 0) * 100)}%</strong>
                  </div>
                </div>
                <button className="primary" onClick={openResultDialog} disabled={!recommendation || loading}>
                  {loading ? "Preparing..." : "View Results"}
                </button>
              </div>
            ) : (
              <div className="profile-test-instructions">
                <strong>Career profiling test</strong>
                <p>Answer every MCQ. The system converts correct answers into model features, predicts careers, then compares your profile with similar successful profiles using KNN.</p>
                <div>
                  <span>{answeredCount}</span>
                  <small>answered out of {questions.length}</small>
                </div>
              </div>
            )}
          </aside>

          <div className="profile-test-main">
            <div className="profile-test-top">
              <div>
                <strong>{answeredCount} / {profilingQuestions.length}</strong>
                <span>answered</span>
              </div>
              <div>
                <strong>{currentSection.title.replace("Section ", "")}</strong>
                <span>{currentSection.description}</span>
              </div>
              <div className={secondsLeft < 300 ? "timer danger" : "timer"}>
                <strong>{formatDuration(secondsLeft)}</strong>
                <span>time left</span>
              </div>
            </div>

            <div className="profile-question-card">
              <span>{currentSection.title.replace(/^Section \d+: /, "")} | Question {activeQuestion + 1}</span>
              <h3>{currentQuestion.question}</h3>
              <div className="profile-option-list">
                {currentQuestion.options.map(([labelText, value], optionIndex) => (
                  <button
                    key={labelText}
                    className={mcqAnswers[currentQuestion.id]?.label === labelText ? "selected" : ""}
                    onClick={() => selectAnswer(labelText, value)}
                  >
                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                    {labelText}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-test-actions">
              <button disabled={activeQuestion === 0} onClick={() => setActiveQuestion(activeQuestion - 1)}>Back</button>
              <button disabled={activeQuestion === questions.length - 1} onClick={() => setActiveQuestion(activeQuestion + 1)}>Next</button>
              <button
                className="primary"
                onClick={recommendation ? openResultDialog : submitProfile}
                disabled={loading || answeredCount < questions.length}
              >
                {loading ? "Predicting..." : recommendation ? "View Results" : answeredAll ? "Generate Recommendation" : "Generate Prediction"}
                <Sparkles size={18} />
              </button>
            </div>

            {!recommendation && !hasCompletedTest && (
              <div className="subject-score-grid">
                {subjectResults.map((group) => (
                  <div className="subject-score-card" key={group.title}>
                    <small>{group.title}</small>
                    <strong>{group.score}%</strong>
                    <div><span style={{ width: `${group.score}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        featureSections.map((section) => (
          <div className="profile-question" key={section.title}>
            <strong>{section.title}</strong>
            <p>{section.helper}</p>
            {section.keys.map((key) => {
              const field = visibleFields.find(([fieldKey]) => fieldKey === key);
              if (!field) return null;
              const [_key, label, min, max] = field;
              return (
                <label key={key}>
                  {label}{academicFeatureKeys.has(key) ? `: ${features[key]}` : ""}
                  {academicFeatureKeys.has(key) ? (
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={key === "GPA" ? "0.1" : "1"}
                      value={features[key]}
                      onChange={(event) => updateFeature(key, event.target.value)}
                    />
                  ) : (
                    <select value={features[key]} onChange={(event) => updateFeature(key, event.target.value)}>
                      {ratingChoices.map(([labelText, value]) => (
                        <option key={labelText} value={value}>{labelText}</option>
                      ))}
                    </select>
                  )}
                </label>
              );
            })}
          </div>
        ))
      )}
      {!isGuided && (
        <button className="primary" onClick={submitProfile} disabled={loading}>
          {loading ? "Predicting..." : "Generate Recommendations"}
          <Sparkles size={18} />
        </button>
      )}
      <button className="secondary" onClick={() => onNavigate?.("guidance")}>Go to Guidance Path</button>
      <div ref={recommendationRef}>
        <RecommendationPanel recommendation={recommendation} onNavigate={onNavigate} />
      </div>
    </section>
  );
}

function SkillInputPanel({ profile, onSaved, onNavigate, onRecommend }) {
  const defaultSkills = "React, Python, SQL, Communication";
  const [skills, setSkills] = useState(defaultSkills);
  const [saved, setSaved] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const parsed = skills.split(",").map((skill) => skill.trim()).filter(Boolean);

  useEffect(() => {
    if (profile?.skills?.length && (skills === defaultSkills || !skills.trim())) {
      setSkills(profile.skills.join(", "));
    }
  }, [profile?.skills]);
  const userFeatures = featuresFromSkillList(parsed);

  async function saveSkills() {
    setLoading(true);
    await api("/advisor/profile", {
      method: "PUT",
      body: JSON.stringify({ skills: parsed })
    });
    const features = featuresFromSkillList(parsed);
    const data = await api("/advisor/predict-profile", {
      method: "POST",
      body: JSON.stringify({ features })
    });
    setRecommendation(data.recommendation);
    // prefer interactive selection: let parent handle finalizing via onRecommend
    onRecommend?.(data.recommendation, data.result);
    setSaved(true);
    setLoading(false);
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
      <button className="primary" onClick={saveSkills} disabled={loading}>
        {loading ? "Generating..." : saved ? "Skills Saved + Recommendation Updated" : "Save Skills & Update Recommendation"}
      </button>
      <button className="secondary" onClick={() => onNavigate?.("guidance")}>Go to Guidance Path</button>
      
      {saved && (
        <button 
          className="secondary" 
          onClick={() => setShowFeedback(true)}
          style={{ marginLeft: "8px", backgroundColor: "#FF9800" }}
        >
          <MessageSquare size={16} style={{ marginRight: "6px" }} />
          Provide Feedback
        </button>
      )}

      <RecommendationPanel recommendation={recommendation} onNavigate={onNavigate} />

      {showFeedback && (
        <FeedbackFormModal 
          career={recommendation?.career || "Software Engineer"}
          recommendedCareers={[recommendation?.career, ...(recommendation?.alternatives || [])].filter(Boolean)}
          userFeatures={userFeatures}
          onClose={() => setShowFeedback(false)}
        />
      )}
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

function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function SkillQuizPanel() {
  const categories = ["All", ...Array.from(new Set(skillQuizDataset.map((item) => item.category)))];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quizPool, setQuizPool] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);

  const groupedQuizzes = useMemo(() => {
    return categories
      .filter((category) => category !== "All")
      .map((category) => {
        const questions = skillQuizDataset.filter((item) => item.category === category);
        return {
          category,
          title: questions[0]?.title || category,
          count: questions.length,
          difficulty: questions.some((item) => item.difficulty === "Medium") ? "Medium" : "Easy"
        };
      });
  }, []);

  const visiblePool = selectedCategory === "All"
    ? skillQuizDataset
    : skillQuizDataset.filter((item) => item.category === selectedCategory);

  function loadAllQuizzes() {
    setQuizPool(skillQuizDataset);
    setActiveQuiz(null);
    setCompleted(false);
    setAnswers({});
  }

  function generateQuiz(category = selectedCategory) {
    const pool = category === "All"
      ? skillQuizDataset
      : skillQuizDataset.filter((item) => item.category === category);
    const nextQuiz = shuffleItems(pool).slice(0, Math.min(5, pool.length || 5));
    setSelectedCategory(category);
    setQuizPool(pool);
    setActiveQuiz(nextQuiz);
    setCurrentIndex(0);
    setAnswers({});
    setCompleted(false);
  }

  function startTopic(category) {
    generateQuiz(category);
  }

  function chooseAnswer(questionId, option) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  function finishQuiz() {
    setCompleted(true);
  }

  const currentQuestion = activeQuiz?.[currentIndex];
  const score = activeQuiz?.reduce((total, item) => total + (answers[item.id] === item.answer ? 1 : 0), 0) || 0;
  const percentage = activeQuiz?.length ? Math.round((score / activeQuiz.length) * 100) : 0;
  const categoryStats = activeQuiz?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = { total: 0, correct: 0 };
    acc[item.category].total += 1;
    if (answers[item.id] === item.answer) acc[item.category].correct += 1;
    return acc;
  }, {}) || {};

  return (
    <section className="advisor-card skill-quiz-panel">
      <div className="quiz-hero">
        <div>
          <p className="eyebrow">Quiz section</p>
          <h2>Test your skills</h2>
          <p>Questions are selected dynamically from an external-style dataset file by category, difficulty, and topic.</p>
        </div>
        <BookOpen size={28} />
      </div>

      <div className="quiz-action-card">
        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <button className="primary" onClick={loadAllQuizzes}>
          <ListChecks size={18} /> Load All Quizzes
        </button>
        <button className="primary quiz-generate-btn" onClick={() => generateQuiz()}>
          <Sparkles size={18} /> Generate Dynamic Quiz
        </button>
      </div>

      {!activeQuiz && (
        <div className="quiz-topic-grid">
          {groupedQuizzes.map((quiz) => (
            <article className="quiz-topic-card" key={quiz.category}>
              <span>{quiz.category}</span>
              <h3>{quiz.title}</h3>
              <p>Category: {quiz.category}</p>
              <strong>Questions: {quiz.count}</strong>
              <button className="primary" onClick={() => startTopic(quiz.category)}>
                <Play size={17} /> Start Quiz
              </button>
            </article>
          ))}
        </div>
      )}

      {activeQuiz && !completed && currentQuestion && (
        <div className="quiz-runner">
          <div className="quiz-runner-top">
            <div>
              <span>Question {currentIndex + 1} of {activeQuiz.length}</span>
              <h3>{currentQuestion.title}</h3>
              <p>{currentQuestion.category} | {currentQuestion.difficulty} | {currentQuestion.source}</p>
            </div>
            <strong>{Object.keys(answers).length}/{activeQuiz.length} answered</strong>
          </div>
          <h4>{currentQuestion.question}</h4>
          <div className="quiz-option-list">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                className={answers[currentQuestion.id] === option ? "selected" : ""}
                onClick={() => chooseAnswer(currentQuestion.id, option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="profile-test-actions">
            <button className="secondary" disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => value - 1)}>Previous</button>
            {currentIndex < activeQuiz.length - 1 ? (
              <button className="primary" onClick={() => setCurrentIndex((value) => value + 1)}>Next</button>
            ) : (
              <button className="primary" onClick={finishQuiz}>Submit Quiz</button>
            )}
          </div>
        </div>
      )}

      {activeQuiz && completed && (
        <div className="quiz-result-card">
          <div className="quiz-score-circle">
            <strong>{percentage}%</strong>
            <span>{score}/{activeQuiz.length}</span>
          </div>
          <div>
            <h3>Quiz performance</h3>
            <p>{percentage >= 70 ? "Strong performance. You can move to higher difficulty questions." : "Good start. Review explanations and retry the weak topics."}</p>
            <div className="quiz-analysis-grid">
              {Object.entries(categoryStats).map(([category, stat]) => (
                <div key={category}>
                  <strong>{category}</strong>
                  <span>{Math.round((stat.correct / stat.total) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
          <button className="primary" onClick={() => generateQuiz(selectedCategory)}>
            <Sparkles size={18} /> Generate New Quiz
          </button>
        </div>
      )}

      {quizPool.length > 0 && !activeQuiz && (
        <p className="quiz-source-note">Loaded {visiblePool.length} questions from the dataset. Select a topic or generate a random quiz.</p>
      )}
    </section>
  );
}

function JobFinderPanel() {
  const [data, setData] = useState({ jobs: jobMatches });
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Remote");
  const [experience, setExperience] = useState("Entry level");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  async function fetchJobs(search = query, locationValue = location, experienceValue = experience) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skills: search,
        location: locationValue,
        experience: experienceValue
      });
      const result = await api(`/advisor/jobs?${params.toString()}`);
      setData(result);
    } catch (error) {
      setData({ jobs: jobMatches });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      fetchJobs(query, location, experience);
    }, 250);
    return () => window.clearTimeout(debounceRef.current);
  }, [query, location, experience]);

  return (
    <section className="advisor-card job-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Job finder</p>
          <h2>Recommended opportunities</h2>
          {data.career && <small style={{ color: "#64748b", marginTop: "6px" }}>Tailored for {data.career}</small>}
        </div>
        <Search size={22} />
      </div>

      <div className="job-search-grid">
        <label>
          Search jobs
          <input
            type="search"
            placeholder="Search by skill, role or company"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          Location
          <input
            type="text"
            placeholder="Remote, Hyderabad, Bengaluru"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </label>
        <label>
          Experience
          <select value={experience} onChange={(event) => setExperience(event.target.value)}>
            {['Entry level', 'Internship', 'Mid level', 'Senior'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="job-status-row">
        <small>{loading ? 'Searching jobs…' : `${data.jobs.length} jobs found`}</small>
      </div>

      {data.profileSkills?.length ? (
        <div className="job-profile-context">
          Profile matched with: {data.profileSkills.slice(0, 6).join(", ")}
        </div>
      ) : null}

      {data.jobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs matched your search yet. Try broadening the keywords or update your location.</p>
        </div>
      ) : (
        <div className="job-card-grid">
          {data.jobs.map((job) => (
            <div className="job-card" key={`${job.role}-${job.company || job.location}`}>
              <div className="job-card-header">
                <div>
                  <small className="job-card-tag">{job.type}</small>
                  <strong>{job.role}</strong>
                </div>
                <span className="job-card-fit">{job.fit}</span>
              </div>

              <div className="job-card-info">
                <span className="job-card-company">{job.company}</span>
                <span className="job-card-location">{job.location}</span>
              </div>

              <div className="job-card-meta">
                <small>{job.skills}</small>
                <strong>{job.salary}</strong>
              </div>
              <div className="job-match-details">
                {job.matchedSkills?.length ? <small>Matched: {job.matchedSkills.join(", ")}</small> : <small>Matched with your saved career profile</small>}
                {job.missingSkills?.length ? <small>Improve: {job.missingSkills.join(", ")}</small> : null}
              </div>
              <div className="job-link-row">
                {(job.links || []).map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CollegeRecommendationPanel() {
  const [filters, setFilters] = useState({
    examType: "JEE",
    examScore: 75,
    eamcetMarks: 80,
    eamcetRank: "",
    budget: 200000,
    location: "",
    course: "CSE",
    category: "General"
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const isEamcet = filters.examType === "EAMCET TS";

  async function searchColleges() {
    setLoading(true);
    setSearched(true);
    const data = await api("/advisor/college-recommend", {
      method: "POST",
      body: JSON.stringify(filters)
    }).catch(() => ({ recommendations: [] }));
    setRecommendations(data.recommendations || []);
    setLoading(false);
  }

  useEffect(() => {
    searchColleges();
  }, []);

  return (
    <section className="advisor-card college-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">College recommendation</p>
          <h2>Find your best-fit college</h2>
          <p>Compare admission chance, fees, placement, cutoff trend, and course fit using your entrance profile.</p>
        </div>
        <Map size={24} />
      </div>

      <div className="college-intro-grid">
        <div>
          <strong>Admission probability model</strong>
          <p>Uses entrance score, cutoff fit, budget, course interest, location, and category.</p>
        </div>
        <div>
          <strong>{recommendations.length || "--"}</strong>
          <span>matched colleges</span>
        </div>
        <div>
          <strong>{filters.examType}</strong>
          <span>selected exam</span>
        </div>
      </div>

      <div className="filter-grid college-filter-grid">
        <label>
          Exam type
          <select value={filters.examType} onChange={(event) => updateFilter("examType", event.target.value)}>
            {[
              { label: "JEE", value: "JEE" },
              { label: "EAMCET TS", value: "EAMCET TS" },
              { label: "CET", value: "CET" },
              { label: "Other CET", value: "OTHER CET" }
            ].map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        {isEamcet ? (
          <>
            <label>
              EAMCET marks out of 160
              <input type="number" min="0" max="160" step="1" value={filters.eamcetMarks} onChange={(event) => updateFilter("eamcetMarks", Number(event.target.value))} />
            </label>
            <label>
              EAMCET rank optional
              <input type="number" min="0" step="1" value={filters.eamcetRank} onChange={(event) => updateFilter("eamcetRank", event.target.value)} placeholder="If known, enter rank" />
            </label>
          </>
        ) : (
          <label>
            JEE percentile
            <input type="number" min="0" max="100" step="0.01" value={filters.examScore} onChange={(event) => updateFilter("examScore", Number(event.target.value))} />
          </label>
        )}
        <label>
          Annual budget
          <input type="number" min="0" step="1000" value={filters.budget} onChange={(event) => updateFilter("budget", Number(event.target.value))} />
        </label>
        <label>
          Preferred location
          <input value={filters.location} onChange={(event) => updateFilter("location", event.target.value)} placeholder="Hyderabad, Bengaluru, Pune..." />
        </label>
        <label>
          Course interest
          <input value={filters.course} onChange={(event) => updateFilter("course", event.target.value)} placeholder="CSE, AI, ECE, Civil..." />
        </label>
        <label>
          Category
          <select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
            {["General", "OBC", "SC", "ST"].map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>

      <button className="primary" onClick={searchColleges} disabled={loading}>
        {loading ? "Finding colleges..." : "Find colleges"}
      </button>

      <div className="college-results-grid">
        {recommendations.length === 0 ? (
          <div className="empty-state">
            <p>{searched ? "No colleges matched these filters. Increase budget, clear location, or use a broader course name." : "Run the search to see matched colleges."}</p>
          </div>
        ) : (
          recommendations.map((college) => (
            <article className="college-card" key={`${college.name}-${college.location}`}>
              <div className="college-card-head">
                <div>
                  <strong>{college.name}</strong>
                  <small>{college.location} | {college.course}</small>
                </div>
                <span>{college.admissionChance}%</span>
              </div>
              <div className="college-meter"><span style={{ width: `${college.admissionChance}%` }} /></div>
              <div className="college-stat-grid">
                <div><small>Fees</small><strong>₹{Number(college.fees).toLocaleString("en-IN")}</strong></div>
                <div><small>Placement</small><strong>{college.placement}</strong></div>
                <div><small>Cutoff</small><strong>{college.cutoff}</strong></div>
                <div><small>Rating</small><strong>{college.rating}/5</strong></div>
              </div>
              <p>{college.cutoffTrend}. {college.userExamMetric}. Accepted exams: {college.acceptedExams?.join(", ")}.</p>
              <small>Dataset: {college.source}</small>
            </article>
          ))
        )}
      </div>
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
      <h2>{data.career ? `${data.career} roadmap` : "Next 30 days"}</h2>
      <div className="roadmap-progress-card">
        <strong>{data.progress || 0}% complete</strong>
        <div className="progress"><span style={{ width: `${data.progress || 0}%` }} /></div>
      </div>
      <div className="guidance-flow visual-flowchart roadmap-flow">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flow-step">
              <div className="flow-step-number">{index + 1}</div>
              <div className="flow-step-body">
                <small>{data.roadmap?.[index]?.status || "pending"}</small>
                <strong>{step}</strong>
                <p>{index === steps.length - 1 ? "Create proof and add it to your profile." : "Complete this stage before moving ahead."}</p>
              </div>
            </div>
            {index < steps.length - 1 && <div className="flow-connector">&rarr;</div>}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function GuidancePanel() {
  const [data, setData] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [similarProfiles, setSimilarProfiles] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [careerOptions, setCareerOptions] = useState([]);
  const [showProfileFeedback, setShowProfileFeedback] = useState(false);
  const [feedbackForCareer, setFeedbackForCareer] = useState(null);
  const [feedbackCareerPrefill, setFeedbackCareerPrefill] = useState(null);
  const [completedRoadmapSteps, setCompletedRoadmapSteps] = useState([]);

  useEffect(() => {
    api("/advisor/guidance").then(setData);
  }, []);

  useEffect(() => {
    if (!data?.career) return;
    setJobRoles(careerRoleMap[data.career] || [
      `${data.career} Intern`,
      `${data.career} Associate`,
      `${data.career} Specialist`,
      `${data.career} Analyst`
    ]);
    const careers = data.recommendedCareers?.length ? data.recommendedCareers : [data.career, ...(careerRoleMap[data.career] || [])];
    setCareerOptions(Array.from(new Set(careers)).slice(0, 4));
    if (data.latestFeatures && Object.keys(data.latestFeatures).length) {
      api("/advisor/knn-recommend", {
        method: "POST",
        body: JSON.stringify({ features: data.latestFeatures, k: 5, num_recommendations: 4 })
      })
        .then((result) => setSimilarProfiles(result.similar_profiles || []))
        .catch(() => setSimilarProfiles([]));
    } else {
      setSimilarProfiles([]);
    }
    if (data.learningPath?.length) {
      const completedCount = Math.round(((data.roadmapProgress || 0) / 100) * data.learningPath.length);
      setCompletedRoadmapSteps(data.learningPath.slice(0, completedCount));
    }
  }, [data]);

  async function openProfileFeedback(career) {
    try {
      const json = await api("/advisor/feedback");
      const entries = (json.feedback || []).filter(f => f.selectedCareer === career);
      setFeedbackForCareer({ career, entries });
      setShowProfileFeedback(true);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  }

  const confidenceValue = Number(data?.confidence || 0);
  const confidencePercent = confidenceValue > 1 ? Math.round(confidenceValue) : Math.round(confidenceValue * 100);
  const hasSavedGuidance = Boolean(data?.hasRecommendation || data?.career);
  const roadmapProgress = data?.learningPath?.length
    ? Math.round((completedRoadmapSteps.length / data.learningPath.length) * 100)
    : 0;

  async function toggleRoadmapStep(step) {
    if (!data?.learningPath?.length) return;
    const exists = completedRoadmapSteps.includes(step);
    const nextSteps = exists
      ? completedRoadmapSteps.filter((item) => item !== step)
      : [...completedRoadmapSteps, step];
    setCompletedRoadmapSteps(nextSteps);
    const progress = Math.round((nextSteps.length / data.learningPath.length) * 100);
    try {
      await api("/advisor/profile", {
        method: "PUT",
        body: JSON.stringify({ roadmapProgress: progress })
      });
    } catch (error) {
      console.warn("Unable to save roadmap progress:", error.message || error);
    }
    if (!exists && progress === 100) {
      setShowFeedback(true);
    }
  }

  return (
    <section className="advisor-card roadmap-panel guidance-panel">
      <p className="eyebrow">Personalized guidance</p>
      <h2>{data?.career || "AI Career Suggestions"}</h2>

      <div className="guidance-dashboard-grid">
        <div className="guidance-summary-card">
          <span>{data?.hasRecommendation ? "Previous career recommendation" : "Recommended career"}</span>
          <h3>{data?.career || "Career Path"}</h3>
          <div className="recommendation-score">
            <strong>{confidencePercent ? `${confidencePercent}% fit` : "Fit score pending"}</strong>
          </div>
          <p>{data?.suggestions?.[0] || "Complete the profile test to unlock your best career guidance."}</p>
        </div>

        <div className="guidance-summary-card">
          <span>Top careers to explore</span>
          <div className="career-card-list">
            {careerOptions.map((career, index) => (
              <div key={career} className="career-card-item">
                <strong>{career}</strong>
                <small>{index === 0 ? "Primary match" : "Similar path"}</small>
                <span>{Math.max(45, confidencePercent - index * 8)}%</span>
              </div>
            ))}
            {!careerOptions.length && (
              <p>{hasSavedGuidance ? "Saved career will appear here shortly." : "Complete career profiling to see career matches."}</p>
            )}
          </div>
        </div>

        <div className="guidance-summary-card">
          <span>Similar profiles</span>
          <div className="similar-profiles-list">
            {similarProfiles.length ? similarProfiles.map((profile) => (
              <div key={profile.profile_id} className="similar-profile-item" onClick={() => openProfileFeedback(profile.career)} style={{ cursor: 'pointer' }}>
                <strong>{profile.profile_id}</strong>
                <small>{profile.career}</small>
                <span>{profile.similarity_score}% similar</span>
              </div>
            )) : <p>No similar feedback profiles yet. After another user shares feedback for a similar profile, it appears here.</p>}
          </div>
        </div>
      </div>

      <div className="guidance-summary">
        {(data?.suggestions || ["Complete the test to unlock AI-based suggestions."]).map((item, index) => (
          <div className="road-step" key={item}>
            <span>{index + 1}</span>
            <p>{item}</p>
          </div>
        ))}
      </div>

      {data?.career && (
        <button 
          className="secondary" 
          onClick={() => setShowFeedback(true)}
          style={{ marginTop: "16px", backgroundColor: "#FF9800", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <MessageSquare size={16} />
          Share Your Progress
        </button>
      )}

      {data?.learningPath?.length ? (
        <>
          <div className="guidance-flow-header">
            <div>
              <p className="eyebrow">Visual roadmap</p>
              <h3>{data.career || "Career"} learning flow</h3>
            </div>
            <span>{roadmapProgress}% complete</span>
          </div>
          <div className="guidance-flow visual-flowchart">
            {data.learningPath.map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flow-step ${completedRoadmapSteps.includes(step) ? "completed" : ""}`}>
                  <div className="flow-step-number">{index + 1}</div>
                  <div className="flow-step-body">
                    <small>{index === 0 ? "Foundation" : index === data.learningPath.length - 1 ? "Portfolio" : "Skill stage"}</small>
                    <strong>{step}</strong>
                    <p>{index === 0 ? "Start here and complete the core basics." : "Practice this stage with one task or mini project."}</p>
                    <button className="roadmap-check-btn" onClick={() => toggleRoadmapStep(step)}>
                      {completedRoadmapSteps.includes(step) ? "Completed" : "Mark complete"}
                    </button>
                  </div>
                </div>
                {index < data.learningPath.length - 1 && <div className="flow-connector">&rarr;</div>}
              </React.Fragment>
            ))}
          </div>
        </>
      ) : null}

      {data?.learningResources?.length ? (
        <>
          <div className="resource-board">
            <div>
              <h4>Free YouTube courses</h4>
              <div className="video-grid">
                {data.learningResources.map((resource) => (
                  <a
                    key={resource.skill}
                    className="video-card"
                    href={resource.youtube}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={`https://img.youtube.com/vi/${resource.videoId}/hqdefault.jpg`} alt={resource.skill} />
                    <div>
                      <strong>{resource.skill}</strong>
                      <small>Free YouTube course</small>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <aside className="resource-side-panel">
              <div className="certification-list">
                <h4>Free certifications</h4>
                <div className="cert-grid">
                  {data.learningResources.flatMap((resource) => resource.certifications || []).slice(0, 10).map((cert) => (
                    <a key={cert.url} href={cert.url} target="_blank" rel="noreferrer" className="cert-link">
                      {cert.title}
                    </a>
                  ))}
                </div>
              </div>
              <div className="certification-list">
                <h4>Learning websites</h4>
                <div className="cert-grid">
                  {data.learningResources.flatMap((resource) => resource.websites || []).slice(0, 10).map((site) => (
                    <a key={`${site.title}-${site.url}`} href={site.url} target="_blank" rel="noreferrer" className="cert-link website-link">
                      {site.title}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : null}

      {showFeedback && (
        <FeedbackFormModal 
          career={feedbackCareerPrefill || data?.career || "Software Engineer"}
          recommendedCareers={careerOptions.map((career) => ({ career, confidence: career === data?.career ? data?.confidence || 0 : 0 }))}
          userFeatures={data?.latestFeatures || {}}
          onClose={() => { setShowFeedback(false); setFeedbackCareerPrefill(null); }}
        />
      )}

      {showProfileFeedback && feedbackForCareer && (
        <div className="feedback-modal-overlay" onClick={() => setShowProfileFeedback(false)}>
          <div className="feedback-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Feedback for {feedbackForCareer.career}</h3>
            {feedbackForCareer.entries.length ? (
              feedbackForCareer.entries.map((fb) => (
                <div key={fb._id} style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{fb.selectedCareer}</strong>
                    <small>{new Date(fb.createdAt).toLocaleDateString()}</small>
                  </div>
                  <p style={{ margin: '6px 0' }}>Outcome: {fb.outcome}</p>
                  {fb.roleTitle && <p style={{ margin: '6px 0' }}>Role: {fb.roleTitle}</p>}
                  {fb.timeTakenMonths != null && <p style={{ margin: '6px 0' }}>Time: {fb.timeTakenMonths} months</p>}
                  {fb.feedbackNotes && <p style={{ marginTop: 8, color: '#444' }}>{fb.feedbackNotes}</p>}
                </div>
              ))
            ) : (
              <p>No feedback entries for this career yet.</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
              <button className="secondary" onClick={() => setShowProfileFeedback(false)}>Close</button>
              <button className="primary" onClick={() => { setFeedbackCareerPrefill(feedbackForCareer.career); setShowProfileFeedback(false); setShowFeedback(true); }}>Provide Feedback</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I’m your career AI coach. Ask me about skills, study plans, or career paths." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const nextMessages = [...messages, { role: "user", text: input.trim() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await api("/advisor/chat", {
        method: "POST",
        body: JSON.stringify({ text: input.trim() })
      });
      setMessages((prev) => [...prev, { role: "assistant", text: response.answer }]);
    } catch (err) {
      setError(err.message || "Unable to connect to the career chat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="advisor-card chat-panel">
      <p className="eyebrow">Career Chat</p>
      <h2>AI Career Coach</h2>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
            <div className="chat-avatar">{message.role === "assistant" ? "🤖" : "🧑"}</div>
            <div className="chat-text">{message.text}</div>
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="chat-input-area">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about careers, skills, or next steps..."
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button className="primary" onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </section>
  );
}

function RecommendationChooser({ recommendation, result, onConfirm, onClose }) {
  const [selectedCareer, setSelectedCareer] = useState(recommendation?.career);
  const [knnRecommendations, setKnnRecommendations] = useState([]);
  const [similarProfiles, setSimilarProfiles] = useState([]);
  const [analyticsMap, setAnalyticsMap] = useState({});
  const [communityFeedbackMap, setCommunityFeedbackMap] = useState({});

  useEffect(() => {
    if (!result?.scores) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api("/advisor/knn-recommend", {
          method: "POST",
          body: JSON.stringify({ features: result.scores, k: 5, num_recommendations: 4 })
        });
        if (!cancelled) {
          setKnnRecommendations(data.knn_recommendations || []);
          setSimilarProfiles(data.similar_profiles || []);
        }
      } catch (err) {
        console.warn("KNN fetch failed in chooser:", err.message || err);
      }
    })();
    return () => { cancelled = true; };
  }, [result]);

  const careers = [
    ...knnRecommendations.map((item) => item.career),
    recommendation?.career,
    ...(recommendation?.alternatives || []).map((item) => item.career)
  ].filter(Boolean).filter((career, index, list) => list.indexOf(career) === index).slice(0, 4);
  const sectionResults = result?.sectionResults || [];

  useEffect(() => {
    careers.forEach(async (career) => {
      try {
        const json = await api(`/advisor/analytics/${encodeURIComponent(career)}`);
        setAnalyticsMap((prev) => ({ ...prev, [career]: json.analytics }));
      } catch {
        // Optional analytics can be absent while the project is in development.
      }
    });

    (async () => {
      for (const career of careers) {
        try {
          const json = await api(`/advisor/feedback/career/${encodeURIComponent(career)}`);
          setCommunityFeedbackMap((prev) => ({ ...prev, [career]: json }));
        } catch {
          // Optional feedback samples can be absent for new careers.
        }
      }
    })();
  }, [careers.join("|")]);

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal-card recommendation-dialog" onClick={(event) => event.stopPropagation()}>
        <h3>View results and choose a career</h3>
        <p>Review Random Forest prediction, KNN similar-profile matches, and community feedback before continuing.</p>

        {sectionResults.length ? (
          <div className="chooser-section">
            <h4>Section-wise test results</h4>
            <div className="section-chart-grid">
              {sectionResults.map((section) => (
                <article key={section.title} className="section-chart-card">
                  <div className="mini-pie" style={{ "--score": `${Math.max(0, Math.min(100, section.score || 0))}%` }}>
                    <span>{section.score}%</span>
                  </div>
                  <div>
                    <strong>{section.title.replace(/^Section \d+: /, "")}</strong>
                    <small>{section.description}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <div className="chooser-career-grid">
          {careers.map((career) => (
            <label key={career} className={`chooser-career-card ${selectedCareer === career ? "selected" : ""}`}>
              <div>
                <strong>{career}</strong>
                <small>{analyticsMap[career]?.mostCommonOutcome ? `Most common: ${analyticsMap[career].mostCommonOutcome}` : "Career recommendation"}</small>
                {communityFeedbackMap[career] && <small>Community samples: {communityFeedbackMap[career].summary.total}</small>}
              </div>
              <div className="chooser-card-score">
                {analyticsMap[career] && <span>{analyticsMap[career].successRate}% success</span>}
                <input type="radio" name="career_choice" checked={selectedCareer === career} onChange={() => setSelectedCareer(career)} />
              </div>
            </label>
          ))}
        </div>

        <div className="chooser-section">
          <h4>KNN similar-career matches</h4>
          <div className="chooser-mini-grid">
            {knnRecommendations.length ? knnRecommendations.map((rec) => {
              const rawScore = Number(rec.confidence ?? rec.score ?? 0);
              const percent = Math.round(rawScore > 1 ? rawScore : rawScore * 100);
              return (
                <article key={rec.career}>
                  <strong>{rec.career}</strong>
                  <small>{percent}% confidence</small>
                  <span>{rec.similar_profile_count || 0} similar profiles</span>
                </article>
              );
            }) : <p>No KNN recommendations available yet.</p>}
          </div>
        </div>

        <div className="chooser-section">
          <h4>Similar user feedback</h4>
          <div className="chooser-scroll-list">
            {similarProfiles.length ? similarProfiles.map((profile, index) => (
              <div key={`${profile.profile_id || "profile"}-${index}`} className="similar-profile-row">
                <strong>{profile.userName || profile.profile_id || `User ${index + 1}`}</strong>
                <span>{profile.career} | Similarity {profile.similarity_score}%</span>
                {profile.outcome && <small>Outcome: {profile.outcome}</small>}
                {profile.feedback && <small>Feedback: {profile.feedback}</small>}
              </div>
            )) : <p>No similar profiles found.</p>}
          </div>
        </div>

        <div className="chooser-section">
          <h4>Community feedback samples</h4>
          <div className="chooser-scroll-list">
            {Object.entries(communityFeedbackMap).length ? Object.entries(communityFeedbackMap).map(([career, info]) => (
              <div key={career} className="community-feedback-row">
                <strong>{career}</strong>
                <span>Samples: {info.summary.total} | Avg time: {info.summary.averageTimeMonths} months</span>
                {info.samples?.slice(0, 3).map((sample, index) => (
                  <div key={`${career}-${index}`} className="community-feedback-sample">
                    <strong>{sample.userName || "User"} - {sample.outcome}</strong>
                    {sample.roleTitle && <small>{sample.roleTitle}</small>}
                    {sample.feedbackNotes && <p>{sample.feedbackNotes}</p>}
                  </div>
                ))}
              </div>
            )) : <p>No community feedback yet.</p>}
          </div>
        </div>

        <div className="dialog-actions">
          <button className="secondary" onClick={onClose}>Cancel</button>
          <button className="primary" onClick={() => onConfirm(selectedCareer)} disabled={!selectedCareer}>Confirm and Continue</button>
        </div>
      </div>
    </div>
  );
}
function FeedbackFormModal({ career, recommendedCareers = [], userFeatures = {}, onClose }) {
  const [outcome, setOutcome] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [timeTaken, setTimeTaken] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const cleanRecommendedCareers = recommendedCareers
    .map((item) => typeof item === "string"
      ? { career: item, confidence: item === career ? 100 : 0 }
      : { career: item?.career, confidence: Number(item?.confidence || 0) })
    .filter((item) => item.career);

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setError("");
    setMessage("");
    if (!outcome) {
      setError("Please select an outcome before submitting feedback.");
      return;
    }

    setLoading(true);
    try {
      await api("/advisor/feedback", {
        method: "POST",
        body: JSON.stringify({
          userFeatures,
          recommendedCareers: cleanRecommendedCareers,
          selectedCareer: career,
          outcome,
          roleTitle,
          timeTakenMonths: timeTaken ? Number(timeTaken) : null,
          feedbackNotes: notes
        })
      });
      setMessage("Feedback saved successfully. Thank you for improving recommendations.");
      window.setTimeout(onClose, 900);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError(error.message || "Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-modal-overlay feedback-modal-overlay--nested" onClick={onClose}>
      <form className="feedback-modal-card feedback-form-card" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Career Recommendation Feedback</h3>
        <p style={{ color: "#666", marginTop: "8px" }}>Help us improve by sharing your experience with the {career} recommendation.</p>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <div className="feedback-field">
          <label>What happened after this recommendation?</label>
          {['Got Job', 'Got Internship', 'Still Learning', 'Not Interested'].map((opt) => (
            <label key={opt} className="feedback-radio">
              <input
                type="radio"
                name="outcome"
                value={opt}
                checked={outcome === opt}
                onChange={(e) => setOutcome(e.target.value)}
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="feedback-field">
          <label>Role title (optional)</label>
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="e.g., Data Science Intern"
          />
        </div>

        <div className="feedback-field">
          <label>Time taken to reach this outcome (months, optional)</label>
          <input
            type="number"
            value={timeTaken}
            onChange={(e) => setTimeTaken(e.target.value)}
            placeholder="e.g., 4"
          />
        </div>

        <div className="feedback-field">
          <label>Additional notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share your experience..."
          />
        </div>

        <div className="feedback-actions">
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary" disabled={loading || !outcome}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdvisorHome() {
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
    </section>
  );
}

function DashboardRoadmapHub({ onSelect }) {
  const cards = [
    {
      title: "Career Decision Roadmap",
      tag: "After test",
      steps: ["Finish profiling test", "Review top careers", "Open guidance path", "Build one proof project"],
      action: "Start Profiling",
      target: "career-profile"
    },
    {
      title: "College Admission Plan",
      tag: "Education",
      steps: ["Enter exam score", "Compare admission chance", "Check fees and placement", "Shortlist 3 colleges"],
      action: "Find Colleges",
      target: "college"
    },
    {
      title: "Resume Improvement Path",
      tag: "NLP",
      steps: ["Upload resume", "Select target role", "Fix missing skills", "Add certificates and project links"],
      action: "Analyze Resume",
      target: "resume"
    }
  ];

  return (
    <section className="dashboard-roadmap-hub">
      <div className="section-title">
        <div>
          <p className="eyebrow">Next steps</p>
          <h2>Roadmaps to continue from here</h2>
        </div>
        <Compass size={22} />
      </div>
      <div className="dashboard-roadmap-grid">
        {cards.map((card) => (
          <article className="dashboard-roadmap-card" key={card.title}>
            <span>{card.tag}</span>
            <h3>{card.title}</h3>
            {card.steps.map((step, index) => (
              <div className="road-step" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
            <button className="secondary" onClick={() => onSelect(card.target)}>{card.action}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function MainOptions({ activeFeature, onSelect }) {
  return (
    <section className="practice-grid">
      {mainOptions.map((option) => (
        <button
          className={`track-card ${option.color} ${activeFeature === option.id ? "selected-option" : ""}`}
          key={option.id}
          onClick={() => onSelect(option.id)}
        >
          <span>{option.badge}</span>
          <strong>{option.title}</strong>
          <small>{option.detail}</small>
        </button>
      ))}
    </section>
  );
}

function Dashboard({ user, onLogout }) {
  const [activeFeature, setActiveFeature] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [latest, setLatest] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pendingRecommendation, setPendingRecommendation] = useState(null);
  const [pendingResultObj, setPendingResultObj] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function restoreUserProfile() {
      try {
        const data = await api("/advisor/profile");
        if (!mounted) return;

        setProfile(data.profile);
        if (!latest && data.profile?.targetRole) {
          setLatest({
            recommendation: {
              career: data.profile.targetRole,
              confidence: 0.72,
              explanation: `Your saved career target is ${data.profile.targetRole}.`,
              skillsToBuild: data.profile.skills || []
            },
            scores: {},
            profile: data.profile
          });
        }
      } catch (error) {
        console.warn("Could not restore profile:", error.message || error);
      }
    }

    restoreUserProfile();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleConfirmRecommendation(selectedCareer) {
    if (!pendingResultObj || !pendingRecommendation) {
      setPendingRecommendation(null);
      setPendingResultObj(null);
      return;
    }

    const final = { ...pendingResultObj, recommendation: { ...pendingRecommendation, career: selectedCareer } };
    setLatest(final);
    // clear pending
    setPendingRecommendation(null);
    setPendingResultObj(null);

    try {
      await api("/advisor/profile", {
        method: "PUT",
        body: JSON.stringify({ targetRole: selectedCareer })
      });
      setProfile((prev) => ({ ...prev, targetRole: selectedCareer }));
    } catch (error) {
      console.warn("Unable to save selected career:", error.message || error);
    }
  }

  const hideInsightRail = ["career-profile", "manual-profile", "resume", "college", "guidance"].includes(activeFeature);

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
          <AdvisorHome />
        )}

        {activeFeature === "dashboard" && (
          <MainOptions activeFeature={activeFeature} onSelect={setActiveFeature} />
        )}

        {activeFeature === "dashboard" && (
          <DashboardRoadmapHub onSelect={setActiveFeature} />
        )}

        <section className={`portal-content ${hideInsightRail ? "portal-content--wide" : ""}`}>
          <div className="primary-workspace">
            {["career-profile", "manual-profile", "resume", "college", "skill-quiz"].includes(activeFeature) && (
              <button className="explore-btn" onClick={() => setActiveFeature("dashboard")}>
                <ArrowRight size={18} /> Back to options
              </button>
            )}
            {activeFeature === "career-profile" && <CareerProfileForm profile={profile} mode="guided" onNavigate={setActiveFeature} onSaved={(result) => setLatest(result)} onRecommend={(rec, res) => { setPendingRecommendation(rec); setPendingResultObj(res); }} />}
            {activeFeature === "manual-profile" && <CareerProfileForm profile={profile} mode="manual" onNavigate={setActiveFeature} onSaved={(result) => setLatest(result)} onRecommend={(rec, res) => { setPendingRecommendation(rec); setPendingResultObj(res); }} />}
            {activeFeature === "skill-quiz" && <SkillQuizPanel />}
            {activeFeature === "chat" && <ChatPanel />}
            {activeFeature === "skills" && <SkillInputPanel profile={profile} onNavigate={setActiveFeature} onSaved={(result) => setLatest(result)} onRecommend={(rec, res) => { setPendingRecommendation(rec); setPendingResultObj(res); }} />}
            {activeFeature === "college" && <CollegeRecommendationPanel />}
            {activeFeature === "resume" && <ResumePanel onNavigate={setActiveFeature} />}
            {activeFeature === "jobs" && <JobFinderPanel />}
            {activeFeature === "courses" && <RoadmapPanel />}
            {activeFeature === "guidance" && <GuidancePanel />}
            {activeFeature === "development" && <SkillDevelopmentPanel />}
            {activeFeature === "mentor" && <MentorPanel />}
            {activeFeature === "progress" && <ProgressPanel />}
            {activeFeature === "profile" && <ProfilePanel user={user} />}
          </div>
          {!hideInsightRail && (
            <aside className="insight-rail">
              <ResultPanel result={latest} onNavigate={setActiveFeature} />
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
          )}
        </section>
      </section>
      {pendingRecommendation && (
        <RecommendationChooser recommendation={pendingRecommendation} result={pendingResultObj} onConfirm={handleConfirmRecommendation} onClose={() => { setPendingRecommendation(null); setPendingResultObj(null); }} />
      )}
      <button className="chatbot-launcher" onClick={() => setActiveFeature("chat")}> 
        <span className="chatbot-icon">💬</span>
        <div>
          <strong>Career Coach</strong>
          <small>Ask the AI</small>
        </div>
      </button>
    </main>
  );
}
export default Dashboard;



