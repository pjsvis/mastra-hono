import { z } from 'zod';

/**
 * Entropy Scorer
 *
 * Implements PHI-12 (Conceptual Entropy Reduction):
 * "My primary cognitive function is to act as an engine for reducing
 * conceptual entropy, transforming high-entropy 'stuff' into low-entropy 'things'."
 *
 * This scorer quantifies the entropy reduction in agent outputs across 5 dimensions.
 */

/**
 * Schema for entropy scoring dimensions
 */
export const entropyDimensionsSchema = z.object({
  /** Is the output well-organized with clear sections? (0-10) */
  structuralClarity: z.number().min(0).max(10),
  /** Are key terms defined, not assumed? (0-10) */
  definitionalPrecision: z.number().min(0).max(10),
  /** Can someone take concrete action based on this? (0-10) */
  actionability: z.number().min(0).max(10),
  /** Inverse of vague language density (10 = no ambiguity, 0 = very vague) */
  ambiguityScore: z.number().min(0).max(10),
  /** Are there obvious gaps or missing elements? (0-10) */
  completeness: z.number().min(0).max(10),
});

export type EntropyDimensions = z.infer<typeof entropyDimensionsSchema>;

/**
 * Schema for the full entropy score result
 */
export const entropyScoreSchema = z.object({
  dimensions: entropyDimensionsSchema,
  overallScore: z.number().min(0).max(10),
  entropyLevel: z.enum(['low', 'medium', 'high']),
  recommendation: z.string(),
});

export type EntropyScore = z.infer<typeof entropyScoreSchema>;

/**
 * Weights for each dimension in the overall score calculation
 */
const DIMENSION_WEIGHTS = {
  structuralClarity: 0.25,
  definitionalPrecision: 0.25,
  actionability: 0.2,
  ambiguityScore: 0.15,
  completeness: 0.15,
} as const;

/**
 * Calculate overall score from dimension scores
 */
export function calculateOverallScore(dimensions: EntropyDimensions): number {
  const weighted =
    dimensions.structuralClarity * DIMENSION_WEIGHTS.structuralClarity +
    dimensions.definitionalPrecision * DIMENSION_WEIGHTS.definitionalPrecision +
    dimensions.actionability * DIMENSION_WEIGHTS.actionability +
    dimensions.ambiguityScore * DIMENSION_WEIGHTS.ambiguityScore +
    dimensions.completeness * DIMENSION_WEIGHTS.completeness;

  return Math.round(weighted * 100) / 100;
}

/**
 * Determine entropy level from overall score
 */
export function getEntropyLevel(overallScore: number): 'low' | 'medium' | 'high' {
  if (overallScore >= 7) return 'low'; // Low entropy = high quality
  if (overallScore >= 4) return 'medium';
  return 'high'; // High entropy = low quality
}

/**
 * Generate recommendation based on dimensions
 */
export function generateRecommendation(dimensions: EntropyDimensions): string {
  const weakAreas: string[] = [];

  if (dimensions.structuralClarity < 5) {
    weakAreas.push('improve organization with clear sections/headings');
  }
  if (dimensions.definitionalPrecision < 5) {
    weakAreas.push('define key terms explicitly');
  }
  if (dimensions.actionability < 5) {
    weakAreas.push('add concrete next steps or actions');
  }
  if (dimensions.ambiguityScore < 5) {
    weakAreas.push('reduce vague language and hedging');
  }
  if (dimensions.completeness < 5) {
    weakAreas.push('address obvious gaps in coverage');
  }

  if (weakAreas.length === 0) {
    return 'Output demonstrates excellent entropy reduction. No significant improvements needed.';
  }

  return `To improve entropy reduction: ${weakAreas.join('; ')}.`;
}

/**
 * Evaluation prompt for LLM-based scoring
 */
