@echo off
echo ========================================
echo OnlyFarmers.in - Application Runner
echo ========================================
echo.

echo Starting OnlyFarmers.in application...
echo.

echo Checking if .env file exists...
if not exist ".env" (
    echo ❌ .env file not found!
    echo Please run setup.bat first or create .env file manually.
    echo.
    pause
    exit /b 1
)

echo ✅ Environment file found
echo.

echo Starting development servers...
echo This will start both frontend and backend
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:3001
echo API Docs will be available at: http://localhost:3001/api/docs
echo.
echo Press Ctrl+C to stop the servers
echo.

npm run dev

echo.
echo Application stopped.
pause
