import { describe, expect, test } from 'bun:test';
import { rm } from 'node:fs/promises';
import { LibSQLStore } from '@mastra/libsql';
import { createLocalMemoryAgent } from '@src/mastra/agents/local-memory-agent';
import { createOllama } from 'ollama-ai-provider-v2';

// Helper to timeout a promise
const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);

describe('Local Observational Memory Agent', () => {
  test('agent should learn from tool errors and adapt via memory', async () => {
    const ollama = createOllama({
      baseURL: 'http://ollama.localhost:1355/api',
    });

    const model = ollama('lfm2.5-thinking');

    // 1. Setup isolated test storage
    const dbPath = `./test-memory-learning-${Date.now()}.db`;
    const testStorage = new LibSQLStore({
      id: 'test-memory-storage',
      url: `file:${dbPath}`,
    });

    await testStorage.init();

    // 2. Create a fresh agent instance aligned with production config
    const testAgent = createLocalMemoryAgent({
      model,
      storage: testStorage,
      observationTokens: 10, // Trigger observation almost immediately
    });

    const threadId = `test-thread-${Date.now()}`;
    let success = false;

    try {
      console.log('--- Attempt 1: Triggering failure ---');
      // Request without prefix - will fail (with 60s timeout)
      const result1 = await withTimeout(
        testAgent.generate('Fetch data for user 123.', {
          memory: {
            thread: threadId,
            resource: 'test-user',
          },
        }),
        60000,
        'First generate call'
      );

      console.log('Agent Response 1:', result1.text);

      // Wait for background observation to process the failure
      console.log('⏳ Waiting for Observational Memory to digest the error...');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      console.log('--- Attempt 2: Testing recall ---');
      // Request another user - should now use the USR- prefix from memory (with 60s timeout)
      const result2 = await withTimeout(
        testAgent.generate('Now fetch data for user 456.', {
          memory: {
            thread: threadId,
            resource: 'test-user',
          },
        }),
        60000,
        'Second generate call'
      );

      const responseText = result2.text.toLowerCase();
      console.log('Agent Response 2:', responseText);

      // We expect the agent to have used the USR- prefix as a sign of successful learning
      success = responseText.includes('usr-456');

      if (!success) {
        console.warn(
          '⚠️ Learning check failed. Model might be too small for complex memory recall in one turn.'
        );
      }

      expect(success).toBe(true);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('fetch failed') ||
          error.message.includes('API key') ||
          error.message.includes('timed out'))
      ) {
        console.warn('⚠️ LLM is likely not reachable or too slow. Skipping assertion.');
        return;
      }

      throw error;
    } finally {
      // Cleanup: Remove WAL/SHM companions
      await rm(dbPath, { force: true });
      await rm(`${dbPath}-wal`, { force: true });
      await rm(`${dbPath}-shm`, { force: true });
    }
  }, 180000); // 3 minute timeout
});
