import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

async function findOrCreateOAuthUser({ provider, providerId, email, name, avatarUrl }) {
  const providerField = provider === "google" ? "googleId" : "githubId";
  let user = await User.findOne({ [providerField]: providerId });

  if (!user && email) {
    user = await User.findOne({ email });
  }

  if (!user) {
    user = await User.create({
      name,
      email,
      [providerField]: providerId,
      avatarUrl,
      authProviders: [provider]
    });
    return user;
  }

  user[providerField] = providerId;
  user.avatarUrl = user.avatarUrl || avatarUrl;
  if (!user.authProviders?.includes(provider)) {
    user.authProviders = [...(user.authProviders || []), provider];
  }
  await user.save();
  return user;
}

export function configurePassport() {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/api/auth/google/callback"
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const user = await findOrCreateOAuthUser({
              provider: "google",
              providerId: profile.id,
              email,
              name: profile.displayName || email?.split("@")[0] || "Google User",
              avatarUrl: profile.photos?.[0]?.value
            });
            done(null, user);
          } catch (error) {
            done(error);
          }
        }
      )
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5001/api/auth/github/callback"
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
            const user = await findOrCreateOAuthUser({
              provider: "github",
              providerId: profile.id,
              email,
              name: profile.displayName || profile.username || "GitHub User",
              avatarUrl: profile.photos?.[0]?.value
            });
            done(null, user);
          } catch (error) {
            done(error);
          }
        }
      )
    );
  }
}
