export interface TextGenerationOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface TextGenerationResult {
  text: string;
  tokensUsed: number;
}

export interface ImageGenerationOptions {
  prompt: string;
  size?: "256x256" | "512x512" | "1024x1024";
  n?: number;
}

export interface ImageGenerationResult {
  urls: string[];
}

export interface DocumentAnalysisOptions {
  content: string;
  mode: "summarize" | "extract" | "qa";
  question?: string;
}

export interface DocumentAnalysisResult {
  text: string;
  tokensUsed: number;
}

export interface AIProvider {
  generateText(options: TextGenerationOptions): Promise<TextGenerationResult>;
  streamText(options: TextGenerationOptions): AsyncIterable<string>;
  generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult>;
  analyzeDocument(options: DocumentAnalysisOptions): Promise<DocumentAnalysisResult>;
}
