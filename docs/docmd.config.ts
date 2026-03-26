import { defineConfig } from "@docmd/core";

/**
 * PolyVis Knowledge Sleeve - Root Source Config
 * 
 * Uses project root as source, outputs to docs-site/
 */
export default defineConfig({
  siteTitle: "PolyVis Knowledge Sleeve",
  siteUrl: "https://polyvis.local",
  description: "Context-as-Code documentation for the PolyVis project",
  offline: true,

  // Use project root as source
  srcDir: ".",

  // Navigation - specify paths relative to root
  navigation: [
    {
      title: "Playbooks",
      children: [
        { title: "Agentic Integrity", path: "/playbooks/agentic-integrity-playbook/" },
        { title: "Agentic Retrofit", path: "/playbooks/agentic-retrofit/" },
        { title: "Agentic SDLC", path: "/playbooks/agentic-sdlc/" },
        { title: "AI-Friendly Code Patterns", path: "/playbooks/ai-friendly-code-patterns/" },
        { title: "Biome Standards", path: "/playbooks/biome-standards/" },
        { title: "CLI Design", path: "/playbooks/cli-design-playbook/" },
        { title: "Design Heuristics", path: "/playbooks/design-heuristics/" },
        { title: "Edinburgh Protocol", path: "/playbooks/edinburgh-protocol/" },
        { title: "Fabric Agent", path: "/playbooks/fabric-agent-playbook/" },
        { title: "Fabric User", path: "/playbooks/fabric-user-playbook/" },
        { title: "Git Workflow", path: "/playbooks/git-workflow-playbook/" },
        { title: "Just Bash", path: "/playbooks/just-bash/" },
        { title: "Loading Process", path: "/playbooks/loading-process-playbook/" },
        { title: "Local Memory Agents", path: "/playbooks/local-memory-agents/" },
        { title: "Mastra Agent", path: "/playbooks/mastra-agent-playbook/" },
        { title: "Nushell Agent", path: "/playbooks/nushell-agent-playbook/" },
        { title: "Nushell User", path: "/playbooks/nushell-user-playbook/" },
        { title: "Origami Protocol", path: "/playbooks/origami-protocol/" },
        { title: "Repo Init", path: "/playbooks/repo-init-playbook/" },
        { title: "Secure Tool Design", path: "/playbooks/secure-tool-design/" },
        { title: "Sidecar Agent", path: "/playbooks/sidecar-agent-playbook/" },
        { title: "Sidecar User", path: "/playbooks/sidecar-user-playbook/" },
        { title: "TD Agent", path: "/playbooks/td-agent-playbook/" },
        { title: "TD Skill", path: "/playbooks/td-skill-playbook/" },
        { title: "TD User", path: "/playbooks/td-user-playbook/" },
        { title: "Tiered Type Safety", path: "/playbooks/tiered-type-safety-playbook/" },
        { title: "TypeScript Standards", path: "/playbooks/typescript-standards/" },
        { title: "UI Color Decision", path: "/playbooks/ui-color-decision-playbook/" },
        { title: "Vercel", path: "/playbooks/vercel-playbook/" },
        { title: "Visual Palette", path: "/playbooks/visual-palette/" },
      ],
    },
    {
      title: "Active Briefs",
      children: [
        { title: "Agentic Integrity Workflow", path: "/briefs/brief-agentic-integrity-workflow/" },
        { title: "AI Workflow Playbook", path: "/briefs/brief-ai-workflow-playbook/" },
        { title: "CTX Telepresence", path: "/briefs/brief-ctx-telepresence/" },
        { title: "Dev CLI 01", path: "/briefs/brief-dev-cli-01/" },
        { title: "Dev CLI 02", path: "/briefs/brief-dev-cli-02/" },
        { title: "Dev CLI 03", path: "/briefs/brief-dev-cli-03/" },
        { title: "Doc Manage", path: "/briefs/brief-doc-manage/" },
        { title: "Mastra Autoresearch Skill", path: "/briefs/brief-mastra-autoresearch-skill/" },
        { title: "Merge Queue", path: "/briefs/brief-merge-queue/" },
        { title: "Playbook Index", path: "/briefs/brief-playbook-index/" },
        { title: "STOOLAP Eval", path: "/briefs/brief-stoolap-eval/" },
        { title: "Summary", path: "/briefs/brief-summary/" },
      ],
    },
    {
      title: "Debriefs",
      children: [
        { title: "Remeda Usage Review", path: "/debriefs/review-remeda-usage-and-plan-deprecation/" },
        { title: "TD 33741f - Biome Heuristics", path: "/debriefs/td-33741f-biome-heuristics/" },
        { title: "TD 3bdb2f", path: "/debriefs/td-3bdb2f/" },
        { title: "TD 4b567d", path: "/debriefs/td-4b567d/" },
        { title: "TD 64959e", path: "/debriefs/td-64959e/" },
        { title: "TD 770149", path: "/debriefs/td-770149/" },
        { title: "TD 8c4038", path: "/debriefs/td-8c4038/" },
        { title: "TD bcf87d", path: "/debriefs/td-bcf87d/" },
        { title: "TD c4a3cb", path: "/debriefs/td-c4a3cb/" },
        { title: "TD fa8288", path: "/debriefs/td-fa8288/" },
        { title: "TD fc7e38", path: "/debriefs/td-fc7e38/" },
      ],
    },
    {
      title: "System Docs",
      children: [
        { title: "Knowledge Sleeve", path: "/docs/knowledge-sleeve/" },
        { title: "Nushell Agent Usage", path: "/docs/nushell-agent-usage/" },
        { title: "Architectural Insights", path: "/docs/architectural-insights/" },
        { title: "Edinburgh Protocol System Prompt", path: "/docs/edinburgh-protocol-system-prompt/" },
        { title: "Dev Setup macOS + Zed", path: "/docs/dev-setup-macos-zed/" },
        { title: "Playbook Loading Process", path: "/docs/playbook-loading-process-tracker/" },
        { title: "TD Usage", path: "/docs/td-usage/" },
        { title: "TD Workflow Diagram", path: "/docs/td-workflow-diagram/" },
        { title: "Safe AGI", path: "/docs/safe-agi/" },
        { title: "Test Mermaid", path: "/docs/test-mermaid/" },
        { title: "Tomatoes", path: "/docs/tomatoes/" },
      ],
    },
  ],

  out: "docs-site",

  theme: {
    name: "sky",
    colors: {
      background: "#FAFAFA",
      primary: "#2D5BFF",
      accent: "#FF4D4D",
      text: "#1A1A2E",
      textMuted: "#6B7280",
    },
  },

  plugins: {
    llms: {
      includeAll: true,
    },
  },
});
