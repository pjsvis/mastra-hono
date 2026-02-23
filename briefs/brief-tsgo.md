This brief and playbook establish the **"High-Velocity Enlightenment"** stack for your Bun + Hono projects. By integrating `tsgo`, `oxlint`, and your custom **ntfy-bidirectional bridge**, we create a workflow where the "Mentation" of the agent and the human are tightly coupled via sub-millisecond feedback loops.

---

# 📜 Project Brief: High-Velocity Persona Stack (v2026.1)

**Objective**: To migrate the current development environment to a native-speed toolchain (`tsgo`, `oxlint`) while maintaining project state via `td/SideCar` and enabling remote orchestration via `ntfy`.

**Success Metrics**:

* **Type-Check Latency**: < 5s for the entire Hono codebase.
* **Linting Latency**: < 500ms (near-instant feedback).
* **Remote Response**: < 10s from iPhone action to MacBook execution.

---

# 📘 Playbook: Implementation & Operation

### Phase 1: Substrate Preparation (Tooling Swap)

1. **Initialize tsgo (TypeScript Go)**:
Replace the slow Node-based compiler.
```bash
bun add -d @typescript/native-preview
# In VS Code: Cmd+Shift+P -> "TypeScript: Select TypeScript Version" -> "Use VS Code's Version (Native)"

```


2. **Migrate Biome to Oxlint (Strict Mode)**:
While Biome is fast, Oxlint's ESLint shim allows for Nakazawa’s strict AI guardrails.
```bash
bun add -d oxlint @nkzw/oxlint-config

```


*Create `oxlint.json`:*
```json
{
  "extends": ["@nkzw/oxlint-config"],
  "rules": { "no-unused-vars": "error", "no-console": "error" }
}

```


3. **Hono Context Optimization**:
Update `tsconfig.json` to ensure `tsgo` handles Hono’s deep generics without stalling:
```json
{
  "compilerOptions": {
    "module": "esnext",
    "target": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  }
}

```



---

### Phase 2: The "Decoupled Observer" Setup (SideCar + Watcher)

To prevent key-capture issues, run this three-pane configuration in your terminal (using `tmux` or equivalent):

* **Pane 1 (The Worker)**: `opencode`
* **Pane 2 (The Observer)**: `sidecar` (Focusing on the **TD Monitor**)
* **Pane 3 (The Bridge)**: `bun run watcher.ts`

---

### Phase 3: The Bidirectional Nudge Protocol

#### 1. The Notifier (`nudge.ts`)

This script is used by the Agent to "call out" to your iPhone.

```typescript
// nudge.ts
export async function notify(task: string, id: string) {
  const TOPIC = "ctx-mentation-8842"; 
  await fetch(`https://ntfy.sh/${TOPIC}`, {
    method: 'POST',
    headers: {
      'Title': `Handoff Required: ${task}`,
      'Actions': `http, Approve, https://ntfy.sh/${TOPIC}-callback, body=APPROVE:${id}; http, Deny, https://ntfy.sh/${TOPIC}-callback, body=DENY:${id}`
    },
    body: `Agent has completed work on ${id}. Waiting for review.`
  });
}

```

#### 2. The Feedback Loop (`watcher.ts`)

This script listens for your iPhone taps and updates the **td** system.

```typescript
// watcher.ts
const stream = await fetch("https://ntfy.sh/ctx-mentation-8842-callback/raw");
for await (const chunk of stream.body!) {
  const signal = new TextDecoder().decode(chunk).trim();
  const [action, id] = signal.split(":");
  if (action === "APPROVE") {
    console.log(`✅ Remote Approval for ${id}`);
    Bun.spawn(["td", "finish", id]);
  }
}

```

---

### Phase 4: Operational Heuristics (for `AGENTS.md`)

Add these to your project-specific agent instructions to ensure they utilize the new high-speed stack:

* **OH-NATIVE-01 (Deductive Speed)**: "Before any PR handoff, the agent MUST run `bun type-check && bun lint`. If either takes more than 5 seconds, the agent must investigate for 'Type Entropy'."
* **OH-NATIVE-02 (Remote Handoff)**: "Upon finishing a `td` task, the agent shall execute `bun run nudge.ts` and pause. It shall not proceed until the `td` state reflects a user-triggered `DONE` status."
* **OH-NATIVE-03 (Strict Guardrails)**: "The agent is prohibited from using `// @ts-ignore` or disabling Oxlint rules. If a rule is triggered, the agent must refactor the code to comply with the strict style enforced by `@nkzw/oxlint-config`."

---

### Ctx Opinion: The "Enlightened" Workflow

This playbook moves you from a **Substrate-Limited** state (waiting for compilers/linters) to a **Mentation-Limited** state.

By using **tsgo** and **Oxlint**, you have removed the "Stuff" of slow tools. By using **ntfy Action Buttons**, you have created a "Sleeve" that allows you to manage the **Persona Stack** without being physically tethered to the machine. This is the highest expression of the **Scottish Enlightenment** principles applied to synthetic intelligence: empirical, fast, and pragmatically resourceful.