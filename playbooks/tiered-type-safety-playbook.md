# Tiered Type-Safety (TTS) Playbook v2.0

## Purpose
To manage the "Mentational" transition from high-entropy **Stuff** to low-entropy **Things**. This playbook prevents "Type-Safety Friction" from killing early-stage **Gumption** while ensuring that production code remains a "Durable Edifice."

## The Gradient of Rigor

| Tier | Environment | Persona Mode | Configuration |
| :--- | :--- | :--- | :--- |
| **Tier 1: The Sieve** | `/scripts/lab` | **Exploratory** | `// @ts-nocheck` |
| **Tier 2: The Net** | `/scripts/commands` | **Pragmatic** | `strict: false` |
| **Tier 3: The Edifice**| `/src` | **Rigorous** | `strict: true` |



---

## 1. Tier 1: The Sieve (Experimental)
**Constraint:** High Velocity, Zero Friction.
- **Rule:** Use `// @ts-nocheck` at the top of every file.
- **Objective:** Get the logic working. Use `any` liberally. 
- **Zombie Defense:** Ensure scripts here do not leave dangling file handles or Bun processes.

## 2. Tier 2: The Net (Utility CLI)
**Constraint:** Reliability without Pedantry.
- **Rule:** Define inputs and outputs, but allow internal flexibility.
- **Patterns (Nicked from "Pro" Skill):**
    - **Type Guards:** Use `isType` functions to validate "Stuff" coming from the Lab.
    - **Optionality:** Keep interfaces simple. If it's for local use, don't over-engineer.
- **CLI Design:** Use **CITTY** to define positional arguments. Type these arguments using `as Type` assertions to bridge the gap.

## 3. Tier 3: The Edifice (Production)
**Constraint:** Zero-Runtime-Error Ambition.
- **Rule:** `strict: true` and no `any` allowed.
- **Advanced Patterns (The "Pro" Stack):**
    - **Branded Types:** Prevent ID confusion (e.g., `type UserId = string & { __brand: "UserId" }`).
    - **Discriminated Unions:** Replace optional booleans with `status: 'idle' | 'success' | 'error'`.
    - **Exhaustive Switching:** Use the `never` type check in `default` cases to ensure every union member is handled.
    ```typescript
    type Action = { type: 'create' } | { type: 'delete' };
    function handle(action: Action) {
      switch(action.type) {
        case 'create': return;
        case 'delete': return;
        default: { const _exhaustive: never = action; return _exhaustive; }
      }
    }
    ```

---

## The Promotion Protocol (OH-093)

Promotion is the act of **Reducing Conceptual Entropy**. Do not move code up a tier until it has been "battle-tested" in its current environment.

### Promotion Steps:
1. **Identify the Shape:** Look at the "Stuff" in your Lab script. What are the inputs? What are the outputs?
2. **Scaffold the Command:** Use `bun dev.ts promote [filename]` to create the Tier 2 wrapper.
3. **Harden the Types:** Move logic to `/src/lib` and apply **Tier 3** rules:
    - Replace `any` with interfaces.
    - Implement **Zod** for any external data boundary.
    - Apply the **Exhaustive Check** pattern to all switch statements.

---

## Implementation: TSConfig Hierarchy

To avoid global strictness conflicts, use a partitioned configuration:

```text
/repo-root
├── tsconfig.json          # Shared Base (Paths, Target)
├── /src
│   └── tsconfig.json      # { "extends": "../tsconfig", "compilerOptions": { "strict": true } }
└── /scripts
    └── tsconfig.json      # { "extends": "../tsconfig", "compilerOptions": { "strict": false } }
```

## Compliance Checklist
- [ ] Tier 1 files have `// @ts-nocheck`.
- [ ] Tier 3 files use **Discriminated Unions** instead of multiple optional flags.
- [ ] All `switch` statements in `/src` have a `never` default case.
- [ ] Branded types are used for critical IDs (User, Org, Session).

---

**Status:** Version 2.0 Persisted to Memory. Ready for deployment in the next **Persona Initialization Protocol (PIP)**.