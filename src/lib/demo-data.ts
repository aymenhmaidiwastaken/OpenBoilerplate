/**
 * Realistic demo/seed data for preview mode.
 * Used by API routes when the openboil-demo cookie is set.
 */

// ─── Users ───────────────────────────────────────────────────
export const demoUsers = [
  { id: "u_1", name: "Sarah Chen", email: "sarah.chen@launchfast.io", role: "admin" as const, banned: false, emailVerified: true, plan: "enterprise", credits: 48200, createdAt: "2024-08-15T09:23:00Z" },
  { id: "u_2", name: "Marcus Rodriguez", email: "marcus@devstack.co", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 3840, createdAt: "2024-09-02T14:11:00Z" },
  { id: "u_3", name: "Emily Watson", email: "emily.w@nexusai.com", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 2190, createdAt: "2024-09-18T08:45:00Z" },
  { id: "u_4", name: "James Donovan", email: "james@acme-inc.com", role: "user" as const, banned: false, emailVerified: true, plan: "enterprise", credits: 41500, createdAt: "2024-10-05T11:30:00Z" },
  { id: "u_5", name: "Priya Sharma", email: "priya@cloudnine.dev", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 4100, createdAt: "2024-10-12T16:20:00Z" },
  { id: "u_6", name: "Alex Kim", email: "alex.kim@bytecraft.io", role: "user" as const, banned: false, emailVerified: true, plan: "free", credits: 62, createdAt: "2024-10-28T10:05:00Z" },
  { id: "u_7", name: "Olivia Martinez", email: "olivia@startupgrind.com", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 3250, createdAt: "2024-11-03T13:45:00Z" },
  { id: "u_8", name: "Daniel Park", email: "daniel.park@fintech.co", role: "user" as const, banned: false, emailVerified: true, plan: "enterprise", credits: 45800, createdAt: "2024-11-10T09:15:00Z" },
  { id: "u_9", name: "Sophie Turner", email: "sophie@creativelab.design", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 1820, createdAt: "2024-11-22T15:30:00Z" },
  { id: "u_10", name: "Raj Patel", email: "raj.patel@quantumleap.ai", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 2950, createdAt: "2024-12-01T08:00:00Z" },
  { id: "u_11", name: "Mia Johnson", email: "mia.j@greenfield.co", role: "user" as const, banned: false, emailVerified: true, plan: "free", credits: 45, createdAt: "2024-12-08T11:20:00Z" },
  { id: "u_12", name: "Liam O'Brien", email: "liam@devhorizon.io", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 4500, createdAt: "2024-12-15T14:00:00Z" },
  { id: "u_13", name: "Nina Kowalski", email: "nina.k@pixelwave.studio", role: "user" as const, banned: true, emailVerified: true, plan: "free", credits: 0, createdAt: "2024-12-20T09:30:00Z" },
  { id: "u_14", name: "Tom Wilson", email: "tom.wilson@saasify.app", role: "user" as const, banned: false, emailVerified: false, plan: "free", credits: 100, createdAt: "2025-01-02T10:45:00Z" },
  { id: "u_15", name: "Aisha Rahman", email: "aisha@codebreeze.dev", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 3100, createdAt: "2025-01-08T16:15:00Z" },
  { id: "u_16", name: "Chris Taylor", email: "chris.t@rocketship.io", role: "user" as const, banned: false, emailVerified: true, plan: "free", credits: 88, createdAt: "2025-01-15T12:00:00Z" },
  { id: "u_17", name: "Yuki Tanaka", email: "yuki@zenstack.jp", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 2700, createdAt: "2025-01-20T08:30:00Z" },
  { id: "u_18", name: "Ben Carter", email: "ben.carter@flowstate.dev", role: "user" as const, banned: false, emailVerified: true, plan: "enterprise", credits: 47300, createdAt: "2025-01-25T14:20:00Z" },
  { id: "u_19", name: "Emma Davis", email: "emma@brightpath.co", role: "user" as const, banned: false, emailVerified: false, plan: "free", credits: 100, createdAt: "2025-02-01T09:00:00Z" },
  { id: "u_20", name: "Leo Nguyen", email: "leo.ng@buildfast.dev", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 4200, createdAt: "2025-02-05T11:45:00Z" },
  { id: "u_21", name: "Isabella Foster", email: "isabella@launchpad.io", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 3600, createdAt: "2025-02-10T15:30:00Z" },
  { id: "u_22", name: "Noah Brooks", email: "noah@stackforge.dev", role: "user" as const, banned: false, emailVerified: true, plan: "free", credits: 34, createdAt: "2025-02-14T10:10:00Z" },
  { id: "u_23", name: "Ava Mitchell", email: "ava.m@dataflow.ai", role: "user" as const, banned: false, emailVerified: true, plan: "enterprise", credits: 49100, createdAt: "2025-02-18T13:00:00Z" },
  { id: "u_24", name: "Ethan Clarke", email: "ethan@rapidbuild.co", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 2400, createdAt: "2025-02-22T08:15:00Z" },
  { id: "u_25", name: "Grace Lee", email: "grace.lee@innovate.studio", role: "user" as const, banned: false, emailVerified: true, plan: "pro", credits: 3800, createdAt: "2025-02-28T17:00:00Z" },
];

