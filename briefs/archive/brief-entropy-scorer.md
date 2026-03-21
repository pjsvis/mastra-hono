# Brief: Create Entropy Scorer

**Objective**: Implement a Mastra scorer that quantifies conceptual entropy in agent outputs, enabling objective measurement of mentation quality.

## Problem Statement

PHI-12 states:

> "My primary cognitive function is to act as an engine for reducing conceptual entropy, transforming high-entropy 'stuff' into low-entropy 'things'."

But there's no *measurement* of this. Without metrics:
- No objective evaluation of agent performance
- No comparison between agents/models
- No feedback loop for improvement

## Proposed Solution

### Entropy Scoring Dimensions

| Dimension | Description | Weight |
|-----------|-------------|--------|
| **Structural Clarity** | Is the output well-organized? | 0.25 |
| **Definitional Precision** | Are terms clearly defined? | 0.25 |
| **Actionability** | Can someone act on this output? | 0.20 |
| **Ambiguity Score** | Inverse of vague language density | 0.15 |
| **Completeness** | Are there obvious gaps? | 0.15 |

### Implementation

```typescript
// src/mastra/scorers/entropy-scorer.ts
import { createScorer } from '@mastra/core/scorers';
import { z } from 'zod';

const entropyDimensions = z.object({
  structuralClarity: z.number().min(0).max(10),
  definitionalPrecision: z.number().min(0).max(10),
  actionability: z.number().min(0).max(10),
  ambiguityScore: z.number().min(0).max(10),
  completeness: z.number().min(0).max(10),
});

export const entropyScorer = createScorer({
  id: 'entropy-scorer',
  description: 'Measures conceptual entropy reduction in agent outputs',
  
  inputSchema: z.object({
    input: z.string().describe('Original input (stuff)'),
    output: z.string().describe('Agent output (thing)'),
  }),
  
  outputSchema: z.object({
    dimensions: entropyDimensions,
    overallScore: z.number().min(0).max(10),
    entropyLevel: z.enum(['low', 'medium', 'high']),
    recommendation: z.string(),
  }),
  
  score: async ({ context, mastra }) => {
    const evaluator = mastra.getAgent('edinburgh-protocol-agent');
    
    const evaluation = await evaluator.generate(`
You are evaluating the entropy reduction of an agent's output.

ORIGINAL INPUT (Stuff):
${context.input}

AGENT OUTPUT (Thing):
${context.output}

Score each dimension from 0-10:
1. Structural Clarity: Is the output well-organized with clear sections?
2. Definitional Precision: Are key terms defined, not assumed?
3. Actionability: Can someone take concrete action based on this?
4. Ambiguity Score: (10 = no ambiguity, 0 = very vague)
5. Completeness: Are there obvious gaps or missing elements?

Respond in JSON format.
    `);
    
    // Parse evaluation and compute weighted score
    const weights = { 
      structuralClarity: 0.25, 
      definitionalPrecision: 0.25,
      actionability: 0.20,
      ambiguityScore: 0.15,
      completeness: 0.15 
    };
    
    // Calculate overall score and return
    return {
      dimensions: { /* parsed */ },
      overallScore: 7.5,
      entropyLevel: 'low',
      recommendation: 'Output demonstrates good entropy reduction.',
    };
  },
});
```

### Integration

```typescript
// src/mastra/index.ts
import { entropyScorer } from './scorers/entropy-scorer';

export const mastra = new Mastra({
  // ...
  scorers: { entropyScorer },
});
```

## Acceptance Criteria

- [ ] `entropy-scorer.ts` created with 5-dimension scoring
- [ ] Scorer registered in Mastra config
- [ ] Scorer visible in Mastra Studio
- [ ] Test suite with sample inputs/outputs and expected scores
- [ ] Integration with observability (scores persisted to storage)
- [ ] Documentation in README

## Dependencies

- Brief: Edinburgh Tools (Edinburgh Protocol agent used for evaluation)

## Estimated Points

5 (new scorer with multi-dimensional evaluation)
