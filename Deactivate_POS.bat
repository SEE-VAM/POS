@echo off
title BrainShop - License Deactivator & System Lock
color 0c
cls

echo =====================================================================
echo          BRAINSHOP COMMERCIAL LICENSE DEACTIVATOR AND LOCK
echo                       (ADMIN / VENDOR ONLY)
echo =====================================================================
echo.

python "%~dp0deactivate_license.py"

echo.
echo =====================================================================
echo  Press any key to close this window...
echo =====================================================================
pause >nul
