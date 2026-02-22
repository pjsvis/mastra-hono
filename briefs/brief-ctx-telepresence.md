Implementing this **Bidirectional Nudge Protocol** will transform your workflow from a "hands-on" development task into a "human-in-the-loop" orchestration. By leveraging **Bun** for a lightweight listener and **ntfy** action buttons for remote input, you fulfill the **Principle of Workflow Durability (PHI-13)** while bypassing the key-capture conflicts of SideCar.

### Project Brief: The "Ctx Telepresence" Integration

**Objective**: Establish a secure, low-latency communication bridge between the MacBook agent (OpenCode/td) and the iPhone user (ntfy) to facilitate remote approvals and status monitoring.

#### 1. System Architecture

* **Trigger**: OpenCode (via a sub-agent directive) sends an ntfy message when a task enters a "Handoff" or "Blocked" state.
* **Interaction**: The iPhone notification displays custom buttons (e.g., "Approve PR," "Retry Test," "Nudge Agent").
* **Callback**: Tapping a button sends an HTTP POST to a secondary "Callback Topic" on ntfy.
* **Response**: A background Bun script on the MacBook "watches" this callback topic and updates the local `td` database or signals the primary agent to resume.

#### 2. Technical Implementation Steps

**Step A: The MacBook Notifier (Bun)**
Create a utility script that agents can call to "ping" you. This script includes **HTTP Actions** that point back to your chosen callback topic.

```typescript
// nudge.ts
const TOPIC = "ctx-mentation-8842"; 
const CALLBACK_TOPIC = `${TOPIC}-callback`;

export async function sendNudge(title: string, message: string, taskID: string) {
  await fetch(`https://ntfy.sh/${TOPIC}`, {
    method: 'POST',
    headers: {
      'Title': title,
      'Tags': 'gear,robot',
      'Actions': [
        `http, Approve, https://ntfy.sh/${CALLBACK_TOPIC}, body=APPROVE:${taskID}`,
        `http, Deny, https://ntfy.sh/${CALLBACK_TOPIC}, body=DENY:${taskID}`
      ].join('; ')
    },
    body: `${message} (Task ID: ${taskID})`
  });
}

```

**Step B: The Callback Watcher (Bun + SQLite)**
This background process listens for your iPhone input and updates the **td** system.

```typescript
// watcher.ts
const CALLBACK_TOPIC = "ctx-mentation-8842-callback";

console.log("Ctx Watcher: Listening for iPhone nudges...");

const response = await fetch(`https://ntfy.sh/${CALLBACK_TOPIC}/raw`);
const reader = response.body?.getReader();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  const signal = new TextDecoder().decode(value).trim();
  
  if (signal.startsWith("APPROVE:")) {
    const id = signal.split(":")[1];
    console.log(`User Approved Task: ${id}`);
    // Execute td command to advance the state
    Bun.spawn(["td", "finish", id]);
  }
}

```

#### 3. Operational Heuristics (AGENTS.md)

To ensure the agent uses this correctly, add the following to your `AGENTS.md`:

* **OH-TELE-01**: "If a task requires human approval (e.g., merging a PR), the agent must execute `bun nudge.ts` and then enter a `PAUSED` state in `td`."
* **OH-TELE-02**: "The agent shall monitor the `td` state every 5 minutes while paused; if the state changes to `DONE` (via the remote watcher), it shall proceed to the next task in the brief."

### Ctx Opinion: The "Noosphere Uplink"

This configuration effectively creates a **Noosphere Uplink**—a persistent intellectual connection between you and the synthetic agent. By using **ntfy Action Buttons**, you reduce the **Input Activation Threshold** to a single tap, preventing "Context Collapse" when you return to your desk.

Separating the **Watcher** from the **SideCar TUI** ensures that the "Sleeve" (your interface) remains responsive and data-driven without the agent's mentation being interrupted by accidental keystrokes.

[Actionable Notifications in ntfy](https://www.youtube.com/watch?v=wDJDiAYZ3H0)
This video provides a practical guide to setting up ntfy and utilizing its more advanced features like action buttons and HTTP callbacks.