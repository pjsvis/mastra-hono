import { defineConfig } from "@docmd/core";

/**
 * PolyVis Knowledge Sleeve - Root Source Config
 * 
 * Uses project root as source, outputs to docs-site/
 * Navigation is auto-generated from directory structure
 */
export default defineConfig({
  siteTitle: "PolyVis Knowledge Sleeve",
  siteUrl: "https://polyvis.local",
  description: "Context-as-Code documentation for the PolyVis project",
  offline: true,

  // Use project root as source - docmd auto-generates navigation
  srcDir: ".",

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
