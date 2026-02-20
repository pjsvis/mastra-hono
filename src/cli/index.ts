#!/usr/bin/env bun

import { parseArgs } from 'node:util';
import { type AgentId, agentIds } from '../mastra/index';
import { chatCommand } from './commands/chat';
import { runCommand } from './commands/run';

const args = process.argv.slice(2);

// Parse top-level command
const command = args[0];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (command === 'agent') {
  await handleAgentCommand(args.slice(1));
} else {
  console.error(`Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}

async function handleAgentCommand(args: string[]): Promise<void> {
  const subcommand = args[0];

  if (!subcommand) {
    console.error('Usage: bun run cli agent <run|chat> <agentId> [options]');
    process.exit(1);
  }

  if (subcommand === 'run') {
    await handleRunCommand(args.slice(1));
  } else if (subcommand === 'chat') {
    await handleChatCommand(args.slice(1));
  } else {
    console.error(`Unknown agent subcommand: ${subcommand}`);
    console.error('Usage: bun run cli agent <run|chat> <agentId> [options]');
    process.exit(1);
  }
}

async function handleRunCommand(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      prompt: {
        type: 'string',
        short: 'p',
      },
      model: {
        type: 'string',
        short: 'm',
      },
    },
    strict: true,
    allowPositionals: true,
  });

  const agentId = positionals[0];

  if (!agentId) {
    console.error('Error: Agent ID is required');
    console.error('Usage: bun run cli agent run <agentId> --prompt "your prompt"');
    process.exit(1);
  }

  if (!agentIds.includes(agentId as AgentId)) {
    console.error(`Error: Unknown agent ID "${agentId}"`);
    console.error(`Available agents: ${agentIds.join(', ')}`);
    process.exit(1);
  }

  if (!values.prompt) {
    console.error('Error: --prompt is required');
    console.error('Usage: bun run cli agent run <agentId> --prompt "your prompt"');
    process.exit(1);
  }

  try {
    await runCommand({
      agent: agentId as AgentId,
      prompt: values.prompt,
      model: values.model,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function handleChatCommand(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      model: {
        type: 'string',
        short: 'm',
      },
    },
    strict: true,
    allowPositionals: true,
  });

  const agentId = positionals[0];

  if (!agentId) {
    console.error('Error: Agent ID is required');
    console.error('Usage: bun run cli agent chat <agentId> [--model model-name]');
    process.exit(1);
  }

  if (!agentIds.includes(agentId as AgentId)) {
    console.error(`Error: Unknown agent ID "${agentId}"`);
    console.error(`Available agents: ${agentIds.join(', ')}`);
    process.exit(1);
  }

  try {
    await chatCommand({
      agent: agentId as AgentId,
      model: values.model,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function showHelp(): void {
  console.log(`
Mastra Agent CLI

Usage:
  bun run cli agent <command> <agentId> [options]

Commands:
  run <agentId> --prompt <prompt>   Execute a single prompt and exit
  chat <agentId>                    Start an interactive chat session

Options:
  --model, -m <model>    Override the default model (e.g., openai/gpt-4o)
  --prompt, -p <prompt>  Prompt to send to the agent (run mode only)

Examples:
  bun run cli agent run localMemoryAgent --prompt "Fetch user 123"
  bun run cli agent chat localMemoryAgent
  bun run cli agent chat researchAgent --model openai/gpt-4o

Available agents:
  - localMemoryAgent
  - researchAgent
  - weatherAgent
`);
}
