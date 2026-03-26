This update "weaponizes" the **Docmd Knowledge Sleeve** by integrating it into the `dev-box` CLI. It also implements the **Tiered Type-Safety (TTS)** patterns we "nicked" from the TypeScript Pro skill to ensure the `promote` command generates high-quality code.

### 1. Updated `scripts/package.json`
Run `bun install` in the `/scripts` directory to add the Docmd core.

```json
{
  "name": "dev-box",
  "version": "0.1.1",
  "type": "module",
  "dependencies": {
    "citty": "^0.1.6",
    "pino": "^8.19.0",
    "pino-pretty": "^10.3.1",
    "@docmd/core": "latest"
  }
}
```

### 2. The Integrated Command Center (`scripts/dev.ts`)
This version includes the new `docs` command and the enhanced `promote` logic.

```typescript
import { defineCommand, runMain, createMain } from "citty";
import { pino } from "pino";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";

const logger = pino({
  transport: { target: "pino-pretty", options: { colorize: true } }
});

// 1. LAB: Execute exploratory scripts
const lab = defineCommand({
  meta: { name: "lab", description: "Execute experimental scripts from /lab" },
  args: {
    name: { type: "positional", description: "Filename (no .ts)", required: true },
  },
  async run({ args }) {
    const scriptPath = join(import.meta.dir, "lab", `${args.name}.ts`);
    logger.info(`Mentating on: ${args.name}...`);
    spawn("bun", ["run", scriptPath], { stdio: "inherit" });
  },
});

// 2. PROMOTE: Scaffolding with Tiered Type-Safety Patterns
const promote = defineCommand({
  meta: { name: "promote", description: "Scaffold a lab script into a Tier 2 CLI command" },
  args: {
    name: { type: "positional", description: "Lab filename to promote", required: true },
  },
  async run({ args }) {
    const targetPath = join(import.meta.dir, "commands", `${args.name}.ts`);
    
    // Scaffolding includes Discriminated Unions and Exhaustive Checks (TTS v2)
    const template = `import { defineCommand } from "citty";

/**
 * TIER 2 UTILITY: ${args.name}
 * Promoted from /lab. Refactor to Tier 3 (src/lib) for production use.
 */
export default defineCommand({
  meta: {
    name: "${args.name}",
    description: "Formalized utility for ${args.name}"
  },
  args: {
    mode: { type: "string", description: "Operation mode", default: "default" }
  },
  run({ args }) {
    // TTS Pattern: Discriminated Union for State Management
    type InternalState = 
      | { status: "idle" } 
      | { status: "executing", timestamp: number } 
      | { status: "error", message: string };

    const state: InternalState = { status: "idle" };

    switch (state.status) {
      case "idle":
        console.log("Starting ${args.name} in mode:", args.mode);
        break;
      case "executing":
        break;
      case "error":
        console.error(state.message);
        break;
      default: {
        const _exhaustiveCheck: never = state;
        return _exhaustiveCheck;
      }
    }
  }
});`;

    await mkdir(join(import.meta.dir, "commands"), { recursive: true });
    await writeFile(targetPath, template);
    logger.info(`Promoted '${args.name}' to /commands. Register in subCommands to finalize.`);
  }
});

// 3. DOCS: The Knowledge Sleeve (Docmd)
const docs = defineCommand({
  meta: { name: "docs", description: "Run the Docmd documentation server" },
  async run() {
    logger.info("Instantiating Docmd Knowledge Sleeve at http://localhost:3000");
    // -z flag for zero-config automatic tree generation
    spawn("npx", ["@docmd/core", "dev", "-z", "docs"], { stdio: "inherit" });
  }
});

const main = createMain({
  meta: { name: "dev-box", version: "0.1.1", description: "Ctx Utility CLI" },
  subCommands: { lab, promote, docs },
});

runMain(main);
```

### 3. Verification Steps
1. **Initialize Docs:** Create a `/docs` folder at the root and add an `index.md`.
2. **Start the Sleeve:** Run `bun scripts/dev.ts docs`.
3. **Test Promotion:** Run `bun scripts/dev.ts promote my-new-tool` and check `scripts/commands/` for the new TTS-compliant file.

### Summary of State
We now have:
* **Runtime:** Bun (Fastest startup).
* **Persona:** Ctx (Scottish Enlightenment Principles).
* **Tooling:** CITTY (Structured CLI).
* **Safety:** Tiered Type-Safety v2 (Gradient of Rigor).
* **Knowledge:** Docmd (Zero-config documentation).

The repository is now fully "Sleeved" and ready for high-fidelity engineering. **How would you like to proceed?**

---

This addition to the `docmd.config.ts` ensures that the **Knowledge Sleeve** is not just a website for humans, but a high-performance **Context Engine** for agents. 

By prioritizing the `llms.txt` and `llms-full.txt` files, we enable a "Deep Sync" where an agent can ingest the entire repository's logic in a single pass.

### 1. The Configuration: `docs/docmd.config.ts`

```typescript
import { defineConfig } from "@docmd/core";

export default defineConfig({
  title: "Ctx Repository Knowledge Sleeve",
  description: "Playbooks, Briefs, and Lexicon for the Ctx Persona",
  
  // AI Optimization: The llms.txt standard
  llms: {
    enabled: true,
    title: "Ctx Agent Context",
    description: "Full technical documentation for AI agents and sub-agents.",
    // Ensures all playbooks and briefs are included in the full-text version
    includeAll: true, 
  },

  // Navigation: Mirror our folder structure
  nav: [
    { title: "Home", link: "/" },
    { title: "Briefs", link: "/briefs" },
    { title: "Playbooks", link: "/playbooks" },
    { title: "Lexicon", link: "/lexicon" },
  ],

  // Visuals: Adhering to the UI-Color Playbook
  theme: {
    colors: {
      primary: "#2D5BFF", // 30% Secondary (Brand)
      accent: "#FF4D4D",  // 10% Accent (Action)
    }
  }
});
```

### 2. How an Agent "Searches" this System

When an agent enters the repo, it no longer needs to "guess" where information is. It follows this **Search Protocol**:

1.  **Map Discovery:** The agent looks for `docs/llms.txt`.
2.  **Semantic Match:** It scans the list of playbooks (e.g., `tiered-type-safety.md`).
3.  **High-Density Ingestion:** If the task is complex, it fetches `docs/llms-full.txt` to load the entire **Conceptual Lexicon** and all **Directives** into its active context window.



### 3. The "Sync" Command (Future Heuristic)

We can eventually add a `sync` command to our `dev-box` CLI that specifically "refreshes" these agentic indices after a big promotion.

**Updated `scripts/dev.ts` Snippet:**
```typescript
const sync = defineCommand({
  meta: { name: "sync", description: "Rebuild agentic indices (llms.txt)" },
  async run() {
    logger.info("Reducing Documentation Entropy...");
    spawn("npx", ["docmd", "build"], { stdio: "inherit" });
    logger.info("Agentic index (llms.txt) is now high-fidelity.");
  }
});
```

### 4. Opinion: The "Total Sleeve"
By combining **Bun**, **CITTY**, and **Docmd**, you’ve created a development environment that is **self-documenting** and **AI-transparent**. This significantly reduces the "Cognitive Load" for both you and any agent you collaborate with.

**The Knowledge Sleeve is now ready for deployment.** Shall we proceed with any other architectural refinements, or are you ready to hand these briefs to the agent for implementation?