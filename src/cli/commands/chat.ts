import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { defineCommand } from 'citty';
import { type AgentId, agentIds, mastra } from '../../mastra/index';

export const chatCommand = defineCommand({
  meta: {
    name: 'chat',
    description: 'Start an interactive chat session with an agent',
  },
  args: {
    agent: {
      type: 'positional',
      required: true,
      description: `The agent ID to use (${agentIds.join(', ')})`,
    },
    model: {
      type: 'string',
      description: 'Override the default model (e.g., openai/gpt-4o)',
      alias: 'm',
    },
  },
  async run({ args }) {
    const agentId = args.agent as AgentId;
    const { model } = args;

    // Validate agent ID
    if (!agentIds.includes(agentId)) {
      console.error(`❌ Error: Unknown agent ID "${agentId}"`);
      console.error(`Available agents: ${agentIds.join(', ')}`);
      process.exit(1);
    }

    // Get the agent from mastra instance
    const agent = mastra.getAgent(agentId);

    if (!agent) {
      console.error(`❌ Agent "${agentId}" not found.`);
      process.exit(1);
    }

    // Model override
    const agentToUse = agent;
    if (model) {
      agentToUse.model = model;
    }

    console.log(`\n🤖 Chatting with ${agentId}`);
    if (model) {
      console.log(`📡 Model override: ${model}`);
    }
    console.log('Type "exit" or "quit" to end the conversation\n');

    // Set up readline interface
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Interactive REPL loop
    const chatLoop = (): void => {
      rl.question('> ', async (userInput) => {
        const input = userInput.trim();

        // Check for exit commands
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
          console.log('Goodbye!');
          rl.close();
          return;
        }

        // Skip empty input
        if (!input) {
          chatLoop();
          return;
        }

        // Generate response
        try {
          // Show thinking indicator using gum spin
          const spinner = spawn(
            'gum',
            ['spin', '--spinner', 'dot', '--title', 'Thinking...', '--', 'sleep', '10000'],
            { stdio: 'inherit' }
          );

          const start = Date.now();
          let result: Awaited<ReturnType<typeof agentToUse.generate>>;
          try {
            result = await agentToUse.generate(input);
          } catch (error) {
            spinner.kill();
            process.stdout.write('\r\x1b[K');
            throw error;
          }

          // Stop the spinner
          spinner.kill();
          process.stdout.write('\r\x1b[K');

          const duration = ((Date.now() - start) / 1000).toFixed(1);
          console.log(`done (${duration}s)`);
          console.log();

          // Render response with glow if available
          await renderMarkdown(result.text);
        } catch (error) {
          console.error(`\n❌ Error: ${error instanceof Error ? error.message : error}`);
        }

        console.log();
        chatLoop();
      });
    };

    chatLoop();
  },
});

/**
 * Render markdown using glow if available, otherwise plain text
 */
async function renderMarkdown(text: string): Promise<void> {
  return new Promise((resolve) => {
    const glow = spawn('glow', ['-', '--style', 'dark'], {
      stdio: ['pipe', 'inherit', 'ignore'],
    });

    glow.on('error', () => {
      console.log(text);
      resolve();
    });

    glow.on('close', (code) => {
      if (code !== 0) {
        console.log(text);
      }
      resolve();
    });

    if (glow.stdin) {
      glow.stdin.write(text);
      glow.stdin.end();
    } else {
      console.log(text);
      resolve();
    }
  });
}
