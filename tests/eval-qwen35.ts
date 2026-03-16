#!/usr/bin/env bun

/**
 * Qwen3.5 Evaluation Script
 * Tests the model on various reasoning and problem-solving tasks
 */

import { cleanThinking } from '@src/utils/thinking-filter';
import { generateText } from 'ai';
import { createOllama } from 'ollama-ai-provider-v2';

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
});

const model = ollama('qwen3.5:latest');

interface TestCase {
  id: string;
  name: string;
  prompt: string;
  expectedKeywords?: string[];
}

const testCases: TestCase[] = [
  {
    id: 'math-1',
    name: 'Basic Arithmetic',
    prompt: 'What is 17 × 23? Show your work.',
    expectedKeywords: ['391'],
  },
  {
    id: 'logic-1',
    name: 'Logical Reasoning',
    prompt: `If all cats have tails, and some animals with tails are mammals, can we conclude that all cats are mammals? Explain your reasoning.`,
    expectedKeywords: ['yes', 'mammals', 'conclude'],
  },
  {
    id: 'code-1',
    name: 'Code Understanding',
    prompt: `What does this JavaScript function do?
\`\`\`javascript
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
\`\`\``,
    expectedKeywords: ['memoize', 'cache', 'function', 'performance'],
  },
  {
    id: 'context-1',
    name: 'Contextual Understanding',
    prompt: `In the context of software development, explain what "technical debt" means and give a specific example.`,
    expectedKeywords: ['debt', 'code', 'maintenance', 'refactor'],
  },
  {
    id: 'creative-1',
    name: 'Creative Problem Solving',
    prompt: `You have a 3-liter jug and a 5-liter jug. How can you measure exactly 4 liters of water? Describe the steps.`,
    expectedKeywords: ['fill', 'pour', 'liter', 'step'],
  },
];

interface TestResult {
  id: string;
  name: string;
  prompt: string;
  response: string;
  cleanedResponse: string;
  duration: number;
  tokenCount?: number;
  expectedKeywords?: string[];
  matchedKeywords: string[];
  success: boolean;
}

async function runTest(testCase: TestCase): Promise<TestResult> {
  console.log(`\n🧪 Running: ${testCase.name} (${testCase.id})`);
  console.log(`Prompt: ${testCase.prompt.substring(0, 100)}...`);

  const start = Date.now();

  try {
    const { text } = await generateText({
      model,
      prompt: testCase.prompt,
    });

    const duration = Date.now() - start;
    const cleanedResponse = cleanThinking(text);

    // Check for expected keywords
    const matchedKeywords: string[] = [];
    if (testCase.expectedKeywords) {
      for (const keyword of testCase.expectedKeywords) {
        if (cleanedResponse.toLowerCase().includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
        }
      }
    }

    const success = testCase.expectedKeywords
      ? matchedKeywords.length / testCase.expectedKeywords.length >= 0.5
      : true;

    return {
      id: testCase.id,
      name: testCase.name,
      prompt: testCase.prompt,
      response: text,
      cleanedResponse,
      duration,
      expectedKeywords: testCase.expectedKeywords,
      matchedKeywords,
      success,
    };
  } catch (error) {
    return {
      id: testCase.id,
      name: testCase.name,
      prompt: testCase.prompt,
      response: '',
      cleanedResponse: `ERROR: ${error instanceof Error ? error.message : String(error)}`,
      duration: Date.now() - start,
      matchedKeywords: [],
      success: false,
    };
  }
}

function formatResult(result: TestResult): string {
  const status = result.success ? '✅ PASS' : '❌ FAIL';
  const keywordMatch = result.expectedKeywords
    ? `${result.matchedKeywords.length}/${result.expectedKeywords.length} keywords`
    : 'N/A';

  return `
${status} ${result.name} (${result.duration}ms)
Keywords: ${keywordMatch}
Response Preview:
${result.cleanedResponse.substring(0, 200)}...
${'─'.repeat(60)}
`;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     Qwen3.5:latest Evaluation Suite                      ║');
  console.log('║     Testing reasoning and problem-solving skills       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const results: TestResult[] = [];

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);
    console.log(formatResult(result));
  }

  // Summary
  const passed = results.filter((r) => r.success).length;
  const total = results.length;
  const avgDuration = results.reduce((acc, r) => acc + r.duration, 0) / total;

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     EVALUATION SUMMARY                                 ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log(`Average Response Time: ${avgDuration.toFixed(0)}ms`);
  console.log('\nDetailed Results:');
  console.log('─'.repeat(60));

  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.duration}ms`);
  }

  // Exit with error code if any tests failed
  if (passed < total) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
