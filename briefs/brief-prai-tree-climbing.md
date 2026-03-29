# Lean-Yggdrasil: ctx CLI Brief

**Objective:** Build `ctx` CLI—a Bun-based "Sleeve" for terminal-to-LLM weaponization using local-first patterns.

## Architecture

| Component | Substrate | Responsibility |
|-----------|-----------|----------------|
| `ctx` wrapper | Nushell/Bash | Env sensing, arg parsing, history capture |
| `ctx-logic.ts` | Bun (not Deno) | LLM communication, state management |
| `ops-lexicon.toml` | TOML (use `'''` literals) | Persistent command storage |
| `./patterns/` | Markdown | Repo-local Fabric patterns |

## Commands

- `ctx wake` - Display operational status from lexicon/CDA
- `ctx weaponize [n]` - Send nth history entry to LLM, append TOML result

## Directives

1. **No Monoliths** - Raw `fetch()`, no LangChain/LlamaIndex
2. **Local Patterns** - Read from `./patterns/<name>/system.md` (repo-root relative)
3. **Context Injection** - Auto-include current `td` task ID in LLM calls
4. **Prai Evaluation** - Test if `prai` adds value vs raw Bun; minimize if heavy

## Success Criteria

1. `ctx ?` returns in < 100ms
2. `ops-lexicon.toml` survives pipes, redirects, nested quotes
3. Deployable via: 2 files (`ctx`, `ctx-logic.ts`) + `./patterns/` folder

---

**Ctx Opinion:** Self-contained operational environment via Bun + local patterns.