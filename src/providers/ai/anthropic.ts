import type {
  AIProvider,
  TextGenerationOptions,
  TextGenerationResult,
  ImageGenerationOptions,
  ImageGenerationResult,
  DocumentAnalysisOptions,
  DocumentAnalysisResult,
} from "./types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1";
const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const API_VERSION = "2023-06-01";

function getApiKey(): string {
  const key = import.meta.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
  }
  return key;
}

function buildHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-key": getApiKey(),
    "anthropic-version": API_VERSION,
  };
}

export class AnthropicAIProvider implements AIProvider {
  async generateText(options: TextGenerationOptions): Promise<TextGenerationResult> {
    const body: Record<string, unknown> = {
      model: DEFAULT_MODEL,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
      messages: [{ role: "user", content: options.prompt }],
    };

    if (options.systemPrompt) {
      body.system = options.systemPrompt;
    }

    const response = await fetch(`${ANTHROPIC_API_URL}/messages`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${error}`);
    }

    const data = await response.json();

    const text = data.content
      .filter((block: { type: string }) => block.type === "text")
      .map((block: { text: string }) => block.text)
      .join("");

    const tokensUsed = (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0);

    return { text, tokensUsed };
  }

  async *streamText(options: TextGenerationOptions): AsyncIterable<string> {
    const body: Record<string, unknown> = {
      model: DEFAULT_MODEL,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
      messages: [{ role: "user", content: options.prompt }],
      stream: true,
    };

    if (options.systemPrompt) {
      body.system = options.systemPrompt;
    }

    const response = await fetch(`${ANTHROPIC_API_URL}/messages`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${error}`);
    }

    if (!response.body) {
      throw new Error("Response body is null — streaming not supported in this environment");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              yield parsed.delta.text;
            }

            if (parsed.type === "message_stop") {
              return;
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async generateImage(_options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    throw new Error(
      "Image generation is not supported by Anthropic. Use text generation to create image descriptions instead."
    );
  }

  async analyzeDocument(options: DocumentAnalysisOptions): Promise<DocumentAnalysisResult> {
    let systemPrompt: string;

    switch (options.mode) {
      case "summarize":
        systemPrompt =
          "You are a document summarization assistant. Provide a clear and concise summary of the given document content.";
        break;
      case "extract":
        systemPrompt =
          "You are an information extraction assistant. Extract the key facts, entities, and data points from the given document content. Present them in a structured format.";
        break;
      case "qa":
        systemPrompt =
          "You are a document Q&A assistant. Answer the user's question based solely on the provided document content. If the answer cannot be found in the document, say so.";
        break;
    }

    let prompt = options.content;
    if (options.mode === "qa" && options.question) {
      prompt = `Document:\n${options.content}\n\nQuestion: ${options.question}`;
    }

    return this.generateText({
      prompt,
      systemPrompt,
      maxTokens: 2048,
      temperature: 0.3,
    });
  }
}
