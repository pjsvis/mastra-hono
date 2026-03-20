# Brief: Create Mentation Workflow

**Objective**: Implement a multi-step Mastra workflow that operationalizes PHI-1 (Abstract & Structure)—transforming raw 'stuff' into structured 'things' through explicit stages.

## Problem Statement

The Ctx philosophy defines **Mentation** as the core cognitive function, but this remains abstract. There is no concrete, executable workflow that:
- Takes unstructured input ('stuff')
- Processes it through defined stages
- Outputs structured, validated results ('things')

This brief makes Mentation *executable*.

## Proposed Solution

### Workflow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   INTAKE    │───▶│  STRUCTURE  │───▶│  VALIDATE   │───▶│   OUTPUT    │
│   (Stuff)   │    │  (Abstract) │    │  (Watt Test)│    │  (Thing)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Implementation

```typescript
// src/mastra/workflows/mentation-workflow.ts
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const intakeStep = createStep({
  id: 'intake',
  description: 'Receive and characterize raw input (stuff)',
  inputSchema: z.object({
    rawInput: z.string().describe('Unstructured input to be mentated'),
    context: z.string().optional().describe('Additional context'),
  }),
  outputSchema: z.object({
    entropy: z.enum(['low', 'medium', 'high']),
    inputType: z.string(),
    keyElements: z.array(z.string()),
  }),
  execute: async ({ context, mastra }) => {
    const agent = mastra.getAgent('edinburgh-protocol-agent');
    const response = await agent.generate(
      `Analyze this input and characterize its entropy level, type, and key elements:\n\n${context.rawInput}`
    );
    // Parse structured response
    return { entropy: 'medium', inputType: 'request', keyElements: [] };
  },
});

const structureStep = createStep({
  id: 'structure',
  description: 'Transform chaos into order (PHI-1)',
  inputSchema: intakeStep.outputSchema,
  outputSchema: z.object({
    structuredOutput: z.any(),
    transformations: z.array(z.string()),
  }),
  execute: async ({ context, mastra }) => {
    const agent = mastra.getAgent('edinburgh-protocol-agent');
    // Use agent to structure the input based on intake analysis
    return { structuredOutput: {}, transformations: [] };
  },
});

const validateStep = createStep({
  id: 'validate',
  description: "Apply Watt's Test: Does this actually help?",
  inputSchema: structureStep.outputSchema,
  outputSchema: z.object({
    isValid: z.boolean(),
    wattsScore: z.number().min(0).max(10),
    issues: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    // Validate the structured output
    return { isValid: true, wattsScore: 8, issues: [] };
  },
});

const outputStep = createStep({
  id: 'output',
  description: 'Emit the final Thing',
  inputSchema: validateStep.outputSchema,
  outputSchema: z.object({
    thing: z.any(),
    metadata: z.object({
      entropyReduction: z.string(),
      confidence: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    return {
      thing: context,
      metadata: { entropyReduction: 'high→low', confidence: 0.85 },
    };
  },
});

export const mentationWorkflow = createWorkflow({
  id: 'mentation-workflow',
  description: 'Transform stuff into things via structured mentation',
  steps: [intakeStep, structureStep, validateStep, outputStep],
});
```

### Integration

Register in `src/mastra/index.ts`:

```typescript
import { mentationWorkflow } from './workflows/mentation-workflow';

export const mastra = new Mastra({
  workflows: { weatherWorkflow, mentationWorkflow },
  // ...
});
```

## Acceptance Criteria

- [ ] `mentation-workflow.ts` created with 4 stages
- [ ] Workflow registered in Mastra config
- [ ] Edinburgh Protocol agent used for structure/analysis steps
- [ ] Workflow accessible via Mastra Studio
- [ ] Integration test demonstrating stuff→thing transformation
- [ ] Documentation added to README

## Dependencies

- Brief: Edinburgh Tools (agent should have tools for grounding)

## Estimated Points

8 (new workflow with multiple steps and agent integration)
