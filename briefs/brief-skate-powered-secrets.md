This brief weaponizes **Charm’s Skate** as the primary identity-based secret store for your **Mastra-Hono** stack. By shifting from `.env` files to Skate, we achieve **Worktree-Agile Security**: your keys follow your SSH identity, not your file system.

### Strategy: The Identity-Based Secret Anchor

We will use a **late-binding injection** pattern. Secrets are never stored in the codebase or environment files; they are fetched from the encrypted Skate store at the "Last Responsible Moment" (initialization).

---

## 1. Project Brief: Skate-Powered Secret Injection

### **Objective**

Migrate the Mastra-Hono pilot from static `.env` management to dynamic, identity-linked secret retrieval using Charm’s Skate.

### **Core Constraints**

* **Key Convention:** Use standard provider names (e.g., `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`).
* **No Multi-Tenancy:** Keys are managed for personal/company use under a single identity.
* **Framework:** Primary implementation in **TypeScript/Hono**.

### **The "Happy Path" Implementation**

#### **Step A: Key Initialization (Human Task)**

You will seed your local Skate store using the standard provider keys. Run these in your terminal:

```bash
skate set ANTHROPIC_API_KEY <your-key>
skate set OPENAI_API_KEY <your-key>

```

#### **Step B: The Secret Retrieval Helper**

Implement a utility to bridge the system's "Stuff" (the CLI output) into "Things" (Typed Variables).

```typescript
// src/lib/secrets.ts
import { execSync } from 'node:child_process';

/**
 * Fetches a secret from Skate.
 * Heuristic: Fails fast if the key is missing to prevent 401s.
 */
export function getSkateSecret(key: string): string {
  try {
    // We use the standard key name directly
    return execSync(`skate get ${key}`).toString().trim();
  } catch (error) {
    console.error(`[Skate Error] Could not retrieve ${key}. Ensure it is set via 'skate set'.`);
    throw new Error(`Missing Required Secret: ${key}`);
  }
}

```

#### **Step C: Mastra Integration**

Inject these secrets into the Mastra instance configuration.

```typescript
// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { getSkateSecret } from '../lib/secrets';

export const mastra = new Mastra({
  agents: {
    /* agents go here */
  },
  // Late-binding injection
  engine: {
    apiKey: getSkateSecret('ANTHROPIC_API_KEY'), 
  }
});

```

---

## 2. Updated Operational Conventions

| Category | Convention | Ctx Heuristic |
| --- | --- | --- |
| **Naming** | Use the standard provider environment variable name (e.g., `OPENAI_API_KEY`). | **PHI-5** (Explicit Formulation) |
| **Leak Prevention** | Never log the output of `getSkateSecret()`. | **ADV-8** (Pre-Mortem Heuristic) |
| **Agent Access** | The agent may call `skate list` to see *what* keys exist, but never `skate get` unless executing a specific task. | **OH-079** (Capability Whitelist) |
| **Fallback** | If a key is missing, the agent must log a `--blocker` in `td` and ping via `ntfy`. | **Workflow 4** (td-skill-playbook) |

---

## 3. Ctx Opinion

**This is a significant upgrade in Agentic Integrity.** By removing the `.env` file, you solve the **"50-First-Dates"** credential problem. When I (as an agent) spin up a new `sidecar` worktree to refactor a Hono route, I don't need to ask you for the API keys or copy-paste a hidden file. I simply "wake up," and as long as I have access to the `skate` binary in the `sleeve`, I have the "Wherewithal" (OH-093) to function.

**Caw Canny:** Ensure that the user account running the agent has the necessary SSH keys to unlock the Skate store. Since Skate is encrypted at rest, the agent depends on your local session being "unlocked."

---

**Next Step:** Would you like me to generate a **`td` task list** to perform this migration on your current project, or shall we refine the **`AGENTS.md`** to explicitly forbid the creation of `.env` files going forward?