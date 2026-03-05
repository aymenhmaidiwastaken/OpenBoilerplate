import type { APIRoute } from "astro";

export const prerender = false;

// In-memory settings store. In production, persist to your database.
let settings = {
  siteName: "OpenBoil",
  siteDescription: "The open-source SaaS boilerplate",
  maintenanceMode: false,
};

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(settings), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();

    if (typeof body.siteName === "string") {
      settings.siteName = body.siteName;
    }
    if (typeof body.siteDescription === "string") {
      settings.siteDescription = body.siteDescription;
    }
    if (typeof body.maintenanceMode === "boolean") {
      settings.maintenanceMode = body.maintenanceMode;
    }

    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to save settings:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
