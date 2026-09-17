@echo off
title Brainshop Retail Commercial System
color 0a

echo =====================================================================
echo                     BRAINSHOP RETAIL SYSTEM LAUNCHER
echo =====================================================================
echo [*] Checking local environment...
echo.

set "PYTHON_CMD="

:: 1. Test standard 'python'
where python >nul 2>&1
if %errorlevel% equ 0 (
    python -c "import sys; sys.exit(0)" >nul 2>&1
    if %errorlevel% equ 0 (
        set "PYTHON_CMD=python"
        goto :launch_server
    )
)

:: 2. Test Python Launcher 'py'
where py >nul 2>&1
if %errorlevel% equ 0 (
    py -c "import sys; sys.exit(0)" >nul 2>&1
    if %errorlevel% equ 0 (
        set "PYTHON_CMD=py"
        goto :launch_server
    )
)

:: 3. Test 'python3'
where python3 >nul 2>&1
if %errorlevel% equ 0 (
    python3 -c "import sys; sys.exit(0)" >nul 2>&1
    if %errorlevel% equ 0 (
        set "PYTHON_CMD=python3"
        goto :launch_server
    )
)

:: 4. Search user AppData installation
for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python3*") do (
    if exist "%%D\python.exe" (
        "%%D\python.exe" -c "import sys; sys.exit(0)" >nul 2>&1
        if %errorlevel% equ 0 (
            set "PYTHON_CMD="%%D\python.exe""
            goto :launch_server
        )
    )
)

:: 5. Search C:\Python3* root directory
for /d %%D in ("C:\Python3*") do (
    if exist "%%D\python.exe" (
        "%%D\python.exe" -c "import sys; sys.exit(0)" >nul 2>&1
        if %errorlevel% equ 0 (
            set "PYTHON_CMD="%%D\python.exe""
            goto :launch_server
        )
    )
)

:: 6. Search Program Files
for /d %%D in ("C:\Program Files\Python3*") do (
    if exist "%%D\python.exe" (
        "%%D\python.exe" -c "import sys; sys.exit(0)" >nul 2>&1
        if %errorlevel% equ 0 (
            set "PYTHON_CMD="%%D\python.exe""
            goto :launch_server
        )
    )
)

:: =========================================================================
:: FALLBACK: If Python is not installed, open directly in Browser!
:: =========================================================================
echo [!] Notice: Python server engine not detected.
echo [*] Launching Brainshop in Standalone Offline Browser Mode...
echo [*] All billing screens, inventory, receipts, and reports are fully available!
echo.
start "" "%~dp0index.html"
timeout /t 4 >nul
exit /b

:: =========================================================================
:: SERVER LAUNCH: Run SQLite Server + Browser
:: =========================================================================
:launch_server
echo [OK] Python Environment Active: %PYTHON_CMD%
echo [*] Starting SQLite Database & Local Server Engine...
echo [*] System will automatically open in your default browser...
echo.
echo =====================================================================
echo  Brainshop System is running! Keep this window open while billing.
echo =====================================================================
echo.

%PYTHON_CMD% "%~dp0server.py"

:: If server.py exits, ensure index.html still opens
if %errorlevel% neq 0 (
    echo.
    echo [*] Opening fallback browser interface...
    start "" "%~dp0index.html"
)
pause
