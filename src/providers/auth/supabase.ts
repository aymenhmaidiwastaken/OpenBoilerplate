import type { AuthProvider, AuthUser, AuthSession } from "./types";

/**
 * Supabase Auth provider implementation using the Supabase REST API.
 *
 * Requirements:
 *   No additional SDK required -- this implementation uses fetch against
 *   the Supabase GoTrue (auth) REST endpoints.
 *
 * Environment variables (via import.meta.env):
 *   SUPABASE_URL            e.g. https://xyzproject.supabase.co
 *   SUPABASE_ANON_KEY       public anon key
 *   SUPABASE_SERVICE_KEY    service-role key (for admin operations)
 *   GOOGLE_CLIENT_ID        (for Google OAuth redirect URL)
 *   GOOGLE_REDIRECT_URI
 */

const SUPABASE_URL = import.meta.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY || "";
const GOOGLE_REDIRECT_URI = import.meta.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

const AUTH_URL = `${SUPABASE_URL}/auth/v1`;
const REST_URL = `${SUPABASE_URL}/rest/v1`;

interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
  email_confirmed_at: string | null;
  created_at: string;
}

interface SupabaseSession {
  access_token: string;
  expires_at: number;
  user: SupabaseUser;
}

function headers(token?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function adminHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  };
}

function supabaseUserToAuthUser(sbUser: SupabaseUser): AuthUser {
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: meta.name || meta.full_name,
    avatar: meta.avatar_url,
    role: (meta.role as "user" | "admin") || "user",
    emailVerified: sbUser.email_confirmed_at !== null,
    createdAt: new Date(sbUser.created_at),
  };
}

function toAuthSession(session: SupabaseSession): AuthSession {
  return {
    user: supabaseUserToAuthUser(session.user),
    token: session.access_token,
    expiresAt: new Date(session.expires_at * 1000),
  };
}

async function supabaseFetch<T>(
  url: string,
  options: RequestInit,
): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase request failed (${res.status}): ${body}`);
  }

  return res.json() as Promise<T>;
}

export class SupabaseAuthProvider implements AuthProvider {
  async signUp(email: string, password: string, name?: string): Promise<AuthSession> {
    const data = await supabaseFetch<SupabaseSession>(`${AUTH_URL}/signup`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        email,
        password,
        data: { name, role: "user" },
      }),
    });

    return toAuthSession(data);
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const data = await supabaseFetch<SupabaseSession>(
      `${AUTH_URL}/token?grant_type=password`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email, password }),
      },
    );

    return toAuthSession(data);
  }

  async signOut(token: string): Promise<void> {
    await fetch(`${AUTH_URL}/logout`, {
      method: "POST",
      headers: headers(token),
    });
  }

  async verifySession(token: string): Promise<AuthUser | null> {
    try {
      const data = await supabaseFetch<SupabaseUser>(`${AUTH_URL}/user`, {
        method: "GET",
        headers: headers(token),
      });

      return supabaseUserToAuthUser(data);
    } catch {
      return null;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await supabaseFetch(`${AUTH_URL}/recover`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Supabase password reset flow: the user clicks the reset link which
    // includes an access_token. We use that token to update the password.
    await supabaseFetch(`${AUTH_URL}/user`, {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify({ password: newPassword }),
    });
  }

  getGoogleAuthUrl(): string {
    const params = new URLSearchParams({
      provider: "google",
      redirect_to: GOOGLE_REDIRECT_URI,
    });

    return `${SUPABASE_URL}/auth/v1/authorize?${params.toString()}`;
  }

  async handleGoogleCallback(code: string): Promise<AuthSession> {
    // After the Supabase-managed OAuth flow, the callback includes
    // an authorization code that can be exchanged for a session.
    const data = await supabaseFetch<SupabaseSession>(
      `${AUTH_URL}/token?grant_type=pkce`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          auth_code: code,
          code_verifier: "", // In production, store and retrieve the PKCE verifier
        }),
      },
    );

    return toAuthSession(data);
  }

  async getUser(id: string): Promise<AuthUser | null> {
    try {
      const data = await supabaseFetch<SupabaseUser>(
        `${AUTH_URL}/admin/users/${id}`,
        {
          method: "GET",
          headers: adminHeaders(),
        },
      );

      return supabaseUserToAuthUser(data);
    } catch {
      return null;
    }
  }

  async updateUser(
    id: string,
    data: Partial<Pick<AuthUser, "name" | "avatar">>,
  ): Promise<AuthUser> {
    const userMetadata: Record<string, string> = {};
    if (data.name !== undefined) userMetadata.name = data.name;
    if (data.avatar !== undefined) userMetadata.avatar_url = data.avatar;

    const updated = await supabaseFetch<SupabaseUser>(
      `${AUTH_URL}/admin/users/${id}`,
      {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({ user_metadata: userMetadata }),
      },
    );

    return supabaseUserToAuthUser(updated);
  }
}
