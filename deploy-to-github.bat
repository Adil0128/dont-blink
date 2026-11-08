@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   DON'T BLINK - Deploy to GitHub ^& GitHub Pages
echo ===================================================
echo.

where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] Git is not found in your system PATH.
    echo.
    echo You have two easy options to host this on GitHub:
    echo.
    echo   OPTION A (Quickest - Web Upload):
    echo     1. Go to https://github.com/new and create a repo named 'dont-blink'.
    echo     2. Click 'uploading an existing file'.
    echo     3. Drag and drop all files from this folder into GitHub!
    echo     4. Go to Repo Settings -^> Pages -^> Select Source 'GitHub Actions' or 'Deploy from branch (/docs)'.
    echo.
    echo   OPTION B (Install Git via Windows Terminal):
    echo     Run: winget install --id Git.Git -e
    echo.
    pause
    exit /b 1
)

echo [*] Initializing Git repository...
git init
git branch -M main

echo [*] Adding game files...
git add .
git commit -m "Deploy DON'T BLINK viral arcade game"

echo.
echo ===================================================
echo [*] Next Steps to publish:
echo ===================================================
echo 1. Create a new repository at: https://github.com/new
echo    Name it: dont-blink (leave Public selected)
echo.
echo 2. Run these two commands (replace USERNAME with your GitHub handle):
echo    git remote add origin https://github.com/USERNAME/dont-blink.git
echo    git push -u origin main
echo.
echo 3. Turn on GitHub Pages:
echo    - Open your repo on GitHub -^> Settings -^> Pages
echo    - Under 'Build and deployment', choose 'GitHub Actions'
echo    - The included workflow will auto-publish your live game URL:
echo      https://USERNAME.github.io/dont-blink/
echo ===================================================
echo.
pause
