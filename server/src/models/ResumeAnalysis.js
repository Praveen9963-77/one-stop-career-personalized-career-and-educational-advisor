import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeText: { type: String, required: true },
    targetRole: String,
    analysis: {
      matchedCareer: String,
      targetRole: String,
      matchScore: Number,
      atsScore: Number,
      extractedSkills: [String],
      keywords: [String],
      missingSkills: [String],
      matchedSkills: [String],
      weakSkills: [String],
      roleRequiredSkills: [String],
      education: [String],
      experience: [String],
      projects: [String],
      keywordDensity: Number,
      sectionScores: {
        skills: Number,
        education: Number,
        experience: Number,
        projects: Number,
        keywords: Number
      },
      suggestions: [String],
      learningPlan: [String],
      learningResources: [
        {
          skill: String,
          youtube: String,
          certifications: [
            {
              title: String,
              url: String
            }
          ]
        }
      ],
      summary: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
