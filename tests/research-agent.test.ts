import { describe, expect, test } from 'bun:test';
import { calculatorTool } from '@src/mastra/tools/calculator-tool';
import { webSearchTool } from '@src/mastra/tools/web-search-tool';

/**
 * Helper to execute tools in tests without manual context mocking
 */
// biome-ignore lint/suspicious/noExplicitAny: generic test helper
async function execTool<TInput, TOutput>(tool: any, params: TInput): Promise<TOutput> {
  // biome-ignore lint/suspicious/noExplicitAny: context is usually any in tests
  const result = await tool.execute(params, {} as any);
  return result as TOutput;
}

describe('Calculator Tool', () => {
  test('should evaluate simple addition', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(calculatorTool, {
      expression: '2 + 2',
    });

    expect(result.result).toBe(4);
    expect(result.expression).toBe('2 + 2');
  });

  test('should evaluate subtraction', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(calculatorTool, {
      expression: '10 - 3',
    });

    expect(result.result).toBe(7);
  });

  test('should evaluate multiplication', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(calculatorTool, {
      expression: '6 * 7',
    });

    expect(result.result).toBe(42);
  });

  test('should evaluate division', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(calculatorTool, {
      expression: '100 / 4',
    });

    expect(result.result).toBe(25);
  });

  test('should handle complex expressions', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(calculatorTool, {
      expression: 'sqrt(16) * 3',
    });

    expect(result.result).toBe(12);
  });

  test('should handle exponents', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(calculatorTool, {
      expression: '2 ^ 8',
    });

    expect(result.result).toBe(256);
  });

  test('should handle parentheses', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(calculatorTool, {
      expression: '(10 - 2) / 4',
    });

    expect(result.result).toBe(2);
  });

  test('should handle mixed operations', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(calculatorTool, {
      expression: '2 + 3 * 4',
    });

    // Order of operations: 3*4=12, then 2+12=14
    expect(result.result).toBe(14);
  });

  test('should handle division by zero', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(calculatorTool, {
      expression: '1 / 0',
    });

    expect(result.error).toBe('Calculation resulted in an invalid number');
  });

  test('should sanitize invalid characters', async () => {
    // "2 + hello" becomes "2 + " which is invalid JavaScript, so it should return an error
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(calculatorTool, {
      expression: '2 + hello', // 'hello' gets stripped
    });

    expect(result.error).toBeDefined();
    expect(result.error).toContain('Failed to calculate');
  });
});

describe('Web Search Tool', () => {
  test('should return search results', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(webSearchTool, {
      query: 'TypeScript programming',
      limit: 3,
    });

    expect(result.results).toBeDefined();
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].title).toBeDefined();
    expect(result.results[0].url).toBeDefined();
  });

  test('should respect limit parameter', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(webSearchTool, {
      query: 'test query',
      limit: 2,
    });

    expect(result.results.length).toBeLessThanOrEqual(2);
  });

  test('should handle empty results gracefully', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(webSearchTool, {
      query: 'xyzabc123notreal',
      limit: 5,
    });

    expect(result.results).toBeDefined();
    // Should return at least a fallback result
    expect(result.results.length).toBeGreaterThan(0);
  });

  test('should include query in response', async () => {
    const query = 'test search';
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    const result = await execTool<any, any>(webSearchTool, {
      query,
      limit: 1,
    });

    expect(result.query).toBe(query);
  });
});
