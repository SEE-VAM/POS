@echo off
title BrainShop - Client License Key Generator
color 0b
cls

echo =====================================================================
echo          BRAINSHOP COMMERCIAL LICENSE KEY GENERATOR
echo                    (FOR YOUR USE ONLY)
echo =====================================================================
echo.

python "%~dp0generate_license.py"

echo.
echo =====================================================================
echo  Press any key to close this window...
echo =====================================================================
pause >nul
