import type { APIRoute } from "astro";
import { getPaymentProvider } from "@/providers/payment";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const provider = await getPaymentProvider();
    const currentSubscription = await provider.getSubscription(user.id);

    if (!currentSubscription) {
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const subscription = await provider.cancelSubscription(currentSubscription.externalId);

    return new Response(JSON.stringify({ subscription }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return new Response(JSON.stringify({ error: "Failed to cancel subscription" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
