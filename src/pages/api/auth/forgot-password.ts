export const prerender = false;

import type { APIRoute } from "astro";
import { getAuthProvider } from "@/providers/auth";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const auth = await getAuthProvider();
    await auth.forgotPassword(email);

    // Always return success to prevent email enumeration
    return new Response(
      JSON.stringify({
        message: "If an account exists with that email, a reset link has been sent",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    // Still return success to prevent email enumeration
    return new Response(
      JSON.stringify({
        message: "If an account exists with that email, a reset link has been sent",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
