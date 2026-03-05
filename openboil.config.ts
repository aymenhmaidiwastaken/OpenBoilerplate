import type { OpenBoilConfig } from "./src/config/schema";

const config: OpenBoilConfig = {
  app: {
    name: "OpenBoil",
    description: "The Ultimate Open Source SaaS Boilerplate",
    url: "http://localhost:4321",
    logo: "/logo.svg",
  },

  homepage: "modern", // "modern" | "minimal" | "bold-dark"

  providers: {
    auth: "custom", // "firebase" | "supabase" | "custom"
    payment: "stripe", // "stripe" | "lemonsqueezy"
    database: "drizzle", // "firestore" | "supabase" | "drizzle"
    ai: "openai", // "openai" | "anthropic" | "google"
    email: "resend", // "resend"
  },

  features: {
    blog: true,
    ai: true,
    admin: true,
    credits: true,
  },

  pricing: {
    currency: "USD",
    plans: [
      {
        id: "free",
        name: "Free",
        price: { monthly: 0, yearly: 0 },
        credits: 100,
        features: ["100 AI credits/month", "Basic support", "1 project"],
      },
      {
        id: "pro",
        name: "Pro",
        price: { monthly: 19, yearly: 190 },
        credits: 5000,
        features: ["5,000 AI credits/month", "Priority support", "Unlimited projects", "API access"],
        popular: true,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: { monthly: 99, yearly: 990 },
        credits: 50000,
        features: ["50,000 AI credits/month", "Dedicated support", "Unlimited everything", "Custom integrations", "SLA"],
      },
    ],
  },

  ai: {
    tool: "content", // "content" | "image" | "document"
  },

  theme: {
    defaultMode: "system", // "light" | "dark" | "system"
    primaryColor: "#6366f1",
  },
};

export default config;
