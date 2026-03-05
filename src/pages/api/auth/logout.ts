export const prerender = false;

import type { APIRoute } from "astro";
import { getAuthProvider } from "@/providers/auth";

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const token = cookies.get("session")?.value;

    if (token) {
      const auth = await getAuthProvider();
      await auth.signOut(token);
    }

    cookies.delete("session", { path: "/" });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    cookies.delete("session", { path: "/" });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
