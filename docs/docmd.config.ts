/**
 * Docmd Configuration - Knowledge Sleeve
 *
 * Configures Docmd to scan root directories and generate llms.txt
 * for agent consumption. Theme follows UI-Color playbook (60-30-10 rule).
 *
 * @see playbooks/ui-color-decision-playbook.md
 */

import { defineConfig } from '@docmd/core';

// =============================================================================
// Theme: UI-Color 60-30-10 Rule
// =============================================================================
// - 60% Dominant (Neutral): #FAFAFA - Backgrounds
// - 30% Secondary (Brand): #2D5BFF - Headers, navigation
// - 10% Accent (Action): #FF4D4D - CTAs, highlights

const THEME = {
  // Base colors following 60-30-10
  SURFACE: '#FAFAFA', // 60% - Neutral canvas
  PRIMARY: '#2D5BFF', // 30% - Brand identity (cool blue)
  ACCENT: '#FF4D4D', // 10% - Critical action (warm red)

  // Semantic extensions
  SUCCESS: '#28C76F',
  WARNING: '#FF9F43',
  ERROR: '#EA5455',
  INFO: '#00CFE8',

  // Text hierarchy
  TEXT_PRIMARY: '#1A1A2E',
  TEXT_SECONDARY: '#6B7280',
  TEXT_MUTED: '#9CA3AF',
};

export default defineConfig({
  // Site metadata for LLMS generation
  siteTitle: 'Mastra-Hono Knowledge Sleeve',
  siteUrl: 'https://mastra-hono.local',
  description: 'Context-as-Code documentation for Mastra-Hono project',

  // Scan directories for documentation
  scanDirs: [
    '../briefs', // Active mission parameters
    '../playbooks', // Pattern playbooks
    '../debriefs', // Post-mortem analysis
    './', // This docs folder
  ],

  // Output directory for generated docs (avoid collision with TypeScript ./dist)
  out: './docs-site',

  // Theme configuration
  theme: {
    name: 'knowledge-sleeve',
    colors: {
      background: THEME.SURFACE,
      primary: THEME.PRIMARY,
      accent: THEME.ACCENT,
      text: THEME.TEXT_PRIMARY,
      textMuted: THEME.TEXT_MUTED,
    },
  },

  // Plugins configuration - LLMS plugin generates llms.txt during build
  // Note: @docmd/plugin-llms is auto-loaded by @docmd/core
  plugins: {
    llms: {
      includeAll: true, // Full context for agents
    },
  },
});
