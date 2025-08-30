@echo off
echo ========================================
echo OnlyFarmers.in - Local Setup Script
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js 18+ from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed!
    echo Please install npm 9+ from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed
echo.

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Current Node.js version: %NODE_VERSION%
echo.

REM Check npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo Current npm version: %NPM_VERSION%
echo.

echo Installing dependencies...
echo This may take a few minutes...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!
echo.

echo Setting up environment configuration...
if not exist ".env" (
    if exist "env.example" (
        copy "env.example" ".env"
        echo ✅ Created .env file from env.example
        echo.
        echo ⚠️  IMPORTANT: Please edit .env file with your configuration!
        echo    - Database credentials
        echo    - JWT secrets
        echo    - Payment gateway keys (if using)
        echo.
    ) else (
        echo ❌ env.example file not found!
        echo Please create .env file manually.
    )
) else (
    echo ✅ .env file already exists
)

echo.
echo ========================================
echo Setup Complete! 🎉
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your configuration
echo 2. Install and start PostgreSQL
echo 3. Install Redis (optional)
echo 4. Run the application:
echo    - npm run dev (both frontend and backend)
echo    - Or run separately:
echo      Backend:  cd apps/backend && npm run start:dev
echo      Frontend: cd apps/frontend && npm run dev
echo.
echo Access URLs:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:3001
echo - API Docs: http://localhost:3001/api/docs
echo.
pause
