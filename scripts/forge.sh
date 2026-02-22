#!/usr/bin/env bash

# forge.sh: The bridge from Brief to td Task

# Ensure brief directory exists
BRIEF_DIR="briefs"
if [ ! -d "$BRIEF_DIR" ]; then
  echo "❌ Error: briefs/ directory not found."
  exit 1
fi

# 1. Pick a brief using gum
SELECTED_BRIEF=$(ls "$BRIEF_DIR"/*.md | gum filter --placeholder "Select a brief to forge into a task...")

if [ -z "$SELECTED_BRIEF" ]; then
  echo "Operation cancelled."
  exit 0
fi

echo "Selected: $SELECTED_BRIEF"

# 2. Check for existing TD-ID
TD_ID=$(grep -o "TD-ID: td-[a-z0-9]\+" "$SELECTED_BRIEF" | head -n 1 | cut -d' ' -f2)

if [ -z "$TD_ID" ]; then
  # 3. Create new td issue
  TITLE=$(grep "^# " "$SELECTED_BRIEF" | head -n 1 | sed 's/# Brief: //;s/# //')
  if [ -z "$TITLE" ]; then
    TITLE=$(basename "$SELECTED_BRIEF" .md)
  fi

  echo "Forging new td task for: $TITLE..."
  
  # Create the issue and capture the ID
  # Output of td create is usually "✓ Created td-xxxxxx: Title"
  RAW_OUTPUT=$(td create "$TITLE" --type task --description "Implemented based on $SELECTED_BRIEF")
  TD_ID=$(echo "$RAW_OUTPUT" | grep -o 'td-[a-z0-9]\{6\}')

  if [ -z "$TD_ID" ]; then
    echo "❌ Error: Failed to create td issue."
    echo "Output: $RAW_OUTPUT"
    exit 1
  fi

  # Link the brief as an artifact
  td link "$TD_ID" "$SELECTED_BRIEF" --role brief
  
  # Link back to the brief (internal metadata)
  TEMP=$(mktemp)
  echo "TD-ID: $TD_ID" > "$TEMP"
  cat "$SELECTED_BRIEF" >> "$TEMP"
  mv "$TEMP" "$SELECTED_BRIEF"
  
  echo "✅ Linked $SELECTED_BRIEF to $TD_ID"
else
  echo "ℹ️ Brief already linked to $TD_ID"
fi

# 4. Start the task and Orient
echo "🚀 Launching task $TD_ID..."
td start "$TD_ID"

echo "🧠 Orienting Agentic Session (tdn)..."
td usage --new-session
