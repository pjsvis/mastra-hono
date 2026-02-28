import { describe, expect, it } from 'bun:test';
import { classifyEntropy } from '../src/mastra/tools/entropy-tool';

type EntropyResult = {
  entropyLevel: 'chaos' | 'turbulence' | 'structure' | 'clarity';
  score: number;
  issues: string[];
  recommendations: string[];
  structureExtracted: {
    entities?: string[];
    relationships?: string[];
    actions?: string[];
  };
};

const executeEntropy = async (input: string): Promise<EntropyResult> => {
  const execute = classifyEntropy.execute;
  if (!execute) {
    throw new Error('classifyEntropy.execute is not available');
  }

  const result = await execute({ input }, {} as never);

  if ('error' in result) {
    throw new Error(`Entropy tool validation failed: ${result.error}`);
  }

  return result;
};

describe('Edinburgh Protocol Tools', () => {
  describe('classifyEntropy', () => {
    it('should classify clear, structured input as low entropy', async () => {
      const result = await executeEntropy(
        '1. Define the problem. 2. List constraints. 3. Propose solutions. 4. Test.'
      );

      expect(result.score).toBeLessThan(0.5);
      expect(['structure', 'clarity']).toContain(result.entropyLevel);
      expect(result.issues.length).toBeLessThan(3);
    });

    it('should classify chaotic input as high entropy', async () => {
      const result = await executeEntropy(
        'Umm... maybe we should kind of try to fix the thing... or maybe?? I think it is probably broken... unclear what to do...'
      );

      expect(result.score).toBeGreaterThan(0.5);
      expect(['chaos', 'turbulence']).toContain(result.entropyLevel);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should extract entities from capitalized phrases', async () => {
      const result = await executeEntropy(
        'I need to analyze the System Configuration and User Authentication modules.'
      );

      expect(result.structureExtracted.entities).toBeDefined();
      expect(result.structureExtracted.entities?.length).toBeGreaterThan(0);
    });

    it('should extract action verbs', async () => {
      const result = await executeEntropy(
        'Create a new user, build the database schema, and implement the API endpoints.'
      );

      expect(result.structureExtracted.actions).toBeDefined();
      expect(result.structureExtracted.actions?.length).toBeGreaterThan(0);
    });

    it('should provide actionable recommendations', async () => {
      const result = await executeEntropy(
        'This is a very long rambling text that goes on and on without clear structure and maybe we should do something about it probably unclear what'
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some((r: string) => r.includes('Break'))).toBe(true);
    });

    it('should assign appropriate entropy levels based on score', async () => {
      const chaos = await executeEntropy(
        '??? unclear maybe probably I think sort of kind of unclear ...'
      );
      expect(chaos.entropyLevel).toBe('chaos');
      expect(chaos.score).toBeGreaterThan(0.7);

      const clarity = await executeEntropy(
        'Objective: Build API. Constraints: Must use TypeScript. Timeline: 2 weeks.'
      );
      expect(clarity.entropyLevel).toBe('clarity');
      expect(clarity.score).toBeLessThan(0.3);
    });

    it('should detect ambiguity markers', async () => {
      const result = await executeEntropy(
        'Maybe we should use this. Probably it will work. I think so.'
      );

      expect(result.issues.some((i: string) => i.includes('ambiguity'))).toBe(true);
      expect(result.score).toBeGreaterThan(0.3);
    });

    it('should handle empty or minimal input gracefully', async () => {
      const result = await executeEntropy('Hi.');

      expect(result.entropyLevel).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });
});
