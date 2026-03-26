This "weaponization" follows the **Principle of Explicit Formulation (PHI-5)**. We are providing the "Sleeve" (the environment and tools) so the "Persona" (the agent) can execute with **High Fidelity**.

I have structured this as a **Bootstrap Package**. You can hand this block to an agent, or create these files manually to initialize the `dev-box`.

### 1. The Environment (`scripts/package.json`)
We keep dependencies separate from the root to maintain a clean production `node_modules`.

```json
{
  "name": "dev-box",
  "type": "module",
  "dependencies": {
    "citty": "^0.1.6",
    "pino": "^8.19.0",
    "pino-pretty": "^10.3.1"
  }
}
```

### 2. The Implementation (`scripts/dev.ts`)
This is the "Router" that handles the transition from **Stuff** (`/lab`) to **Things** (`/commands`).

```typescript
import { defineCommand, runMain, createMain } from "citty";
import { pino } from "pino";
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const logger = pino({
  transport: { target: "pino-pretty", options: { colorize: true } }
});

// 1. The 'Lab' Command - The exploratory engine
const lab = defineCommand({
  meta: { name: "lab", description: "Execute experimental scripts from the /lab folder" },
  args: {
    name: { type: "positional", description: "Script name (without .ts)", required: true },
  },
  async run({ args }) {
    const scriptPath = join(import.meta.dir, "lab", `${args.name}.ts`);
    logger.info(`Mentating on: ${args.name}...`);
    
    const child = spawn("bun", ["run", scriptPath], { stdio: "inherit" });
    child.on("close", (code) => {
      if (code !== 0) logger.error(`Lab script exited with code ${code}`);
    });
  },
});

// 2. The 'Promote' Command - The entropy reduction engine
const promote = defineCommand({
  meta: { name: "promote", description: "Move a lab script toward formalization" },
  run() {
    logger.warn("Promotion Heuristic: Manually move file to /commands and register in dev.ts");
    // Future: Automate file movement and boilerplate generation
  }
});

// 3. Main CLI Entry
const main = createMain({
  meta: { name: "dev-box", version: "0.1.0", description: "Ctx Utility CLI" },
  subCommands: {
    lab,
    promote,
    // Add formalized commands here as they evolve
  },
});

runMain(main);
```

### 3. The "First Stuff" (`scripts/lab/hello-world.ts`)
A simple test to verify the "Tree Climbing" works.

```typescript
// @ts-nocheck
console.log("--- Lab Execution Successful ---");
console.log("Current Runtime:", Bun.version);
```

### 4. The README (`scripts/README.md`)
To ensure **Workflow Durability (PHI-13)** across sessions.

```markdown
# Dev-Box Utility CLI

## Usage
- **Experimental:** Place `.ts` files in `/lab`. Run via `bun scripts/dev.ts lab <filename>`.
- **Formal:** Define commands in `/commands` and register them in `dev.ts`.

## Philosophy
This CLI acts as a transition layer. Code starts in `/lab` (high entropy) and is promoted to `/commands` or `/src` (low entropy) once its utility is proven.
```

### 5. Execution
To activate this "weapon," the agent or user should run:
```bash
cd scripts && bun install
bun dev.ts lab hello-world
```

**Next Step:** I am ready to generate the specific **Promotion Heuristic** logic for `scripts/dev.ts` (e.g., a command that generates a `citty` template from a lab script) if you wish to further automate the "Tool Evolution" process. Otherwise, this infrastructure is ready for deployment.