// ─── Subscriptions ───────────────────────────────────────────
export const demoSubscriptions = [
  { id: "sub_1", userId: "u_1", userEmail: "sarah.chen@launchfast.io", plan: "enterprise", status: "active", amount: 9900, currentPeriodEnd: "2025-04-15T00:00:00Z" },
  { id: "sub_2", userId: "u_2", userEmail: "marcus@devstack.co", plan: "pro", status: "active", amount: 2900, currentPeriodEnd: "2025-04-02T00:00:00Z" },
  { id: "sub_3", userId: "u_3", userEmail: "emily.w@nexusai.com", plan: "pro", status: "active", amount: 2900, currentPeriodEnd: "2025-04-18T00:00:00Z" },
  { id: "sub_4", userId: "u_4", userEmail: "james@acme-inc.com", plan: "enterprise", status: "active", amount: 9900, currentPeriodEnd: "2025-04-05T00:00:00Z" },
  { id: "sub_5", userId: "u_5", userEmail: "priya@cloudnine.dev", plan: "pro", status: "active", amount: 2900, currentPeriodEnd: "2025-04-12T00:00:00Z" },
  { id: "sub_6", userId: "u_7", userEmail: "olivia@startupgrind.com", plan: "pro", status: "trialing", amount: 2900, currentPeriodEnd: "2025-03-17T00:00:00Z" },
  { id: "sub_7", userId: "u_8", userEmail: "daniel.park@fintech.co", plan: "enterprise", status: "active", amount: 9900, currentPeriodEnd: "2025-04-10T00:00:00Z" },
  { id: "sub_8", userId: "u_9", userEmail: "sophie@creativelab.design", plan: "pro", status: "active", amount: 2900, currentPeriodEnd: "2025-04-22T00:00:00Z" },
  { id: "sub_9", userId: "u_10", userEmail: "raj.patel@quantumleap.ai", plan: "pro", status: "active", amount: 2900, currentPeriodEnd: "2025-04-01T00:00:00Z" },
  { id: "sub_10", userId: "u_12", userEmail: "liam@devhorizon.io", plan: "pro", status: "canceled", amount: 2900, currentPeriodEnd: "2025-03-15T00:00:00Z" },
  { id: "sub_11", userId: "u_15", userEmail: "aisha@codebreeze.dev", plan: "pro", status: "active", amount: 2900, currentPeriodEnd: "2025-04-08T00:00:00Z" },
  { id: "sub_12", userId: "u_17", userEmail: "yuki@zenstack.jp", plan: "pro", status: "trialing", amount: 2900, currentPeriodEnd: "2025-03-20T00:00:00Z" },
  { id: "sub_13", userId: "u_18", userEmail: "ben.carter@flowstate.dev", plan: "enterprise", status: "active", amount: 9900, currentPeriodEnd: "2025-04-25T00:00:00Z" },
  { id: "sub_14", userId: "u_20", userEmail: "leo.ng@buildfast.dev", plan: "pro", status: "active", amount: 2900, currentPeriodEnd: "2025-04-05T00:00:00Z" },
  { id: "sub_15", userId: "u_21", userEmail: "isabella@launchpad.io", plan: "pro", status: "active", amount: 2900, currentPeriodEnd: "2025-04-10T00:00:00Z" },
  { id: "sub_16", userId: "u_23", userEmail: "ava.m@dataflow.ai", plan: "enterprise", status: "active", amount: 9900, currentPeriodEnd: "2025-04-18T00:00:00Z" },
  { id: "sub_17", userId: "u_24", userEmail: "ethan@rapidbuild.co", plan: "pro", status: "active", amount: 2900, currentPeriodEnd: "2025-04-22T00:00:00Z" },
  { id: "sub_18", userId: "u_25", userEmail: "grace.lee@innovate.studio", plan: "pro", status: "active", amount: 2900, currentPeriodEnd: "2025-04-28T00:00:00Z" },
];

