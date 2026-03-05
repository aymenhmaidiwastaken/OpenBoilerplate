import type { APIRoute } from "astro";
import { isDemo, getDemoSignups, getDemoRevenue } from "@/lib/demo-data";

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
    return new Response(JSON.stringify({
      signups: getDemoSignups(),
      revenue: getDemoRevenue(),
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Generate mock analytics data for the last 30 days
  const signups = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    signups.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: Math.floor(Math.random() * 50) + 10,
    });
  }

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentMonth = now.getMonth();
  const revenue = [];
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    revenue.push({
      month: months[monthIndex],
      revenue: Math.floor(Math.random() * 8000) + 2000,
    });
  }

  return new Response(JSON.stringify({ signups, revenue }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
