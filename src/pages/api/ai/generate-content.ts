import type { APIRoute } from "astro";
import { consumeCredits } from "@/lib/credits";
import { getAIProvider } from "@/providers/ai";

export const prerender = false;

const SYSTEM_PROMPTS: Record<string, string> = {
  "blog-post":
    "You are a professional blog writer. Write engaging, well-structured blog content based on the user's prompt.",
  "marketing-copy":
    "You are an expert marketing copywriter. Write compelling, persuasive marketing copy based on the user's prompt.",
  "product-description":
    "You are a product description specialist. Write clear, appealing product descriptions based on the user's prompt.",
  email:
    "You are a professional email writer. Write clear, effective emails based on the user's prompt.",
  custom:
    "You are a helpful writing assistant. Generate content based on the user's prompt.",
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { prompt?: string; template?: string; temperature?: number };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { prompt, template = "custom", temperature = 0.7 } = body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return new Response(JSON.stringify({ error: "Prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { allowed, remaining } = await consumeCredits(user.id, "ai-text");
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Insufficient credits",
        remaining,
      }),
      { status: 402, headers: { "Content-Type": "application/json" } }
    );
  }

  const ai = await getAIProvider();
  const systemPrompt = SYSTEM_PROMPTS[template] || SYSTEM_PROMPTS.custom;

  const stream = ai.streamText({
    prompt: prompt.trim(),
    systemPrompt,
    temperature: Math.min(1, Math.max(0, temperature)),
    stream: true,
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: [ERROR]\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
