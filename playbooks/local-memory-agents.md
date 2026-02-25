# Playbook: Designing Local Memory Agents (Observational)

This playbook outlines the heuristics for building agents that learn from their environment using local Mastra Observational Memory.

## 1. Core Principles

- **Data Sovereignty**: Always use local model providers (e.g., Ollama) for the **Observer** and **Reflector** to keep memory logs local.
- **Fail-Fast Tools**: Tools must return explicit validation errors in the `result/error` pattern. Agents cannot "observe" success if the tool crashes the runtime.
- **Aggressive Orientation**: Set `messageTokens` thresholds significantly lower for local development (e.g., 500-1000 tokens) than production (30,000) to see results faster.

## 2. Implementation Pattern

```typescript
const agent = new Agent({
  name: '...',
  model: localModel,
  memory: new Memory({
    storage: localStorage,
    options: {
      observationalMemory: {
        model: localModel, // The Observer model
        observation: {
          messageTokens: 500, // Trigger learning quickly
        }
      }
    }
  })
});
```

## 3. Testing the Learning Loop

To verify an agent is learning:
1. **Trigger Failure**: Prompt the agent to use a tool with intentionally missing or malformed params.
2. **Wait for Reflection**: Background memory needs time (or token count) to trigger. In tests, use a low threshold and a 5-10 second sleep.
3. **Test Recall**: Prompt for a similar task. The agent should now prepend the correct prefix or include the missing param discovered in the first attempt.

## 4. Verification Checklist

- [ ] Does the agent have a dedicated `Memory` instance with `observationalMemory: true`?
- [ ] Is the storage adapter compatible (LibSQL, PG, or MongoDB)?
- [ ] Are the tool outputs using the `error` field for validation failures?
- [ ] Is the model capable of following the observation "thought trace"? (Minimum 1B params, 8B+ recommended).
