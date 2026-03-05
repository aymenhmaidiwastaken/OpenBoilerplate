import type {
  AIProvider,
  TextGenerationOptions,
  TextGenerationResult,
  ImageGenerationOptions,
  ImageGenerationResult,
  DocumentAnalysisOptions,
  DocumentAnalysisResult,
} from "./types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-pro";

function getApiKey(): string {
  const key = import.meta.env.GOOGLE_AI_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_AI_API_KEY is not set in environment variables");
  }
  return key;
}

export class GoogleAIProvider implements AIProvider {
  async generateText(options: TextGenerationOptions): Promise<TextGenerationResult> {
    const parts: Array<{ text: string }> = [];

    if (options.systemPrompt) {
      parts.push({ text: options.systemPrompt });
    }
    parts.push({ text: options.prompt });

    const url = `${GEMINI_API_URL}/models/${DEFAULT_MODEL}:generateContent?key=${getApiKey()}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          maxOutputTokens: options.maxTokens ?? 1024,
          temperature: options.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google AI API error (${response.status}): ${error}`);
    }

    const data = await response.json();

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((part: { text: string }) => part.text)
        .join("") ?? "";

    const tokensUsed =
      (data.usageMetadata?.promptTokenCount ?? 0) +
      (data.usageMetadata?.candidatesTokenCount ?? 0);

    return { text, tokensUsed };
  }

  async *streamText(options: TextGenerationOptions): AsyncIterable<string> {
    const parts: Array<{ text: string }> = [];

    if (options.systemPrompt) {
      parts.push({ text: options.systemPrompt });
    }
    parts.push({ text: options.prompt });

    const url = `${GEMINI_API_URL}/models/${DEFAULT_MODEL}:streamGenerateContent?alt=sse&key=${getApiKey()}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          maxOutputTokens: options.maxTokens ?? 1024,
          temperature: options.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google AI API error (${response.status}): ${error}`);
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
            const parts = parsed.candidates?.[0]?.content?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.text) {
                  yield part.text;
                }
              }
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
      "Image generation is not supported by the Google Gemini API. Use a dedicated image generation provider instead."
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
