@echo off
setlocal
cd /d "%~dp0"
if exist "%~dp0runtime\node.exe" (
  "%~dp0runtime\node.exe" "%~dp0tools\start-linked.mjs" --open
) else (
  where node.exe >nul 2>nul
  if errorlevel 1 (
    echo Node.js 22 or later is required for this source download.
    echo See docs\INSTALLATION.md for installation instructions.
    pause
    exit /b 1
  )
  node.exe "%~dp0tools\start-linked.mjs" --open
)
if errorlevel 1 pause
