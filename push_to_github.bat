@echo off
title Push MyPOS to GitHub (SEE-VAM/POS)
color 0b
echo ========================================================
echo   Pushing MyPOS Retail Project to GitHub
echo   Repository: https://github.com/SEE-VAM/POS.git
echo ========================================================
echo.

set "GIT_PATH=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
if exist "%GIT_PATH%" (
    set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
)

echo [1/3] Staging and committing any recent code changes...
git add -A
git commit -m "update: sync POS application code and features" >nul 2>nul
echo Done.
echo.

echo [2/3] Checking remote repository configuration...
git remote -v
echo.

echo [3/3] Pushing main branch to GitHub...
echo (If prompted, sign in via your browser window)
echo.
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
    echo   [NOTICE] Push could not complete automatically.
    echo   Run: git push origin main
    echo ========================================================
)

echo.
pause
