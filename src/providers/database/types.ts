import type { AuthUser } from "../auth/types";
import type { Subscription } from "../payment/types";

export interface UserRecord {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: "user" | "admin";
  passwordHash?: string;
  emailVerified: boolean;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageRecord {
  id: string;
  userId: string;
  type: "ai-text" | "ai-image" | "ai-document";
  credits: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseProvider {
  // Users
  createUser(data: Omit<UserRecord, "id" | "createdAt" | "updatedAt" | "credits">): Promise<UserRecord>;
  getUserById(id: string): Promise<UserRecord | null>;
  getUserByEmail(email: string): Promise<UserRecord | null>;
  updateUser(id: string, data: Partial<UserRecord>): Promise<UserRecord>;
  deleteUser(id: string): Promise<void>;
  listUsers(opts?: { limit?: number; offset?: number; search?: string }): Promise<{ users: UserRecord[]; total: number }>;

  // Subscriptions
  upsertSubscription(data: Subscription): Promise<Subscription>;
  getSubscription(userId: string): Promise<Subscription | null>;

  // Usage / Credits
  addUsage(data: Omit<UsageRecord, "id" | "createdAt">): Promise<UsageRecord>;
  getUsage(userId: string, opts?: { from?: Date; to?: Date; limit?: number }): Promise<UsageRecord[]>;
  updateCredits(userId: string, delta: number): Promise<number>;
  getCredits(userId: string): Promise<number>;

  // Admin stats
  getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    mrr: number;
  }>;
}
