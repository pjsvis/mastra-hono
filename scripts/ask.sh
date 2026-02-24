#!/usr/bin/env bash

# ask.sh: Send a blocking synchronous question to the Human via ntfy (Robust v3)

QUESTION="$1"
BASE_TOPIC="ctx-mastra-hono-pjs"
# Use a short unique ID to avoid URL length issues or collisions
ANS_ID=$(date +%s | tail -c 5)
ANS_TOPIC="${BASE_TOPIC}-ans-${ANS_ID}"

if [ -z "$QUESTION" ]; then
  echo "❌ Error: No question provided. Usage: bun run ask \"your question\""
  exit 1
fi

echo "📤 Sending question to Human via ntfy..."
echo "⏳ Waiting for response on your iPhone..."
echo "🔗 Answer Topic: https://ntfy.sh/$ANS_TOPIC"

# 1. Send question with 'view' actions (URLs)
# These are more reliable on iOS than 'http' POST actions.
# Clicking them opens a URL that triggers the publish event.
curl -s \
  -H "Title: Mastra-Hono Intervention" \
  -H "Priority: urgent" \
  -H "Tags: question,robot_face" \
  -H "Actions: view, ✅ Yes, https://ntfy.sh/$ANS_TOPIC/publish?message=Yes&clear=1; view, 🛑 No, https://ntfy.sh/$ANS_TOPIC/publish?message=No&clear=1" \
  -d "$QUESTION (Ans ID: $ANS_ID)" \
  "https://ntfy.sh/$BASE_TOPIC" > /dev/null

# 2. Wait for the answer
# We poll for exactly 1 message.
# We use a loop to handle potential connection timeouts or empty responses.
MAX_WAIT=300
ELAPSED=0
RESPONSE=""
while [ -z "$RESPONSE" ] && [ "$ELAPSED" -lt "$MAX_WAIT" ]; do
  # Poll blocks until a message arrives or times out after 60s
  RAW_RESPONSE=$(curl -s --max-time 30 "https://ntfy.sh/$ANS_TOPIC/raw?poll=1")

  # Check if response is empty or contains error (like the 'since' error we saw before)
  if [[ "$RAW_RESPONSE" == "Yes" ]] || [[ "$RAW_RESPONSE" == "No" ]]; then
    RESPONSE="$RAW_RESPONSE"
  fi
  # Optional: sleep 1 to avoid tight loop on errors
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done

if [ -z "$RESPONSE" ]; then
  echo "⏰ Timed out waiting for human response."
  exit 2
fi

echo ""
echo "📥 Received response: $RESPONSE"

# 3. Send confirmation back to the phone
curl -s -d "Confirmation: Received '$RESPONSE'. Resuming Gumption..." "https://ntfy.sh/$BASE_TOPIC" > /dev/null

# 4. Log to td (if a task is focused)
td log --type decision "HUMAN ANSWERED '$RESPONSE' TO: $QUESTION" 2>/dev/null || true

# 4. Return status to the agent
if [ "$RESPONSE" == "Yes" ]; then
  echo "✅ Human said YES. Proceeding."
  exit 0
else
  echo "🛑 Human said NO. Aborting or redirecting."
  exit 1
fi
