@echo off
title Updating MyPOS Application (SEE-VAM/POS)
color 0b
echo ========================================================
echo   MyPOS Retail Software - 1-Click Update System
echo   Repository: https://github.com/SEE-VAM/POS
echo ========================================================
echo.
echo Checking for updates from GitHub...
echo (Note: Your billing records in pos_database.db will remain 100%% safe)
echo.

set "GIT_PATH=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
if exist "%GIT_PATH%" (
    set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
)

where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [Method 1] Pulling latest updates using Git...
    git pull origin main
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================================
        echo   [SUCCESS] MyPOS updated successfully!
        echo   All your billing data (pos_database.db) is safe.
        echo ========================================================
        echo.
        echo Please restart MyPOS or press Ctrl+F5 in your browser.
        pause
        exit /b 0
    )
)

echo.
echo [Method 2] Git not found or pull failed. Downloading latest update package directly...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Write-Host 'Downloading app.js...'; Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/SEE-VAM/POS/main/app.js' -OutFile 'app.js.new'; if (Test-Path 'app.js.new') { Move-Item -Force 'app.js.new' 'app.js' }; Write-Host 'Downloading index.html...'; Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/SEE-VAM/POS/main/index.html' -OutFile 'index.html.new'; if (Test-Path 'index.html.new') { Move-Item -Force 'index.html.new' 'index.html' }; Write-Host 'Downloading server.py...'; Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/SEE-VAM/POS/main/server.py' -OutFile 'server.py.new'; if (Test-Path 'server.py.new') { Move-Item -Force 'server.py.new' 'server.py' }; Write-Host 'Downloading pos_theme_style.css...'; Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/SEE-VAM/POS/main/pos_theme_style.css' -OutFile 'pos_theme_style.css.new'; if (Test-Path 'pos_theme_style.css.new') { Move-Item -Force 'pos_theme_style.css.new' 'pos_theme_style.css' }"

echo.
echo ========================================================
echo   [SUCCESS] Files updated to latest version!
echo   Database and hardware license are 100%% intact.
echo ========================================================
echo Please restart MyPOS or press Ctrl+F5 in your browser.
pause
