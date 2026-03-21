---
date: 2026-03-19
tags: [feature, implementation, mastra, research, typescript]
agent: ctx-persona-63
environment: local
---

## Task: brief-mastra-autoresearch-skill-2026-03-19.md

**Objective:** To implement a modular, type-safe "Autoresearch" skill using the Mastra framework that transforms high-entropy web data ("Stuff") into structured, persisted knowledge ("Things").

- [ ] **Sieve Phase:** Implement high-recall web search via Tavily/Brave tools.
- [ ] **Extraction Phase:** Implement entropy-reduction scraping (HTML to Markdown).
- [ ] **Validation Phase:** Integrate the CPC-AR (Critical Process Checklist).
- [ ] **Persistence Phase:** Implement timestamped Markdown archiving with Ctx metadata headers.

## Frontmatter & Persistence Specs

**File Naming:** `research-archive/[YYYY-MM-DD-HHmm]_[slug].md`
**Metadata Header Requirement:**
- Must include `persona: Ctx (CDA #63)`.
- Must include `locus_tag` for conversational traceability.
- Must list status of `OH-090` and `CPC-AR` validation.

## Key Actions Checklist

- [ ] **Scaffold Project:** Initialize TypeScript environment with `strict: true` per TSIP.
- [ ] **Tooling:** Define `webSearchTool` and `scrapeTool` using `@mastra/core`.
- [ ] **Agent Logic:** Program the Researcher Agent with "Gumption" (OH-093) to self-correct "fucked-adjacent" data.
- [ ] **Workflow Loop:** Chain tools into a Mastra `Workflow` with a terminal persistence step.
- [ ] **Verification:** Run a `tsc --noEmit` check to ensure zero type-safety violations.

## Detailed Mentation Requirements

- **Deductive Minimalism:** The agent must be instructed to subtract "Noise" (ads, fluff) rather than adding "Complexity" (narrative padding).
- **Caw Canny:** In cases of conflicting data, the agent must flag the contradiction rather than hallucinating a resolution.
- **Artifact as Proof:** No research task is "Complete" until a Markdown file is successfully written to the local `/research-archive` directory.