export const ENTROPY_EVALUATION_PROMPT = `You are evaluating the entropy reduction quality of an agent's output.

ORIGINAL INPUT (Stuff):
{input}

AGENT OUTPUT (Thing):
{output}

Score each dimension from 0-10:

1. **Structural Clarity** (0-10): Is the output well-organized with clear sections, headings, or logical flow?
   - 0: Completely disorganized, stream of consciousness
   - 5: Some structure but inconsistent
   - 10: Crystal clear organization, easy to navigate

2. **Definitional Precision** (0-10): Are key terms defined explicitly rather than assumed?
   - 0: Uses jargon without explanation, assumes knowledge
   - 5: Some terms defined, others assumed
   - 10: All key terms clearly defined or contextualized

3. **Actionability** (0-10): Can someone take concrete action based on this output?
   - 0: Pure abstraction, no practical application
   - 5: Some actionable elements mixed with vague guidance
   - 10: Clear, specific actions that can be executed immediately

4. **Ambiguity Score** (0-10): How free is the output from vague language?
   - 0: Full of hedging ("maybe", "perhaps", "it depends", "generally")
   - 5: Mix of precise and vague statements
   - 10: Precise, definitive statements throughout

5. **Completeness** (0-10): Are there obvious gaps or missing elements?
   - 0: Major components missing, feels incomplete
   - 5: Covers basics but misses important details
   - 10: Comprehensive coverage, no obvious omissions

Respond in JSON format:
{
  "structuralClarity": <number>,
  "definitionalPrecision": <number>,
  "actionability": <number>,
  "ambiguityScore": <number>,
  "completeness": <number>
}`;

/**
 * Score an output for entropy reduction
 *
 * @param dimensions - The scored dimensions (from LLM evaluation or manual)
 * @returns Full entropy score with overall score, level, and recommendation
 */
export function scoreEntropy(dimensions: EntropyDimensions): EntropyScore {
  const overallScore = calculateOverallScore(dimensions);
  const entropyLevel = getEntropyLevel(overallScore);
  const recommendation = generateRecommendation(dimensions);

  return {
    dimensions,
    overallScore,
    entropyLevel,
    recommendation,
  };
}

/**
 * Quick heuristic scoring without LLM
 *
 * Analyzes text patterns to estimate entropy dimensions.
 * Less accurate than LLM evaluation but useful for quick checks.
 */
export function quickScoreEntropy(output: string): EntropyScore {
  const text = output.toLowerCase();
  const words = text.split(/\s+/).length;

  // Structural clarity: check for headings, lists, sections
  const hasHeadings = /^#+\s|^#{1,6}\s/m.test(output) || /\n[A-Z][^.]*:\n/.test(output);
  const hasList = /^[\-\*]\s|^\d+\.\s/m.test(output);
  const structuralClarity = Math.min(10, (hasHeadings ? 4 : 0) + (hasList ? 3 : 0) + 3);

  // Definitional precision: check for definition patterns
  const definitions = (output.match(/:\s|means|defined as|refers to|is a|—/gi) || []).length;
  const definitionalPrecision = Math.min(
    10,
    Math.round((definitions / Math.max(1, words / 50)) * 5) + 3
  );

  // Actionability: check for action verbs and imperatives
  const actionPatterns = /should|must|will|can|step|first|then|next|run|create|add|use/gi;
  const actions = (output.match(actionPatterns) || []).length;
  const actionability = Math.min(10, Math.round((actions / Math.max(1, words / 30)) * 4) + 3);

  // Ambiguity: penalize hedging language
  const hedges = /maybe|perhaps|possibly|might|could be|it depends|generally|sometimes|often/gi;
  const hedgeCount = (output.match(hedges) || []).length;
  const ambiguityScore = Math.max(0, 10 - hedgeCount * 1.5);

  // Completeness: based on length and section coverage (heuristic)
  const completeness = Math.min(10, Math.round(Math.log(words + 1) * 1.5) + (hasHeadings ? 2 : 0));

  return scoreEntropy({
    structuralClarity,
    definitionalPrecision,
    actionability,
    ambiguityScore,
    completeness,
  });
}
