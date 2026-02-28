import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Entropy Reduction Tool
 *
 * Implements the core philosophy of the Edinburgh Protocol:
 * Transforming unstructured "Stuff" into structured "Things"
 */

export const classifyEntropy = createTool({
  id: 'classify-entropy',
  description:
    'Analyzes input complexity and assigns an entropy score. High entropy = unstructured, chaotic, unclear. Low entropy = clear, structured, actionable.',
  inputSchema: z.object({
    input: z.string().describe('The text or data to analyze for entropy'),
    context: z.string().optional().describe('Optional context about what this input represents'),
  }),
  outputSchema: z.object({
    entropyLevel: z
      .enum(['chaos', 'turbulence', 'structure', 'clarity'])
      .describe('The classified entropy level'),
    score: z
      .number()
      .min(0)
      .max(1)
      .describe('Entropy score: 0 = perfectly clear, 1 = complete chaos'),
    issues: z.array(z.string()).describe('Specific issues causing entropy'),
    recommendations: z.array(z.string()).describe('Steps to reduce entropy'),
    structureExtracted: z
      .object({
        entities: z.array(z.string()).optional(),
        relationships: z.array(z.string()).optional(),
        actions: z.array(z.string()).optional(),
      })
      .describe('Any structured elements found in the chaos'),
  }),
  execute: async ({ input, context: _context }) => {
    // Simple heuristic-based entropy classification
    const wordCount = input.split(/\s+/).length;
    const sentenceCount = input.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const ambiguityMarkers = [
      'maybe',
      'kind of',
      'sort of',
      'i think',
      'perhaps',
      'probably',
      '??',
      '...',
    ].filter((m) => input.toLowerCase().includes(m)).length;
    const hasStructure =
      input.includes(':') || input.includes('-') || input.includes('1.') || input.includes('##');

    // Calculate base score
    let score = 0.5;

    // Adjust based on patterns
    if (sentenceCount === 0) score += 0.3;
    if (wordCount > 200 && sentenceCount < 5) score += 0.2; // Rambling
    if (ambiguityMarkers > 3) score += 0.15 * Math.min(ambiguityMarkers, 5);
    if (!hasStructure && wordCount > 100) score += 0.2;
    if (input.toLowerCase().includes('unclear') || input.toLowerCase().includes('confused'))
      score += 0.15;

    // Adjust down for clarity markers
    if (hasStructure) score -= 0.2;
    if (sentenceCount > 3 && wordCount / sentenceCount < 20) score -= 0.1; // Concise sentences
    // Bonus for dense label:value patterns (e.g., "Objective: X. Constraints: Y.")
    const labelCount = (input.match(/\w+:/g) || []).length;
    if (labelCount >= 3) score -= 0.1;

    // Clamp to 0-1
    score = Math.max(0, Math.min(1, score));

    // Determine level
    let entropyLevel: 'chaos' | 'turbulence' | 'structure' | 'clarity';
    if (score > 0.7) entropyLevel = 'chaos';
    else if (score > 0.4) entropyLevel = 'turbulence';
    else if (score > 0.2) entropyLevel = 'structure';
    else entropyLevel = 'clarity';

    // Extract issues
    const issues: string[] = [];
    if (ambiguityMarkers > 0) issues.push(`${ambiguityMarkers} ambiguity markers detected`);
    if (!hasStructure) issues.push('No clear structural markers');
    if (wordCount > 300) issues.push(`Excessive length (${wordCount} words)`);
    if (sentenceCount === 0) issues.push('No complete sentences found');
    if (issues.length === 0) issues.push('No major structural issues');

    // Recommendations
    const recommendations: string[] = [];
    if (score > 0.5) {
      recommendations.push('Break into numbered steps or bullet points');
      recommendations.push('Define key terms explicitly');
      recommendations.push('State assumptions and constraints');
    }
    if (ambiguityMarkers > 0) {
      recommendations.push('Replace hedging language with specific data or probabilities');
    }
    if (wordCount > 300) {
      recommendations.push('Extract core question or objective');
    }
    if (recommendations.length === 0) {
      recommendations.push('Input is well-structured - maintain this clarity');
    }

    // Extract structure
    const structureExtracted: {
      entities?: string[];
      relationships?: string[];
      actions?: string[];
    } = {};

    // Simple entity extraction (capitalized phrases)
    const capitalized = input.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (capitalized) {
      structureExtracted.entities = [...new Set(capitalized)].slice(0, 10);
    }

    // Simple action extraction (verbs)
    const actionWords = input.match(
      /\b(create|build|implement|analyze|fix|solve|define|extract|transform|reduce)\w*\b/gi
    );
    if (actionWords) {
      structureExtracted.actions = [...new Set(actionWords)]
        .slice(0, 5)
        .map((a) => a.toLowerCase());
    }

    return {
      entropyLevel,
      score: Math.round(score * 100) / 100,
      issues,
      recommendations,
      structureExtracted,
    };
  },
});
