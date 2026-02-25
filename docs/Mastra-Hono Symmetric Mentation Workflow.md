This report delivers the high-fidelity instructions and artefacts required to transition the **mastra-hono** project to the Symmetric Mentation workflow. We are establishing a system where your local Mac acts as the "Engine Room" and GitHub as the "Sovereign Audit Chamber."

### ---

**1\. The Haptic Link (ntfy Configuration)**

To achieve the **"Mac-to-iPhone"** poke, we use ntfy. This ensures you are only pulled into "Mentation" when the agent requires a human decision.

* **iPhone Setup:** Download the ntfy app. Subscribe to a unique topic: ctx-mastra-hono-pjs.  
* **Mac Alias:** Add this to your shell config (.zshrc):  
  Bash  
  \# Usage: notify "PR \#42 Passed"  
  alias notify='curl \-d "$1" ntfy.sh/ctx-mastra-hono-pjs'

### ---

**2\. Artefact: AGENTS.md (Project Constitution)**

Place this at the repository root (/AGENTS.md). It provides the "Grounding" for both local agents (Claude/Cursor) and the GitHub Review Agent.

Markdown

\# AGENTS.md \- Mastra-Hono Project Guidelines

\#\# Tech Stack  
\- **\*\*Framework:\*\*** Hono (Edge-compatible)  
\- **\*\*Agentic Engine:\*\*** Mastra AI  
\- **\*\*Runtime:\*\*** Bun or Node.js (Node 20+)  
\- **\*\*Validation:\*\*** Zod

\#\# Coding Patterns  
\- **\*\*Hono Routes:\*\*** Use \`factory.createHandlers()\` for type safety. Chained routes are mandatory.  
\- **\*\*Mastra Tools:\*\*** Define tools in \`src/mastra/tools/\` using \`createTool\`.  
\- **\*\*Schemas:\*\*** All Tool inputs/outputs must use Zod schemas. No \`any\`.

\#\# Commands  
\- **\*\*Dev:\*\*** \`npm run dev\`  
\- **\*\*Check Types:\*\*** \`tsc \--noEmit\`  
\- **\*\*Tests:\*\*** \`npm test\`

\#\# Boundaries  
\- Never modify \`.env\` files directly.  
\- Do not add new top-level dependencies without permission.  
\- Always run \`tsc\` before submitting a PR.

### ---

**3\. Artefact: review.md (GitHub Agentic Workflow)**

Place this at .github/workflows/review.md. This is the instructions for the GitHub Cloud Agent.

Markdown

\---  
name: Sovereign Review Agent  
on:  
  pull*\_request:*  
    *branches: \[main\]*  
*permissions:*  
  *contents: read*  
  *pull-requests: write*  
*tools:*  
  *\- web-fetch*  
  *\- shell-execute*  
*\---*

*\# PR Auditor Persona*  
*You are the Lead Sovereign Architect. Your mission is to audit PRs for the Mastra-Hono project.*

*\#\# Step 1: Grounding*  
*Read the \`/AGENTS.md\` file to understand our standards.*

*\#\# Step 2: Audit*  
*1\. Run \`npm install\` and \`tsc \--noEmit\` to check for type regressions.*  
*2\. Verify that any new Mastra tools in \`src/mastra/tools\` have Zod schemas.*  
*3\. Check Hono routes for the \`factory.createHandlers\` pattern.*

*\#\# Step 3: Notification*  
*\- If the audit fails: Post a comment with the errors and notify the human via:*  
  *\`curl \-d "Mastra-Hono Audit Failed: ${GITHUB\_*PR*\_URL}" ntfy.sh/ctx-mastra-hono-pjs\`*  
*\- If it passes: Approve the PR.*

### ---

**4\. Implementation Steps for Mastra-Hono**

1. **Initialize GHAW:** \`\`\`bash  
   gh aw init  
2. **Commit Artefacts:** Move the AGENTS.md and review.md files into place.  
3. **Compile the Cloud Agent:** \`\`\`bash  
   gh aw compile  
   \*This generates the \`.lock.yml\` file required for GitHub to execute the natural language instructions.\*

4. **Local Tasking:**  
   Start your first task in the new workflow:  
   Bash  
   td start "Implement Auth Middleware in Hono"  
   \# The agent will now use AGENTS.md to ensure it follows the factory pattern.

### ---

**5\. Ctx Opinion**

By implementing this, you have effectively solved the **"50-First-Dates"** context loss. Even if you switch between projects, the AGENTS.md ensures the agent "wakes up" with the correct project memory. The **Mastra-Hono** stack is particularly powerful here because Hono’s small footprint and Mastra’s TypeScript-first design mean your "Mentation Bridge" is lightning fast.

This setup is **low-entropy** and **high-gumption**. We will replicate this pattern across your other repositories once the Mastra-Hono bridge is verified.

For a deeper dive into how Mastra organizes these agentic components, check out this [Mastra AI Framework Workshop](https://www.youtube.com/watch?v=FWlRHPZWyHE). It provides a hands-on look at defining tools and agents in pure TypeScript, which is essential for grounding your AGENTS.md instructions.

