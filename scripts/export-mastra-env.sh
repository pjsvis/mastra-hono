#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

ENV_FILE="${PROJECT_ROOT}/.env"

echo "==> Exporting API keys from Skate to .env file"

# Check if skate is installed
if ! command -v skate >/dev/null 2>&1; then
  echo "❌ Skate is not installed. Install with: brew install skate"
  exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
  echo "# MastraCode Environment Variables" > "$ENV_FILE"
  echo "# Generated from Skate credentials" >> "$ENV_FILE"
  echo "" >> "$ENV_FILE"
  echo "✓ Created new .env file"
fi

# Function to export a key from skate to .env
export_skate_key() {
  local skate_key="$1"
  local env_var="$2"

  if key_value=$(skate get "$skate_key" 2>/dev/null); then
    # Remove existing entry if it exists
    if grep -q "^${env_var}=" "$ENV_FILE"; then
      sed -i '' "s/^${env_var}=.*/${env_var}=${key_value}/" "$ENV_FILE"
      echo "✓ Updated $env_var in .env"
    else
      echo "${env_var}=${key_value}" >> "$ENV_FILE"
      echo "✓ Added $env_var to .env"
    fi
    return 0
  else
    echo "⚠ Warning: Could not retrieve $skate_key from Skate"
    return 1
  fi
}

# Export supported API keys for MastraCode
export_skate_key "OPENAI_API_KEY" "OPENAI_API_KEY" || true
export_skate_key "GOOGLE_GENERATIVE_AI_API_KEY" "GOOGLE_GENERATIVE_AI_API_KEY" || true
export_skate_key "OPENROUTER_API_KEY" "OPENROUTER_API_KEY" || true

echo ""
echo "==> Done! API keys have been exported to $ENV_FILE"
echo "==> The .env file can now be loaded by your application"
