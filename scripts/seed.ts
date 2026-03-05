import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../src/providers/database/drizzle/schema";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required. Set it in your .env file.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log("Seeding database...");

  // Create admin user
  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@openboil.com",
      name: "Admin User",
      role: "admin",
      emailVerified: true,
      credits: 99999,
      passwordHash: "$2a$12$LJ3m4ys3Jz1r9X8d8J5z8.QkTcI5v7Vh3t1Z5m8Q9J4K7G6F5H2W.", // "password123"
    })
    .returning();

  console.log("Created admin user:", admin.email);

  // Create sample users
  const sampleUsers = [
    { email: "john@example.com", name: "John Doe", credits: 4500 },
    { email: "jane@example.com", name: "Jane Smith", credits: 2300 },
    { email: "bob@example.com", name: "Bob Wilson", credits: 100 },
  ];

  for (const user of sampleUsers) {
    const [created] = await db
      .insert(schema.users)
      .values({
        ...user,
        role: "user",
        emailVerified: true,
        passwordHash: "$2a$12$LJ3m4ys3Jz1r9X8d8J5z8.QkTcI5v7Vh3t1Z5m8Q9J4K7G6F5H2W.",
      })
      .returning();
    console.log("Created user:", created.email);

    // Add sample usage
    await db.insert(schema.usage).values([
      { userId: created.id, type: "ai-text", credits: 1 },
      { userId: created.id, type: "ai-image", credits: 5 },
      { userId: created.id, type: "ai-document", credits: 3 },
    ]);
  }

  // Create sample subscriptions
  const users = await db.select().from(schema.users);
  for (const user of users.slice(0, 2)) {
    await db.insert(schema.subscriptions).values({
      userId: user.id,
      planId: "pro",
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      externalId: `sub_${Math.random().toString(36).slice(2)}`,
    });
  }

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
