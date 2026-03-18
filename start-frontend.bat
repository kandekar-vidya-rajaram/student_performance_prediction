@echo off
REM Start React Development Server for Student Academic Performance Predictor

echo.
echo ========================================
echo Student Academic Performance Predictor
echo React Frontend Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✓ Node.js and npm are installed
echo.

REM Navigate to frontend directory
cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo Installing dependencies (this may take a few minutes)...
    echo.
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo ✓ Dependencies are installed
echo.
echo Starting React development server...
echo.
echo The application will open at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
call npm start

pause
