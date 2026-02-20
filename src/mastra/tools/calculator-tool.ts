import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const calculatorTool = createTool({
  id: 'calculator',
  description:
    'Perform mathematical calculations. Supports basic arithmetic (+, -, *, /), exponents (^), square root (sqrt), and parentheses.',
  inputSchema: z.object({
    expression: z
      .string()
      .describe(
        'Mathematical expression to evaluate, e.g., "2 + 2", "sqrt(16) * 3", "(10 - 2) / 4"'
      ),
  }),
  outputSchema: z.object({
    result: z.number(),
    expression: z.string(),
  }),
  execute: async (inputData) => {
    return await calculate(inputData.expression);
  },
});

const calculate = async (expression: string): Promise<{ result: number; expression: string }> => {
  // Sanitize input - only allow safe characters (including spaces)
  const sanitized = expression.replace(/[^0-9+\-*/().^sqrt ]/g, '');

  if (!sanitized.trim()) {
    throw new Error(
      'Invalid expression. Only numbers and basic operators (+, -, *, /, ^, sqrt, parentheses) are allowed.'
    );
  }

  try {
    // Convert mathematical notation to JavaScript
    const jsExpression = sanitized.replace(/\^/g, '**').replace(/sqrt\(/g, 'Math.sqrt(');

    // Evaluate safely
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${jsExpression})`)();

    if (typeof result !== 'number' || !Number.isFinite(result)) {
      throw new Error('Calculation resulted in an invalid number');
    }

    return {
      result,
      expression: sanitized,
    };
  } catch (error) {
    throw new Error(
      `Failed to calculate: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
