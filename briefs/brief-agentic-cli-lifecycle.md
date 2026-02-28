To optimize a CLI tool for agentic use (specifically for the **Ctx** persona or similar sub-agents), a single `--help` parameter is typically **insufficient** for high-reliability automation. While human users navigate via discovery, agents operate most effectively when they can retrieve targeted, structured metadata without parsing a "wall of text".

Applying the principles of **Conceptual Entropy Reduction** and **Factored Design**, here is the recommended hierarchy for agent-integrated CLI help:

### 1. The "Single Source of Truth" (JSON Metadata)

A single `--help` flag usually returns unstructured "stuff" meant for human eyes. For agents, provide a flag like `--schema` or `--metadata` that returns a **JSON-formatted map** of the entire CLI surface.

* **Why:** Agents can ingest this directly into their "Mentation" to understand valid parameter combinations, type requirements, and default values without heuristic guessing.

### 2. Context-Specific Help (Help per Command/Param)

"Help per param" is significantly better for managing the agent's **Cognitive Load**.

* **The Heuristic:** Implement `[command] --help` and ideally `[command] --param [name] --help`.
* **Agentic Utility:** If an agent receives an error (e.g., a "grumpy" output from a failed validation), it should be able to query the specific parameter it got wrong rather than re-reading the entire manual.

### 3. Integrated Example Artifacts

In alignment with the **Artifact as Proof Protocol (APP)**, help should include a `--examples` flag that outputs valid, copy-pasteable command strings.

* **Why:** This lowers the **Input Activation Threshold** for the agent, allowing it to use pattern matching ("Fast Thinking") before engaging in complex syntax construction ("Slow Thinking").

### 4. Machine-Readable Error Messages

Standard help text is a proactive measure; error messages are reactive help.

* Ensure errors return **structured exit codes** and, if possible, a JSON body suggesting the correct syntax. This enables the agent to perform **Iterative Validation** and self-correct without human intervention.

### Recommendation for MastraCode Integration

If you are building specialized tools for a Mastra agent:

1. **Prioritize the JSON Schema:** Use a library (like `zod` or `commander` with a custom-export) to ensure the CLI's internal logic and its help documentation are perfectly synced.
2. **Granular Discovery:** Implement a "Sieve and Net" approach to help.
* **Sieve:** `--help` (Broad overview).
* **Net:** `[command] --help` (Precise detail).



**It might be a good idea to** implement a `--docs` flag that outputs a markdown version of the manual, as the **Markdown Formatting Protocol (MFP)** ensures maximum clarity for the agent's internal parser.