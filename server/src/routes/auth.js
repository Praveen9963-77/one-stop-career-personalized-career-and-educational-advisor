import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();
const clientUrl = process.env.CLIENT_URL || "http://127.0.0.1:5174";

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl };
}

function redirectWithToken(res, user) {
  const token = signToken(user);
  const encodedUser = encodeURIComponent(JSON.stringify(publicUser(user)));
  res.redirect(`${clientUrl}/?token=${token}&user=${encodedUser}`);
}

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "An account already exists for this email" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role, authProviders: ["password"] });

  res.status(201).json({
    token: signToken(user),
    user: publicUser(user)
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    token: signToken(user),
    user: publicUser(user)
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user: publicUser(user) });
});

router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ message: "Google OAuth is not configured" });
  }
  passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${clientUrl}/?oauth=failed` }),
  (req, res) => redirectWithToken(res, req.user)
);

router.get("/github", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.status(503).json({ message: "GitHub OAuth is not configured" });
  }
  passport.authenticate("github", { scope: ["user:email"], session: false })(req, res, next);
});

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: `${clientUrl}/?oauth=failed` }),
  (req, res) => redirectWithToken(res, req.user)
);

export default router;
