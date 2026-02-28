#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "==> Mastra Hono dev setup (macOS + Zed)"

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun is required. Install with:"
  echo "  curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

echo "==> Installing dependencies"
bun install

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
  echo "    Update .env with your API keys."
fi

echo "==> Running checks (lint + typecheck)"
bun run check

echo "==> Running tests"
bun test

echo "==> Done. Suggested next steps:"
echo "  - Run: bun run dev"
echo "  - Open: http://hono.localhost:1355"
echo "  - Run: bun run dev"
echo "  - Open: http://localhost:3000"
