import { config } from "@/config";

export type AIToolType = "content" | "image" | "document";

export interface AIToolMeta {
  type: AIToolType;
  label: string;
  description: string;
  icon: string;
  color: string;
  href: string;
}

const AI_TOOLS: Record<AIToolType, AIToolMeta> = {
  content: {
    type: "content",
    label: "Content Generator",
    description: "Generate blog posts, marketing copy, product descriptions, and more using AI with streaming output.",
    icon: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>`,
    color: "from-violet-500 to-purple-500",
    href: "/ai/content",
  },
  image: {
    type: "image",
    label: "Image Generator",
    description: "Create images from text prompts. Choose sizes, styles, and generate multiple variations.",
    icon: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25z" /></svg>`,
    color: "from-amber-500 to-orange-500",
    href: "/ai/image",
  },
  document: {
    type: "document",
    label: "Document Analyzer",
    description: "Upload PDFs and documents. Summarize, extract key points, or ask questions about your documents.",
    icon: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>`,
    color: "from-emerald-500 to-teal-500",
    href: "/ai/document",
  },
};

export function getActiveTool(override?: AIToolType): AIToolMeta {
  const toolType = override || config.ai.tool;
  return AI_TOOLS[toolType];
}

export function getAllTools(): AIToolMeta[] {
  return Object.values(AI_TOOLS);
}

export function getToolByType(type: AIToolType): AIToolMeta {
  return AI_TOOLS[type];
}
