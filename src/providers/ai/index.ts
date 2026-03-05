import type { AIProvider } from "./types";
import { config } from "@/config";

let _instance: AIProvider | null = null;

export async function getAIProvider(): Promise<AIProvider> {
  if (_instance) return _instance;

  switch (config.providers.ai) {
    case "anthropic": {
      const { AnthropicAIProvider } = await import("./anthropic");
      _instance = new AnthropicAIProvider();
      break;
    }
    case "google": {
      const { GoogleAIProvider } = await import("./google");
      _instance = new GoogleAIProvider();
      break;
    }
    case "openai":
    default: {
      const { OpenAIProvider } = await import("./openai");
      _instance = new OpenAIProvider();
      break;
    }
  }

  return _instance;
}

export type { AIProvider, TextGenerationOptions, TextGenerationResult, ImageGenerationOptions, ImageGenerationResult, DocumentAnalysisOptions, DocumentAnalysisResult } from "./types";
