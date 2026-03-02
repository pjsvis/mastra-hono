#!/usr/bin/env bash

# forge.sh: The bridge from Brief to td Task

# Ensure brief directory exists
BRIEF_DIR="briefs"
if [ ! -d "$BRIEF_DIR" ]; then
  echo "❌ Error: briefs/ directory not found."
  exit 1
fi

# Parse arguments
BRIEF_PATH=""
NON_INTERACTIVE=false

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --brief|-b)
      BRIEF_PATH="$2"
      NON_INTERACTIVE=true
      shift 2
      ;;
    *)
      echo "❌ Unknown option: $1"
      echo "Usage: $0 [--brief BRIEF_FILE]"
      exit 1
      ;;
  esac
done

# 1. Pick a brief
if [ "$NON_INTERACTIVE" = true ]; then
  # Non-interactive mode: use specified brief
  if [ -z "$BRIEF_PATH" ]; then
    echo "❌ Error: --brief requires a file path"
    echo "Usage: $0 [--brief BRIEF_FILE]"
    exit 1
  fi

  if [[ "$BRIEF_PATH" != /* ]]; then
    BRIEF_PATH="$BRIEF_DIR/$BRIEF_PATH"
  fi

  if [ ! -f "$BRIEF_PATH" ]; then
    echo "❌ Error: Brief file not found: $BRIEF_PATH"
    exit 1
  fi

  SELECTED_BRIEF="$BRIEF_PATH"
else
  # Interactive mode: use gum to select
  BRIEF_FILES=("$BRIEF_DIR"/*.md)
  if [ "${#BRIEF_FILES[@]}" -eq 1 ] && [ "${BRIEF_FILES[0]}" = "$BRIEF_DIR/*.md" ]; then
    echo "❌ Error: No briefs found in $BRIEF_DIR."
    exit 1
  fi

  SELECTED_BRIEF=$(printf '%s\n' "${BRIEF_FILES[@]}" | gum filter --placeholder "Select a brief to forge into a task...")

  if [ -z "$SELECTED_BRIEF" ]; then
    echo "Operation cancelled."
    exit 0
  fi
fi

echo "Selected: $SELECTED_BRIEF"

# 2. Check for existing TD-ID
TD_ID=$(nu -c "open \"$SELECTED_BRIEF\" | lines | find 'TD-ID:' | first | split row ' ' | get 1? | default ''")

if [ -z "$TD_ID" ]; then
  # 3. Create new td issue
  TITLE=$(nu -c "open \"$SELECTED_BRIEF\" | lines | where { |line| $line | str starts-with '# ' } | first | str replace '# Brief: ' '' | str replace '# ' '' | default ''")
  if [ -z "$TITLE" ]; then
    TITLE=$(basename "$SELECTED_BRIEF" .md)
  fi

  echo "Forging new td task for: $TITLE..."

  # Create the issue with a structured description
  RAW_OUTPUT=$(td create "$TITLE" --type task --description "Brief: $SELECTED_BRIEF")
  TD_ID=$(echo "$RAW_OUTPUT" | grep -o 'td-[a-z0-9]\+')

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
