import mongoose from "mongoose";

const careerAnalyticsSchema = new mongoose.Schema(
  {
    career: { type: String, required: true, unique: true },
    totalUsers: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 }, // Job + Internship
    internshipCount: { type: Number, default: 0 },
    jobCount: { type: Number, default: 0 },
    stillLearningCount: { type: Number, default: 0 },
    notInterestedCount: { type: Number, default: 0 },
    averageTimeTakenMonths: { type: Number, default: 0 },
    totalTimeMonths: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }, // Percentage
    mostCommonOutcome: { type: String, default: "" },
    feedback: [
      {
        feedbackId: mongoose.Schema.Types.ObjectId,
        outcome: String,
        timeTakenMonths: Number,
        roleTitle: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("CareerAnalytics", careerAnalyticsSchema);
