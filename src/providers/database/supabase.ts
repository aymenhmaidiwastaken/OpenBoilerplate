import type {
  DatabaseProvider,
  UserRecord,
  UsageRecord,
} from "./types";
import type { Subscription } from "../payment/types";

/**
 * Supabase-backed DatabaseProvider.
 *
 * Communicates with a Supabase project via the PostgREST-compatible REST API
 * using plain `fetch`. No Supabase JS SDK is required.
 */
export class SupabaseDatabaseProvider implements DatabaseProvider {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.SUPABASE_URL;
    this.apiKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!this.baseUrl || !this.apiKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Internal fetch helper
  // ---------------------------------------------------------------------------

  private async request<T>(
    path: string,
    opts: {
      method?: string;
      body?: unknown;
      headers?: Record<string, string>;
      single?: boolean;
    } = {},
  ): Promise<T> {
    const { method = "GET", body, headers = {}, single = false } = opts;

    const res = await fetch(`${this.baseUrl}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: this.apiKey,
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Prefer: single
          ? "return=representation,count=exact"
          : "return=representation",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase API error ${res.status}: ${text}`);
    }

    const json = await res.json();
    return single && Array.isArray(json) ? json[0] : json;
  }

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------

  async createUser(
    data: Omit<UserRecord, "id" | "createdAt" | "updatedAt" | "credits">,
  ): Promise<UserRecord> {
    return this.request<UserRecord>("users", {
      method: "POST",
      body: {
        email: data.email,
        name: data.name ?? null,
        avatar: data.avatar ?? null,
        role: data.role,
        password_hash: data.passwordHash ?? null,
        email_verified: data.emailVerified,
      },
      single: true,
    }).then(this.mapUserFromApi);
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    const rows = await this.request<UserRecord[]>(
      `users?id=eq.${id}&limit=1`,
    );
    return rows.length ? this.mapUserFromApi(rows[0]) : null;
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const rows = await this.request<UserRecord[]>(
      `users?email=eq.${encodeURIComponent(email)}&limit=1`,
    );
    return rows.length ? this.mapUserFromApi(rows[0]) : null;
  }

  async updateUser(
    id: string,
    data: Partial<UserRecord>,
  ): Promise<UserRecord> {
    const body: Record<string, unknown> = {};
    if (data.email !== undefined) body.email = data.email;
    if (data.name !== undefined) body.name = data.name;
    if (data.avatar !== undefined) body.avatar = data.avatar;
    if (data.role !== undefined) body.role = data.role;
    if (data.passwordHash !== undefined)
      body.password_hash = data.passwordHash;
    if (data.emailVerified !== undefined)
      body.email_verified = data.emailVerified;
    if (data.credits !== undefined) body.credits = data.credits;
    body.updated_at = new Date().toISOString();

    return this.request<UserRecord>(`users?id=eq.${id}`, {
      method: "PATCH",
      body,
      single: true,
    }).then(this.mapUserFromApi);
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`users?id=eq.${id}`, { method: "DELETE" });
  }

  async listUsers(
    opts: { limit?: number; offset?: number; search?: string } = {},
  ): Promise<{ users: UserRecord[]; total: number }> {
    const { limit = 50, offset = 0, search } = opts;
    let path = `users?order=created_at.desc&limit=${limit}&offset=${offset}`;
    if (search) {
      path += `&or=(email.ilike.*${encodeURIComponent(search)}*,name.ilike.*${encodeURIComponent(search)}*)`;
    }

    const res = await fetch(`${this.baseUrl}/rest/v1/${path}`, {
      headers: {
        apikey: this.apiKey,
        Authorization: `Bearer ${this.apiKey}`,
        Prefer: "count=exact",
      },
    });

    const total = parseInt(
      res.headers.get("content-range")?.split("/")[1] ?? "0",
      10,
    );
    const rows: UserRecord[] = await res.json();

    return {
      users: rows.map(this.mapUserFromApi),
      total,
    };
  }

  // ---------------------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------------------

  async upsertSubscription(data: Subscription): Promise<Subscription> {
    return this.request<Subscription>("subscriptions", {
      method: "POST",
      body: {
        id: data.id,
        user_id: data.userId,
        plan_id: data.planId,
        status: data.status,
        current_period_start: data.currentPeriodStart.toISOString(),
        current_period_end: data.currentPeriodEnd.toISOString(),
        cancel_at_period_end: data.cancelAtPeriodEnd,
        external_id: data.externalId,
      },
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      single: true,
    }).then(this.mapSubscriptionFromApi);
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    const rows = await this.request<Subscription[]>(
      `subscriptions?user_id=eq.${userId}&limit=1`,
    );
    return rows.length ? this.mapSubscriptionFromApi(rows[0]) : null;
  }

  // ---------------------------------------------------------------------------
  // Usage / Credits
  // ---------------------------------------------------------------------------

  async addUsage(
    data: Omit<UsageRecord, "id" | "createdAt">,
  ): Promise<UsageRecord> {
    const record = await this.request<UsageRecord>("usage", {
      method: "POST",
      body: {
        user_id: data.userId,
        type: data.type,
        credits: data.credits,
        metadata: data.metadata ?? null,
      },
      single: true,
    }).then(this.mapUsageFromApi);

    // Deduct credits via RPC or direct update
    await this.request("rpc/update_credits", {
      method: "POST",
      body: { p_user_id: data.userId, p_delta: -data.credits },
    });

    return record;
  }

  async getUsage(
    userId: string,
    opts: { from?: Date; to?: Date; limit?: number } = {},
  ): Promise<UsageRecord[]> {
    const { from, to, limit = 100 } = opts;
    let path = `usage?user_id=eq.${userId}&order=created_at.desc&limit=${limit}`;
    if (from) path += `&created_at=gte.${from.toISOString()}`;
    if (to) path += `&created_at=lte.${to.toISOString()}`;

    const rows = await this.request<UsageRecord[]>(path);
    return rows.map(this.mapUsageFromApi);
  }

  async updateCredits(userId: string, delta: number): Promise<number> {
    const result = await this.request<{ credits: number }>(
      "rpc/update_credits",
      {
        method: "POST",
        body: { p_user_id: userId, p_delta: delta },
      },
    );
    return result.credits;
  }

  async getCredits(userId: string): Promise<number> {
    const rows = await this.request<{ credits: number }[]>(
      `users?id=eq.${userId}&select=credits&limit=1`,
    );
    if (!rows.length) throw new Error(`User ${userId} not found`);
    return rows[0].credits;
  }

  // ---------------------------------------------------------------------------
  // Admin stats (stub — assumes an RPC or view exists)
  // ---------------------------------------------------------------------------

  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    mrr: number;
  }> {
    const [usersRes, activeRes] = await Promise.all([
      fetch(`${this.baseUrl}/rest/v1/users?select=id&limit=0`, {
        headers: {
          apikey: this.apiKey,
          Authorization: `Bearer ${this.apiKey}`,
          Prefer: "count=exact",
        },
      }),
      fetch(
        `${this.baseUrl}/rest/v1/subscriptions?status=eq.active&select=id&limit=0`,
        {
          headers: {
            apikey: this.apiKey,
            Authorization: `Bearer ${this.apiKey}`,
            Prefer: "count=exact",
          },
        },
      ),
    ]);

    const totalUsers = parseInt(
      usersRes.headers.get("content-range")?.split("/")[1] ?? "0",
      10,
    );
    const activeUsers = parseInt(
      activeRes.headers.get("content-range")?.split("/")[1] ?? "0",
      10,
    );

    return {
      totalUsers,
      activeUsers,
      totalRevenue: 0, // Requires server-side RPC
      mrr: 0, // Requires server-side RPC
    };
  }

  // ---------------------------------------------------------------------------
  // Mappers (snake_case API -> camelCase types)
  // ---------------------------------------------------------------------------

  private mapUserFromApi = (row: any): UserRecord => ({
    id: row.id,
    email: row.email,
    name: row.name ?? undefined,
    avatar: row.avatar ?? undefined,
    role: row.role,
    passwordHash: row.password_hash ?? undefined,
    emailVerified: row.email_verified,
    credits: row.credits,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  private mapSubscriptionFromApi = (row: any): Subscription => ({
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    currentPeriodStart: new Date(row.current_period_start),
    currentPeriodEnd: new Date(row.current_period_end),
    cancelAtPeriodEnd: row.cancel_at_period_end,
    externalId: row.external_id,
  });

  private mapUsageFromApi = (row: any): UsageRecord => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    credits: row.credits,
    metadata: row.metadata ?? undefined,
    createdAt: new Date(row.created_at),
  });
}