// ─── Analytics (signups) ─────────────────────────────────────
// Realistic growth curve over 30 days
export function getDemoSignups() {
  const signups = [];
  const now = new Date();
  // Simulate organic growth with weekend dips
  const baseValues = [
    12, 15, 18, 14, 11, 8, 7, 19, 22, 25, 20, 17, 9, 8,
    24, 28, 31, 26, 23, 11, 10, 33, 35, 38, 30, 27, 13, 12, 40, 42,
  ];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    signups.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: baseValues[29 - i],
    });
  }
  return signups;
}

// Revenue by month — steady MRR growth
export function getDemoRevenue() {
  return [
    { month: "Apr", revenue: 2400 },
    { month: "May", revenue: 3100 },
    { month: "Jun", revenue: 3800 },
    { month: "Jul", revenue: 4900 },
    { month: "Aug", revenue: 5600 },
    { month: "Sep", revenue: 6200 },
    { month: "Oct", revenue: 7400 },
    { month: "Nov", revenue: 8100 },
    { month: "Dec", revenue: 8900 },
    { month: "Jan", revenue: 9800 },
    { month: "Feb", revenue: 11200 },
    { month: "Mar", revenue: 12400 },
  ];
}

// ─── Admin stats ─────────────────────────────────────────────
export const demoStats = {
  totalUsers: "2,847",
  monthlyRevenue: "$12,400",
  activeSubscriptions: "342",
  aiUsage: "18,439",
};

// ─── Usage timeline (admin) ──────────────────────────────────
export function getDemoUsageTimeline() {
  const timeline = [];
  const now = new Date();
  const values = [
    { text: 145, image: 42, doc: 18 },
    { text: 162, image: 38, doc: 22 },
    { text: 138, image: 51, doc: 15 },
    { text: 189, image: 47, doc: 28 },
    { text: 201, image: 55, doc: 31 },
    { text: 175, image: 39, doc: 19 },
    { text: 112, image: 28, doc: 11 },
    { text: 156, image: 44, doc: 24 },
    { text: 198, image: 62, doc: 29 },
    { text: 210, image: 58, doc: 35 },
    { text: 185, image: 49, doc: 27 },
    { text: 223, image: 65, doc: 33 },
    { text: 195, image: 52, doc: 26 },
    { text: 240, image: 71, doc: 38 },
  ];
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const v = values[13 - i];
    timeline.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      "ai-text": v.text,
      "ai-image": v.image,
      "ai-document": v.doc,
    });
  }
  return timeline;
}

