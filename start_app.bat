@echo off
echo ==========================================
echo       EVENTPULSE SETUP & START
echo ==========================================

echo.
echo [STEP 1/4] Setting up Backend...
cd backend
if exist package-lock.json del package-lock.json
echo Installing backend dependencies (this may take a minute)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: Backend installation failed.
    echo Please check your internet connection or Node.js installation.
    pause
    exit /b
)
echo ✅ Backend ready.

echo.
echo [STEP 2/4] Starting Backend Server...
start "EventPulse Backend (Port 5000)" npm start

echo.
echo ==========================================

echo.
echo [STEP 3/4] Setting up Frontend...
cd ../frontend
if exist package-lock.json del package-lock.json
echo Installing frontend dependencies (this may take a minute)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: Frontend installation failed.
    pause
    exit /b
)
echo ✅ Frontend ready.

echo.
echo [STEP 4/4] Starting Frontend...
start "EventPulse Frontend (Port 5173)" npm run dev

echo.
echo ==========================================
echo 🚀 ALL SYSTEMS GO!
echo The website should open shortly.
echo Keep the two new terminal windows OPEN.
echo ==========================================
pause
