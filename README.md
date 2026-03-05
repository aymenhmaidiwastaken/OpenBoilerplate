<div align="center">

<img src="public/logo.svg" alt="OpenBoil" width="64" height="64" />

# OpenBoil

### The Ultimate Open-Source SaaS Boilerplate

**Ship your SaaS in record time.** Production-ready with authentication, payments, AI integrations, admin dashboard, blog, and 30+ polished pages. Swap providers with a single config change.

[![MIT License](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-5-ff5d01.svg)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8.svg)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://typescriptlang.org)

[Getting Started](#-quick-start) · [Screenshots](#-3-homepage-themes) · [Features](#-whats-included) · [Configuration](#%EF%B8%8F-configuration) · [Contributing](CONTRIBUTING.md)

</div>

---

<div align="center">

![OpenBoil Homepage](public/screenshots/homepage-light.png)

</div>

---

## Why OpenBoil?

Most boilerplates lock you into one stack. OpenBoil gives you a **provider abstraction system** — swap authentication, payments, database, and AI providers by changing a single line in your config. No refactoring. No rewiring.

```ts
// openboil.config.ts — change providers in seconds
providers: {
  auth: "custom",        // "firebase" | "supabase" | "custom"
  payment: "stripe",     // "stripe" | "lemonsqueezy"
  database: "drizzle",   // "firestore" | "supabase" | "drizzle"
  ai: "openai",          // "openai" | "anthropic" | "google"
  email: "resend",       // "resend"
}
```

Stop rebuilding the same infrastructure. Focus on what makes your product unique.

---

## What's Included

| Category | Features |
|----------|----------|
| **Authentication** | Email/password, Google OAuth, JWT sessions, password reset, email verification |
| **Payments** | Stripe & LemonSqueezy, subscription management, credit-based billing |
| **AI Tools** | Content generator, image generator, document analyzer with streaming output |
| **Admin Panel** | User management, analytics charts, subscription tracking, AI usage monitoring, blog CMS, site settings |
| **Blog** | MDX-powered, category filtering, table of contents, share buttons, SEO optimized |
| **Dashboard** | Credit tracking, usage history, billing management, profile & settings |
| **Landing Pages** | 3 homepage variants + 3 AI feature pages + pricing + about + blog |
| **Email** | React Email templates with Resend delivery |
| **UI** | 20+ shadcn/ui components, dark/light mode, fully responsive |

---

## 3 Homepage Themes

Choose your landing page style — set it in one config line:

```ts
homepage: "modern" // "modern" | "minimal" | "bold-dark"
```

### Modern (Default)

Clean and professional with gradient accents, stats counter, testimonials, and animated config preview.

![Modern Homepage - Light](public/screenshots/homepage-light.png)

Full dark mode support across every page — toggle with one click.

![Modern Homepage - Dark](public/screenshots/homepage-dark.png)

### Minimal

Developer-focused with code snippets, production-ready screen previews, and FAQ section.

![Minimal Homepage](public/screenshots/homepage-minimal.png)

### Bold Dark

High-energy design with bold typography, neon emerald accents, and an aggressive CTA layout.

![Bold Dark Homepage](public/screenshots/homepage-bold.png)

---

## AI Feature Pages

Three dedicated landing pages with **interactive demo testers** — fully client-side, no API keys needed. Each page has its own color scheme that extends to the header and navigation, plus testimonials, FAQ accordions, and "How It Works" sections.

### AI Content Generator — Violet Theme

Type a prompt and watch simulated streaming text appear character by character with a blinking cursor.

![AI Content Page](public/screenshots/ai-content.png)

### AI Image Generator — Amber Theme

Enter a prompt, see loading skeleton placeholders, then gradient cards with your prompt text overlaid.

![AI Image Page](public/screenshots/ai-image.png)

### AI Document Analyzer — Emerald Theme

Pre-loaded sample document with Summarize / Extract / Q&A mode switcher and simulated analysis results.

![AI Document Page](public/screenshots/ai-document.png)

---

## Dashboard

Full user dashboard with sidebar navigation, credit tracking, and AI tools.

### Overview

Credit balance, current plan, monthly usage stats, recent activity feed, and quick action cards for all AI tools.

![Dashboard Overview](public/screenshots/dashboard.png)

### AI Content Generator

Template selector (Blog Post, Email, Product Description), prompt textarea, temperature slider, credit cost indicator, and streaming output panel.

![AI Content Generator](public/screenshots/dashboard-ai-content.png)

### AI Image Generator

Prompt input, size selector (512x512, 1024x1024, etc.), and credit tracking.

![AI Image Generator](public/screenshots/dashboard-ai-image.png)

### AI Document Analyzer

Drag-and-drop file upload (supports .txt, .md, .csv, .json, .xml, .html, .log), analysis mode dropdown, and results panel.

![AI Document Analyzer](public/screenshots/dashboard-ai-document.png)

### Billing & Subscription

Current plan with status badge, credit usage progress bar, next billing date, and subscription management button.

![Billing](public/screenshots/dashboard-billing.png)

### Account Settings

Profile editor (name, email, avatar URL), password change form, and danger zone with typed-confirmation account deletion.

![Settings](public/screenshots/dashboard-settings.png)

---

## Admin Panel

Full admin dashboard with 7 sections for managing your SaaS business.

### Overview

Key metrics — total users, monthly revenue, active subscriptions, AI usage — plus signup trend and revenue charts.

![Admin Overview](public/screenshots/admin-overview.png)

### User Management

Searchable, paginated user table with name, email, role badges (admin/user), status indicators, join dates, and action menus.

![Admin Users](public/screenshots/admin-users.png)

### Analytics

Signup trends over time and monthly revenue breakdown charts powered by Recharts.

![Admin Analytics](public/screenshots/admin-analytics.png)

### Subscription Management

Plan distribution cards (Free/Pro/Enterprise counts), plus a full subscription table with user, plan, status, amount, and renewal date.

![Admin Subscriptions](public/screenshots/admin-subscriptions.png)

### AI Usage Monitoring

Per-tool usage stats (AI Text, AI Image, AI Document) with credits consumed, plus a stacked bar chart showing daily usage by tool type.

![Admin Usage](public/screenshots/admin-usage.png)

### Blog CMS

Create, edit, publish, unpublish, and delete blog posts. Status column shows Published/Draft. Includes title, creation date, and last updated.

![Admin Blog](public/screenshots/admin-blog.png)

### Site Settings

Editable site name, site description, and maintenance mode toggle with save button.

![Admin Settings](public/screenshots/admin-settings.png)

---

## More Pages

### Pricing

Monthly/yearly toggle, 3-tier pricing cards with feature checklists, highlighted "Popular" badge on Pro plan, and billing FAQ.

![Pricing](public/screenshots/pricing.png)

### Blog

Category filter tabs (All, Guides, Features, Architecture), post cards with category badges, dates, descriptions, and read-more links. Powered by MDX.

![Blog](public/screenshots/blog.png)

### About

Company description, mission statement, team avatars, and values section.

![About](public/screenshots/about.png)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Astro 5](https://astro.build) — Islands architecture, SSR + SSG |
| **UI Library** | [React 19](https://react.dev) — Interactive island components |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) — Utility-first CSS |
| **Components** | [shadcn/ui](https://ui.shadcn.com) — 20+ Radix-based accessible components |
| **Database** | [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL / [Supabase](https://supabase.com) / [Firebase](https://firebase.google.com) |
| **Auth** | Custom JWT / [Supabase Auth](https://supabase.com/auth) / [Firebase Auth](https://firebase.google.com/products/auth) |
| **Payments** | [Stripe](https://stripe.com) / [LemonSqueezy](https://lemonsqueezy.com) |
| **AI** | [OpenAI](https://openai.com) / [Anthropic](https://anthropic.com) / [Google AI](https://ai.google.dev) |
| **Email** | [Resend](https://resend.com) + [React Email](https://react.email) |
| **Charts** | [Recharts](https://recharts.org) |
| **State** | [Nano Stores](https://github.com/nanostores/nanostores) — Cross-island state |
| **Validation** | [Zod](https://zod.dev) |
| **Language** | [TypeScript 5](https://typescriptlang.org) — End-to-end type safety |

---

## Page Count

**30+ production-ready pages** out of the box:

| Section | Pages |
|---------|-------|
| Homepage variants | 3 (Modern, Minimal, Bold Dark) |
| AI landing pages | 3 (Content, Image, Document) — each with interactive demos |
| Marketing | 4 (Pricing, Blog listing, About, Contact) |
| Auth | 3 (Login, Register, Forgot Password) |
| Dashboard | 4 (Overview, AI Tools, Billing, Settings) |
| Admin | 7 (Overview, Users, Analytics, Subscriptions, Usage, Blog, Settings) |
| Legal | 2 (Terms of Service, Privacy Policy) |
| Blog posts | 4 (MDX articles with TOC) |
| **Total** | **30+** |

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** (or use [Neon](https://neon.tech) / [Supabase](https://supabase.com) for hosted)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/openboil.git
cd openboil

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run the interactive setup wizard
npm run setup

# Push database schema
npm run db:push

# (Optional) Seed with demo data
npm run seed

# Start development server
npm run dev
```

Visit **http://localhost:4321** and you're live.

---

## Configuration

Everything is controlled from a single file — `openboil.config.ts`:

```ts
const config = {
  app: {
    name: "YourApp",
    description: "Your SaaS description",
    url: "https://yourapp.com",
  },

  homepage: "modern",       // "modern" | "minimal" | "bold-dark"

  providers: {
    auth: "custom",          // "firebase" | "supabase" | "custom"
    payment: "stripe",       // "stripe" | "lemonsqueezy"
    database: "drizzle",     // "firestore" | "supabase" | "drizzle"
    ai: "openai",            // "openai" | "anthropic" | "google"
    email: "resend",         // "resend"
  },

  features: {
    blog: true,              // Toggle features on/off
    ai: true,
    admin: true,
    credits: true,
  },

  pricing: {
    currency: "USD",
    plans: [
      { id: "free",  name: "Free",  price: { monthly: 0, yearly: 0 },  credits: 100 },
      { id: "pro",   name: "Pro",   price: { monthly: 19, yearly: 190 }, credits: 5000, popular: true },
      { id: "enterprise", name: "Enterprise", price: { monthly: 99, yearly: 990 }, credits: 50000 },
    ],
  },

  theme: {
    defaultMode: "system",   // "light" | "dark" | "system"
    primaryColor: "#6366f1",
  },
};
```

---

## Demo Mode

OpenBoil includes a built-in **demo mode** that populates all dashboards with realistic sample data — no database required. Demo mode activates automatically when no database is connected, making it perfect for:

- Exploring the full UI before choosing your stack
- Showing the boilerplate to stakeholders
- Taking screenshots for your own README

---

## Environment Variables

Copy `.env.example` to `.env` and fill in only the providers you need:

| Variable | Provider | Required |
|----------|----------|----------|
| `JWT_SECRET` | Custom Auth | When using custom auth |
| `DATABASE_URL` | Drizzle/PostgreSQL | When using Drizzle |
| `STRIPE_SECRET_KEY` | Stripe | When using Stripe |
| `OPENAI_API_KEY` | OpenAI | When using AI features |
| `RESEND_API_KEY` | Resend | When using email |

All other provider variables (Firebase, Supabase, Anthropic, Google AI, LemonSqueezy) are documented in `.env.example`.

---

## Project Structure

```
openboil/
├── openboil.config.ts          # Single source of truth
├── .env.example                # Environment variable template
├── scripts/
│   ├── setup.ts                # Interactive setup wizard
│   └── seed.ts                 # Database seeder
├── src/
│   ├── components/
│   │   ├── ui/                 # 20+ shadcn/ui components
│   │   ├── layout/             # Header, Footer, Sidebar, MobileNav
│   │   ├── auth/               # Login, Register, OAuth, UserMenu
│   │   ├── admin/              # Admin panel components
│   │   ├── ai/                 # AI tools + interactive demos
│   │   ├── dashboard/          # Dashboard components
│   │   ├── blog/               # Blog cards, TOC, share buttons
│   │   └── homepage/           # 3 homepage variants
│   │       ├── modern/
│   │       ├── minimal/
│   │       └── bold-dark/
│   ├── content/                # MDX blog posts
│   ├── emails/                 # React Email templates
│   ├── layouts/                # Base, Marketing, Dashboard, Admin
│   ├── lib/
│   │   ├── providers/          # Auth, payment, DB, AI, email
│   │   ├── demo-data.ts        # Demo mode data
│   │   └── ...                 # Utils, hooks, SEO, credits
│   ├── pages/
│   │   ├── api/                # REST API endpoints
│   │   ├── admin/              # Admin routes (7 pages)
│   │   ├── auth/               # Auth pages (3 pages)
│   │   ├── blog/               # Blog routes
│   │   └── dashboard/          # Dashboard routes (4 pages)
│   ├── stores/                 # Nano Stores (auth, theme, UI)
│   └── styles/                 # Global CSS & theme variables
└── drizzle.config.ts           # Drizzle ORM config
```

---

## Deployment

```bash
npm run build    # Build for production
npm run preview  # Preview locally
```

**Supported platforms:**

| Platform | How |
|----------|-----|
| **Vercel** | Connect repo — auto-detects Astro |
| **Netlify** | Connect repo — uses netlify.toml |
| **Node.js** | Self-hosted with `@astrojs/node` adapter |
| **Docker** | `docker-compose up --build` |

Set your target in `.env`:
```
DEPLOY_TARGET=vercel  # "vercel" | "netlify" | "node"
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 4321 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run setup` | Interactive setup wizard (providers, config, .env) |
| `npm run seed` | Seed database with sample data |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run email:dev` | Preview React Email templates |

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) — use it for anything, free forever.

---

<div align="center">

**Built with the belief that great ideas shouldn't be held back by boilerplate code.**

If OpenBoil saves you time, consider giving it a star!

</div>
