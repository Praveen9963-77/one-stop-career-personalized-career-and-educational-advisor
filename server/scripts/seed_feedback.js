import dotenv from "dotenv";
import { connectDb } from "../src/config/db.js";
import User from "../src/models/User.js";
import RecommendationFeedback from "../src/models/RecommendationFeedback.js";
import CareerAnalytics from "../src/models/CareerAnalytics.js";

dotenv.config();

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/career_advisor";
  await connectDb(uri);

  // Create dummy users (if not exist)
  const dummyEmails = [
    "seed.user1@example.com",
    "seed.user2@example.com",
    "seed.user3@example.com",
    "seed.user4@example.com",
    "seed.user5@example.com"
  ];

  const users = [];
  for (let i = 0; i < dummyEmails.length; i++) {
    const email = dummyEmails[i];
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: `Seed User ${i + 1}`, email, passwordHash: "" });
    }
    users.push(user);
  }

  const careers = [
    "Software Engineer",
    "Full Stack Developer",
    "Data Analyst",
    "Data Scientist",
    "AI Engineer",
    "Cloud Engineer",
    "Cybersecurity Analyst",
    "Backend Developer",
    "Machine Learning Engineer",
    "Business Analyst"
  ];

  const outcomes = ["Got Job", "Got Internship", "Still Learning", "Not Interested"];

  const sampleFeedbackNotes = [
    "Great roadmap and practical projects helped me get interviews.",
    "Needed more SQL and data visualization practice.",
    "The learning plan was useful but time consuming.",
    "Got an internship due to the suggested project.",
    "Still building projects; roadmap is clear." 
  ];

  const entries = [];
  const total = 12;
  for (let i = 0; i < total; i++) {
    const user = users[i % users.length];
    const selectedCareer = careers[i % careers.length];
    const recommendedCareers = [
      { career: selectedCareer, confidence: Math.round(50 + Math.random() * 50) }
    ];

    const feedback = {
      user: user._id,
      testResult: null,
      userFeatures: {},
      recommendedCareers,
      selectedCareer,
      outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
      roleTitle: `${selectedCareer} (Entry)`,
      timeTakenMonths: Math.floor(Math.random() * 12) + 1,
      feedbackNotes: sampleFeedbackNotes[i % sampleFeedbackNotes.length]
    };

    entries.push(feedback);
  }

  // Insert feedbacks
  const created = await RecommendationFeedback.insertMany(entries);
  console.log(`Inserted ${created.length} recommendation feedback entries.`);

  // Recompute CareerAnalytics from feedback
  const aggregation = await RecommendationFeedback.aggregate([
    {
      $group: {
        _id: "$selectedCareer",
        totalUsers: { $sum: 1 },
        gotJob: { $sum: { $cond: [{ $eq: ["$outcome", "Got Job"] }, 1, 0] } },
        gotIntern: { $sum: { $cond: [{ $eq: ["$outcome", "Got Internship"] }, 1, 0] } },
        stillLearning: { $sum: { $cond: [{ $eq: ["$outcome", "Still Learning"] }, 1, 0] } },
        notInterested: { $sum: { $cond: [{ $eq: ["$outcome", "Not Interested"] }, 1, 0] } },
        totalTime: { $sum: { $ifNull: ["$timeTakenMonths", 0] } }
      }
    }
  ]);

  for (const row of aggregation) {
    const career = row._id;
    const totalUsers = row.totalUsers || 0;
    const jobCount = row.gotJob || 0;
    const internshipCount = row.gotIntern || 0;
    const stillLearningCount = row.stillLearning || 0;
    const notInterestedCount = row.notInterested || 0;
    const totalTimeMonths = row.totalTime || 0;

    const successCount = jobCount + internshipCount;
    const successRate = totalUsers ? Math.round((successCount / totalUsers) * 100) : 0;
    const averageTimeTakenMonths = totalUsers ? Math.round(totalTimeMonths / totalUsers) : 0;

    await CareerAnalytics.updateOne(
      { career },
      {
        career,
        totalUsers,
        successCount,
        internshipCount,
        jobCount,
        stillLearningCount,
        notInterestedCount,
        averageTimeTakenMonths,
        totalTimeMonths,
        successRate,
        mostCommonOutcome: jobCount >= internshipCount ? "Job" : "Internship"
      },
      { upsert: true }
    );
  }

  console.log("Career analytics updated from seeded feedback.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
