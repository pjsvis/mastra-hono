# Brief: Equip Edinburgh Protocol Agent with Tools

**Objective**: Transform the Edinburgh Protocol agent from a pure reasoning agent into a grounded, operational agent by adding web search and calculator tools.

## Problem Statement

The Edinburgh Protocol agent embodies Ctx principles (Mentation, Mentational Humility, CNS Avoidance) but currently lacks **grounding tools**. Without tools, it cannot:
- Validate claims against external sources (violates empiricism principle)
- Perform calculations to verify numerical reasoning
- Access current information (trapped in training data)

This creates a gap between philosophy and praxis—contrary to Watt's Test ("does it work?").

## Proposed Solution

### 1. Add Existing Tools

Import and attach `webSearchTool` and `calculatorTool` to the Edinburgh Protocol agent:

```typescript
// src/mastra/agents/edinburgh-protocol-agent.ts
import { calculatorTool } from '../tools/calculator-tool';
import { webSearchTool } from '../tools/web-search-tool';

export const edinburghProtocolAgent = new Agent({
  // ... existing config
  tools: { calculatorTool, webSearchTool },
});
```

### 2. Update System Prompt

Add tool-aware instructions to the agent's prompt:

```markdown
## AVAILABLE TOOLS

You have access to:
- **calculatorTool**: For mathematical verification. Use this to validate any numerical claims.
- **webSearchTool**: For empirical grounding. Use this to verify facts against current sources.

### Tool Usage Protocol (Hume's Verification)
Before asserting facts:
1. If numerical → verify with calculatorTool
2. If empirical claim → ground with webSearchTool
3. If neither tool applies → explicitly state "unverified assertion"
```

## Acceptance Criteria

- [ ] Edinburgh Protocol agent has `calculatorTool` attached
- [ ] Edinburgh Protocol agent has `webSearchTool` attached
- [ ] System prompt updated with tool usage guidance
- [ ] Agent successfully uses tools when prompted with factual/numerical queries
- [ ] Tests added for tool-augmented responses

## Dependencies

None—uses existing tools from `src/mastra/tools/`.

## Estimated Points

3 (straightforward integration)
