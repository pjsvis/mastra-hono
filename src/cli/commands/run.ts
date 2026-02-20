import { spawn } from 'node:child_process';
import { type AgentId, agentIds, mastra } from '../../mastra/index';

interface RunOptions {
  agent: AgentId;
  prompt: string;
  model?: string;
}

export async function runCommand(options: RunOptions): Promise<void> {
  const { agent: agentId, prompt, model } = options;

  // Get the agent from mastra instance
  const agent = mastra.getAgent(agentId);

  if (!agent) {
    const availableAgents = agentIds.join(', ');
    throw new Error(`Agent "${agentId}" not found. Available agents: ${availableAgents}`);
  }

  // Model override
  const agentToUse = agent;
  if (model) {
    agentToUse.model = model;
  }

  // Show thinking indicator using gum spin
  // We use a dummy command that we kill once generation is complete
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
  } finally {
    // Stop the spinner
    spinner.kill();
    // Move to next line after spinner is gone
    process.stdout.write('\r\x1b[K'); // Clear the line
  }
  const duration = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`done (${duration}s)`);
  console.log();

  // Render response with glow if available
  await renderMarkdown(result.text);
}

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
