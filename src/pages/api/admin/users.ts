import type { APIRoute } from "astro";
import { getDatabaseProvider } from "@/providers/database";
import { isDemo, demoUsers } from "@/lib/demo-data";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url, cookies }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limit = parseInt(url.searchParams.get("limit") || "10");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const search = url.searchParams.get("search") || "";

  // Use realistic demo data
  if (isDemo(cookies)) {
    let filtered = demoUsers;
    if (search) {
      const q = search.toLowerCase();
      filtered = demoUsers.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    const paginated = filtered.slice(offset, offset + limit);
    return new Response(JSON.stringify({
      users: paginated,
      total: filtered.length,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const db = await getDatabaseProvider();
    const result = await db.listUsers({ limit, offset, search: search || undefined });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to list users:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PATCH: APIRoute = async ({ locals, request, cookies }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  if (isDemo(cookies)) {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  try {
    const db = await getDatabaseProvider();
    const body = await request.json();
    const { userId, ...updates } = body;
    if (!userId) return new Response(JSON.stringify({ error: "userId is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const updated = await db.updateUser(userId, updates);
    return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const DELETE: APIRoute = async ({ locals, request, cookies }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  if (isDemo(cookies)) {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  try {
    const db = await getDatabaseProvider();
    const body = await request.json();
    const { userId } = body;
    if (!userId) return new Response(JSON.stringify({ error: "userId is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    await db.deleteUser(userId);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
