import { describe, expect, test } from 'bun:test';
import { rm } from 'node:fs/promises';
import { LibSQLStore } from '@mastra/libsql';
import { createLocalMemoryAgent } from '@src/mastra/agents/local-memory-agent';
import { createOllama } from 'ollama-ai-provider-v2';

describe('Local Observational Memory Agent', () => {
  test('agent should learn from tool errors and adapt via memory', async () => {
    const ollama = createOllama({
      baseURL: 'http://localhost:11434/api',
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
      // Request without prefix - will fail
      const result1 = await testAgent.generate('Fetch data for user 123.', {
        memory: {
          thread: threadId,
          resource: 'test-user',
        },
      });

      console.log('Agent Response 1:', result1.text);

      // Wait for background observation to process the failure
      console.log('⏳ Waiting for Observational Memory to digest the error...');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      console.log('--- Attempt 2: Testing recall ---');
      // Request another user - should now use the USR- prefix from memory
      const result2 = await testAgent.generate('Now fetch data for user 456.', {
        memory: {
          thread: threadId,
          resource: 'test-user',
        },
      });

      const responseText = result2.text.toLowerCase();
      console.log('Agent Response 2:', responseText);

      // We expect the agent to have used the USR- prefix or at least mentioned Alice Agentic
      // Note: With 1.2B models, we check for 'usr-456' as a sign of successful learning
      success = responseText.includes('usr-456') || responseText.includes('alice agentic');

      if (!success) {
        console.warn(
          '⚠️ Learning check failed. Model might be too small for complex memory recall in one turn.'
        );
      }

      expect(success).toBe(true);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('fetch failed') || error.message.includes('API key'))
      ) {
        console.warn('⚠️ LLM is likely not reachable. Skipping assertion.');
        return;
      }

      throw error;
    } finally {
      // Cleanup: Wait a bit for async tasks to finish
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await rm(dbPath, { force: true });
    }
  }, 180000); // 3 minute timeout
});
