# Playbook: Agentic Integrity Retrofit Guide

This guide provides the technical steps to port the **Agentic Integrity Workflow** (Symmetric Mentation) to any new or existing repository.

## 1. Core Script Porting

Copy the following standard scripts from `mastra-hono/scripts/` to your target repo:

-   `forge.sh`: Bridges Markdown briefs to `td` tasks.
-   `finish.sh`: Handles verification, debriefing, PR creation, and cleanup guidance.
-   `ask.sh`: Implements the "Haptic Link" via `ntfy`.

## 2. Directory Structure

Initialize the "Map of Knowledge" folders:

```bash
mkdir -p briefs debriefs playbooks tests/human
```

## 3. `package.json` Integration

Add these mandatory scripts to your `package.json`. Customize the `verify` command based on the target project's tech stack (e.g., `npm test`, `vitest`, `cargo test`).

```json
{
  "scripts": {
    "ask": "bash scripts/ask.sh",
    "forge": "bash scripts/forge.sh",
    "finish": "bash scripts/finish.sh",
    "verify": "bun run lint && bun run test" 
  }
}
```

## 4. The Agent Constitution (`AGENTS.md`)

Copy `/AGENTS.md` and customize the **Tech Stack** section for the new repo. The **MANDATORY: Session Orientation** and **The Forge Lifecycle** sections should remain identical to ensure workflow consistency across the organization.

## 5. Local Environment Setup

1.  **Initialize `td`**:
    ```bash
    td init --name <repo-name>
    ```
2.  **Haptic Alias** (Optional but recommended):
    Add to your `.zshrc` or `.bashrc`:
    ```bash
    alias tdn='td usage --new-session'
    ```

## 6. The "Map of Knowledge" Protocol

Ensure all agents in the new repo follow the structured description format:
-   **Brief**: `briefs/my-brief.md`
-   **Debrief**: `debriefs/td-id.md`
-   **Test-Plan**: `tests/human/td-id-verification.md`
-   **Playbook**: `playbooks/my-pattern.md`

## 7. Retrofit Checklist

- [ ] `td` is initialized and `tdn` works.
- [ ] `scripts/ask.sh` has the correct `NTFY_TOPIC`.
- [ ] `scripts/finish.sh` has the correct `NEW_DESC` rebuilding logic.
- [ ] `package.json` has the `verify` script mapped to the project's actual test suite.
- [ ] `AGENTS.md` is present in the root.
