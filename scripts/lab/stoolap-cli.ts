/**
 * stoolap CLI - Simple command interface for the lexicon
 * 
 * Usage: bun scripts/lab/stoolap-cli.ts <command> [args]
 */

import { Database } from "@stoolap/node";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DB_PATH = join(DATA_DIR, "lexicon.stoolap");

// Ensure DB exists
if (!existsSync(DB_PATH)) {
  console.error("❌ Database not found. Run stoolap-lexicon.ts first.");
  process.exit(1);
}

const db = await Database.open(DB_PATH);

const command = process.argv[2];

async function run() {
  switch (command) {
    case "list": {
      const concepts = await db.query("SELECT * FROM concepts ORDER BY type, name");
      if (concepts.length === 0) {
        console.log("No concepts found.");
      } else {
        for (const c of concepts) {
          console.log(`[${c.type}] ${c.concept_key}: ${c.name}`);
          console.log(`   "${c.description}"`);
        }
      }
      break;
    }

    case "add": {
      const [key, type, name, ...descParts] = process.argv.slice(3);
      const description = descParts.join(" ");
      
      if (!key || !type || !name) {
        console.error("Usage: stoolap-cli add <key> <type> <name> [description]");
        process.exit(1);
      }
      
      await db.execute(
        `INSERT INTO concepts (concept_key, name, type, description) VALUES ($1, $2, $3, $4)`,
        [key, name, type, description || ""]
      );
      console.log(`✅ Added: ${key}`);
      break;
    }

    case "get": {
      const key = process.argv[3];
      if (!key) {
        console.error("Usage: stoolap-cli get <key>");
        process.exit(1);
      }
      const result = await db.query("SELECT * FROM concepts WHERE concept_key = $1", [key]);
      if (result.length === 0) {
        console.log(`Not found: ${key}`);
      } else {
        console.log(JSON.stringify(result[0], null, 2));
      }
      break;
    }

    case "delete": {
      const key = process.argv[3];
      if (!key) {
        console.error("Usage: stoolap-cli delete <key>");
        process.exit(1);
      }
      await db.execute("DELETE FROM concepts WHERE concept_key = $1", [key]);
      console.log(`🗑️  Deleted: ${key}`);
      break;
    }

    case "log": {
      const [conceptKey, decision, ...ctxParts] = process.argv.slice(3);
      const context = ctxParts.join(" ");
      
      await db.execute(
        `INSERT INTO decisions (concept_key, decision, context) VALUES ($1, $2, $3)`,
        [conceptKey, decision, context || ""]
      );
      console.log(`📝 Logged decision for: ${conceptKey}`);
      break;
    }

    case "audit": {
      const actions = await db.query("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 20");
      for (const a of actions) {
        console.log(`[${a.action}] ${a.entity_type}: ${a.entity_key} - ${a.details}`);
      }
      break;
    }

    case "help":
    default:
      console.log(`
stoolap CLI - Conceptual Lexicon

Commands:
  list              List all concepts
  add <key> <type> <name> [desc]   Add a concept
  get <key>         Get a concept
  delete <key>      Delete a concept
  log <key> <decision> [context]   Log a decision
  audit             Show recent audit log
`);
  }
}

await run();
await db.close();
