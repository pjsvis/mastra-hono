#!/usr/bin/env bash

# finish.sh: Automated Closure, Debriefing, and Sovereign Submission

# 1. Get current active issue
CURRENT_ISSUE=$(nu -c "td current --json | from json | get focused.issue.id? | default ''")

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
  nu -c "td query \"id = '$CURRENT_ISSUE'\" -o json
    | from json
    | first
    | get logs
    | where type != 'secret'
    | where { |it| ($it.message | str contains --regex '(?i)api[_-]?key|token|secret|password') == false }
    | each { |it| $\"- ($it.message)\" }
    | str join (char nl)" 2>/dev/null || echo "- Completed objectives defined in brief."
  echo ""
  echo "## Decisions & Heuristics"
  nu -c "td query \"id = '$CURRENT_ISSUE'\" -o json
    | from json
    | first
    | get logs
    | where type == 'decision'
    | where { |it| ($it.message | str contains --regex '(?i)api[_-]?key|token|secret|password') == false }
    | each { |it| $\"- ($it.message)\" }
    | str join (char nl)" 2>/dev/null || echo "- Followed standard Mastra-Hono architecture."
  echo ""
  echo "## Metadata"
  echo "- **Status**: Automated Closure"
  echo "- **Date**: $(date)"
} > "$DEBRIEF_FILE"

# 4. Logical Artifact Recording
echo "🔗 Linking artifacts to $CURRENT_ISSUE..."
td link "$CURRENT_ISSUE" "$DEBRIEF_FILE" --role debrief

# Optional: If a new playbook was created
NEW_PLAYBOOK=$(git diff --name-only main | grep "playbooks/" | grep -v "biome-standards.md")
if [ -n "$NEW_PLAYBOOK" ]; then
  while IFS= read -r pb; do
    [ -z "$pb" ] && continue
    td link "$CURRENT_ISSUE" "$pb" --role reference
    echo "✅ Recorded new playbook: $pb"
  done <<< "$NEW_PLAYBOOK"
fi

# Optional: If a human test plan was created
HUMAN_TEST=$(git diff --name-only main | grep "tests/human/" | grep "$CURRENT_ISSUE")
if [ -n "$HUMAN_TEST" ]; then
  while IFS= read -r ht; do
    [ -z "$ht" ] && continue
    td link "$CURRENT_ISSUE" "$ht" --role test-plan
    echo "✅ Recorded human test plan: $ht"
  done <<< "$HUMAN_TEST"
fi

# 5. Logical Context Map (Update Description with structured links)
echo "🗺 Updating task context map..."
NEW_DESC=$(nu -c "td show \"$CURRENT_ISSUE\" --json | from json | get description? | default ''")

# Add Debrief
NEW_DESC="${NEW_DESC}
Debrief: ${DEBRIEF_FILE}"

# Add Test Plan if found
if [ -n "$HUMAN_TEST" ]; then
  while IFS= read -r ht; do
    [ -z "$ht" ] && continue
    NEW_DESC="${NEW_DESC}
Test-Plan: ${ht}"
  done <<< "$HUMAN_TEST"
fi

# Add Playbooks if found
if [ -n "$NEW_PLAYBOOK" ]; then
  while IFS= read -r pb; do
    [ -z "$pb" ] && continue
    NEW_DESC="${NEW_DESC}
Playbook: ${pb}"
  done <<< "$NEW_PLAYBOOK"
fi

td update "$CURRENT_ISSUE" --description "$NEW_DESC"

# 6. Final Handoff & Review
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
  git push origin "$BRANCH_NAME" || {
    echo "❌ Error: Failed to push branch $BRANCH_NAME."
    exit 1
  }

  # 7. Create GitHub PR
  echo "🔀 Creating GitHub PR..."
  ISSUE_TITLE=$(nu -c "td query \"id = '$CURRENT_ISSUE'\" -o json | from json | first | get title")
  PR_OUTPUT=$(gh pr create --title "[$CURRENT_ISSUE] $ISSUE_TITLE" \
               --body-file "$DEBRIEF_FILE" \
               --base main \
               --head "$BRANCH_NAME" 2>&1)
  PR_STATUS=$?
  if [ $PR_STATUS -ne 0 ]; then
    if echo "$PR_OUTPUT" | grep -qi "already exists"; then
      echo "ℹ️ PR already exists or updated via push."
    else
      echo "❌ Error: Failed to create PR."
      echo "$PR_OUTPUT"
      exit 1
    fi
  else
    echo "$PR_OUTPUT"
  fi
fi

td unfocus

echo "✅ Task $CURRENT_ISSUE complete. Status: REVIEWABLE"
echo "🧠 Session detached. The Forge is ready for the next mission."
echo ""
echo "🔥 NEXT STEPS FOR HUMAN (The Ephemeral Forge):"
echo "1. Review the PR on GitHub (Sovereign Cloud Audit is running)."
echo "2. Once satisfied, run 'td approve $CURRENT_ISSUE' to mark as DONE."
echo "3. Cleanup: Run 'bun run td-worktree cleanup $CURRENT_ISSUE'"