// ─── Blog posts ──────────────────────────────────────────────
export const demoBlogPosts = [
  { id: "1", title: "Introducing OpenBoil: Ship Your SaaS in Days, Not Months", slug: "introducing-openboil", published: true, createdAt: "2025-01-10T09:00:00Z", updatedAt: "2025-01-12T14:30:00Z" },
  { id: "2", title: "How to Set Up Authentication with Supabase in 5 Minutes", slug: "supabase-auth-guide", published: true, createdAt: "2025-01-18T11:00:00Z", updatedAt: "2025-01-20T09:15:00Z" },
  { id: "3", title: "Building AI-Powered Features with the Credit System", slug: "ai-credit-system", published: true, createdAt: "2025-01-25T08:30:00Z", updatedAt: "2025-02-01T16:00:00Z" },
  { id: "4", title: "Provider Swapping: From Stripe to LemonSqueezy in One Line", slug: "provider-swapping-guide", published: true, createdAt: "2025-02-03T10:00:00Z", updatedAt: "2025-02-05T11:20:00Z" },
  { id: "5", title: "Deploying to Vercel, Netlify, and Docker", slug: "deployment-guide", published: true, createdAt: "2025-02-10T13:00:00Z", updatedAt: "2025-02-12T15:45:00Z" },
  { id: "6", title: "Building a Custom Admin Dashboard with OpenBoil", slug: "custom-admin-dashboard", published: true, createdAt: "2025-02-18T09:30:00Z", updatedAt: "2025-02-20T10:00:00Z" },
  { id: "7", title: "OpenBoil v1.1: What's New and What's Coming", slug: "v1-1-release-notes", published: false, createdAt: "2025-03-01T08:00:00Z", updatedAt: "2025-03-03T14:30:00Z" },
  { id: "8", title: "How We Scaled to 5,000 Users with Zero DevOps", slug: "scaling-to-5000-users", published: false, createdAt: "2025-03-04T11:00:00Z", updatedAt: "2025-03-04T11:00:00Z" },
];

// ─── User usage records (dashboard) ──────────────────────────
export function getDemoUserUsage() {
  const now = new Date();
  const records = [
    { id: "rec_1", type: "ai-text", credits: -5, metadata: { template: "Blog Post" }, hoursAgo: 2 },
    { id: "rec_2", type: "ai-image", credits: -10, metadata: { size: "1024x1024" }, hoursAgo: 5 },
    { id: "rec_3", type: "ai-document", credits: -8, metadata: { action: "summarize" }, hoursAgo: 24 },
    { id: "rec_4", type: "ai-text", credits: -5, metadata: { template: "Marketing Copy" }, hoursAgo: 28 },
    { id: "rec_5", type: "ai-text", credits: -5, metadata: { template: "Product Description" }, hoursAgo: 48 },
    { id: "rec_6", type: "ai-image", credits: -10, metadata: { size: "512x512" }, hoursAgo: 52 },
    { id: "rec_7", type: "ai-document", credits: -8, metadata: { action: "extract" }, hoursAgo: 72 },
    { id: "rec_8", type: "ai-text", credits: -5, metadata: { template: "Email Copy" }, hoursAgo: 96 },
    { id: "rec_9", type: "ai-text", credits: -5, metadata: { template: "Social Media Post" }, hoursAgo: 100 },
    { id: "rec_10", type: "ai-image", credits: -10, metadata: { size: "1024x1024" }, hoursAgo: 120 },
    { id: "rec_11", type: "ai-text", credits: -5, metadata: { template: "Blog Post" }, hoursAgo: 144 },
    { id: "rec_12", type: "ai-document", credits: -8, metadata: { action: "qa" }, hoursAgo: 168 },
    { id: "rec_13", type: "ai-text", credits: -5, metadata: { template: "Landing Page" }, hoursAgo: 192 },
    { id: "rec_14", type: "ai-image", credits: -10, metadata: { size: "1024x1024" }, hoursAgo: 200 },
    { id: "rec_15", type: "ai-text", credits: -5, metadata: { template: "Blog Post" }, hoursAgo: 240 },
  ];

  return records.map((r) => ({
    ...r,
    userId: "demo-user",
    createdAt: new Date(now.getTime() - r.hoursAgo * 3600000).toISOString(),
  }));
}

// ─── Helper: check if request is demo mode ───────────────────
export function isDemo(cookies: { get: (name: string) => { value: string } | undefined }): boolean {
  return cookies.get("openboil-demo")?.value === "true";
}
