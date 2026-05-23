import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["student", "job-seeker"], default: "student" },
    googleId: { type: String, sparse: true },
    githubId: { type: String, sparse: true },
    avatarUrl: String,
    authProviders: [{ type: String, enum: ["password", "google", "github"] }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
