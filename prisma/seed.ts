// Seed script - run with: npx tsx prisma/seed.ts
// Uses the native SQLite driver directly since Prisma v7 requires adapter/config

import Database from "better-sqlite3";
import { resolve } from "path";

const dbPath = resolve(__dirname, "..", "dev.db");
const db = new Database(dbPath);

const sampleUrls = [
  {
    url: "https://example.com/product-1",
    title: "Amazing Product Launch",
    description: "Check out our latest product release",
  },
  {
    url: "https://example.com/blog-post",
    title: "How to Boost Productivity",
    description: "10 tips that actually work",
  },
  {
    url: "https://example.com/deal",
    title: "Summer Sale - 50% Off",
    description: "Limited time offer on all items",
  },
  {
    url: "https://example.com/guide",
    title: "Complete Beginner's Guide",
    description: "Everything you need to know to get started",
  },
  {
    url: "https://example.com/news",
    title: "Breaking Industry News",
    description: "The latest updates from the industry",
  },
];

console.log("Seeding database...");

const insert = db.prepare(
  "INSERT INTO Url (url, title, description, isActive, createdAt, updatedAt) VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))"
);

for (const data of sampleUrls) {
  insert.run(data.url, data.title, data.description);
}

console.log(`Seeded ${sampleUrls.length} URLs`);
db.close();
