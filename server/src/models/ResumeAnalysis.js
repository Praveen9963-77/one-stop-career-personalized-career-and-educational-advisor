import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeText: { type: String, required: true },
    analysis: {
      matchedCareer: String,
      matchScore: Number,
      extractedSkills: [String],
      keywords: [String],
      missingSkills: [String],
      summary: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("ResumeAnalysis", resumeAnalysisSchema);

