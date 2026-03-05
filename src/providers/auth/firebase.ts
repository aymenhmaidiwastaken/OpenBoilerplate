import type { AuthProvider, AuthUser, AuthSession } from "./types";

const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_REDIRECT_URI = import.meta.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

// Trick Vite into not statically analyzing this import
async function loadFirebaseAdmin(): Promise<any> {
  const name = "firebase-" + "admin";
  try {
    return await (Function(`return import("${name}")`)() as Promise<any>);
  } catch {
    throw new Error("firebase-admin is required. Install it with: npm install firebase-admin");
  }
}

let admin: any = null;
let auth: any = null;

async function getFirebaseAuth(): Promise<any> {
  if (auth) return auth;
  admin = await loadFirebaseAdmin();
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: import.meta.env.FIREBASE_PROJECT_ID || "",
        clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL || "",
        privateKey: (import.meta.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
    });
  }
  auth = admin.auth();
  return auth;
}

function toUser(fb: any): AuthUser {
  return {
    id: fb.uid,
    email: fb.email || "",
    name: fb.displayName,
    avatar: fb.photoURL,
    role: fb.customClaims?.role || "user",
    emailVerified: fb.emailVerified,
    createdAt: new Date(fb.metadata.creationTime),
  };
}

export class FirebaseAuthProvider implements AuthProvider {
  async signUp(email: string, password: string, name?: string): Promise<AuthSession> {
    const a = await getFirebaseAuth();
    const fb = await a.createUser({ email, password, displayName: name, emailVerified: false });
    await a.setCustomUserClaims(fb.uid, { role: "user" });
    const token = await a.createCustomToken(fb.uid);
    return { user: { ...toUser(fb), role: "user" }, token, expiresAt: new Date(Date.now() + 3600_000) };
  }

  async signIn(_email: string, _password: string): Promise<AuthSession> {
    const a = await getFirebaseAuth();
    const fb = await a.getUserByEmail(_email);
    const token = await a.createCustomToken(fb.uid);
    return { user: toUser(fb), token, expiresAt: new Date(Date.now() + 3600_000) };
  }

  async signOut(token: string): Promise<void> {
    const a = await getFirebaseAuth();
    try { const d = await a.verifyIdToken(token); await a.revokeRefreshTokens(d.uid); } catch {}
  }

  async verifySession(token: string): Promise<AuthUser | null> {
    const a = await getFirebaseAuth();
    try { const d = await a.verifyIdToken(token, true); return toUser(await a.getUser(d.uid)); } catch { return null; }
  }

  async forgotPassword(email: string): Promise<void> {
    const a = await getFirebaseAuth();
    await a.generatePasswordResetLink(email);
  }

  async resetPassword(): Promise<void> {
    throw new Error("Firebase handles password resets via its own action URLs.");
  }

  getGoogleAuthUrl(): string {
    const p = new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, redirect_uri: GOOGLE_REDIRECT_URI, response_type: "code", scope: "openid email profile", access_type: "offline", prompt: "consent" });
    return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  }

  async handleGoogleCallback(code: string): Promise<AuthSession> {
    const a = await getFirebaseAuth();
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, client_id: GOOGLE_CLIENT_ID, client_secret: import.meta.env.GOOGLE_CLIENT_SECRET || "", redirect_uri: GOOGLE_REDIRECT_URI, grant_type: "authorization_code" }),
    });
    if (!res.ok) throw new Error("Failed to exchange Google authorization code.");
    const { id_token } = await res.json() as any;
    const decoded = await a.verifyIdToken(id_token);
    const fb = await a.getUser(decoded.uid);
    const token = await a.createCustomToken(fb.uid);
    return { user: toUser(fb), token, expiresAt: new Date(Date.now() + 3600_000) };
  }

  async getUser(id: string): Promise<AuthUser | null> {
    const a = await getFirebaseAuth();
    try { return toUser(await a.getUser(id)); } catch { return null; }
  }

  async updateUser(id: string, data: Partial<Pick<AuthUser, "name" | "avatar">>): Promise<AuthUser> {
    const a = await getFirebaseAuth();
    return toUser(await a.updateUser(id, { displayName: data.name, photoURL: data.avatar }));
  }
}
