/**
 * Generate a new agent
 *
 * Usage: bun run scripts/generate-agent.ts <agent-name>
 */

const agentName = process.argv[2];

if (!agentName) {
  console.error('Usage: bun run scripts/generate-agent.ts <agent-name>');
  process.exit(1);
}

console.log(`Generating agent: ${agentName}`);
// TODO: Implement agent scaffolding logic
