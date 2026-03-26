This brief establishes **Docmd** as the "Knowledge Sleeve" for the repository. By integrating it into our `dev-box` CLI, we ensure that documentation is never a secondary task, but a real-time reflection of our **Mentation** process.

---

```markdown
---
date: 2026-03-26
tags: [documentation, docmd, dx, static-site, automation]
agent: ctx-vs
environment: local
---

# Brief: Instantiate Docmd Knowledge Sleeve

**Objective:** Implement Docmd.io as the standardized documentation engine to house playbooks, briefs, and the conceptual lexicon, integrated directly into the `dev-box` CLI.

- [ ] **Infrastructure:** Initialize Docmd in the `/docs` directory.
- [ ] **CLI Integration:** Add a `docs` command to `scripts/dev.ts` to run the Docmd dev server.
- [ ] **Content Migration:** Move existing playbooks into `/docs/playbooks`.
- [ ] **AI-Optimization:** Configure the `llms.txt` generation to support future agentic ingestion.

## Key Actions Checklist:

- [ ] **Setup:** Run `mkdir docs` and initialize with a basic `docmd.config.ts` (if required) or standard folder structure.
- [ ] **Command Implementation:**
    - Update `scripts/dev.ts` with a `docs` sub-command.
    - Use `Bun.spawn(["npx", "@docmd/core", "dev"], { stdio: "inherit" })`.
- [ ] **Organization:** Create the following structure:
    - `/docs/briefs/` (Move this brief here after creation)
    - `/docs/playbooks/` (TTS v2, Bun, CLI-Design, UI-Color)
    - `/docs/lexicon/` (Conceptual Lexicon reference)
- [ ] **Validation:** Run `bun scripts/dev.ts docs` and verify the sidebar correctly reflects the folder hierarchy.

## Detailed Requirements / Visuals

### Directory Architecture
```text
/repo-root
├── /src
├── /scripts
└── /docs
    ├── index.md          # Project Overview
    ├── briefs/           # Active and Archived Briefs
    ├── playbooks/        # Tiered Type-Safety, UI Guidelines, etc.
    └── lexicon.md        # Local instance of CL v1.79
```

### The AI-Sleeve (llms.txt)
Ensure Docmd is configured to output `llms.txt`. This file acts as a high-density "map" for agents, satisfying **PHI-2 (Synergistic Collaboration)** by allowing me (or any other agent) to quickly "re-sync" with the project's state.

## Verification
- Navigating to `localhost:3000` (or the Docmd default port) shows all playbooks with proper Markdown rendering.
- The `llms.txt` file is accessible and contains a concatenated summary of the `/docs` folder.
```

---

### Next Step
I have drafted the brief for the **Knowledge Sleeve**. Once you have persisted this to `docs/briefs/brief-init-docmd.md`, would you like me to provide the **updated `scripts/dev.ts` code block** that includes the new `docs` command?