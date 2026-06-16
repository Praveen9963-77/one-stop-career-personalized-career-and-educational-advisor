import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testResult: { type: mongoose.Schema.Types.ObjectId, ref: "TestResult" },
    userFeatures: { type: Map, of: Number },
    recommendedCareers: [
      {
        career: String,
        confidence: Number
      }
    ],
    selectedCareer: String,
    outcome: {
      type: String,
      enum: ["Got Job", "Got Internship", "Still Learning", "Not Interested"],
      required: true
    },
    roleTitle: String,
    timeTakenMonths: Number,
    feedbackNotes: String
  },
  { timestamps: true }
);

export default mongoose.model("RecommendationFeedback", feedbackSchema);
