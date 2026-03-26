/**
 * stoolap CLI - Conceptual Lexicon with Graph + Vector
 */

import { Database } from "@stoolap/node";
import { existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DB_PATH = join(DATA_DIR, "lexicon.stoolap");

if (!existsSync(DB_PATH)) {
  console.error("❌ Database not found.");
  process.exit(1);
}

const db = await Database.open(DB_PATH);

const [cmd, ...args] = process.argv.slice(2);

// ============================================
// HELPERS
// ============================================

function normalizeVector(vec: number[]): number[] {
  const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return mag > 0 ? vec.map(v => v / mag) : vec;
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * (b[i] || 0), 0);
}

// ============================================
// COMMANDS
// ============================================

async function run() {
  switch (cmd) {
    // --- Concepts ---
    case "list": {
      const concepts = await db.query("SELECT * FROM concepts ORDER BY type, name");
      for (const c of concepts) {
        console.log(`[${c.type}] ${c.concept_key}: ${c.name}`);
        console.log(`   "${c.description}"`);
      }
      break;
    }

    case "add": {
      const [key, type, name, ...desc] = args;
      if (!key || !type || !name) {
        console.error("Usage: add <key> <type> <name> [description]");
        process.exit(1);
      }
      await db.execute(
        `INSERT INTO concepts (concept_key, name, type, description) VALUES ($1, $2, $3, $4)`,
        [key, name, type, desc.join(" ")]
      );
      console.log(`✅ Added: ${key}`);
      break;
    }

    case "get": {
      const [key] = args;
      const result = await db.query("SELECT * FROM concepts WHERE concept_key = $1", [key]);
      if (result.length === 0) {
        console.log("Not found");
      } else {
        console.log(JSON.stringify(result[0], null, 2));
      }
      break;
    }

    case "update": {
      const [key, field, ...valueParts] = args;
      if (!key || !field || valueParts.length === 0) {
        console.error("Usage: update <key> <field> <value>");
        process.exit(1);
      }
      await db.execute(
        `UPDATE concepts SET ${field} = $1, updated_at = CURRENT_TIMESTAMP WHERE concept_key = $2`,
        [valueParts.join(" "), key]
      );
      console.log(`✅ Updated: ${key}.${field}`);
      break;
    }

    case "delete": {
      const [key] = args;
      await db.execute("DELETE FROM concepts WHERE concept_key = $1", [key]);
      console.log(`🗑️  Deleted: ${key}`);
      break;
    }

    // --- Relationships (Graph) ---
    case "link": {
      const [from, to, rel, weight] = args;
      if (!from || !to || !rel) {
        console.error("Usage: link <from_key> <to_key> <relationship> [weight]");
        process.exit(1);
      }
      await db.execute(
        `INSERT INTO relationships (from_key, to_key, relationship, weight) VALUES ($1, $2, $3, $4)`,
        [from, to, rel, parseFloat(weight) || 1.0]
      );
      console.log(`🔗 ${from} --[${rel}]--> ${to}`);
      break;
    }

    case "links": {
      const [key] = args;
      const outgoing = await db.query("SELECT * FROM relationships WHERE from_key = $1", [key || ""]);
      const incoming = await db.query("SELECT * FROM relationships WHERE to_key = $1", [key || ""]);
      
      if (key) {
        console.log(`Relationships for: ${key}`);
        for (const r of outgoing) {
          console.log(`  → ${r.to_key} [${r.relationship}]`);
        }
        for (const r of incoming) {
          console.log(`  ← ${r.from_key} [${r.relationship}]`);
        }
      } else {
        console.log("All relationships:");
        for (const r of [...outgoing, ...incoming]) {
          console.log(`  ${r.from_key} --[${r.relationship}]--> ${r.to_key}`);
        }
      }
      break;
    }

    // --- Embeddings (Vector) ---
    case "embed": {
      const [key, ...vecParts] = args;
      if (!key || vecParts.length === 0) {
        console.error("Usage: embed <key> <dim1> <dim2> ...");
        process.exit(1);
      }
      const vector = vecParts.map(Number);
      if (vector.some(isNaN)) {
        console.error("All dimensions must be numbers");
        process.exit(1);
      }
      const normalized = normalizeVector(vector);
      await db.execute(
        `INSERT INTO embeddings (concept_key, dimension, vector, normalized) VALUES ($1, $2, $3, 1)`,
        [key, vector.length, JSON.stringify(normalized)]
      );
      console.log(`📐 Added embedding: ${key} (${vector.length}D, normalized)`);
      break;
    }

    case "similar": {
      const [key, limit] = args;
      if (!key) {
        console.error("Usage: similar <key> [limit]");
        process.exit(1);
      }
      
      const queryEmb = await db.queryOne(
        "SELECT vector FROM embeddings WHERE concept_key = $1", [key]
      );
      if (!queryEmb) {
        console.log("No embedding found for:", key);
        break;
      }
      
      const queryVector = JSON.parse(queryEmb.vector);
      const allEmbeddings = await db.query(
        "SELECT * FROM embeddings WHERE concept_key != $1", [key]
      );
      
      const similarities = allEmbeddings.map(emb => ({
        key: emb.concept_key,
        similarity: dotProduct(queryVector, JSON.parse(emb.vector))
      }));
      
      similarities.sort((a, b) => b.similarity - a.similarity);
      const top = similarities.slice(0, parseInt(limit) || 5);
      
      console.log(`Most similar to ${key}:`);
      for (const s of top) {
        console.log(`  ${s.key}: ${(s.similarity * 100).toFixed(1)}%`);
      }
      break;
    }

    case "stats": {
      const concepts = await db.queryOne("SELECT COUNT(*) as c FROM concepts");
      const relationships = await db.queryOne("SELECT COUNT(*) as r FROM relationships");
      const embeddings = await db.queryOne("SELECT COUNT(*) as e FROM embeddings");
      console.log(`📊 Lexicon Statistics:`);
      console.log(`  Concepts: ${concepts?.c || 0}`);
      console.log(`  Relationships: ${relationships?.r || 0}`);
      console.log(`  Embeddings: ${embeddings?.e || 0}`);
      break;
    }

    case "help":
    default:
      console.log(`
stoolap CLI - Graph + Vector Lexicon

Concepts:
  list                          List all concepts
  add <key> <type> <name> [desc]  Add concept
  get <key>                     Get concept details
  update <key> <field> <value>  Update concept
  delete <key>                 Delete concept

Graph (Relationships):
  link <from> <to> <rel> [wt]  Add relationship
  links [key]                  List relationships

Vector (Embeddings):
  embed <key> <dim1> <dim2>...  Add embedding
  similar <key> [limit]         Find similar concepts

Utility:
  stats                         Show statistics
`);
  }
}

await run();
await db.close();
