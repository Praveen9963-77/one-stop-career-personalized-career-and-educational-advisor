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
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
  UserRound
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import ResumePanel from "./ResumePanel";
import ResultPanel from "./ResultPanel";
import TestPanel from "./TestPanel";
const sidebarFeatures = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "career-profile", label: "Career Profiling", icon: Target },
  { id: "manual-profile", label: "Manual Skills", icon: SlidersHorizontal },
  { id: "guidance", label: "Guidance", icon: Compass },
  { id: "aptitude", label: "Aptitude Test", icon: ListChecks },
  { id: "coding", label: "Coding Test", icon: Code2 },
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
  { role: "Frontend Developer Intern", fit: "87%", skills: "React, JavaScript, UI basics" },
  { role: "Data Analyst Trainee", fit: "78%", skills: "Excel, SQL, Python" },
  { role: "Business Analyst Intern", fit: "74%", skills: "Communication, process, dashboards" }
];

const profileFeatureFields = [
  ["Math_Score", "Math Score", 0, 100],
  ["Physics_Score", "Physics Score", 0, 100],
  ["Chemistry_Score", "Chemistry Score", 0, 100],
  ["Biology_Score", "Biology Score", 0, 100],
  ["English_Score", "English Score", 0, 100],
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
  ["Social_Service_Interest", "Social Service Interest", 1, 10]
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

const academicFeatureKeys = new Set(["Math_Score", "Physics_Score", "Chemistry_Score", "Biology_Score", "English_Score", "GPA"]);

const featureSections = [
  {
    title: "Academic Scores",
    helper: "Use your latest completed academic level. Enter subject marks out of 100 and GPA out of 10.",
    keys: ["Math_Score", "Physics_Score", "Chemistry_Score", "Biology_Score", "English_Score", "GPA"]
  },
  {
    title: "Technical Skills",
    helper: "Select your current level honestly. These are converted to 1-10 values for the model.",
    keys: ["Coding_Skill", "Problem_Solving", "Data_Analysis", "Web_Development", "AI_Interest"]
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
  { id: "math_1", feature: "Math_Score", question: "If 25% of a number is 40, what is the number?", options: [["100", 40], ["120", 55], ["160", 100], ["200", 45]] },
  { id: "math_2", feature: "Math_Score", question: "The average of 8, 12, 15 and 25 is:", options: [["12", 45], ["15", 55], ["18", 100], ["20", 50]] },
  { id: "math_3", feature: "Math_Score", question: "If x + 7 = 19, then x is:", options: [["10", 50], ["11", 55], ["12", 100], ["13", 50]] },
  { id: "math_4", feature: "Math_Score", question: "A ratio 2:3 has total 50. The larger part is:", options: [["20", 55], ["25", 50], ["30", 100], ["35", 45]] },
  { id: "physics_1", feature: "Physics_Score", question: "The SI unit of force is:", options: [["Joule", 45], ["Newton", 100], ["Watt", 45], ["Pascal", 55]] },
  { id: "physics_2", feature: "Physics_Score", question: "Speed is calculated as:", options: [["Distance / Time", 100], ["Time / Distance", 40], ["Mass x Acceleration", 55], ["Force / Area", 45]] },
  { id: "physics_3", feature: "Physics_Score", question: "A simple electric circuit must have:", options: [["Only a bulb", 40], ["Only a wire", 40], ["Closed path and source", 100], ["Only a switch", 45]] },
  { id: "chemistry_1", feature: "Chemistry_Score", question: "Water is represented by the formula:", options: [["CO2", 40], ["H2O", 100], ["O2", 45], ["NaCl", 40]] },
  { id: "chemistry_2", feature: "Chemistry_Score", question: "A pH less than 7 usually indicates:", options: [["Acid", 100], ["Base", 40], ["Salt only", 45], ["Metal", 40]] },
  { id: "biology_1", feature: "Biology_Score", question: "The basic unit of life is:", options: [["Atom", 40], ["Cell", 100], ["Tissue only", 55], ["Organ", 60]] },
  { id: "biology_2", feature: "Biology_Score", question: "Which system transports blood in the body?", options: [["Digestive", 45], ["Circulatory", 100], ["Respiratory only", 55], ["Nervous", 50]] },
  { id: "english_1", feature: "English_Score", question: "Choose the correctly spelled word:", options: [["Recieve", 40], ["Receive", 100], ["Receeve", 40], ["Receve", 40]] },
  { id: "english_2", feature: "English_Score", question: "Choose the best synonym for concise:", options: [["Lengthy", 40], ["Brief", 100], ["Confused", 45], ["Delayed", 40]] },
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
  { id: "math_5", feature: "Math_Score", question: "A shopkeeper gives 20% discount on an item marked at 2500. Selling price is:", options: [["1800", 55], ["2000", 100], ["2100", 50], ["2300", 40]] },
  { id: "math_6", feature: "Math_Score", question: "If the probability of an event is 0.25, the probability that it does not occur is:", options: [["0.25", 45], ["0.50", 50], ["0.75", 100], ["1.25", 35]] },
  { id: "physics_4", feature: "Physics_Score", question: "According to Ohm's law, if voltage doubles and resistance stays same, current:", options: [["Halves", 45], ["Doubles", 100], ["Becomes zero", 35], ["Stays same", 50]] },
  { id: "physics_5", feature: "Physics_Score", question: "A body moving with constant velocity has acceleration:", options: [["Zero", 100], ["Increasing", 40], ["Negative always", 45], ["Equal to speed", 35]] },
  { id: "chemistry_3", feature: "Chemistry_Score", question: "Which bond involves sharing of electron pairs?", options: [["Ionic bond", 55], ["Covalent bond", 100], ["Metallic sound", 35], ["Gravity bond", 30]] },
  { id: "chemistry_4", feature: "Chemistry_Score", question: "Oxidation generally means:", options: [["Gain of electrons", 45], ["Loss of electrons", 100], ["No electron change", 35], ["Only melting", 30]] },
  { id: "biology_3", feature: "Biology_Score", question: "DNA mainly stores:", options: [["Genetic information", 100], ["Blood pressure only", 40], ["Oxygen only", 35], ["Digestive enzymes only", 45]] },
  { id: "biology_4", feature: "Biology_Score", question: "Photosynthesis mainly converts light energy into:", options: [["Chemical energy", 100], ["Sound energy", 35], ["Mechanical energy", 40], ["Nuclear energy", 30]] },
  { id: "english_3", feature: "English_Score", question: "Choose the sentence with correct grammar:", options: [["She go to college daily.", 35], ["She goes to college daily.", 100], ["She going college daily.", 40], ["She gone to college daily.", 45]] },
  { id: "english_4", feature: "English_Score", question: "A paragraph conclusion should usually:", options: [["Introduce unrelated topic", 35], ["Summarize or close the idea", 100], ["Remove the main point", 35], ["Repeat random words", 30]] },
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
  { id: "social_2", feature: "Social_Service_Interest", question: "Which project best reflects social service interest?", options: [["Accessibility tool for students", 10], ["Private game score only", 3], ["Personal wallpaper app", 2], ["Random calculator with no user need", 2]] }
];

const profileFeatureLabels = Object.fromEntries(profileFeatureFields.map(([key, label]) => [key, label]));

const profilingSubjectGroups = [
  {
    title: "Academics",
    features: ["Math_Score", "Physics_Score", "Chemistry_Score", "Biology_Score", "English_Score"]
  },
  {
    title: "Technical",
    features: ["Coding_Skill", "Problem_Solving", "Data_Analysis", "Web_Development", "AI_Interest"]
  },
  {
    title: "Communication",
    features: ["Communication", "Leadership", "Teamwork", "Public_Speaking"]
  },
  {
    title: "Thinking Style",
    features: ["Creativity", "Analytical_Thinking", "Attention_To_Detail", "Stress_Handling", "Research_Interest", "Social_Service_Interest"]
  }
];

function computeGuidedProfile(mcqAnswers, gpa) {
  const totals = {};
  const counts = {};

  for (const question of profilingQuestions) {
    const answer = mcqAnswers[question.id];
    if (!answer) continue;
    totals[question.feature] = (totals[question.feature] || 0) + answer.value;
    counts[question.feature] = (counts[question.feature] || 0) + 1;
  }

  const features = { ...defaultProfileFeatures, GPA: Number(gpa || 7) };
  for (const feature of Object.keys(totals)) {
    features[feature] = Math.round((totals[feature] / counts[feature]) * 100) / 100;
  }

  return features;
}

function makeLocalRecommendation(features) {
  const profile = Object.fromEntries(
    Object.entries(features).map(([key, value]) => [key, Number(value || 0)])
  );
  const careerRules = [
    {
      career: "Software Engineer",
      score: profile.Coding_Skill + profile.Problem_Solving + profile.Web_Development + profile.Math_Score / 10,
      skills: ["Data Structures", "JavaScript or Python", "System Design", "Git"],
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
    },
    {
      career: "Healthcare / Biology Track",
      score: profile.Biology_Score / 10 + profile.Chemistry_Score / 10 + profile.Social_Service_Interest + profile.Research_Interest,
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
    alternatives: careerRules.slice(1, 4).map((item) => ({
      career: item.career,
      score: Math.min(0.9, Math.max(0.45, item.score / maxScore))
    }))
  };
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
    id: "resume",
    color: "green",
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

function RecommendationPanel({ recommendation }) {
  if (!recommendation) return null;

  const careers = [
    { career: recommendation.career, score: recommendation.confidence },
    ...(recommendation.alternatives || [])
  ].slice(0, 4);

  return (
    <div className="roadmap-panel">
      <p className="eyebrow">Career recommendations</p>
      <h2>{recommendation.career}</h2>
      <p>{recommendation.explanation}</p>
      {careers.map((item, index) => (
        <div className="job-row" key={`${item.career}-${index}`}>
          <div>
            <strong>{index + 1}. {item.career}</strong>
            <small>{index === 0 ? "Best match" : "Alternative recommendation"}</small>
          </div>
          <span>{Math.round(Number(item.score || 0) * 100)}%</span>
        </div>
      ))}
      <div className="chips">
        {recommendation.skillsToBuild?.map((skill) => <span key={skill}>{skill}</span>)}
      </div>
    </div>
  );
}

function CareerProfileForm({ mode, onSaved }) {
  const [features, setFeatures] = useState(defaultProfileFeatures);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isGuided = mode === "guided";
  const visibleFields = profileFeatureFields;
  const answeredCount = Object.keys(mcqAnswers).length;
  const progress = Math.round((answeredCount / profilingQuestions.length) * 100);
  const currentQuestion = profilingQuestions[activeQuestion];
  const guidedFeatures = useMemo(
    () => computeGuidedProfile(mcqAnswers, features.GPA),
    [mcqAnswers, features.GPA]
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
        : features;
      const data = await api("/advisor/predict-profile", {
        method: "POST",
        body: JSON.stringify({ features: payloadFeatures })
      });
      setRecommendation(data.recommendation);
      onSaved?.(data.result);
    } catch (err) {
      const payloadFeatures = isGuided
        ? buildGuidedFeatures()
        : features;
      setRecommendation(makeLocalRecommendation(payloadFeatures));
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

  function selectAnswer(labelText, value) {
    setMcqAnswers({
      ...mcqAnswers,
      [currentQuestion.id]: { label: labelText, value }
    });
  }

  return (
    <section className="advisor-card skill-builder">
      <p className="eyebrow">{isGuided ? "Career profiling test" : "Manual skills input"}</p>
      <h2>{isGuided ? "Complete your career profile" : "Enter your skills manually"}</h2>
      <p>{isGuided ? "Answer the timed MCQ set. Each subject score is saved and used to generate your career prediction." : "Update skill and interest levels, then generate recommendations."}</p>
      {error && <p className="error">{error}</p>}
      {isGuided ? (
        <div className="profile-test-shell">
          <aside className="profile-test-sidebar">
            <div className="profile-round">
              <span>Round 1</span>
              <strong>MCQ</strong>
              <div className="progress"><span style={{ width: `${progress}%` }} /></div>
              <small>{progress}% Completed</small>
            </div>
            <div className="profile-question-list">
              {profilingQuestions.map((item, index) => (
                <button
                  key={item.id}
                  className={`${activeQuestion === index ? "active" : ""} ${mcqAnswers[item.id] ? "answered" : ""}`}
                  onClick={() => setActiveQuestion(index)}
                >
                  <span>{index + 1}</span>
                  <div>
                    <strong>MCQ</strong>
                    <small>{profileFeatureLabels[item.feature] || item.feature}</small>
                  </div>
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
          </aside>

          <div className="profile-test-main">
            <div className="profile-test-top">
              <div>
                <strong>{answeredCount} / {profilingQuestions.length}</strong>
                <span>answered</span>
              </div>
              <label>
                GPA
                <input type="number" min="0" max="10" step="0.1" value={features.GPA} onChange={(event) => updateFeature("GPA", event.target.value)} />
              </label>
              <div className={secondsLeft < 300 ? "timer danger" : "timer"}>
                <strong>{formatDuration(secondsLeft)}</strong>
                <span>time left</span>
              </div>
            </div>

            <div className="profile-question-card">
              <span>Question {activeQuestion + 1}</span>
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
              <button disabled={activeQuestion === profilingQuestions.length - 1} onClick={() => setActiveQuestion(activeQuestion + 1)}>Next</button>
              <button className="primary" onClick={submitProfile} disabled={loading || answeredCount < profilingQuestions.length}>
                {loading ? "Predicting..." : "Generate Prediction"}
                <Sparkles size={18} />
              </button>
            </div>

            <div className="subject-score-grid">
              {subjectResults.map((group) => (
                <div className="subject-score-card" key={group.title}>
                  <small>{group.title}</small>
                  <strong>{group.score}%</strong>
                  <div><span style={{ width: `${group.score}%` }} /></div>
                </div>
              ))}
            </div>
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
      <RecommendationPanel recommendation={recommendation} />
    </section>
  );
}

function SkillInputPanel() {
  const [skills, setSkills] = useState("React, Python, SQL, Communication");
  const [saved, setSaved] = useState(false);
  const parsed = skills.split(",").map((skill) => skill.trim()).filter(Boolean);

  async function saveSkills() {
    await api("/advisor/profile", {
      method: "PUT",
      body: JSON.stringify({ skills: parsed })
    });
    setSaved(true);
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
      <button className="primary" onClick={saveSkills}>{saved ? "Skills Saved" : "Save Skills"}</button>
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

function JobFinderPanel() {
  const [data, setData] = useState({ jobs: jobMatches });

  useEffect(() => {
    api("/advisor/jobs").then(setData).catch(() => setData({ jobs: jobMatches }));
  }, []);

  return (
    <section className="advisor-card job-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Job finder</p>
          <h2>Recommended opportunities</h2>
        </div>
        <Search size={22} />
      </div>
      {data.jobs.map((job) => (
        <div className="job-row" key={job.role}>
          <div>
            <strong>{job.role}</strong>
            <small>{job.skills || job.type}</small>
          </div>
          <span>{job.fit}</span>
        </div>
      ))}
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
      <h2>Next 30 days</h2>
      {steps.map((step, index) => (
        <div className="road-step" key={step}>
          <span>{index + 1}</span>
          <p>{step}</p>
        </div>
      ))}
    </section>
  );
}

function GuidancePanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/advisor/guidance").then(setData);
  }, []);

  return (
    <section className="advisor-card roadmap-panel">
      <p className="eyebrow">Personalized guidance</p>
      <h2>{data?.career || "AI Career Suggestions"}</h2>
      {(data?.suggestions || ["Complete the test to unlock AI-based suggestions."]).map((item, index) => (
        <div className="road-step" key={item}>
          <span>{index + 1}</span>
          <p>{item}</p>
        </div>
      ))}
    </section>
  );
}

function SkillDevelopmentPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/advisor/skills").then(setData);
  }, []);

  return (
    <section className="advisor-card skill-builder">
      <p className="eyebrow">Skill development</p>
      <h2>{data?.career || "Learning Path"}</h2>
      <div className="chips">
        {(data?.recommendedSkills || ["JavaScript", "SQL", "Communication"]).map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      {(data?.learningPath || []).map((item) => (
        <div className="road-step" key={item.skill}>
          <span><BookOpen size={16} /></span>
          <p>{item.action}</p>
        </div>
      ))}
    </section>
  );
}

function MentorPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/advisor/mentor").then(setData);
  }, []);

  return (
    <section className="advisor-card roadmap-panel">
      <p className="eyebrow">Expert guidance</p>
      <h2>Mentor Support</h2>
      {(data?.mentorTips || ["Ask for resume review", "Prepare interview answers", "Discuss your roadmap"]).map((tip, index) => (
        <div className="road-step" key={tip}>
          <span>{index + 1}</span>
          <p>{tip}</p>
        </div>
      ))}
      <div className="chips">
        {(data?.chatPrompts || []).map((prompt) => <span key={prompt}>{prompt}</span>)}
      </div>
    </section>
  );
}

function ProgressPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/advisor/progress").then(setData);
  }, []);

  return (
    <section className="advisor-card roadmap-panel">
      <p className="eyebrow">Track progress</p>
      <h2>{data?.roadmapProgress || 0}% Roadmap Complete</h2>
      <div className="chips">
        {(data?.completedSkills?.length ? data.completedSkills : ["Complete skills to track progress"]).map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      {(data?.milestones || []).map((item) => (
        <div className="road-step" key={item.title}>
          <span>{item.done ? "✓" : "•"}</span>
          <p>{item.title}</p>
        </div>
      ))}
    </section>
  );
}

function ProfilePanel({ user }) {
  const [profile, setProfile] = useState(null);
  const [targetRole, setTargetRole] = useState("");

  useEffect(() => {
    api("/advisor/profile").then((data) => {
      setProfile(data.profile);
      setTargetRole(data.profile.targetRole || "");
    });
  }, []);

  async function saveProfile() {
    const data = await api("/advisor/profile", {
      method: "PUT",
      body: JSON.stringify({ targetRole })
    });
    setProfile(data.profile);
  }

  return (
    <section className="advisor-card skill-builder">
      <p className="eyebrow">User profile management</p>
      <h2>{user.name}</h2>
      <p>{user.email || user.role || "Student"}</p>
      <textarea value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Target role, interests, or career goal" />
      <button className="primary" onClick={saveProfile}>{profile ? "Save Profile" : "Create Profile"}</button>
    </section>
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
  const [results, setResults] = useState([]);
  const [activeFeature, setActiveFeature] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const latest = results[0];

  async function refresh() {
    const data = await api("/tests/results");
    setResults(data.results);
  }

  useEffect(() => {
    refresh();
  }, []);

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

        <section className="portal-content">
          <div className="primary-workspace">
            {["career-profile", "manual-profile", "resume"].includes(activeFeature) && (
              <button className="explore-btn" onClick={() => setActiveFeature("dashboard")}>
                <ArrowRight size={18} /> Back to options
              </button>
            )}
            {activeFeature === "aptitude" && <TestPanel onSaved={(result) => {
              setResults([result, ...results]);
              setActiveFeature("profile");
            }} />}
            {activeFeature === "career-profile" && <CareerProfileForm mode="guided" onSaved={(result) => setResults([result, ...results])} />}
            {activeFeature === "manual-profile" && <CareerProfileForm mode="manual" onSaved={(result) => setResults([result, ...results])} />}
            {activeFeature === "coding" && <CodingPracticePanel />}
            {activeFeature === "skills" && <SkillInputPanel />}
            {activeFeature === "resume" && <ResumePanel />}
            {activeFeature === "jobs" && <JobFinderPanel />}
            {activeFeature === "courses" && <RoadmapPanel />}
            {activeFeature === "guidance" && <GuidancePanel />}
            {activeFeature === "development" && <SkillDevelopmentPanel />}
            {activeFeature === "mentor" && <MentorPanel />}
            {activeFeature === "progress" && <ProgressPanel />}
            {activeFeature === "profile" && <ProfilePanel user={user} />}
            <div className="history premium-history">
              <h3>Stored Results</h3>
              {results.length === 0 && <p>Results will appear here after your first test.</p>}
              {results.map((result) => (
                <button className="history-item" key={result._id}>
                  <span>{result.recommendation?.career}</span>
                  <small>{new Date(result.createdAt).toLocaleString()}</small>
                </button>
              ))}
            </div>
          </div>
          <aside className="insight-rail">
            <ResultPanel result={latest} />
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
        </section>
      </section>
    </main>
  );
}
export default Dashboard;

