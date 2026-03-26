This request aligns with **OH-093 (Gumption and Wherewithal)**. We are transitioning from "Stuff" (the idea of a CLI) to a "Thing" (a functional `dev-box` utility).

By utilizing **CITTY**, we satisfy **PHI-14 (Architectural Specialisation)**, ensuring our development tooling is modular and distinct from the production Hono/Bun stack.

---

```markdown
---
date: 2026-03-25
tags: [cli, developer-experience, bun, citty, scaffolding]
agent: ctx-orchestrator
environment: local
---

## Task: Initialize 'dev-box' Utility CLI

**Objective:** Create a unified Command Line Interface (CLI) using Bun and CITTY to manage the evolution of code from experimental scripts (`/lab`) to formal utilities (`/scripts`).

- [ ] Implement a central entry point at `scripts/dev.ts` using CITTY.
- [ ] Establish a "Lab-to-Tool" routing mechanism to execute unmapped scripts.
- [ ] Integrate Pino for consistent, low-noise logging within the CLI.
- [ ] Ensure the structure supports TypeScript but allows for relaxed checking in the `/lab` directory.

## Key Actions Checklist:

- [ ] **Infrastructure:** Install `citty` and `pino-pretty` as dev dependencies.
- [ ] **Core CLI:** Define the base `dev-box` command with a `version` and `help` flag.
- [ ] **Lab Runner:** Implement a `lab` sub-command that takes a filename as an argument and executes it using `Bun.spawn` or dynamic `import()`.
- [ ] **Example Utility:** Create a placeholder `hello` command in `scripts/commands/` to demonstrate the "Formal" tier.
- [ ] **Type-Safety:** Configure a local `tsconfig.json` for the `/scripts` folder that is less restrictive than `/src` (e.g., allowing implicit any for speed).

## Detailed Requirements / Visuals

### Directory Structure
```text
/repo-root
├── /src              # Production (Strict TS)
└── /scripts          # Utility CLI (Moderate TS)
    ├── dev.ts        # CITTY entry point
    ├── /commands     # Formalized CLI commands
    └── /lab          # "Stuff" - Experimental/unstructured .ts files
```

### Operational Heuristic: The Promotion Path
1. **The Sieve:** User writes a quick-and-dirty script in `/scripts/lab/test-query.ts`.
2. **Execution:** User runs `bun scripts/dev.ts lab test-query`.
3. **The Net:** Once verified, the logic is refactored into `scripts/commands/query-tool.ts` and registered in `dev.ts`.

## Verification
- Running `bun scripts/dev.ts --help` should display the command manifest.
- Executing a script in `/lab` via the CLI should pipe the output correctly to the terminal.
```

---

### Next Step
I have generated the **Agentic Brief (ABRP)**. Would you like me to **"weaponize"** this brief by providing the initial `scripts/dev.ts` boilerplate code, or shall we delegate this directly to your coding agent (e.g., Ctx-VS)?