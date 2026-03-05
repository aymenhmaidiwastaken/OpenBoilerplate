import * as p from "@clack/prompts";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

async function main() {
  p.intro("OpenBoil Setup");

  const providers = await p.group(
    {
      auth: () =>
        p.select({
          message: "Which auth provider?",
          options: [
            { value: "custom", label: "Custom (JWT + Google OAuth)", hint: "recommended" },
            { value: "firebase", label: "Firebase Auth" },
            { value: "supabase", label: "Supabase Auth" },
          ],
        }),
      payment: () =>
        p.select({
          message: "Which payment provider?",
          options: [
            { value: "stripe", label: "Stripe", hint: "recommended" },
            { value: "lemonsqueezy", label: "LemonSqueezy" },
          ],
        }),
      database: () =>
        p.select({
          message: "Which database provider?",
          options: [
            { value: "drizzle", label: "Drizzle + PostgreSQL", hint: "recommended" },
            { value: "firestore", label: "Firestore" },
            { value: "supabase", label: "Supabase" },
          ],
        }),
      ai: () =>
        p.select({
          message: "Which AI provider?",
          options: [
            { value: "openai", label: "OpenAI" },
            { value: "anthropic", label: "Anthropic" },
            { value: "google", label: "Google Gemini" },
          ],
        }),
      homepage: () =>
        p.select({
          message: "Which homepage design?",
          options: [
            { value: "modern", label: "Modern SaaS" },
            { value: "minimal", label: "Minimal" },
            { value: "bold-dark", label: "Bold Dark" },
          ],
        }),
      appName: () =>
        p.text({
          message: "App name?",
          placeholder: "My SaaS App",
          defaultValue: "My SaaS App",
        }),
      appUrl: () =>
        p.text({
          message: "App URL?",
          placeholder: "http://localhost:4321",
          defaultValue: "http://localhost:4321",
        }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      },
    }
  );

  const s = p.spinner();

  // Generate openboil.config.ts
  s.start("Generating config...");
  const configContent = `import type { OpenBoilConfig } from "./src/config/schema";

const config: OpenBoilConfig = {
  app: {
    name: "${providers.appName}",
    description: "Built with OpenBoil",
    url: "${providers.appUrl}",
  },
  homepage: "${providers.homepage}",
  providers: {
    auth: "${providers.auth}",
    payment: "${providers.payment}",
    database: "${providers.database}",
    ai: "${providers.ai}",
    email: "resend",
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
        features: ["5,000 AI credits/month", "Priority support", "Unlimited projects"],
        popular: true,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: { monthly: 99, yearly: 990 },
        credits: 50000,
        features: ["50,000 AI credits/month", "Dedicated support", "Unlimited everything"],
      },
    ],
  },
  theme: {
    defaultMode: "system",
    primaryColor: "#6366f1",
  },
};

export default config;
`;
  writeFileSync(join(process.cwd(), "openboil.config.ts"), configContent);
  s.stop("Config generated");

  // Generate .env
  s.start("Generating .env...");
  if (!existsSync(join(process.cwd(), ".env"))) {
    const envExample = readFileSync(join(process.cwd(), ".env.example"), "utf-8");
    writeFileSync(join(process.cwd(), ".env"), envExample);
  }
  s.stop(".env generated");

  p.outro("Setup complete! Run `npm run dev` to start developing.");
}

main().catch(console.error);
