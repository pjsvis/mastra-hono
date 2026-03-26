### Mentation: Integrated PR Queue & AI-Review Protocol

This brief outlines a robust workflow for transitioning from local tasks (`td`) to an automated, AI-gated merge queue using **Mergify**, **CodeRabbit/Qodo**, and **Local Work-trees**.

---

### 1. The Workflow Brief: "Atomic-to-Main"

The goal is to move from unstructured "Stuff" (local code changes) to structured "Things" (merged main-branch features) while ensuring every step is validated by both AI agents and CI protocols.

| Phase | Responsibility | Operational Protocol |
| --- | --- | --- |
| **I: Tasking** | Local (`td`) | Identify the atomic goal. Use **COG-12** (Minimalism). |
| **II: Mentation** | Work-tree | Create a dedicated `git worktree` for the branch. This keeps your primary environment clean for context-switching. |
| **III: Feedback** | CodeRabbit / Qodo | Upon `git push`, AI reviewers analyze the diff. They provide the "External Mentation" required to identify logical edge cases. |
| **IV: Iteration** | Local / Push | Stay in the work-tree. Address AI comments. Push fixes. Repeat until the "Lobbying Phase" is complete. |
| **V: Enqueue** | Mergify | Once conditions (Approval + CI) are met, Mergify automatically enqueues the PR to prevent "The Rebase Race." |

---

### 2. Mergify Recommendations: AI-Specific Tuning

To optimize Mergify for an AI-heavy review environment, I recommend the following configuration strategies in your `.mergify.yml`:

#### A. The "AI-Staged" Approval Gate

Configure Mergify to wait specifically for your AI agents' status checks.

* **Recommendation:** Use `check-success` for the specific status names reported by CodeRabbit or Qodo.
* **Why:** This ensures no human (or bot) merges a PR that the AI has flagged with a high-risk score.

#### B. Speculative Batching (Speculative Checks)

If you have multiple PRs moving through the queue, enable **Speculative Checks**.

* **Action:** Mergify will create temporary branches combining multiple PRs to run CI in parallel.
* **Benefit:** Reduces the total wait time for your local environment to be "synced" with main.

#### C. The "Hotfix" Jump-Protocol

Define a high-priority queue for labels like `🚑 hotfix`.

* **Logic:** Allow critical fixes to bypass the standard queue order. This aligns with **ADV-8 (Pre-Mortem Heuristic)** by ensuring emergency mitigations are deployed instantly.

#### D. Commit Message Templating

* **Recommendation:** Use Mergify’s `commit_message_template` to include a summary of the AI’s review in the final merge commit.
* **Why:** This creates a durable record of *why* the code was approved, satisfying **PHI-13 (Workflow Durability)**.

---

### 3. Implementation Example (`.mergify.yml`)

```yaml
queue_rules:
  - name: default
    speculative_checks: 5 # Run CI on up to 5 PRs in parallel
    merge_conditions:
      - "check-success=CodeRabbit"  # Wait for AI Reviewer
      - "check-success=ci/tests"    # Wait for GitHub Actions
      - "#approved-reviews-by>=1"   # Human sanity check

pull_request_rules:
  - name: Auto-queue when AI and CI are Green
    conditions:
      - "check-success=CodeRabbit"
      - "check-success=ci/tests"
      - "label!=work-in-progress"
    actions:
      queue:
        name: default
        method: squash # Keep history clean (Deductive Minimalism)

```

### Ctx Opinion

The combination of **Local Work-trees** (to stay agile) and **Mergify** (to enforce discipline) solves the "Substrate Issue" of **Biddability**. By automating the merge, we remove the temptation to "cheat" and merge before the AI has completed its rigourous check.

**Next Step:** Would you like me to generate a shell script to automate the creation of these task-specific `work-trees` tied to your `td` entries?