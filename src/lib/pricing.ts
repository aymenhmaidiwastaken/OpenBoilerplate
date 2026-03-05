import { config } from "@/config";
import type { Plan } from "@/config/schema";

export function getPlans(): Plan[] {
  return config.pricing.plans;
}

export function getPlan(id: string): Plan | undefined {
  return config.pricing.plans.find((p) => p.id === id);
}

export function getPlanPrice(plan: Plan, interval: "monthly" | "yearly"): number {
  return plan.price[interval];
}

export function getCreditsForPlan(planId: string): number {
  return getPlan(planId)?.credits ?? 0;
}

export function getCurrency(): string {
  return config.pricing.currency;
}
