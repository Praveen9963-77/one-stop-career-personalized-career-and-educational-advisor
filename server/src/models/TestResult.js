import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    career: String,
    confidence: Number,
    educationPath: [String],
    skillsToBuild: [String],
    explanation: String
  },
  { _id: false }
);

const testResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: Map, of: Number, required: true },
    scores: { type: Map, of: Number, required: true },
    recommendation: recommendationSchema
  },
  { timestamps: true }
);

export default mongoose.model("TestResult", testResultSchema);

