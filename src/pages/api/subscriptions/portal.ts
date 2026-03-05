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
    const { url } = await provider.createPortalSession(user.id);

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Portal session error:", error);
    return new Response(JSON.stringify({ error: "Failed to create portal session" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
