import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    educationLevel: { type: String, default: "Student" },
    interests: [{ type: String }],
    skills: [{ type: String }],
    targetRole: String,
    completedSkills: [{ type: String }],
    roadmapProgress: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("UserProfile", userProfileSchema);

