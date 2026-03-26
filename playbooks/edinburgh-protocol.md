---
id: PB-008
title: "Edinburgh Protocol Playbook"
role: "Build | Orchestrate"
infrastructure: [mastra]
last_updated: "2026-03-21"
tags: [playbook]
---

# Edinburgh Protocol Playbook

## Purpose
This playbook documents the **Edinburgh Protocol**, a framework for building agents and workflows that reduce conceptual entropy—transforming chaotic "Stuff" into structured "Things" through Scottish Enlightenment principles. It provides a systematic approach to handling uncertainty, making decisions under ambiguity, and analyzing complex system failures.

**Core Philosophy:** Reduce conceptual entropy by acknowledging the difference between maps (your understanding) and territories (reality), measuring uncertainty explicitly, and applying appropriate analytical lenses based on entropy levels.


## When to Use

The Edinburgh Protocol is particularly valuable in the following situations:

| Situation | Recommended Action | Rationale |
|-----------|-------------------|-----------|
| **Requirements are unclear or contradictory** | Apply entropy classification | Unclear requirements indicate high entropy; protocol helps structure the chaos |
| **Debugging complex system failures** | Use systems-analyzer (incentives > villains) | Focus on systemic factors rather than blaming individuals |
| **Reviewing proposals or designs** | Apply impartial-spectator | Simulate disinterested expert perspective |
| **Making decisions under uncertainty** | Measure entropy explicitly | Acknowledge uncertainty and apply appropriate analytical lens |
| **Analyzing why something failed** | Look for bad incentives, not bad people | Systemic failures often stem from misaligned incentives |

## The Protocol

### Phase 1: Acknowledge the Map

Before acting, recognize that you're working with a "map" (your understanding), not the "territory" (reality). Document three categories:

**What you know (evidence):**
- Facts that can be verified
- Data that has been collected
- Observations that are objective

**What you assume (no evidence):**
- Beliefs held without proof
- Hypotheses that haven't been tested
- Conjectures about unknown factors

**What you don't know (explicit gaps):**
- Information that is missing
- Questions that remain unanswered
- Areas where further investigation is needed

**Why this matters:**
By explicitly distinguishing between knowledge, assumptions, and ignorance, you reduce the risk of confabulating narratives to fill gaps. This is the foundation of entropy reduction.

### Phase 2: Measure Entropy

Use the `classifyEntropy` tool to quantify the level of conceptual chaos:

```
Input → Entropy Score → Classification
```

**Entropy Levels:**

| Level | Score Range | Characteristics | Recommended Action |
|-------|-------------|----------------|---------------------|
| **Chaos** | 0.8-1.0 | Unstructured, contradictory, no clear objective | Apply Phase 3 (High Entropy) |
| **Turbulence** | 0.4-0.7 | Some structure but unclear relationships | Apply Phase 3 (Medium Entropy) |
| **Structure** | 0.2-0.4 | Clear but complex, actionable with effort | Apply Phase 3 (Low Entropy) |
| **Clarity** | 0.0-0.2 | Well-defined, actionable, low risk | Execute with precision |

**How to measure:**
```bash
# Using the entropy tool
classifyEntropy "Your input text here"
```

### Phase 3: Apply the Appropriate Lens

The appropriate analytical lens depends on the entropy level:

#### For High Entropy (>0.6):

1. **Extract the core question** – What is actually being asked? Strip away noise and ambiguity.
2. **Identify stakeholders and incentives** – Who benefits? Who loses? What are the systemic drivers? (Adam Smith)
3. **List constraints and boundary conditions** – What are the limits? What cannot be changed?
4. **Propose the smallest testable hypothesis** – What's the minimal experiment that could reduce uncertainty? (David Hume)

#### For Medium Entropy (0.3-0.6):

1. **Organize into categories/taxonomies** – Create structure from the semi-structured information.
2. **Map relationships and dependencies** – How do elements relate? What depends on what?
3. **Identify missing information** – What gaps remain? What would increase confidence?
4. **Draft provisional conclusions** – State conclusions with explicit confidence levels.

#### For Low Entropy (<0.3):

1. **Validate assumptions** – Test the premises before proceeding.
2. **Execute with precision** – The path is clear; focus on execution quality.
3. **Document for future entropy reduction** – Capture lessons learned to reduce entropy in similar situations.

### Phase 4: The Impartial Spectator

