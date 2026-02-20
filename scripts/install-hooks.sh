#!/usr/bin/env bash
# Install git hooks
# Run this after cloning or when hooks are updated

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$SCRIPT_DIR/.git/hooks"

# Ensure hooks directory exists
mkdir -p "$HOOKS_DIR"

# Copy pre-commit hook
cp "$SCRIPT_DIR/scripts/pre-commit" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Git hooks installed successfully!"
echo "   Pre-commit hook will run: biome check + tsc --noEmit + tests"
echo "   To bypass: git commit --no-verify"
