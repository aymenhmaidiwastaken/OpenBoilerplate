export const prerender = false;

import type { APIRoute } from "astro";
import { getDatabaseProvider } from "@/providers/database";
import { isDemo, getDemoUserUsage } from "@/lib/demo-data";

export const GET: APIRoute = async ({ locals, cookies }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use realistic demo data
  if (isDemo(cookies)) {
    return new Response(JSON.stringify({ records: getDemoUserUsage() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const db = await getDatabaseProvider();
    const records = await db.getUsage(user.id, { limit: 100 });

    return new Response(
      JSON.stringify({
        records: records.map((r) => ({
          id: r.id,
          userId: r.userId,
          type: r.type,
          credits: r.credits,
          metadata: r.metadata,
          createdAt: r.createdAt.toISOString(),
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch usage data";
    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
