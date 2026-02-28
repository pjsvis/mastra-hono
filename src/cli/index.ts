#!/usr/bin/env bun

import { defineCommand, runMain } from 'citty';
import { agentCommand } from './commands/agent';

const main = defineCommand({
  meta: {
    name: 'mastra-cli',
    version: '0.1.0',
    description: 'Mastra Agent CLI - Interact with your AI agents',
  },
  subCommands: {
    agent: agentCommand,
  },
});

runMain(main);
