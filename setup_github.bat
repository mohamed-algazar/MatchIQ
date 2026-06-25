@echo off
REM MatchIQ GitHub Setup Script (Windows)
REM Run this from inside your project folder: D:\Level 4\finally\

echo ============================================
echo  MatchIQ - GitHub Repository Setup Script
echo ============================================
echo.

REM Step 1: Initialize git if not already done
if not exist ".git" (
    echo [1/7] Initializing git repository...
    git init
) else (
    echo [1/7] Git already initialized.
)

REM Step 2: Set remote to existing repo
echo [2/7] Setting remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/mohamed-algazar/-MatchIQ.git

REM Step 3: Copy provided files into project root
echo [3/7] Make sure you copied README.md, .gitignore, LICENSE into this folder.
echo       Press any key when ready...
pause >nul

REM Step 4: Stage everything
echo [4/7] Staging all files...
git add .

REM Step 5: Check what will be committed
echo [5/7] Files to be committed:
git status --short

REM Step 6: Commit
echo [6/7] Creating commit...
git commit -m "feat: complete MatchIQ graduation project

- YOLOv8 fine-tuned on SoccerNet (mAP50: 0.843)
- StrongSORT multi-object tracking
- Geometry Layer: homography + optical flow camera compensation
- Player speed/distance estimation with physics smoothing
- Team assignment via KMeans jersey-color clustering
- Heatmaps, pass networks, ball possession detection
- React + FastAPI dashboard with JSON export
- Chunked pipeline for long video processing"

REM Step 7: Push
echo [7/7] Pushing to GitHub...
git branch -M main
git push -u origin main --force

echo.
echo ============================================
echo  Done! Check: https://github.com/mohamed-algazar/-MatchIQ
echo ============================================
pause
