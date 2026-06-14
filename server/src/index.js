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

function listenOnPort(portToTry) {
  return new Promise((resolve, reject) => {
    const server = app.listen(portToTry, () => resolve(server));
    server.once("error", reject);
  });
}

connectDb(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/career_advisor")
  .then(async () => {
    let currentPort = Number(process.env.PORT) || 5000;
    const maxPort = currentPort + 10;
    let server;

    while (currentPort <= maxPort) {
      try {
        server = await listenOnPort(currentPort);
        console.log(`API running on http://localhost:${currentPort}`);
        break;
      } catch (error) {
        if (error.code === "EADDRINUSE") {
          console.warn(`Port ${currentPort} is already in use. Trying port ${currentPort + 1}...`);
          currentPort += 1;
        } else {
          console.error("Server error", error);
          process.exit(1);
        }
      }
    }

    if (!server) {
      console.error(`Unable to bind to ports ${port} through ${maxPort}.`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Failed to start API", error);
    process.exit(1);
  });
