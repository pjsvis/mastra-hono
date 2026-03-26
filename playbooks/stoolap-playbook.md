---
id: PB-STOOLAP
title: "Stoolap Playbook"
role: "Orchestrate"
infrastructure: [stoolap]
last_updated: "2026-03-26"
tags: [playbook]
---

# Stoolap Playbook

Embedded SQL database with MVCC, graph, and vector support. Replaces SQLite with saner defaults and no WAL confusion.

**Core Philosophy:** Simple mental model. One file = one database. No modes to manage.

## Usage

### Quick Start

```bash
# Install
bun add @stoolap/node

# Initialize database
bun scripts/lab/stoolap-cli.ts help
```

### CLI Commands

```bash
# Concepts (CRUD)
bun scripts/lab/stoolap-cli.ts list
bun scripts/lab/stoolap-cli.ts add <key> <type> <name> [description]
bun scripts/lab/stoolap-cli.ts get <key>
bun scripts/lab/stoolap-cli.ts update <key> <field> <value>
bun scripts/lab/stoolap-cli.ts delete <key>

# Graph (Relationships)
bun scripts/lab/stoolap-cli.ts link <from> <to> <relationship> [weight]
bun scripts/lab/stoolap-cli.ts links [key]

# Vector (Embeddings)
bun scripts/lab/stoolap-cli.ts embed <key> <dim1> <dim2> ...
bun scripts/lab/stoolap-cli.ts similar <key> [limit]

# Utility
bun scripts/lab/stoolap-cli.ts stats
```

---

## Reference

### Schema

```sql
-- Concepts
CREATE TABLE concepts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  tags TEXT,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relationships (Graph)
CREATE TABLE relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_key TEXT NOT NULL,
  to_key TEXT NOT NULL,
  relationship TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Embeddings (Vector)
CREATE TABLE embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_key TEXT NOT NULL,
  dimension INTEGER NOT NULL,
  vector TEXT NOT NULL,  -- JSON array
  normalized INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Decisions (Audit)
CREATE TABLE decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_key TEXT NOT NULL,
  context TEXT,
  decision TEXT NOT NULL,
  rationale TEXT,
  outcome TEXT,
  agent_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_key TEXT,
  details TEXT,
  agent_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API (Node.js)

```typescript
import { Database } from "@stoolap/node";

// Open database
const db = await Database.open(":memory:");  // or file path

// Execute SQL
await db.exec(`CREATE TABLE ...`);

// Query with parameters
const results = await db.query(
  `SELECT * FROM concepts WHERE type = $1`,
  ["persona"]
);

// Execute (no results)
await db.execute(
  `INSERT INTO concepts (concept_key, name, type) VALUES ($1, $2, $3)`,
  ["key-001", "Name", "type"]
);

// Close
await db.close();
```

### Parameters

- Positional: `$1`, `$2`, `$3`...
- Named: `:name` (object syntax)

### Gotchas

1. **INTEGER PRIMARY KEY** - Only INTEGER (not TEXT) can be primary key
2. **AUTOINCREMENT** - Use explicitly
3. **Reserved words** - Avoid: `KEY`, `SELECT`, `TABLE`, etc.

---

## Setup

### Installation

```bash
bun add @stoolap/node

# If native bindings missing:
cd node_modules/@stoolap/node && npm rebuild
```

### Database Location

Default: `data/lexicon.stoolap`

Create directory if needed:
```bash
mkdir -p data
```

---

## Browser (WASM)

```javascript
// Load WASM
const wasm = await import('/assets/wasm/stoolap.js');
await wasm.default();

const db = new wasm.StoolapDB();

// Use same SQL API
db.execute_batch(`
  CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  );
  INSERT INTO products VALUES (1, 'Laptop');
`);

const results = db.query("SELECT * FROM products");
```

### Benefits
- Zero backend
- Offline capable
- Sync when online
- Edge functions (Cloudflare Workers, Deno Deploy)

---

## Migration from SQLite

### SQLite → Stoolap Mapping

| SQLite | Stoolap | Notes |
|--------|---------|-------|
| `INTEGER PRIMARY KEY` | Same | Required |
| `AUTOINCREMENT` | `AUTOINCREMENT` | Same syntax |
| `?` params | `$1`, `$2` | Different |
| `WAL mode` | N/A | Not needed |
| `BEGIN TRANSACTION` | N/A | Not needed |

### Migration Steps

1. Export SQLite schema
2. Convert parameter syntax (`?` → `$1`)
3. Remove WAL mode settings
4. Test queries
5. Swap connection string

### Example

```typescript
// SQLite
db.prepare("SELECT * FROM users WHERE id = ?").get(id);

// Stoolap
const results = await db.query("SELECT * FROM users WHERE id = $1", [id]);
```

---

## See Also

- [Setup Playbook](./setup-playbook.md) - Tool installation
- [Loading Process](./loading-process-playbook.md) - Two-step loading pattern
