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

  let body: { content?: string; mode?: string; question?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { content, mode = "summarize", question } = body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return new Response(
      JSON.stringify({ error: "Document content is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const validModes = ["summarize", "extract", "qa"] as const;
  const validatedMode = validModes.includes(mode as any)
    ? (mode as (typeof validModes)[number])
    : "summarize";

  if (validatedMode === "qa" && (!question || !question.trim())) {
    return new Response(
      JSON.stringify({ error: "A question is required for Q&A mode" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { allowed, remaining } = await consumeCredits(user.id, "ai-document");
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
    const result = await ai.analyzeDocument({
      content: content.trim(),
      mode: validatedMode,
      ...(validatedMode === "qa" && { question: question?.trim() }),
    });

    return new Response(
      JSON.stringify({ text: result.text, tokensUsed: result.tokensUsed }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Document analysis failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
