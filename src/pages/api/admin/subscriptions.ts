import type { APIRoute } from "astro";
import { isDemo, demoSubscriptions } from "@/lib/demo-data";

export const prerender = false;

export const GET: APIRoute = async ({ locals, cookies }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use realistic demo data
  if (isDemo(cookies)) {
    const plans = ["free", "pro", "enterprise"];
    const distribution = plans.map((plan) => {
      const count = demoSubscriptions.filter((s) => s.plan === plan).length;
      return { plan, count, percentage: demoSubscriptions.length > 0 ? Math.round((count / demoSubscriptions.length) * 100) : 0 };
    });

    return new Response(JSON.stringify({
      subscriptions: demoSubscriptions,
      distribution,
      total: demoSubscriptions.length,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fallback mock data
  const plans = ["starter", "pro", "enterprise"];
  const statuses = ["active", "active", "active", "trialing", "canceled"];
  const subscriptions = Array.from({ length: 15 }, (_, i) => {
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amounts: Record<string, number> = { starter: 900, pro: 2900, enterprise: 9900 };
    return {
      id: `sub_${i + 1}`,
      userId: `user_${i + 1}`,
      userEmail: `user${i + 1}@example.com`,
      plan, status,
      amount: amounts[plan],
      currentPeriodEnd: new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toISOString(),
    };
  });

  const distribution = plans.map((plan) => {
    const count = subscriptions.filter((s) => s.plan === plan).length;
    return { plan, count, percentage: subscriptions.length > 0 ? (count / subscriptions.length) * 100 : 0 };
  });

  return new Response(JSON.stringify({ subscriptions, distribution, total: subscriptions.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
