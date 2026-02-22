import { mastra } from '../src/mastra';

async function main() {
  const agent = mastra.getAgent('localMemoryAgent');
  const threadId = `human-test-${Date.now()}`;

  console.log('🚀 Starting Human Verification for Observational Memory');
  console.log('---------------------------------------------------');
  console.log('Step 1: Triggering an intentional error (invalid userId)...');

  const res1 = await agent.generate('Fetch data for user 123.', {
    memory: { thread: threadId, resource: 'human-verification' },
  });

  console.log('\n🤖 Agent Response (Attempt 1):');
  console.log(res1.text);
  console.log('\n[Observation: The tool returned an error because 123 is missing the USR- prefix]');

  console.log('\n⏳ Waiting 5 seconds for local memory to reflect on the error...');
  await new Promise((r) => setTimeout(r, 5000));

  console.log('\nStep 2: Testing if the agent learned the rule...');
  const res2 = await agent.generate('Now fetch data for user 456.', {
    memory: { thread: threadId, resource: 'human-verification' },
  });

  console.log('\n🤖 Agent Response (Attempt 2):');
  console.log(res2.text);

  if (res2.text.toLowerCase().includes('usr-456')) {
    console.log('\n✅ SUCCESS: The agent adapted its behavior based on observational memory!');
  } else {
    console.log(
      '\n❌ FAILED: The agent did not use the USR- prefix. (Model may need more context or tokens)'
    );
  }
}

main().catch(console.error);
