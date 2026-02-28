# Playbook: Edinburgh Protocol

## Purpose
A framework for building agents and workflows that reduce conceptual entropy—transforming chaotic "Stuff" into structured "Things" through Scottish Enlightenment principles.

## When to Use
- Requirements are unclear or contradictory
- Debugging complex system failures
- Reviewing proposals or designs
- Making decisions under uncertainty
- Analyzing why something failed (look for bad incentives, not bad people)

## The Protocol

### Phase 1: Acknowledge the Map
Before acting, recognize that you're working with a "map" (your understanding), not the "territory" (reality). Document:
- What you know (evidence)
- What you assume (no evidence)
- What you don't know (explicit gaps)

### Phase 2: Measure Entropy
Use the classifyEntropy tool:
```
Input → Entropy Score → Classification
```

**Levels:**
- **Chaos** (0.8-1.0): Unstructured, contradictory, no clear objective
- **Turbulence** (0.4-0.7): Some structure but unclear relationships
- **Structure** (0.2-0.4): Clear but complex, actionable with effort
- **Clarity** (0.0-0.2): Well-defined, actionable, low risk

### Phase 3: Apply the Appropriate Lens

**For High Entropy (>0.6):**
1. Extract the core question (what is actually being asked?)
2. Identify stakeholders and incentives (Smith)
3. List constraints and boundary conditions
4. Propose the smallest testable hypothesis (Hume)

**For Medium Entropy (0.3-0.6):**
1. Organize into categories/taxonomies
2. Map relationships and dependencies
3. Identify missing information
4. Draft provisional conclusions with confidence levels

**For Low Entropy (<0.3):**
1. Validate assumptions
2. Execute with precision
3. Document for future entropy reduction

### Phase 4: The Impartial Spectator
Before finalizing any output, simulate an "Impartial Spectator":
1. "Would a disinterested expert agree with this analysis?"
2. "What would convince me I'm wrong?"
3. "Are there systemic factors I'm ignoring?"

### Phase 5: Watt's Test
Ask: "Does this actually help?" If not, iterate.

## Anti-Patterns

**DO NOT:**
- ❌ Fill gaps with confabulated narratives
- ❃ Blame individuals for systemic failures
- ❌ Prioritize elegance over utility
- ❌ Hide uncertainty behind jargon
- ❌ Treat maps as territories

**DO:**
- ✓ State ignorance clearly when appropriate
- ✓ Look for incentive structures in failures
- ✓ Prioritize "does it work?" over "is it elegant?"
- ✓ Use precise language, even if it reveals uncertainty
- ✓ Build better steam engines (pragmatic improvement)

## Quick Reference

| Situation | Action |
|-----------|--------|
| "The requirements are unclear" | Apply entropy classification |
| "Why did this fail?" | Use systems-analyzer (incentives > villains) |
| "Is this analysis sound?" | Invoke impartial-spectator |
| "Which solution is better?" | Run Watt's Test (which actually improves things?) |

## Integration with Mastra

See implementation in:
- Agent: `src/mastra/agents/edinburgh-protocol-agent.ts`
- Tool: `src/mastra/tools/entropy-tool.ts`
- Usage: Import and invoke via Mastra framework

## Further Reading
- Hume: "An Enquiry Concerning Human Understanding"
- Smith: "The Theory of Moral Sentiments" (Impartial Spectator)
- Source: Edinburgh Protocol System Prompt (archive)
