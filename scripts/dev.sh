#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting Physics MCP Server Development Environment"

# Build all packages
echo "📦 Building packages..."
pnpm -w build

# Check if Python worker dependencies are installed
if [ ! -f "packages/python-worker/requirements.txt" ]; then
    echo "❌ Python worker requirements.txt not found"
    exit 1
fi

# Install Python dependencies if needed
echo "🐍 Checking Python dependencies..."
cd packages/python-worker
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment (Windows/Unix compatible)
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install -r requirements.txt
cd ../..

echo "🎯 Starting MCP server..."
echo "Server will listen on stdio for JSON-RPC requests"
echo "Press Ctrl+C to stop"

# Start the MCP server
node packages/server/dist/index.js
