@echo off
REM Preflight verification script for Physics MCP Server Phases 1-3 (Windows)

echo 🔍 Physics MCP Server - Phase 1-3 Preflight Verification
echo =========================================================

REM Change to project root
cd /d "%~dp0\.."

REM Build if needed
if not exist "packages\server\dist\index.js" (
    echo 🔨 Building server...
    call npm run build
)

REM Get tools list via JSON-RPC
set "TOOLS_REQUEST={\"jsonrpc\":\"2.0\",\"id\":\"tools\",\"method\":\"tools/list\",\"params\":{}}"

echo 🚀 Getting tools list from server...
echo %TOOLS_REQUEST% | node packages\server\dist\index.js > tools_output.tmp 2>nul

REM Check if we got a response
findstr /C:"tools" tools_output.tmp >nul
if errorlevel 1 (
    echo ❌ FAILED: Could not get tools list from server
    del tools_output.tmp 2>nul
    exit /b 1
)

REM Count tools (simplified check)
findstr /C:"name" tools_output.tmp | find /c "name" > tool_count.tmp
set /p TOOL_COUNT=<tool_count.tmp

echo 📊 Found %TOOL_COUNT% tools

REM Check for key tools (simplified)
findstr /C:"cas_evaluate" tools_output.tmp >nul
if errorlevel 1 (
    echo ❌ cas_evaluate - MISSING
    set MISSING=1
) else (
    echo ✅ cas_evaluate
)

findstr /C:"plot_function_2d" tools_output.tmp >nul
if errorlevel 1 (
    echo ❌ plot_function_2d - MISSING
    set MISSING=1
) else (
    echo ✅ plot_function_2d
)

findstr /C:"quantum_solve" tools_output.tmp >nul
if errorlevel 1 (
    echo ❌ quantum_solve - MISSING
    set MISSING=1
) else (
    echo ✅ quantum_solve
)

REM Check acceleration layer
echo.
echo 🚀 Checking acceleration layer...
if exist "packages\python-worker\accel.py" (
    echo ✅ accel.py exists
) else (
    echo ❌ accel.py missing
    set MISSING=1
)

REM Cleanup
del tools_output.tmp tool_count.tmp 2>nul

echo.
echo 📊 PREFLIGHT SUMMARY
echo ====================

if "%TOOL_COUNT%" geq "20" if not defined MISSING (
    echo.
    echo 🎉 PREFLIGHT PASSED - Phase 1-3 requirements met!
    echo ✅ Ready to proceed with Phase 4-8 implementation
    exit /b 0
) else (
    echo.
    echo ❌ PREFLIGHT FAILED
    echo 🔧 Required actions:
    echo 1. Complete Phase 1-3 implementation
    echo 2. Ensure all tools are properly registered
    echo 3. Run 'npm run build' to compile packages
    exit /b 1
)
