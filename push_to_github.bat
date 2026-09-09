@echo off
title Push MyPOS to GitHub (SEE-VAM/POS)
echo ========================================================
echo   Pushing MyPOS Retail Project to GitHub
echo   Repository: https://github.com/SEE-VAM/POS.git
echo ========================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"

echo Checking remote configuration...
git remote -v
echo.

echo Pushing main branch to origin...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] Code successfully pushed to GitHub!
    echo   View online: https://github.com/SEE-VAM/POS
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   [NOTE] If authentication is required:
    echo   1. Sign in via your browser when prompted, OR
    echo   2. Enter your GitHub Username and Personal Access Token (PAT).
    echo ========================================================
)

echo.
pause
