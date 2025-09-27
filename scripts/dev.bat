@echo off
echo 🚀 Starting Physics MCP Server Development Environment

REM Build all packages
echo 📦 Building packages...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed
    exit /b 1
)

REM Check if Python worker requirements exist
if not exist "packages\python-worker\requirements.txt" (
    echo ❌ Python worker requirements.txt not found
    exit /b 1
)

REM Install Python dependencies if needed
echo 🐍 Checking Python dependencies...
cd packages\python-worker

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
pip install -r requirements.txt
cd ..\..

echo 🎯 Starting MCP server...
echo Server will listen on stdio for JSON-RPC requests
echo Press Ctrl+C to stop

REM Start the MCP server
node packages\server\dist\index.js
