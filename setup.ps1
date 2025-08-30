# OnlyFarmers.in - Local Setup Script (PowerShell)
# Run this script in PowerShell as Administrator if needed

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OnlyFarmers.in - Local Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm not found"
    }
} catch {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    Write-Host "Please install npm 9+ from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check Node.js version requirement
$nodeMajorVersion = [int]($nodeVersion -replace 'v', '' -split '\.')[0]
if ($nodeMajorVersion -lt 18) {
    Write-Host "⚠️  Warning: Node.js version $nodeVersion detected" -ForegroundColor Yellow
    Write-Host "   Recommended: Node.js 18+ for optimal performance" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

# Install dependencies
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Setting up environment configuration..." -ForegroundColor Yellow

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Created .env file from env.example" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Please edit .env file with your configuration!" -ForegroundColor Yellow
        Write-Host "   - Database credentials" -ForegroundColor Gray
        Write-Host "   - JWT secrets" -ForegroundColor Gray
        Write-Host "   - Payment gateway keys (if using)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "❌ env.example file not found!" -ForegroundColor Red
        Write-Host "Please create .env file manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "2. Install and start PostgreSQL" -ForegroundColor White
Write-Host "3. Install Redis (optional)" -ForegroundColor White
Write-Host "4. Run the application:" -ForegroundColor White
Write-Host "   - npm run dev (both frontend and backend)" -ForegroundColor Gray
Write-Host "   - Or run separately:" -ForegroundColor Gray
Write-Host "     Backend:  cd apps/backend && npm run start:dev" -ForegroundColor Gray
Write-Host "     Frontend: cd apps/frontend && npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "- API Docs: http://localhost:3001/api/docs" -ForegroundColor White
Write-Host ""

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL status..." -ForegroundColor Yellow
try {
    $pgProcess = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
    if ($pgProcess) {
        Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PostgreSQL is not running" -ForegroundColor Yellow
        Write-Host "   Please start PostgreSQL service" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Could not check PostgreSQL status" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to continue"
