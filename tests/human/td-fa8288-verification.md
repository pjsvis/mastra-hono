# Human Test Plan: Observational Memory (`td-fa8288`)

This document provides a clear path for a human (the User) to verify the "Observational Memory" product. It moves the verification from hidden code into a visible, interactive process.

## 1. Prerequisites
- **Ollama**: Must be running locally.
- **Model**: `lfm2.5-thinking:latest` must be pulled (`ollama pull lfm2.5-thinking`).
- **Storage**: The `mastra.db` file will be used to store observations.

## 2. Automated Interactive Test
Run the following command to see the agent learn in real-time:

```bash
bun run scripts/test-learning.ts
```

### What to Look For:
1. **First Attempt**: The agent should call `mockApiTool` with `userId: "123"`. The script will show the error returned by the tool.
2. **The Reflection Wait**: A 5-second pause occurs. In a real system, this happens in the background.
3. **Second Attempt**: The agent should call `mockApiTool` with `userId: "USR-456"`. 

**Pass Criteria**: The agent automatically prepends `USR-` to the second request without being explicitly told to do so in the second prompt.

## 3. Manual "Black-Box" Test
If you want to test it manually via the CLI or a test file:

1. **Delete Existing Memory**: `rm mastra.db` (Caution: this wipes all local memory).
2. **Run a Prompt**: Ask the agent to fetch data for "Alice".
3. **See it Fail**: It will fail because "Alice" isn't "USR-Alice".
4. **Wait/Chat**: Talk about something else for a minute to trigger token thresholds, or run a few more prompts.
5. **Final Test**: Ask for "Bob". If the agent asks for "USR-Bob", the system is working perfectly.

## 4. Why This Matters
If you don't see the agent adapting, it means the **Reflector** model isn't strong enough or the **Observation Threshold** (messageTokens) is too high. This human test ensures our "Neat" system is actually "Effective".
