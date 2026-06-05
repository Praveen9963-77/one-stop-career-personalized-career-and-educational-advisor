import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import passport from "passport";
import { connectDb } from "./config/db.js";
import { configurePassport } from "./config/passport.js";
import advisorRoutes from "./routes/advisor.js";
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resumes.js";
import testRoutes from "./routes/tests.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

configurePassport();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174"
    ],
    credentials: true
  })
);
app.use(express.json());
app.use(passport.initialize());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "one-stop-personalized-career-and-educational-advisor-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/advisor", advisorRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/tests", testRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

connectDb(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/career_advisor")
  .then(() => {
    app.listen(port, () => console.log(`API running on http://localhost:${port}`));
  })
  .catch((error) => {
    console.error("Failed to start API", error);
    process.exit(1);
  });
