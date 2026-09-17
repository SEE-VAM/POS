@echo off
title BrainShop Commercial POS Launcher
color 0a

echo =====================================================================
echo                     BRAINSHOP COMMERCIAL POS
echo =====================================================================
echo [*] Checking local background engine...

:: Check if server is already running on port 8080
netstat -ano | findstr :8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo [*] Server engine is already active on http://localhost:8080
    start "" "http://localhost:8080"
    exit /b
)

:: Find python executable
set "PYTHON_CMD="
where python >nul 2>&1 && set "PYTHON_CMD=python"
if not defined PYTHON_CMD (
    where py >nul 2>&1 && set "PYTHON_CMD=py"
)

if defined PYTHON_CMD (
    echo [*] Launching BrainShop POS Server on http://localhost:8080...
    start /b "" %PYTHON_CMD% "%~dp0server.py"
    timeout /t 2 >nul
    start "" "http://localhost:8080"
    exit /b
)

:: Fallback if Python is not installed
echo [!] Python not detected, opening in offline browser mode...
start "" "%~dp0index.html"
exit /b
