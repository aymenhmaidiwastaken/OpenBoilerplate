import type { APIRoute } from "astro";
import { getPaymentProvider } from "@/providers/payment";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { planId, interval } = body;

    if (!planId || !interval) {
      return new Response(JSON.stringify({ error: "Missing planId or interval" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (interval !== "monthly" && interval !== "yearly") {
      return new Response(JSON.stringify({ error: "Invalid interval. Must be 'monthly' or 'yearly'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const provider = await getPaymentProvider();
    const session = await provider.createCheckout(user.id, planId, interval);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
