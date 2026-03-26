/**
 * stoolap Conceptual Lexicon POC
 * 
 * Schema for storing agent concepts, heuristics, and decision logs.
 */

import { Database } from "@stoolap/node";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

// Storage path
const DATA_DIR = join(process.cwd(), "data");
const DB_PATH = join(DATA_DIR, "lexicon.stoolap");

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database
const db = await Database.open(DB_PATH);

// Schema
await db.exec(`
  CREATE TABLE IF NOT EXISTS concepts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    concept_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    version TEXT DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    concept_key TEXT NOT NULL,
    context TEXT,
    decision TEXT NOT NULL,
    rationale TEXT,
    outcome TEXT,
    agent_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (concept_key) REFERENCES concepts(concept_key)
  )
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_key TEXT,
    details TEXT,
    agent_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// CRUD operations
async function createConcept(key: string, name: string, type: string, description: string, tags: string[]) {
  await db.execute(
    `INSERT INTO concepts (concept_key, name, type, description, tags) VALUES ($1, $2, $3, $4, $5)`,
    [key, name, type, description, JSON.stringify(tags)]
  );
  
  await logAction("create", "concepts", key, `Created ${name}`);
  console.log(`✅ Created: ${key}`);
}

async function getConcept(key: string) {
  const result = await db.query(`SELECT * FROM concepts WHERE concept_key = $1`, [key]);
  return result[0];
}

async function listConcepts(type?: string) {
  const sql = type 
    ? `SELECT * FROM concepts WHERE type = $1 ORDER BY name`
    : `SELECT * FROM concepts ORDER BY type, name`;
  return await db.query(sql, type ? [type] : []);
}

async function updateConcept(key: string, updates: Record<string, any>) {
  const sets: string[] = [];
  const values: any[] = [];
  let i = 1;
  
  for (const [k, v] of Object.entries(updates)) {
    if (k !== 'concept_key' && k !== 'id') {
      sets.push(`${k} = $${i}`);
      values.push(Array.isArray(v) ? JSON.stringify(v) : v);
      i++;
    }
  }
  sets.push(`updated_at = CURRENT_TIMESTAMP`);
  
  values.push(key);
  await db.execute(
    `UPDATE concepts SET ${sets.join(", ")} WHERE concept_key = $${i}`,
    values
  );
  
  await logAction("update", "concepts", key, `Updated ${key}`);
  console.log(`✅ Updated: ${key}`);
}

async function deleteConcept(key: string) {
  await db.execute(`DELETE FROM concepts WHERE concept_key = $1`, [key]);
  await logAction("delete", "concepts", key, `Deleted ${key}`);
  console.log(`🗑️  Deleted: ${key}`);
}

async function logDecision(conceptKey: string, context: string, decision: string, rationale?: string) {
  await db.execute(
    `INSERT INTO decisions (concept_key, context, decision, rationale) VALUES ($1, $2, $3, $4)`,
    [conceptKey, context, decision, rationale]
  );
}

async function logAction(action: string, entityType: string, entityKey?: string, details?: string) {
  await db.execute(
    `INSERT INTO audit_log (action, entity_type, entity_key, details) VALUES ($1, $2, $3, $4)`,
    [action, entityType, entityKey || null, details || null]
  );
}

// Statistics
async function getStats() {
  const concepts = await db.query(`SELECT type, COUNT(*) as count FROM concepts GROUP BY type`);
  const decisions = await db.queryOne(`SELECT COUNT(*) as total FROM decisions`);
  const actions = await db.query(`SELECT action, COUNT(*) as count FROM audit_log GROUP BY action`);
  return { concepts, decisions: decisions?.total || 0, actions };
}

// Demo
console.log("📚 stoolap Conceptual Lexicon POC\n");
console.log("=".repeat(50));

// Create sample concepts
await createConcept("ctx-gumption", "Gumption", "persona", 
  "Local execution layer - high-velocity implementation", ["agent", "local", "execution"]);

await createConcept("ctx-sovereignty", "Sovereignty", "persona",
  "Cloud review layer - sovereign auditing", ["agent", "cloud", "review"]);

await createConcept("ctx-entropy", "Entropy Reduction", "heuristic",
  "Keep agent cognitive load low - reduce confusion", ["metric", "quality"]);

await createConcept("ctx-handoff", "Symmetric Mentation Handoff", "pattern",
  "Document done/remaining/decision on context switch", ["workflow", "handoff"]);

// List all
console.log("\n📖 All Concepts:");
const all = await listConcepts();
for (const row of all) {
  const tags = JSON.parse(row.tags || "[]");
  console.log(`  [${row.type}] ${row.concept_key}: ${row.name}`);
  console.log(`     "${row.description}"`);
  console.log(`     Tags: ${tags.join(", ")}`);
}

// Stats
console.log("\n📊 Statistics:");
const stats = await getStats();
console.log(`  Total concepts: ${all.length}`);
console.log(`  By type:`);
for (const s of stats.concepts) {
  console.log(`    - ${s.type}: ${s.count}`);
}

// Log a decision
await logDecision("ctx-entropy", "Choosing database", 
  "Use stoolap for new storage", 
  "Simpler API, built-in OLAP, better defaults");

console.log("\n✅ Conceptual Lexicon POC complete!");
console.log(`   Database: ${DB_PATH}`);

await db.close();
