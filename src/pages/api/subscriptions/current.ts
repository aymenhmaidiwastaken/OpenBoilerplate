import type { APIRoute } from "astro";
import { getPaymentProvider } from "@/providers/payment";
import { isDemo } from "@/lib/demo-data";

export const prerender = false;

export const GET: APIRoute = async ({ locals, cookies }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Demo mode: return a realistic Pro subscription
    if (isDemo(cookies)) {
      return new Response(JSON.stringify({
        subscription: {
          id: "sub_demo_1",
          userId: "demo-user",
          plan: "pro",
          status: "active",
          currentPeriodEnd: "2025-04-02T00:00:00Z",
          cancelAtPeriodEnd: false,
          externalId: "sub_1MowQVBnkgV8Jhe3jlqT",
        },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const provider = await getPaymentProvider();
    const subscription = await provider.getSubscription(user.id);

    return new Response(JSON.stringify({ subscription }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return new Response(JSON.stringify({ error: "Failed to get subscription" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
