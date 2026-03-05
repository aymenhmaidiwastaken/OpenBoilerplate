import { getDatabaseProvider } from "@/providers/database";

export const CREDIT_COSTS = {
  "ai-text": 1,
  "ai-image": 5,
  "ai-document": 3,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export async function consumeCredits(userId: string, action: CreditAction): Promise<{ allowed: boolean; remaining: number }> {
  const db = await getDatabaseProvider();
  const cost = CREDIT_COSTS[action];
  const current = await db.getCredits(userId);

  if (current < cost) {
    return { allowed: false, remaining: current };
  }

  const remaining = await db.updateCredits(userId, -cost);
  await db.addUsage({ userId, type: action, credits: cost });
  return { allowed: true, remaining };
}

export async function getCredits(userId: string): Promise<number> {
  const db = await getDatabaseProvider();
  return db.getCredits(userId);
}
