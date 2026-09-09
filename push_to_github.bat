@echo off
title Pushing MyPOS Retail Application to GitHub
color 0b
echo ========================================================
echo   Pushing MyPOS Retail Project to GitHub
echo   Repository: https://github.com/SEE-VAM/POS.git
echo ========================================================
echo.

set "GIT_PATH=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"

if not exist "%GIT_PATH%" (
    echo [ERROR] Git was not found at %GIT_PATH%
    pause
    exit /b 1
)

echo [1/2] Connecting to GitHub remote...
"%GIT_PATH%" remote -v
echo.

echo [2/2] Pushing branch 'main' to origin...
echo (A browser window will open shortly to authorize your GitHub account if not already signed in)
echo.
"%GIT_PATH%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] Code successfully pushed to GitHub!
    echo   Check your repository at:
    echo   https://github.com/SEE-VAM/POS
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   [NOTE] If authentication failed:
    echo   Make sure you are logged into GitHub account 'SEE-VAM'
    echo   in your default browser, or enter a Personal Access Token.
    echo ========================================================
)

echo.
pause
