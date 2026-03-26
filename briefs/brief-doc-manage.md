This **Consolidated Master Brief** serves as the single source of truth for the repository's architecture. It integrates the **Persona Stack**, **Tiered Type-Safety**, **Docmd Knowledge Sleeve**, and your **Root-Level Visibility** preference into a single executable mission.

---

# Master Brief: Repository Architecture & Knowledge Sleeve

**Date:** 2026-03-26
**Agent:** `ctx-vs` (or current active agent)
**Environment:** Local / Bun Runtime
**Status:** [ ] UNINITIALIZED | [ ] IN-PROGRESS | [ ] COMPLETE

## 1. Objective
To instantiate a "Context-as-Code" environment where the AI persona (Ctx) is integrated through a specialized utility CLI (`dev-box`), a tiered safety model, and a high-density documentation sleeve (Docmd) that treats root-level playbooks as active infrastructure.

## 2. Structural Requirements (Root-Level Visibility)
Maintain the following directory structure to ensure "Context is Code" is at the forefront of the mental space:

```text
/repo-root
├── /briefs         # [NEW] Active and archived mission parameters
├── /playbooks       # [NEW] TTS v2, UI-Color, CLI-Design, etc.
├── /debriefs        # [NEW] Post-mortem analysis and entropy reduction
├── /scripts         # Utility CLI (CITTY + Bun)
│   ├── dev.ts       # Main Entry Point
│   ├── /commands    # Formalized Tier 2 Utilities
│   └── /lab         # Tier 1 "Stuff" (Experimental scripts)
├── /src             # Tier 3 "Edifice" (Production Hono/Bun)
└── /docs            # Docmd configuration and additional context
```

## 3. Technology Stack & Tiered Type-Safety (TTS v2.0)
| Tier | Location | Strictness | Patterns |
| :--- | :--- | :--- | :--- |
| **Tier 1: Sieve** | `/scripts/lab` | `// @ts-nocheck` | Rapid "Tree Climbing," exploratory logic. |
| **Tier 2: Net** | `/scripts/commands` | Moderate | CITTY args, Type Guards, basic logging. |
| **Tier 3: Edifice**| `/src` | `strict: true` | Branded Types, Discriminated Unions, Exhaustive Checks. |



## 4. Key Actions Checklist

### Phase A: The Utility Sleeve (dev-box)
- [ ] **Setup:** Initialize `scripts/package.json` with `citty`, `pino`, and `@docmd/core`.
- [ ] **Command Logic:** Implement `lab` (run raw scripts) and `docs` (run Docmd).
- [ ] **Promotion Heuristic:** Update the `promote` command to generate TTS v2.0 boilerplate (discriminated unions and `never` default cases).

### Phase B: The Knowledge Sleeve (Docmd)
- [ ] **Config:** Create `docs/docmd.config.ts` to scan root directories (`/briefs`, `/playbooks`, `/debriefs`).
- [ ] **AI Optimization:** Enable `llms.txt` and `llms-full.txt` to provide high-density search for agents.
- [ ] **UI Integration:** Apply **UI-Color Playbook** colors (60-30-10 rule) to the Docmd theme.

### Phase C: Context Migration
- [ ] **Persist:** Move all recently generated playbooks (TTS v2.0, UI-Color, etc.) into the root `/playbooks` folder.
- [ ] **Verify:** Run `bun scripts/dev.ts docs` and ensure the `llms.txt` correctly maps the root folders.

## 5. Implementation Code Snippets

### The Promotion Template (Tier 2 Scaffolding)
```typescript
const ttsTemplate = `
// TIER 2 UTILITY: Promoted from /lab
export default defineCommand({
  run() {
    type State = { status: "idle" } | { status: "error", msg: string };
    const state: State = { status: "idle" };
    switch(state.status) {
      case "idle": return console.log("Success");
      case "error": return console.error(state.msg);
      default: { const _ex: never = state; return _ex; }
    }
  }
});`;
```

### The Docmd "Root-Scanning" Config
```typescript
export default defineConfig({
  scanDirs: ["../briefs", "../playbooks", "../debriefs", "./"],
  llms: { enabled: true, includeAll: true }
});
```



## 6. Verification
- **Agent Access:** Can the agent find `llms.txt` and describe the project's TTS tiers?
- **CLI Performance:** Does `bun scripts/dev.ts lab hello` execute without type-errors?
- **Visibility:** Are `/briefs` and `/playbooks` visible in the root during a standard `ls` command?

---
**Proceed with Implementation: [ ]**