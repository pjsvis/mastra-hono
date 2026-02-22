#!/usr/bin/env bash

# finish.sh: Automated Closure, Debriefing, and Sovereign Submission

# 1. Get current active issue
CURRENT_ISSUE=$(td usage -q | grep -E "Working on:|FOCUSED ISSUE:" | head -n 1 | sed -E 's/.*(Working on:|FOCUSED ISSUE:) ([^ ]+).*/\2/' | tr -d '"')

if [ -z "$CURRENT_ISSUE" ]; then
  echo "❌ Error: No active issue found."
  exit 1
fi

echo "🚀 Finishing task: $CURRENT_ISSUE"

# 2. Sovereign Gate: Run Checks
echo "🔍 Running pre-submission checks (lint + typecheck + tests)..."
# We run verify which includes tests
bun run verify || {
  echo "❌ Error: Checks failed. Fix issues before finishing."
  exit 1
}

# 3. Automated Debrief Generation
DEBRIEF_FILE="debriefs/$CURRENT_ISSUE.md"
mkdir -p debriefs

echo "📝 Synthesizing debrief..."
{
  echo "# Debrief: $CURRENT_ISSUE"
  echo ""
  echo "## Summary of Changes"
  # List changed files
  git diff --name-only main | sed 's/^/- /'
  echo ""
  echo "## Key Achievements"
  # Try to extract logs from the query system
  td query "id = '$CURRENT_ISSUE'" -o json | jq -r '.[0].logs[] | "- " + .message' 2>/dev/null || echo "- Completed objectives defined in brief."
  echo ""
  echo "## Decisions & Heuristics"
  td query "id = '$CURRENT_ISSUE'" -o json | jq -r '.[0].logs[] | select(.type == "decision") | "- " + .message' 2>/dev/null || echo "- Followed standard Mastra-Hono architecture."
  echo ""
  echo "## Metadata"
  echo "- **Status**: Automated Closure"
  echo "- **Date**: $(date)"
} > "$DEBRIEF_FILE"

# 4. Logical Artifact Recording
echo "🔗 Linking artifacts to $CURRENT_ISSUE..."
td link "$CURRENT_ISSUE" "$DEBRIEF_FILE" --role debrief

# Optional: If a new playbook was created (detected by changes in playbooks/ file)
NEW_PLAYBOOK=$(git diff --name-only main | grep "playbooks/" | grep -v "biome-standards.md")
if [ -n "$NEW_PLAYBOOK" ]; then
  for pb in $NEW_PLAYBOOK; do
    td link "$CURRENT_ISSUE" "$pb" --role reference
    echo "✅ Recorded new playbook: $pb"
  done
fi

# 5. Final Handoff & Review
echo "📦 Performing final automated handoff..."
td handoff "$CURRENT_ISSUE" \
  --done "Automated completion verified by lint/typecheck/tests." \
  --remaining "None" \
  --decision "Proceeding to PR based on successful verification."

echo "🚀 Submitting for Review (PR Trigger)..."
td review "$CURRENT_ISSUE"

# 6. Git Push to trigger GHAW
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH_NAME" != "main" ] && [ "$BRANCH_NAME" != "HEAD" ]; then
  echo "📤 Pushing branch $BRANCH_NAME..."
  git push origin "$BRANCH_NAME"
  
  # 7. Create GitHub PR
  echo "🔀 Creating GitHub PR..."
  ISSUE_TITLE=$(td query "id = '$CURRENT_ISSUE'" -o json | jq -r '.[0].title')
  gh pr create --title "[$CURRENT_ISSUE] $ISSUE_TITLE" \
               --body-file "$DEBRIEF_FILE" \
               --base main \
               --head "$BRANCH_NAME" \
               > /dev/null 2>&1 || echo "ℹ️ PR already exists or updated via push."
fi

echo "✅ Task $CURRENT_ISSUE complete. Status: REVIEWABLE"
echo ""
echo "🔥 NEXT STEPS FOR HUMAN:"
echo "1. Review the PR on GitHub (Sovereign Cloud Audit is running)."
echo "2. Once satisfied, run 'td approve $CURRENT_ISSUE' to mark as DONE."
echo "3. Cleanup: 'git worktree remove ...' and delete the local branch."
