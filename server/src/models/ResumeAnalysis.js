import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeText: { type: String, required: true },
    targetRole: String,
    resumeFileName: String,
    resumeFileType: String,
    resumeFilePath: String,
    analysis: {
      matchedCareer: String,
      targetRole: String,
      resumeScore: Number,
      atsScore: Number,
      extractedSkills: [String],
      skills: [String],
      skillCategories: [String],
      keywords: [String],
      missingSkills: [String],
      matchedSkills: [String],
      weakSkills: [String],
      roleRequiredSkills: [String],
      education: {
        degree: String,
        branch: String,
        institution: String,
        cgpa: String,
        graduationYear: String,
        lines: [String]
      },
      experience: {
        roles: [String],
        companies: [String],
        duration: [String],
        totalYears: Number,
        lines: [String]
      },
      projects: [
        {
          title: String,
          description: String,
          technologies: [String]
        }
      ],
      certifications: [String],
      keywordDensity: Number,
      sectionScores: {
        skills: Number,
        education: Number,
        experience: Number,
        projects: Number,
        keywords: Number,
        certifications: Number,
        structure: Number
      },
      resumeBreakdown: {
        skills: Number,
        projects: Number,
        experience: Number,
        education: Number,
        certifications: Number,
        structure: Number
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
      jobMatches: [
        {
          title: String,
          company: String,
          location: String,
          type: String,
          matchPercent: Number,
          matchingSkills: [String],
          missingSkills: [String]
        }
      ],
      similarUsers: [
        {
          profileId: String,
          career: String,
          similarity: Number,
          matchedSkills: [String]
        }
      ],
      careerRecommendations: [
        {
          career: String,
          score: Number,
          confidence: Number,
          explanation: String
        }
      ],
      aiFeedback: [String],
      summary: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
