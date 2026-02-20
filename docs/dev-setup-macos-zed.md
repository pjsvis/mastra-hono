# Dev Setup (macOS + Zed)

This guide sets up the project on macOS with Zed as your editor. It also includes the required `td` workflow conventions for this repo.

---

## 1) Prerequisites

Install these tools first:

- **Bun** (required)
- **Git**
- **Zed**
- **td** (task management CLI used by this repo)

If you already have them, skip ahead.

---

## 2) Clone and Install

```/dev/null/placeholder.sh#L1-3
git clone <repo-url>
cd mastra-hono
bun install
```

---

## 3) Environment Variables

Create your local `.env` file:

```/dev/null/placeholder.sh#L1-2
cp .env.example .env
# Add your model provider keys to .env
```

---

## 4) Zed Editor Setup

Recommended settings:

- Enable TypeScript language server
- Enable format on save
- Use Biome for formatting/linting

If you want Zed tasks, see `.zed/tasks.json`.

---

## 5) TD Workflow (Required)

This repo requires `td` for task tracking.

**Start every session:**

```/dev/null/placeholder.sh#L1-1
td usage --new-session
```

**End every session:**

```/dev/null/placeholder.sh#L1-5
td handoff <issue-id> \
  --done "What you completed" \
  --remaining "What is left" \
  --decision "Key decisions made" \
  --uncertain "Open questions"
```

**Session end reminder:** Do not finish a session (or tell an agent to wrap up) without a recorded `td handoff`.

### Optional Alias (Recommended)

If you already added the alias, you can use:

```/dev/null/placeholder.sh#L1-1
tdn
```

---

## 6) Common Commands

```/dev/null/placeholder.sh#L1-6
bun run dev       # Start dev server
bun run build     # Build
bun run start     # Start production server
bun run test      # Run tests
bun run check     # Lint + typecheck
bun run precommit # Pre-commit checks
```

---

## 7) Quick Sanity Check

```/dev/null/placeholder.sh#L1-2
bun run check
bun run test
```

---

## 8) If Something Isn’t Obvious

Update the docs in:

- `README.md`
- `docs/dev-setup-macos-zed.md`
- `AGENTS.md`
- `playbooks/*`

This repo expects documentation to be clear and current.