import type { APIRoute } from "astro";
import { getPaymentProvider } from "@/providers/payment";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const signature = request.headers.get("x-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing x-signature header" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rawBody = await request.text();
    const provider = await getPaymentProvider();
    const result = await provider.handleWebhook(rawBody, signature);

    console.log("LemonSqueezy webhook processed:", result.event);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("LemonSqueezy webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
