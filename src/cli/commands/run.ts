import { spawn } from 'node:child_process';
import { defineCommand } from 'citty';
import { type AgentId, agentIds, mastra } from '../../mastra/index';

export const runCommand = defineCommand({
  meta: {
    name: 'run',
    description: 'Execute a single prompt and exit',
  },
  args: {
    agent: {
      type: 'positional',
      required: true,
      description: `The agent ID to use (${agentIds.join(', ')})`,
    },
    prompt: {
      type: 'string',
      description: 'The prompt to send to the agent',
      alias: 'p',
      required: true,
    },
    model: {
      type: 'string',
      description: 'Override the default model (e.g., openai/gpt-4o)',
      alias: 'm',
    },
  },
  async run({ args }) {
    const agentId = args.agent as AgentId;
    const { prompt, model } = args;

    // Validate agent ID
    if (!agentIds.includes(agentId)) {
      console.error(`❌ Error: Unknown agent ID "${agentId}"`);
      console.error(`Available agents: ${agentIds.join(', ')}`);
      process.exit(1);
    }

    // Validate prompt
    if (!prompt) {
      console.error('❌ Error: --prompt is required');
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

    // Show thinking indicator using gum spin
    const spinner = spawn(
      'gum',
      ['spin', '--spinner', 'dot', '--title', 'Thinking...', '--', 'sleep', '10000'],
      { stdio: 'inherit' }
    );

    // Generate response
    const start = Date.now();
    let result: Awaited<ReturnType<typeof agentToUse.generate>>;
    try {
      result = await agentToUse.generate(prompt);
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
