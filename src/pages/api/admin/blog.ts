import type { APIRoute } from "astro";
import { isDemo, demoBlogPosts } from "@/lib/demo-data";

export const prerender = false;

let mockPosts = [...demoBlogPosts];

export const GET: APIRoute = async ({ locals, cookies }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (isDemo(cookies)) {
    return new Response(JSON.stringify({ posts: demoBlogPosts }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ posts: mockPosts }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PATCH: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }
  try {
    const body = await request.json();
    const { postId, ...updates } = body;
    if (!postId) return new Response(JSON.stringify({ error: "postId is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const index = mockPosts.findIndex((p) => p.id === postId);
    if (index === -1) return new Response(JSON.stringify({ error: "Post not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    mockPosts[index] = { ...mockPosts[index], ...updates, updatedAt: new Date().toISOString() };
    return new Response(JSON.stringify(mockPosts[index]), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }
  try {
    const body = await request.json();
    const { postId } = body;
    if (!postId) return new Response(JSON.stringify({ error: "postId is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    mockPosts = mockPosts.filter((p) => p.id !== postId);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
