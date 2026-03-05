import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { AuthProvider, AuthUser, AuthSession } from "./types";
import { getDatabaseProvider } from "@/providers/database";
import { getEmailProvider } from "@/providers/email";
import type { UserRecord } from "@/providers/database/types";

const JWT_SECRET = import.meta.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = import.meta.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = 12;

const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = import.meta.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = import.meta.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

const APP_URL = import.meta.env.APP_URL || "http://localhost:3000";

/**
 * In-memory stores for tokens. In production, these should be backed by
 * a persistent store (Redis, database table, etc.).
 */
const revokedTokens = new Set<string>();
const resetTokens = new Map<string, { userId: string; expiresAt: Date }>();

function userRecordToAuthUser(record: UserRecord): AuthUser {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    avatar: record.avatar,
    role: record.role,
    emailVerified: record.emailVerified,
    createdAt: record.createdAt,
  };
}

function createSession(user: AuthUser): AuthSession {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  return { user, token, expiresAt };
}

export class CustomAuthProvider implements AuthProvider {
  async signUp(email: string, password: string, name?: string): Promise<AuthSession> {
    const db = await getDatabaseProvider();
    const emailProvider = await getEmailProvider();

    const existing = await db.getUserByEmail(email);
    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const record = await db.createUser({
      email,
      passwordHash,
      name,
      role: "user",
      emailVerified: false,
    });

    const user = userRecordToAuthUser(record);

    // Send welcome email (fire-and-forget)
    emailProvider.sendWelcome(email, name || email).catch(() => {});

    return createSession(user);
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const db = await getDatabaseProvider();

    const record = await db.getUserByEmail(email);
    if (!record || !record.passwordHash) {
      throw new Error("Invalid email or password.");
    }

    const valid = await bcrypt.compare(password, record.passwordHash);
    if (!valid) {
      throw new Error("Invalid email or password.");
    }

    const user = userRecordToAuthUser(record);
    return createSession(user);
  }

  async signOut(token: string): Promise<void> {
    revokedTokens.add(token);
  }

  async verifySession(token: string): Promise<AuthUser | null> {
    if (revokedTokens.has(token)) {
      return null;
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      if (!payload.sub) return null;

      const db = await getDatabaseProvider();
      const record = await db.getUserById(payload.sub);
      if (!record) return null;

      return userRecordToAuthUser(record);
    } catch {
      return null;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const db = await getDatabaseProvider();
    const emailProvider = await getEmailProvider();

    const record = await db.getUserByEmail(email);
    if (!record) {
      // Return silently to prevent email enumeration
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    resetTokens.set(resetToken, { userId: record.id, expiresAt });

    const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;
    await emailProvider.sendPasswordReset(email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const entry = resetTokens.get(token);
    if (!entry || entry.expiresAt < new Date()) {
      throw new Error("Invalid or expired reset token.");
    }

    const db = await getDatabaseProvider();
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await db.updateUser(entry.userId, { passwordHash });
    resetTokens.delete(token);
  }

  getGoogleAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleGoogleCallback(code: string): Promise<AuthSession> {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange Google authorization code.");
    }

    const tokenData = (await tokenResponse.json()) as { id_token: string };

    // Fetch user info from Google
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${tokenData.id_token}`,
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to retrieve Google user info.");
    }

    const googleUser = (await userInfoResponse.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified?: string;
    };

    const db = await getDatabaseProvider();
    const emailProvider = await getEmailProvider();

    let record = await db.getUserByEmail(googleUser.email);

    if (!record) {
      // Create a new user from Google profile
      record = await db.createUser({
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
        role: "user",
        emailVerified: googleUser.email_verified === "true",
      });

      emailProvider.sendWelcome(googleUser.email, googleUser.name || googleUser.email).catch(() => {});
    } else {
      // Update existing user with latest Google profile data
      record = await db.updateUser(record.id, {
        name: record.name || googleUser.name,
        avatar: record.avatar || googleUser.picture,
        emailVerified: true,
      });
    }

    const user = userRecordToAuthUser(record);
    return createSession(user);
  }

  async getUser(id: string): Promise<AuthUser | null> {
    const db = await getDatabaseProvider();
    const record = await db.getUserById(id);
    if (!record) return null;
    return userRecordToAuthUser(record);
  }

  async updateUser(
    id: string,
    data: Partial<Pick<AuthUser, "name" | "avatar">>,
  ): Promise<AuthUser> {
    const db = await getDatabaseProvider();
    const record = await db.updateUser(id, data);
    return userRecordToAuthUser(record);
  }
}
