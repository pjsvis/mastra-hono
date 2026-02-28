import { defineCommand } from 'citty';
import { agentIds } from '../../mastra/index';
import { chatCommand } from './chat';
import { runCommand } from './run';

export const agentCommand = defineCommand({
  meta: {
    name: 'agent',
    description: 'Agent commands - run and chat with AI agents',
  },
  subCommands: {
    run: runCommand,
    chat: chatCommand,
  },
});

export const agentArg = {
  type: 'positional',
  required: true,
  description: `The agent ID to use (${agentIds.join(', ')})`,
} as const;

export const modelArg = {
  type: 'string',
  description: 'Override the default model (e.g., openai/gpt-4o)',
  alias: 'm',
} as const;
