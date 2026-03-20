import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { quickScoreEntropy, scoreEntropy } from '../scorers/entropy-scorer';

/**
 * Mentation Workflow
 *
 * Operationalizes PHI-1 (Abstract & Structure):
 * "Actively transform unstructured inputs ('stuff') into structured,
 * coherent representations ('things')."
 *
 * Pipeline:
 * INTAKE (Stuff) → STRUCTURE (Abstract) → VALIDATE (Watt Test) → OUTPUT (Thing)
 */

/**
 * Schema for the intake analysis
 */
const intakeAnalysisSchema = z.object({
  entropy: z.enum(['low', 'medium', 'high']),
  inputType: z.string(),
  keyElements: z.array(z.string()),
  rawInput: z.string(),
  context: z.string().optional(),
});

/**
 * Schema for the structured output
 */
const structuredOutputSchema = z.object({
  structuredOutput: z.object({
    title: z.string(),
    summary: z.string(),
    sections: z.array(
      z.object({
        heading: z.string(),
        content: z.string(),
      })
    ),
    actionItems: z.array(z.string()).optional(),
    definitions: z.record(z.string(), z.string()).optional(),
  }),
  transformations: z.array(z.string()),
  rawInput: z.string(),
});

/**
 * Schema for validation result
 */
const validationSchema = z.object({
  isValid: z.boolean(),
  wattsScore: z.number().min(0).max(10),
  issues: z.array(z.string()),
  structuredOutput: structuredOutputSchema.shape.structuredOutput,
  rawInput: z.string(),
});

/**
 * Schema for final output
 */
const mentationOutputSchema = z.object({
  thing: z.object({
    title: z.string(),
    summary: z.string(),
    sections: z.array(
      z.object({
        heading: z.string(),
        content: z.string(),
      })
    ),
    actionItems: z.array(z.string()).optional(),
    definitions: z.record(z.string(), z.string()).optional(),
  }),
  metadata: z.object({
    entropyReduction: z.string(),
    wattsScore: z.number(),
    confidence: z.number(),
    transformations: z.array(z.string()),
  }),
});

/**
 * Step 1: INTAKE
 *
 * Receive and characterize raw input ('stuff').
 * Assess entropy level and identify key elements.
 */
const intakeStep = createStep({
  id: 'intake',
  description: 'Receive and characterize raw input (stuff)',
  inputSchema: z.object({
    rawInput: z.string().describe('Unstructured input to be mentated'),
    context: z.string().optional().describe('Additional context'),
  }),
  outputSchema: intakeAnalysisSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data required');
    }

    const { rawInput, context } = inputData;
    const agent = mastra?.getAgent('edinburghProtocolAgent');

    if (!agent) {
      // Fallback heuristic analysis without agent
      const words = rawInput.split(/\s+/).length;
      const hasStructure = /^#+\s|^\d+\.|^[-*]\s/m.test(rawInput);
      const entropy = words < 50 && hasStructure ? 'low' : words > 200 ? 'high' : 'medium';

      return {
        entropy,
        inputType: 'text',
        keyElements: rawInput
          .split(/[.!?]/)
          .slice(0, 3)
          .map((s) => s.trim())
          .filter(Boolean),
        rawInput,
        context,
      };
    }

    const response = await agent.generate([
      {
        role: 'user',
        content: `Analyze this input and characterize its entropy level. Respond in JSON format only.

INPUT:
${rawInput}

${context ? `CONTEXT: ${context}` : ''}

Respond with exactly this JSON structure:
{
  "entropy": "low" | "medium" | "high",
  "inputType": "question" | "request" | "statement" | "data" | "mixed",
  "keyElements": ["element1", "element2", "element3"]
}`,
      },
    ]);

    try {
      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          entropy: parsed.entropy || 'medium',
          inputType: parsed.inputType || 'mixed',
          keyElements: parsed.keyElements || [],
          rawInput,
          context,
        };
      }
    } catch {
      // Fall back to heuristic
    }

    return {
      entropy: 'medium',
      inputType: 'mixed',
      keyElements: [],
      rawInput,
      context,
    };
  },
});

/**
 * Step 2: STRUCTURE
 *
 * Transform chaos into order (PHI-1).
 * Apply mentation to create structured representation.
 */
