import { describe, expect, test } from 'bun:test';
import { calculatorTool } from '@src/mastra/tools/calculator-tool';
import { webSearchTool } from '@src/mastra/tools/web-search-tool';

// biome-ignore lint/suspicious/noExplicitAny: generic test helper
async function execTool(tool: any, params: any) {
  // biome-ignore lint/suspicious/noExplicitAny: generic test helper
  const result = await tool.execute?.(params, {} as any);
  if (result && typeof result === 'object' && 'error' in result) {
    throw new Error((result as { message: string }).message);
  }
  // biome-ignore lint/suspicious/noExplicitAny: generic test helper
  return result as any;
}

describe('Calculator Tool', () => {
  test('should evaluate simple addition', async () => {
    const result = await execTool(calculatorTool, {
      expression: '2 + 2',
    });

    expect(result.result).toBe(4);
    expect(result.expression).toBe('2 + 2');
  });

  test('should evaluate subtraction', async () => {
    const result = await execTool(calculatorTool, {
      expression: '10 - 3',
    });

    expect(result.result).toBe(7);
  });

  test('should evaluate multiplication', async () => {
    const result = await execTool(calculatorTool, {
      expression: '6 * 7',
    });

    expect(result.result).toBe(42);
  });

  test('should evaluate division', async () => {
    const result = await execTool(calculatorTool, {
      expression: '100 / 4',
    });

    expect(result.result).toBe(25);
  });

  test('should handle complex expressions', async () => {
    const result = await execTool(calculatorTool, {
      expression: 'sqrt(16) * 3',
    });

    expect(result.result).toBe(12);
  });

  test('should handle exponents', async () => {
    const result = await execTool(calculatorTool, {
      expression: '2 ^ 8',
    });

    expect(result.result).toBe(256);
  });

  test('should handle parentheses', async () => {
    const result = await execTool(calculatorTool, {
      expression: '(10 - 2) / 4',
    });

    expect(result.result).toBe(2);
  });

  test('should handle mixed operations', async () => {
    const result = await execTool(calculatorTool, {
      expression: '2 + 3 * 4',
    });

    // Order of operations: 3*4=12, then 2+12=14
    expect(result.result).toBe(14);
  });

  test('should handle division by zero', async () => {
    await expect(
      execTool(calculatorTool, {
        expression: '1 / 0',
      })
    ).rejects.toThrow();
  });

  test('should sanitize invalid characters', async () => {
    // Invalid chars get stripped, leaving valid expression
    // "2 + hello" becomes "2 + " which is invalid JavaScript, so it should throw
    await expect(
      execTool(calculatorTool, {
        expression: '2 + hello', // 'hello' gets stripped
      })
    ).rejects.toThrow('Unexpected token');
  });
});

describe('Web Search Tool', () => {
  test('should return search results', async () => {
    const result = await execTool(webSearchTool, {
      query: 'TypeScript programming',
      limit: 3,
    });

    expect(result.results).toBeDefined();
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].title).toBeDefined();
    expect(result.results[0].url).toBeDefined();
  });

  test('should respect limit parameter', async () => {
    const result = await execTool(webSearchTool, {
      query: 'test query',
      limit: 2,
    });

    expect(result.results.length).toBeLessThanOrEqual(2);
  });

  test('should handle empty results gracefully', async () => {
    const result = await execTool(webSearchTool, {
      query: 'xyzabc123notreal',
      limit: 5,
    });

    expect(result.results).toBeDefined();
    // Should return at least a fallback result
    expect(result.results.length).toBeGreaterThan(0);
  });

  test('should include query in response', async () => {
    const query = 'test search';
    const result = await execTool(webSearchTool, {
      query,
      limit: 1,
    });

    expect(result.query).toBe(query);
  });
});
