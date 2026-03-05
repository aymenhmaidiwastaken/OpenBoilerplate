import type { APIRoute } from "astro";
import { isDemo, getDemoUsageTimeline } from "@/lib/demo-data";

export const prerender = false;

export const GET: APIRoute = async ({ locals, cookies }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use realistic demo data
  if (isDemo(cookies)) {
    const timeline = getDemoUsageTimeline();
    const summary = [
      { type: "ai-text", total: timeline.reduce((s, d) => s + d["ai-text"], 0), totalCredits: timeline.reduce((s, d) => s + d["ai-text"] * 1, 0) },
      { type: "ai-image", total: timeline.reduce((s, d) => s + d["ai-image"], 0), totalCredits: timeline.reduce((s, d) => s + d["ai-image"] * 5, 0) },
      { type: "ai-document", total: timeline.reduce((s, d) => s + d["ai-document"], 0), totalCredits: timeline.reduce((s, d) => s + d["ai-document"] * 10, 0) },
    ];
    return new Response(JSON.stringify({ timeline, summary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fallback mock data
  const timeline = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    timeline.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      "ai-text": Math.floor(Math.random() * 200) + 50,
      "ai-image": Math.floor(Math.random() * 80) + 10,
      "ai-document": Math.floor(Math.random() * 40) + 5,
    });
  }
  const summary = [
    { type: "ai-text", total: timeline.reduce((s, d) => s + d["ai-text"], 0), totalCredits: timeline.reduce((s, d) => s + d["ai-text"] * 1, 0) },
    { type: "ai-image", total: timeline.reduce((s, d) => s + d["ai-image"], 0), totalCredits: timeline.reduce((s, d) => s + d["ai-image"] * 5, 0) },
    { type: "ai-document", total: timeline.reduce((s, d) => s + d["ai-document"], 0), totalCredits: timeline.reduce((s, d) => s + d["ai-document"] * 10, 0) },
  ];

  return new Response(JSON.stringify({ timeline, summary }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
