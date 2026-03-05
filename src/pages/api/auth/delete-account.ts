export const prerender = false;

import type { APIRoute } from "astro";
import { getAuthProvider } from "@/providers/auth";
import { getDatabaseProvider } from "@/providers/database";

export const POST: APIRoute = async ({ locals, cookies }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete user data from database
    const db = await getDatabaseProvider();
    await db.deleteUser(user.id);

    // Sign out and clear session
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
    return new Response(JSON.stringify({ error: "Failed to delete account" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
