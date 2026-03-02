# AI-Friendly Code Patterns Playbook

## Executive Summary

**Key Learning:** Code patterns that are "clean" and "modern" for humans often become "opaque" and difficult for AI coding agents. This playbook documents when to prefer imperative over functional programming for maximum AI agent maintainability.

---

## Case Study: Git Worktree Cleanup Implementation

### The Experiment

We created two versions of the same functionality:
1. **Original (Imperative)** - Traditional JavaScript patterns
2. **Remeda (Functional)** - Modern functional programming with pipelines

### Human Readability Verdict

**Winner: Original (Imperative)**

Both versions were readable to humans, but the original was easier because:
- Familiar patterns that every developer knows
- Explicit control flow and state mutations
- No learning curve for team members

### AI Agent Maintainability Verdict

**Winner: Original (Imperative)** by a **landslide margin**

#### Why AI Agents Struggle with Functional Code

**1. The Reduce Function Problem**
```typescript
// Remeda version - Hard for AI
reduce(
  (acc, line) => {
    if (startsWith("worktree ", line)) {
      return { ...acc, current: { ...acc.current, path: ... } };
    }
  },
  { worktrees: [], current: null }
)
```

- Multiple spread operations confuse AI
- Complex accumulator structure
- AI must reason about nested mutations
- Higher cognitive load for LLMs

```typescript
// Original version - Easy for AI
let current = null;
for (const line of output.split('\n')) {
  if (line.startsWith('worktree ')) {
    current = { path: ..., branch: '' };
  }
  worktrees.push(current);
}
```

- Explicit state changes
- Clear step-by-step logic
- AI can track each operation
- Matches patterns from training data

**2. Pipeline Reasoning**
```typescript
// Remeda version - AI struggles with type flow
pipe(
  data,
  transform1,  // What's the type here?
  transform2,  // And here?
  transform3   // AI has to infer all intermediate types
)
```

```typescript
// Original version - Clear types throughout
const output = exec("git branch --merged main");
const branches = output.split('\n');
const trimmed = branches.map(b => b.trim());
const filtered = trimmed.filter(b => b && !PROTECTED.includes(b));
// AI knows types at each step
```

**3. Intent Understanding**
```typescript
// Remeda version - Why are we doing this?
map((b) => b.trim())
filter((b): b is string => b !== "" && !PROTECTED.includes(b))
```

```typescript
// Original version - Clear context
for (const branch of branches) {
  const trimmed = branch.trim();  // Operation in context
  if (trimmed && !PROTECTED.includes(trimmed)) {
    // Clear business logic
  }
}
```

---

## The Counterexample: await-to-js

### Why This Package Works Well

```typescript
// await-to-js: Simple, focused, AI-friendly
const [error, data] = await to(someAsyncOperation());
if (error) {
  // AI understands this pattern instantly
}
```

**Why it's great for both humans AND agents:**
1. **Single purpose** - Does one thing well
2. **Low complexity** - No complex transformations
3. **Clear intent** - Error handling is explicit
4. **Familiar pattern** - Similar to Go error handling
5. **Type-safe** - Easy for AI to infer types

**Contrast with Remeda:**
- Remeda has 100+ functions with complex signatures
- Higher learning curve for AI
- More opportunities for AI hallucinations
- Pipeline complexity scales poorly for AI reasoning

---

## Comparative Analysis

| Pattern | Human Readability | AI Maintainability | Verdict |
|---------|------------------|-------------------|---------|
| Simple imperative loops | ✅ High | ✅ High | **Keep** |
| Functional pipelines (simple) | ✅ High | ✅ Medium | **Conditional** |
| Functional pipelines (complex) | ⚠️ Medium | ❌ Low | **Avoid** |
| Small utility functions | ✅ High | ✅ High | **Keep** |
| Large functional libraries | ⚠️ Variable | ❌ Low | **Deprecate** |

---

## Package Selection Guidelines

### ✅ Keep (AI-Friendly)

**Criteria:**
- Simple, focused functionality
- Low complexity (< 3 parameters)
- Clear, linear data flow
- Matches common training patterns

**Examples:**
- `await-to-js` - Simple error handling
- `zod` - Schema validation with clear structure
- Small domain utilities (date-fns individual exports)

### ❌ Deprecate (AI-Unfriendly)

**Criteria:**
- Large API surface (50+ functions)
- Complex composition patterns
- Heavy use of higher-order functions
- Requires significant learning investment

**Examples:**
- `remeda` - Too complex for AI reasoning
- `ramda` - Same issues as Remeda
- `lodash` - Large, though somewhat familiar to AI
- `fp-ts` - Extremely complex for AI

---

## Practical Guidelines for This Project

### When to Use Imperative Code

**Always prefer when:**
1. Parsing structured data from strings
2. Implementing complex state machines
3. Working with nested objects
4. Building data structures incrementally
5. Performance is critical (avoid function call overhead)

