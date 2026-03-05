import type { APIRoute } from "astro";
import { getDatabaseProvider } from "@/providers/database";
import { isDemo, demoStats } from "@/lib/demo-data";

export const prerender = false;

export const GET: APIRoute = async ({ locals, cookies }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (isDemo(cookies)) {
    return new Response(JSON.stringify(demoStats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const db = await getDatabaseProvider();
    const stats = await db.getStats();
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
