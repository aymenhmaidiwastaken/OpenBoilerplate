import type { APIRoute } from "astro";
import { getCredits } from "@/lib/credits";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const credits = await getCredits(user.id);

    return new Response(JSON.stringify({ credits }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get credits error:", error);
    return new Response(JSON.stringify({ error: "Failed to get credits" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
