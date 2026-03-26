/**
 * stoolap POC - Minimal test
 * 
 * Test: Can stoolap replace SQLite for Conceptual Lexicon storage?
 */

import { Database } from "@stoolap/node";

const db = await Database.open(":memory:");

// Create schema with autoincrement
await db.exec(`
  CREATE TABLE concepts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    concept_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    tags TEXT
  )
`);

// Insert test data
await db.execute(
  `INSERT INTO concepts (concept_key, name, category, description, tags) VALUES ($1, $2, $3, $4, $5)`,
  ["ctx-001", "Gumption", "Persona", "Local execution layer", '["agent","local"]']
);

await db.execute(
  `INSERT INTO concepts (concept_key, name, category, description, tags) VALUES ($1, $2, $3, $4, $5)`,
  ["ctx-002", "Sovereignty", "Persona", "Cloud review layer", '["agent","cloud"]']
);

await db.execute(
  `INSERT INTO concepts (concept_key, name, category, description, tags) VALUES ($1, $2, $3, $4, $5)`,
  ["ctx-003", "Entropy", "Metric", "Measure of confusion", '["score","metric"]']
);

// Query all
const results = await db.query(`SELECT * FROM concepts`);

console.log("🎯 All concepts:");
for (const row of results) {
  console.log(`  - ${row.name} (${row.category}): ${row.description}`);
}

// Filter by category
const personas = await db.query(`SELECT * FROM concepts WHERE category = $1`, ["Persona"]);

console.log("\n📊 Persona concepts:");
for (const row of personas) {
  console.log(`  - ${row.name}: ${row.description}`);
}

// Aggregation
const byCategory = await db.query(`SELECT category, COUNT(*) as count FROM concepts GROUP BY category`);

console.log("\n📈 Concepts by category:");
for (const row of byCategory) {
  console.log(`  - ${row.category}: ${row.count}`);
}

await db.close();
console.log("\n✅ stoolap POC complete!");
