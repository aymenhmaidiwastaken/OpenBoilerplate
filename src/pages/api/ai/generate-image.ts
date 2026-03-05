import type { APIRoute } from "astro";
import { consumeCredits } from "@/lib/credits";
import { getAIProvider } from "@/providers/ai";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { prompt?: string; size?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { prompt, size = "512x512" } = body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return new Response(JSON.stringify({ error: "Prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validSizes = ["256x256", "512x512", "1024x1024"] as const;
  const validatedSize = validSizes.includes(size as any)
    ? (size as (typeof validSizes)[number])
    : "512x512";

  const { allowed, remaining } = await consumeCredits(user.id, "ai-image");
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Insufficient credits",
        remaining,
      }),
      { status: 402, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const ai = await getAIProvider();
    const result = await ai.generateImage({
      prompt: prompt.trim(),
      size: validatedSize,
    });

    return new Response(JSON.stringify({ urls: result.urls }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Image generation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
