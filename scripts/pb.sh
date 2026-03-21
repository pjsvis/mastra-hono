#!/usr/bin/env bash
set -euo pipefail

# pb: Playbook Discovery and Extraction Utility

INDEX_FILE="playbook-index.json"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

cd "$PROJECT_ROOT"

# Ensure jq is installed
if ! command -v jq &> /dev/null; then
  echo -e "${RED}❌ Error: 'jq' is required but not installed.${NC}"
  exit 1
fi

# Ensure column is installed
if ! command -v column &> /dev/null; then
  echo -e "${RED}❌ Error: 'column' is required but not installed.${NC}"
  exit 1
fi

# Auto-index if missing
if [ ! -f "$INDEX_FILE" ]; then
  echo -e "${YELLOW}ℹ️ Index not found. Rebuilding...${NC}"
  bun run scripts/pb-index.ts > /dev/null
fi

usage() {
  echo -e "${BOLD}Usage:${NC} pb [command] [args]"
  echo ""
  echo -e "${BOLD}Commands:${NC}"
  echo "  list              Show all playbooks in a formatted table"
  echo "  search <term>     Search playbooks by title, ID, or infrastructure"
  echo "  view <id> [sec]   View a playbook or a specific section"
  echo "  index             Force rebuild the playbook index"
  echo ""
  echo -e "${BOLD}Examples:${NC}"
  echo "  pb list"
  echo "  pb search mastra"
  echo "  pb view PB-001"
  echo "  pb view PB-001 'Step 1'"
  exit 1
}

if [ $# -lt 1 ]; then
  usage
fi

COMMAND=$1
shift

case "$COMMAND" in
  list)
    (
      echo -e "ID|TITLE|ROLE|INFRASTRUCTURE"
      jq -r '.[] | "\(.id)|\(.title)|\(.role)|\(.infrastructure | join(","))"' "$INDEX_FILE"
    ) | column -t -s '|'
    ;;

  search)
    TERM=${1:-}
    if [ -z "$TERM" ]; then usage; fi
    echo -e "${BLUE}🔍 Searching for '$TERM'...${NC}\n"
    (
      echo -e "ID|TITLE|INFRASTRUCTURE"
      jq -r --arg term "$TERM" '.[] | select(.title + .id + (.infrastructure | join(" ")) | test($term; "i")) | "\(.id)|\(.title)|\(.infrastructure | join(","))"' "$INDEX_FILE"
    ) | column -t -s '|'
    ;;

  view)
    ID=${1:-}
    SECTION=${2:-}
    if [ -z "$ID" ]; then usage; fi

    # Find file path from ID
    FILE_PATH=$(jq -r --arg id "$ID" '.[] | select(.id == $id) | .path' "$INDEX_FILE")

    if [ -z "$FILE_PATH" ] || [ "$FILE_PATH" == "null" ]; then
      echo -e "${RED}❌ Error: Playbook with ID '$ID' not found.${NC}"
      exit 1
    fi

    if [ -z "$SECTION" ]; then
      # Display full file
      if command -v glow &> /dev/null; then
        glow "$FILE_PATH"
      else
        cat "$FILE_PATH"
      fi
    else
      # Extract specific section
      echo -e "${GREEN}📖 Extracting section matching '$SECTION' from $ID...${NC}\n"
      awk -v sec="$SECTION" '
        BEGIN { IGNORECASE = 1; found = 0; start_level = 0 }
        /^#+ / {
          level = length($1)
          if (found) {
            if (level <= start_level) exit;
          } else {
            # Check if this header matches the section search term
            header_text = $0
            sub(/^#+ /, "", header_text)
            if (header_text ~ sec) {
              found = 1
              start_level = level
            }
          }
        }
        found { print }
      ' "$FILE_PATH"
    fi
    ;;

  index)
    bun run scripts/pb-index.ts
    ;;

  *)
    usage
    ;;
esac
