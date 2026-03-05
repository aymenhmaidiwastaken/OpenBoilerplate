import { z } from "zod";

const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.object({
    monthly: z.number(),
    yearly: z.number(),
  }),
  credits: z.number(),
  features: z.array(z.string()),
  popular: z.boolean().optional(),
});

export const configSchema = z.object({
  app: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().url(),
    logo: z.string().optional(),
  }),

  homepage: z.enum(["modern", "minimal", "bold-dark"]).default("modern"),

  providers: z.object({
    auth: z.enum(["firebase", "supabase", "custom"]).default("custom"),
    payment: z.enum(["stripe", "lemonsqueezy"]).default("stripe"),
    database: z.enum(["firestore", "supabase", "drizzle"]).default("drizzle"),
    ai: z.enum(["openai", "anthropic", "google"]).default("openai"),
    email: z.enum(["resend"]).default("resend"),
  }),

  features: z.object({
    blog: z.boolean().default(true),
    ai: z.boolean().default(true),
    admin: z.boolean().default(true),
    credits: z.boolean().default(true),
  }),

  pricing: z.object({
    currency: z.string().default("USD"),
    plans: z.array(planSchema),
  }),

  ai: z.object({
    tool: z.enum(["content", "image", "document"]).default("content"),
  }).default({ tool: "content" }),

  theme: z.object({
    defaultMode: z.enum(["light", "dark", "system"]).default("system"),
    primaryColor: z.string().default("#6366f1"),
  }),
});

export type OpenBoilConfig = z.infer<typeof configSchema>;
export type Plan = z.infer<typeof planSchema>;
