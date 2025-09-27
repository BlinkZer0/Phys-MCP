#!/usr/bin/env bash
set -euo pipefail

echo "🎨 Formatting code..."

# Format TypeScript files
echo "Formatting TypeScript files..."
pnpm prettier --write "packages/*/src/**/*.ts"

# Format JSON files
echo "Formatting JSON files..."
pnpm prettier --write "*.json" "packages/*/package.json"

# Format Python files (if ruff is available)
if command -v ruff &> /dev/null; then
    echo "Formatting Python files with ruff..."
    ruff format packages/python-worker/
else
    echo "⚠️  ruff not found, skipping Python formatting"
fi

echo "✅ Code formatting complete!"
