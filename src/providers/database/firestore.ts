import type {
  DatabaseProvider,
  UserRecord,
  UsageRecord,
} from "./types";
import type { Subscription } from "../payment/types";

// Trick Vite into not statically analyzing this import
async function loadFirebaseFirestore(): Promise<any> {
  const moduleName = "firebase-admin" + "/firestore";
  try {
    return await (Function(`return import("${moduleName}")`)() as Promise<any>);
  } catch {
    throw new Error(
      "firebase-admin is required for the Firestore provider. Install it with: npm install firebase-admin"
    );
  }
}

export class FirestoreDatabaseProvider implements DatabaseProvider {
  private dbPromise: Promise<any> | null = null;

  private getDb(): Promise<any> {
    if (!this.dbPromise) {
      this.dbPromise = loadFirebaseFirestore().then((mod: any) => mod.getFirestore());
    }
    return this.dbPromise;
  }

  private async getFieldValue(): Promise<any> {
    const mod = await loadFirebaseFirestore();
    return mod.FieldValue;
  }

  async createUser(
    data: Omit<UserRecord, "id" | "createdAt" | "updatedAt" | "credits">,
  ): Promise<UserRecord> {
    const db = await this.getDb();
    const ref = db.collection("users").doc();
    const now = new Date();
    const user: UserRecord = { id: ref.id, ...data, credits: 0, createdAt: now, updatedAt: now };
    await ref.set(user);
    return user;
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    const db = await this.getDb();
    const snap = await db.collection("users").doc(id).get();
    return snap.exists ? (snap.data() as UserRecord) : null;
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const db = await this.getDb();
    const snap = await db.collection("users").where("email", "==", email).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].data() as UserRecord;
  }

  async updateUser(id: string, data: Partial<UserRecord>): Promise<UserRecord> {
    const db = await this.getDb();
    const ref = db.collection("users").doc(id);
    await ref.update({ ...data, updatedAt: new Date() });
    const snap = await ref.get();
    return snap.data() as UserRecord;
  }

  async deleteUser(id: string): Promise<void> {
    const db = await this.getDb();
    await db.collection("users").doc(id).delete();
  }

  async listUsers(opts: { limit?: number; offset?: number; search?: string } = {}): Promise<{ users: UserRecord[]; total: number }> {
    const db = await this.getDb();
    const { limit = 50, offset = 0 } = opts;
    let query = db.collection("users").orderBy("createdAt", "desc");
    if (offset > 0) {
      const all = await query.limit(offset).get();
      const last = all.docs[all.docs.length - 1];
      if (last) query = query.startAfter(last);
    }
    const snap = await query.limit(limit).get();
    const totalSnap = await db.collection("users").count().get();
    return { users: snap.docs.map((d: any) => d.data() as UserRecord), total: totalSnap.data().count };
  }

  async upsertSubscription(data: Subscription): Promise<Subscription> {
    const db = await this.getDb();
    await db.collection("subscriptions").doc(data.userId).set(data, { merge: true });
    return data;
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    const db = await this.getDb();
    const snap = await db.collection("subscriptions").doc(userId).get();
    return snap.exists ? (snap.data() as Subscription) : null;
  }

  async addUsage(data: Omit<UsageRecord, "id" | "createdAt">): Promise<UsageRecord> {
    const db = await this.getDb();
    const ref = db.collection("usage").doc();
    const record: UsageRecord = { id: ref.id, ...data, createdAt: new Date() };
    await ref.set(record);
    const FieldValue = await this.getFieldValue();
    await db.collection("users").doc(data.userId).update({ credits: FieldValue.increment(-data.credits) });
    return record;
  }

  async getUsage(userId: string, opts: { from?: Date; to?: Date; limit?: number } = {}): Promise<UsageRecord[]> {
    const db = await this.getDb();
    const { from, to, limit = 100 } = opts;
    let query = db.collection("usage").where("userId", "==", userId).orderBy("createdAt", "desc");
    if (from) query = query.where("createdAt", ">=", from);
    if (to) query = query.where("createdAt", "<=", to);
    const snap = await query.limit(limit).get();
    return snap.docs.map((d: any) => d.data() as UsageRecord);
  }

  async updateCredits(userId: string, delta: number): Promise<number> {
    const db = await this.getDb();
    const FieldValue = await this.getFieldValue();
    const ref = db.collection("users").doc(userId);
    await ref.update({ credits: FieldValue.increment(delta) });
    const snap = await ref.get();
    return (snap.data() as UserRecord).credits;
  }

  async getCredits(userId: string): Promise<number> {
    const db = await this.getDb();
    const snap = await db.collection("users").doc(userId).get();
    if (!snap.exists) throw new Error(`User ${userId} not found`);
    return (snap.data() as UserRecord).credits;
  }

  async getStats(): Promise<{ totalUsers: number; activeUsers: number; totalRevenue: number; mrr: number }> {
    const db = await this.getDb();
    const totalSnap = await db.collection("users").count().get();
    const activeSnap = await db.collection("subscriptions").where("status", "==", "active").count().get();
    return { totalUsers: totalSnap.data().count, activeUsers: activeSnap.data().count, totalRevenue: 0, mrr: 0 };
  }
}
