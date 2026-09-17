@echo off
title Toolvero - Starting Web Platform
set PATH=%USERPROFILE%\nodejs;%PATH%

echo ========================================================
echo          Toolvero - Powerful Online Tools SaaS
echo ========================================================
echo.
echo Starting local server at http://localhost:3000 ...
echo Opening your default browser...
echo.

start http://localhost:3000
npm.cmd run dev -- --port 3000
pause