const structureStep = createStep({
  id: 'structure',
  description: 'Transform chaos into order (PHI-1)',
  inputSchema: intakeAnalysisSchema,
  outputSchema: structuredOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Intake analysis required');
    }

    const { rawInput, entropy, keyElements, inputType } = inputData;
    const agent = mastra?.getAgent('edinburghProtocolAgent');

    const transformations: string[] = [];

    if (!agent) {
      // Fallback: basic structuring without agent
      transformations.push('heuristic-structuring');

      return {
        structuredOutput: {
          title: 'Structured Output',
          summary: rawInput.substring(0, 200) + (rawInput.length > 200 ? '...' : ''),
          sections: [
            {
              heading: 'Content',
              content: rawInput,
            },
          ],
          actionItems: [],
          definitions: {},
        },
        transformations,
        rawInput,
      };
    }

    transformations.push('agent-mentation');
    transformations.push(`entropy-reduction-${entropy}-to-low`);

    const response = await agent.generate([
      {
        role: 'user',
        content: `You are performing MENTATION: transforming unstructured "Stuff" into structured "Things".

ENTROPY LEVEL: ${entropy}
INPUT TYPE: ${inputType}
KEY ELEMENTS: ${keyElements.join(', ')}

RAW INPUT (STUFF):
${rawInput}

Transform this into a structured output. Respond with exactly this JSON structure:
{
  "title": "A clear, descriptive title",
  "summary": "2-3 sentence summary of the core content",
  "sections": [
    {"heading": "Section Name", "content": "Section content..."}
  ],
  "actionItems": ["Action 1", "Action 2"],
  "definitions": {"term": "definition"}
}

Apply these principles:
- Reduce entropy by adding structure
- Define any ambiguous terms
- Extract actionable items if present
- Organize into logical sections`,
      },
    ]);

    try {
      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          structuredOutput: {
            title: parsed.title || 'Untitled',
            summary: parsed.summary || '',
            sections: parsed.sections || [],
            actionItems: parsed.actionItems,
            definitions: parsed.definitions,
          },
          transformations,
          rawInput,
        };
      }
    } catch {
      // Fall back to basic structuring
    }

    return {
      structuredOutput: {
        title: 'Structured Output',
        summary: rawInput.substring(0, 200),
        sections: [{ heading: 'Content', content: rawInput }],
        actionItems: [],
        definitions: {},
      },
      transformations,
      rawInput,
    };
  },
});

/**
 * Step 3: VALIDATE
 *
 * Apply Watt's Test: "Does this actually help?"
 * Score the output for practical utility.
 */
const validateStep = createStep({
  id: 'validate',
  description: "Apply Watt's Test: Does this actually help?",
  inputSchema: structuredOutputSchema,
  outputSchema: validationSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Structured output required');
    }

    const { structuredOutput, rawInput } = inputData;
    const issues: string[] = [];

    // Apply quick entropy scoring to validate quality
    const outputText = `${structuredOutput.title}\n\n${structuredOutput.summary}\n\n${structuredOutput.sections.map((s) => `## ${s.heading}\n${s.content}`).join('\n\n')}`;

    const entropyScore = quickScoreEntropy(outputText);

    // Check for common issues
    if (!structuredOutput.title || structuredOutput.title === 'Untitled') {
      issues.push('Missing meaningful title');
    }

    if (!structuredOutput.summary || structuredOutput.summary.length < 20) {
      issues.push('Summary too brief or missing');
    }

    if (structuredOutput.sections.length === 0) {
      issues.push('No structured sections');
    }

    if (entropyScore.overallScore < 5) {
      issues.push('Output entropy still high - needs further structuring');
    }

    const isValid = issues.length === 0 && entropyScore.overallScore >= 5;

    return {
      isValid,
      wattsScore: entropyScore.overallScore,
      issues,
      structuredOutput,
      rawInput,
    };
  },
});

/**
 * Step 4: OUTPUT
 *
 * Emit the final "Thing" with metadata.
 */
const outputStep = createStep({
  id: 'output',
  description: 'Emit the final Thing with metadata',
  inputSchema: validationSchema,
  outputSchema: mentationOutputSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Validation result required');
    }

    const { structuredOutput, wattsScore, rawInput } = inputData;

    // Calculate confidence based on Watt's score
    const confidence = wattsScore / 10;

    // Determine entropy reduction description
    const inputEntropy = quickScoreEntropy(rawInput);
    const outputEntropy = quickScoreEntropy(
      `${structuredOutput.title}\n${structuredOutput.summary}\n${structuredOutput.sections.map((s) => s.content).join('\n')}`
    );

    const entropyReduction = `${inputEntropy.entropyLevel}→${outputEntropy.entropyLevel}`;

    return {
      thing: structuredOutput,
      metadata: {
        entropyReduction,
        wattsScore,
        confidence,
        transformations: ['intake', 'structure', 'validate', 'output'],
      },
    };
  },
});

/**
 * The Mentation Workflow
 *
 * Transforms "Stuff" (unstructured input) into "Things" (structured output)
 * through a 4-stage pipeline implementing PHI-1.
 */
const mentationWorkflow = createWorkflow({
  id: 'mentation-workflow',
  inputSchema: z.object({
    rawInput: z.string().describe('Unstructured input to be mentated'),
    context: z.string().optional().describe('Additional context'),
  }),
  outputSchema: mentationOutputSchema,
})
  .then(intakeStep)
  .then(structureStep)
  .then(validateStep)
  .then(outputStep);

mentationWorkflow.commit();

export { mentationWorkflow };
