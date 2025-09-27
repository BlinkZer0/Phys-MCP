@echo off
echo 🎨 Formatting code...

REM Format TypeScript files
echo Formatting TypeScript files...
call npx prettier --write "packages\*\src\**\*.ts"

REM Format JSON files
echo Formatting JSON files...
call npx prettier --write "*.json" "packages\*\package.json"

REM Format Python files (if ruff is available)
where ruff >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Formatting Python files with ruff...
    ruff format packages\python-worker\
) else (
    echo ⚠️  ruff not found, skipping Python formatting
)

echo ✅ Code formatting complete!
