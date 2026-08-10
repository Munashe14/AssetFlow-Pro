@echo off
setlocal

REM This file launches itself again in two new windows, passing "backend"
REM or "frontend" as an argument. That's what the IF blocks below check for.
if "%~1"=="backend" goto :run_backend
if "%~1"=="frontend" goto :run_frontend

REM ================= Main launcher =================
set "ROOT=%~dp0"

echo ============================================
echo   AssetFlow-Pro Launcher
echo ============================================
echo.

if not exist "%ROOT%backend" (
    echo [ERROR] backend folder not found next to this .bat file.
    pause
    exit /b 1
)
if not exist "%ROOT%frontend" (
    echo [ERROR] frontend folder not found next to this .bat file.
    pause
    exit /b 1
)
if not exist "%ROOT%venv\Scripts\activate.bat" (
    echo [ERROR] venv not found at project root.
    echo Run: python -m venv venv
    echo Then: venv\Scripts\activate ^&^& pip install -r backend\requirements.txt
    pause
    exit /b 1
)

echo Starting backend...
start "AssetFlow Backend" cmd /k call "%~f0" backend

echo Waiting for backend to boot...
timeout /t 4 /nobreak >nul

echo Starting frontend...
start "AssetFlow Frontend" cmd /k call "%~f0" frontend

echo Waiting for frontend to boot...
timeout /t 5 /nobreak >nul

echo Opening app in your browser...
start http://localhost:5173

echo.
echo ============================================
echo Backend  running at: http://localhost:8000
echo Frontend running at: http://localhost:5173
echo Close the two new windows to stop the servers.
echo ============================================
exit /b 0

REM ================= Backend window =================
:run_backend
cd /d "%~dp0"
call venv\Scripts\activate.bat
REM Run from project root so the relative imports in backend\main.py
REM (e.g. "from .import models") resolve correctly. Requires backend\__init__.py.
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
exit /b 0

REM ================= Frontend window =================
:run_frontend
cd /d "%~dp0frontend"
if not exist node_modules (
    echo [INFO] node_modules not found. Running npm install first...
    call npm install
)
npm run dev
exit /b 0