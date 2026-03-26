/**
 * stoolap Extended Schema - Graph + Vector DB
 * 
 * Phase 4: Add relationships and embeddings
 */

import { Database } from "@stoolap/node";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DB_PATH = join(DATA_DIR, "lexicon.stoolap");

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const db = await Database.open(DB_PATH);

// ============================================
// SCHEMA: Graph (relationships)
// ============================================
await db.exec(`
  CREATE TABLE IF NOT EXISTS relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_key TEXT NOT NULL,
    to_key TEXT NOT NULL,
    relationship TEXT NOT NULL,
    weight REAL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await db.exec(`
  CREATE INDEX IF NOT EXISTS idx_relationships_from ON relationships(from_key)
`);

await db.exec(`
  CREATE INDEX IF NOT EXISTS idx_relationships_to ON relationships(to_key)
`);

// ============================================
// SCHEMA: Vector (embeddings)
// ============================================
await db.exec(`
  CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    concept_key TEXT NOT NULL,
    dimension INTEGER NOT NULL,
    vector TEXT NOT NULL,
    normalized INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await db.exec(`
  CREATE INDEX IF NOT EXISTS idx_embeddings_key ON embeddings(concept_key)
`);

// ============================================
// GRAPH OPERATIONS
// ============================================

async function addRelationship(from: string, to: string, rel: string, weight: number = 1.0) {
  await db.execute(
    `INSERT INTO relationships (from_key, to_key, relationship, weight) VALUES ($1, $2, $3, $4)`,
    [from, to, rel, weight]
  );
  console.log(`🔗 Added: ${from} --[${rel}]--> ${to}`);
}

async function getRelationships(key: string) {
  const outgoing = await db.query(
    `SELECT * FROM relationships WHERE from_key = $1`,
    [key]
  );
  const incoming = await db.query(
    `SELECT * FROM relationships WHERE to_key = $1`,
    [key]
  );
  return { outgoing, incoming };
}

async function getRelatedConcepts(key: string, depth: number = 1) {
  // Simple traversal: get all directly connected concepts
  const related = await db.query(`
    SELECT DISTINCT r.*, c.name, c.type 
    FROM relationships r
    JOIN concepts c ON (c.concept_key = r.to_key OR c.concept_key = r.from_key)
    WHERE r.from_key = $1 OR r.to_key = $1
  `, [key]);
  return related;
}

async function getGraphStats() {
  const nodes = await db.queryOne(`SELECT COUNT(DISTINCT from_key) + COUNT(DISTINCT to_key) as total FROM relationships`);
  const edges = await db.queryOne(`SELECT COUNT(*) as total FROM relationships`);
  const types = await db.query(`SELECT relationship, COUNT(*) as count FROM relationships GROUP BY relationship`);
  return { nodes: nodes?.total || 0, edges: edges?.total || 0, types };
}

// ============================================
// VECTOR OPERATIONS
// ============================================

function normalizeVector(vec: number[]): number[] {
  const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return mag > 0 ? vec.map(v => v / mag) : vec;
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * (b[i] || 0), 0);
}

async function addEmbedding(key: string, vector: number[], dimension: number) {
  const normalized = normalizeVector(vector);
  await db.execute(
    `INSERT INTO embeddings (concept_key, dimension, vector, normalized) VALUES ($1, $2, $3, 1)`,
    [key, dimension, JSON.stringify(normalized)]
  );
  console.log(`📐 Added embedding for: ${key} (dim=${dimension})`);
}

async function findSimilar(key: string, limit: number = 5) {
  // Get the query embedding
  const queryEmb = await db.queryOne(
    `SELECT vector FROM embeddings WHERE concept_key = $1`,
    [key]
  );
  
  if (!queryEmb) {
    console.log(`No embedding found for: ${key}`);
    return;
  }
  
  const queryVector = JSON.parse(queryEmb.vector);
  
  // Get all embeddings and compute similarity
  const allEmbeddings = await db.query(`SELECT * FROM embeddings WHERE concept_key != $1`, [key]);
  
  const similarities = allEmbeddings.map(emb => {
    const embVector = JSON.parse(emb.vector);
    const similarity = dotProduct(queryVector, embVector);
    return { ...emb, similarity };
  });
  
  // Sort by similarity and return top N
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, limit);
}

async function cosineSimilarity(key1: string, key2: string) {
  const emb1 = await db.queryOne(`SELECT vector FROM embeddings WHERE concept_key = $1`, [key1]);
  const emb2 = await db.queryOne(`SELECT vector FROM embeddings WHERE concept_key = $1`, [key2]);
  
  if (!emb1 || !emb2) return null;
  
  const v1 = JSON.parse(emb1.vector);
  const v2 = JSON.parse(emb2.vector);
  
  return dotProduct(v1, v2);
}

// ============================================
// DEMO
// ============================================

console.log("🔗 Graph + 📐 Vector DB POC\n");
console.log("=".repeat(50));

// Add relationships
console.log("\n📝 Adding relationships...");
await addRelationship("ctx-gumption", "ctx-symmetric-mentation", "part-of", 1.0);
await addRelationship("ctx-sovereignty", "ctx-symmetric-mentation", "part-of", 1.0);
await addRelationship("ctx-entropy", "ctx-symmetric-mentation", "measures", 0.8);
await addRelationship("ctx-gumption", "ctx-entropy", "contributes-to", 0.5);

// Query relationships
console.log("\n🔍 Graph: Concepts related to 'ctx-symmetric-mentation'");
const related = await getRelatedConcepts("ctx-symmetric-mentation");
for (const r of related) {
  console.log(`  ${r.from_key} --[${r.relationship}]--> ${r.to_key}`);
}

// Graph stats
console.log("\n📊 Graph Statistics:");
const graphStats = await getGraphStats();
console.log(`  Nodes: ${graphStats.nodes}, Edges: ${graphStats.edges}`);
for (const t of graphStats.types) {
  console.log(`  - ${t.relationship}: ${t.count}`);
}

// Add embeddings (simulated - 4D vectors)
console.log("\n📐 Adding embeddings (4D vectors)...");
await addEmbedding("ctx-gumption", [0.9, 0.2, 0.1, 0.3], 4);
await addEmbedding("ctx-sovereignty", [0.8, 0.3, 0.2, 0.4], 4);
await addEmbedding("ctx-entropy", [0.1, 0.9, 0.5, 0.2], 4);
await addEmbedding("ctx-symmetric-mentation", [0.5, 0.5, 0.3, 0.3], 4);

// Find similar
console.log("\n🔍 Vector: Find concepts similar to 'ctx-gumption'");
const similar = await findSimilar("ctx-gumption", 3);
for (const s of similar || []) {
  console.log(`  ${s.concept_key}: ${(s.similarity * 100).toFixed(1)}% similar`);
}

// Cosine similarity
console.log("\n📐 Vector: Similarity between ctx-gumption and ctx-sovereignty");
const sim = await cosineSimilarity("ctx-gumption", "ctx-sovereignty");
console.log(`  Similarity: ${((sim || 0) * 100).toFixed(1)}%`);

console.log("\n✅ Extended stoolap POC complete!");
console.log(`   Database: ${DB_PATH}`);

await db.close();
