import type {
  AIProvider,
  TextGenerationOptions,
  TextGenerationResult,
  ImageGenerationOptions,
  ImageGenerationResult,
  DocumentAnalysisOptions,
  DocumentAnalysisResult,
} from "./types";

const OPENAI_API_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o";
const DEFAULT_IMAGE_MODEL = "dall-e-3";

function getApiKey(): string {
  const key = import.meta.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }
  return key;
}

function buildHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getApiKey()}`,
  };
}

export class OpenAIProvider implements AIProvider {
  async generateText(options: TextGenerationOptions): Promise<TextGenerationResult> {
    const messages: Array<{ role: string; content: string }> = [];

    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: options.prompt });

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }

    const data = await response.json();

    return {
      text: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  }

  async *streamText(options: TextGenerationOptions): AsyncIterable<string> {
    const messages: Array<{ role: string; content: string }> = [];

    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: options.prompt });

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
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
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
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

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const size = options.size ?? "1024x1024";
    const n = options.n ?? 1;

    const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        model: DEFAULT_IMAGE_MODEL,
        prompt: options.prompt,
        n,
        size,
        response_format: "url",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Images API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const urls: string[] = data.data.map((item: { url: string }) => item.url);

    return { urls };
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