**Examples:**
```typescript
// ✅ AI-Friendly: Parsing worktrees
function parseWorktrees(output: string): Worktree[] {
  const worktrees: Worktree[] = [];
  let current: Partial<Worktree> | null = null;
  
  for (const line of output.split('\n')) {
    if (line.startsWith('worktree ')) {
      current = { path: line.slice(9) };
    } else if (line.startsWith('branch ') && current) {
      worktrees.push({ ...current, branch: line.slice(7) });
      current = null;
    }
  }
  
  return worktrees;
}
```

### When Functional Code is Acceptable

**Use when:**
1. Simple transformations (map/filter/each)
2. Small utility functions
3. Type-safe operations
4. Operations that don't require state tracking

**Examples:**
```typescript
// ✅ Acceptable: Simple filtering
const activeTasks = tasks.filter(t => !t.completed);

// ✅ Acceptable: Simple mapping
const taskIds = tasks.map(t => t.id);

// ✅ Acceptable: Small transformation
const trimmed = input.trim().toLowerCase();
```

### Anti-Patterns to Avoid

**❌ Don't do this:**
```typescript
// Too complex for AI to modify correctly
const result = pipe(
  data,
  reduce((acc, item) => ({
    ...acc,
    [item.id]: { ...acc[item.id], ...transform(item) }
  }), {}),
  mapValues(v => ({ ...v, computed: calc(v) })),
  filter(v => v.computed > threshold)
);
```

**✅ Do this instead:**
```typescript
// AI can easily understand and modify
const result: Record<string, TransformedItem> = {};
for (const item of data) {
  const transformed = transform(item);
  const computed = calc(transformed);
  
  if (computed > threshold) {
    result[item.id] = {
      ...item,
      ...transformed,
      computed
    };
  }
}
```

---

## Opinion: Should We Deprecate Remeda?

**Recommendation: YES, deprecate Remeda**

### Rationale

1. **AI Maintainability** - Our primary constraint
   - Complex functional code is harder for AI to maintain
   - Reduces accuracy of AI-generated changes
   - Increases AI debugging time

2. **Team Considerations**
   - Remeda has a learning curve
   - Mixed-skill teams benefit from simpler patterns
   - Onboarding overhead

3. **Code Review Burden**
   - Complex pipelines are harder to review
   - Harder to spot bugs
   - More cognitive load on reviewers

4. **Performance**
   - Function call overhead in hot paths
   - Immutable allocations for every operation
   - JavaScript engine optimization challenges

### Migration Strategy

1. **Phase 1: Stop new usage**
   - Don't use Remeda in new code
   - Prefer native JavaScript or simple utilities

2. **Phase 2: Gradual replacement**
   - Replace complex Remeda usage with imperative code
   - Keep simple utility functions if they add value
   - Document the migration for future reference

3. **Phase 3: Remove dependency**
   - Once all Remeda usage is replaced, remove from package.json
   - Document the lessons learned

### Keep: await-to-js

**This package serves a different purpose:**
- Simple, focused API
- Clear, linear data flow
- Excellent for both humans and AI
- Low cognitive overhead
- Type-safe without complexity

---

## Key Takeaways

### For Developers

1. **Write code that AI can understand**
   - Explicit beats implicit
   - Linear beats complex pipelines
   - Familiar beats clever

2. **Think about AI maintainability**
   - How easy would it be for an AI to modify this?
   - Would an AI understand the intent?
   - Are there simpler patterns?

3. **Avoid premature abstraction**
   - Don't functionalize everything just because it's "clean"
   - Sometimes loops are the right choice
   - Performance matters

### For Code Review

1. **Check AI-friendliness**
   - Is the code easily maintainable by AI?
   - Are complex transformations justified?

2. **Prefer readability**
   - "This is clever" ≠ "This is good"
   - Simple and explicit is usually better

3. **Question dependencies**
   - Do we need this large library?
   - Can we use native JavaScript instead?
   - Is this worth the learning curve?

### For Package Selection

1. **Evaluate AI compatibility**
   - Is the API surface manageable?
   - Are the patterns AI-friendly?
   - Will AI hallucinate less with this?

2. **Keep focused libraries**
   - Single-purpose utilities are great
   - Multi-function libraries are risky
   - Domain-specific beats general-purpose

---

## Conclusion

The most surprising insight is that **what makes code "clean" for humans often makes it "opaque" for AI agents**. This isn't about bad code vs good code - it's about choosing patterns that work for both humans AND AI.

Our goal isn't to write bad code - it's to write **AI-maintainable code**. Sometimes that means choosing familiar imperative patterns over elegant functional ones. The complexity of our AI tools demands code that they can understand, modify, and debug effectively.

**Bottom line:** When in doubt, choose the approach that's easier for an AI agent to understand and maintain. The code may be less "elegant," but it will be more maintainable in an AI-driven development workflow.

---

## References

- Original implementation: `src/cli/commands/worktree/cleanup.ts`
- Functional version: `src/cli/commands/worktree/cleanup-remeda.ts`
- Package: `remeda` (deprecate)
- Package: `await-to-js` (keep)

---

**Last Updated:** 2025-01-03  
**Status:** Active Playbook  
**Next Review:** After next major AI tooling update