Before finalizing any output, simulate an "Impartial Spectator" (Adam Smith's concept):

**Three questions to ask:**

1. **"Would a disinterested expert agree with this analysis?"**
   - Imagine an expert with no stake in the outcome reviewing your work.
   - Would they find it reasonable? What objections would they raise?

2. **"What would convince me I'm wrong?"**
   - Identify evidence that would falsify your conclusions.
   - If you can't think of anything, you're likely overconfident.

3. **"Are there systemic factors I'm ignoring?"**
   - Look for patterns, incentives, and structures that might be driving the situation.
   - Avoid attributing outcomes to individual character when systemic factors are at play.

**Why this matters:**
The Impartial Spectator helps you step outside your own perspective and identify blind spots, biases, and overconfidence.

### Phase 5: Watt's Test

Ask: **"Does this actually help?"**

If not, iterate.

**What "help" means:**
- Does it reduce entropy?
- Does it enable better decisions?
- Does it improve understanding?
- Does it lead to actionable outcomes?

**What "help" does NOT mean:**
- Does it sound sophisticated?
- Does it impress others?
- Does it follow a particular methodology?
- Does it conform to expectations?

**Why this matters:**
James Watt's approach to steam engines was relentlessly pragmatic. He didn't pursue elegance for its own sake; he focused on what actually worked. The same principle applies here.

## Anti-Patterns

### What NOT to Do

| Anti-Pattern | Why It's Bad | Alternative |
|--------------|--------------|-------------|
| ❌ Fill gaps with confabulated narratives | Creates false certainty; leads to bad decisions | State ignorance explicitly |
| ❌ Blame individuals for systemic failures | Ignores root causes; prevents learning | Look for incentive structures |
| ❌ Prioritize elegance over utility | Wastes effort on form over function | Prioritize "does it work?" |
| ❌ Hide uncertainty behind jargon | Reduces transparency; prevents collaboration | Use precise language, even if it reveals uncertainty |
| ❌ Treat maps as territories | Confuses understanding with reality | Acknowledge the map-territory distinction |

### What TO Do

| Pattern | Why It's Good | Example |
|---------|---------------|---------|
| ✓ State ignorance clearly when appropriate | Enables others to fill gaps; reduces overconfidence | "We don't know X, but we can test Y" |
| ✓ Look for incentive structures in failures | Identifies root causes; enables systemic fixes | "The failure was caused by misaligned incentives, not incompetence" |
| ✓ Prioritize "does it work?" over "is it elegant?" | Focuses on outcomes; reduces waste | "This solution is ugly but effective" |
| ✓ Use precise language, even if it reveals uncertainty | Improves clarity; enables collaboration | "We're 60% confident this will work" |
| ✓ Build better steam engines (pragmatic improvement) | Focuses on incremental progress; reduces risk | "This small improvement reduces entropy by 10%" |

## Quick Reference

| Situation | Action | Tool/Method |
|-----------|--------|--------------|
| "The requirements are unclear" | Apply entropy classification | `classifyEntropy` |
| "Why did this fail?" | Use systems-analyzer (incentives > villains) | Phase 3 (High Entropy) |
| "Is this analysis sound?" | Invoke impartial-spectator | Phase 4 |
| "Which solution is better?" | Run Watt's Test (which actually improves things?) | Phase 5 |
| "How do I handle this uncertainty?" | Measure entropy explicitly | Phase 2 |

## Integration with Mastra

The Edinburgh Protocol is implemented in the Mastra framework through the following components:

### Agent
- **File:** `src/mastra/agents/edinburgh-protocol-agent.ts`
- **Purpose:** Provides an agent that applies the Edinburgh Protocol to analyze and reduce conceptual entropy
- **Usage:** Import and invoke via Mastra framework

### Tool
- **File:** `src/mastra/tools/entropy-tool.ts`
- **Purpose:** Provides the `classifyEntropy` function for measuring conceptual entropy
- **Usage:** Call the tool with input text to get entropy score and classification

### Example Usage

```typescript
import { edinburghProtocolAgent } from '@mastra/agents/edinburgh-protocol-agent';
import { classifyEntropy } from '@mastra/tools/entropy-tool';

// Measure entropy
const result = await classifyEntropy({
  input: "Your input text here"
});

// Apply protocol based on entropy level
const analysis = await edinburghProtocolAgent.generate({
  prompt: `Analyze this input with entropy score ${result.score}: ${result.classification}`
});
```

## Further Reading

### Primary Sources

- **David Hume:** "An Enquiry Concerning Human Understanding" – Empiricism and skepticism about causation
- **Adam Smith:** "The Theory of Moral Sentiments" – The Impartial Spectator and moral philosophy
- **James Watt:** Steam engine improvements – Pragmatic engineering over theoretical elegance

### Secondary Sources

- **Edinburgh Protocol System Prompt** (archive) – Original formulation of the protocol
- **Entropy Theory** – Information theory applications to conceptual clarity
- **Systems Thinking** – Analyzing complex systems and feedback loops

### Related Playbooks

- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy
- [Design Heuristics Playbook](./design-heuristics.md) – General design principles for agent systems
- [Secure Tool Design Playbook](./secure-tool-design.md) – Building tools that are safe and reliable

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team
