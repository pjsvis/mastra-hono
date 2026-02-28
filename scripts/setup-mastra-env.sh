#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "==> Setting up environment variables for MastraCode from Skate"

# Check if skate is installed
if ! command -v skate >/dev/null 2>&1; then
  echo "❌ Skate is not installed. Install with: brew install skate"
  exit 1
fi

# Function to retrieve a key from skate
get_skate_key() {
  local key_name="$1"
  local env_var_name="$2"

  if key_value=$(skate get "$key_name" 2>/dev/null); then
    export "$env_var_name=$key_value"
    echo "✓ Retrieved $env_var_name from Skate"
    return 0
  else
    echo "⚠ Warning: Could not retrieve $key_name from Skate"
    return 1
  fi
}

# Retrieve supported API keys for MastraCode
get_skate_key "OPENAI_API_KEY" "OPENAI_API_KEY" || true
get_skate_key "GOOGLE_GENERATIVE_AI_API_KEY" "GOOGLE_GENERATIVE_AI_API_KEY" || true
get_skate_key "OPENROUTER_API_KEY" "OPENROUTER_API_KEY" || true

echo ""
echo "==> Environment variables set for current shell session"
echo "==> To make them persistent, run: source scripts/setup-mastra-env.sh"
echo "==> Or add to your shell startup script"
