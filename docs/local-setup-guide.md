# 🚀 OnlyFarmers.in - Local Setup Guide

This guide will walk you through setting up and running the OnlyFarmers.in application on your Windows PC.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **PostgreSQL**: Version 12 or higher

### Optional Software
- **Redis**: Version 6.0 or higher (for production features)
- **Git**: For version control

## 🛠️ Installation Steps

### Step 1: Install Node.js and npm

1. **Download Node.js**:
   - Visit [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS version (18.x or higher)
   - Run the installer and follow the setup wizard

2. **Verify Installation**:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install PostgreSQL

1. **Download PostgreSQL**:
   - Visit [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   - Download the latest version for Windows
   - Run the installer

2. **Setup Configuration**:
   - Choose installation directory
   - Set a password for the `postgres` user (remember this!)
   - Keep default port (5432)
   - Install all components

3. **Verify Installation**:
   - Open Command Prompt
   - Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\[version]\bin`)
   - Test connection:
     ```bash
     psql -U postgres -h localhost
     ```
   - Enter your password when prompted
   - Type `\q` to exit

### Step 3: Install Redis (Optional)

1. **Using Windows Subsystem for Linux (WSL)**:
   ```bash
   wsl --install
   wsl
   sudo apt update
   sudo apt install redis-server
   sudo systemctl start redis-server
   ```

2. **Using Docker**:
   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

3. **Using Windows Redis**:
   - Download from [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
   - Install and start the service

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

1. **Run the setup script**:
   - Double-click `setup.bat` (Command Prompt)
   - Or run `setup.ps1` in PowerShell

2. **Follow the prompts**:
   - The script will check prerequisites
   - Install dependencies automatically
   - Create environment configuration

### Option 2: Manual Setup

1. **Clone/Download the project**:
   ```bash
   git clone <repository-url>
   cd OnlyFrmers.in
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment**:
   ```bash
   copy env.example .env
   ```

## ⚙️ Environment Configuration

### 1. Edit the `.env` file

Open `.env` in your text editor and configure:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password_here
DB_DATABASE=onlyfarmers_dev

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Application
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Create Database

1. **Open Command Prompt** and navigate to PostgreSQL bin:
   ```bash
   cd "C:\Program Files\PostgreSQL\[version]\bin"
   ```

2. **Create the database**:
   ```bash
   createdb -U postgres -h localhost onlyfarmers_dev
   ```

3. **Verify database creation**:
   ```bash
   psql -U postgres -h localhost -d onlyfarmers_dev
   ```

## 🏃‍♂️ Running the Application

### Option 1: Run Everything Together

```bash
# In the project root directory
npm run dev
```

This will start both frontend and backend simultaneously.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

## 🌐 Access URLs

Once running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Development mode (both apps)
npm run dev

# Build all applications
npm run build

# Lint code
npm run lint

# Type checking
npm run type-check

# Clean build files
npm run clean

# Format code
npm run format
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
- Change ports in `.env` file
- Or kill processes using the ports:
  ```bash
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

#### 2. Database Connection Failed
**Error**: `Connection to database failed`

**Solution**:
- Verify PostgreSQL service is running
- Check credentials in `.env` file
- Ensure database `onlyfarmers_dev` exists
- Test connection manually with `psql`

#### 3. Module Not Found
**Error**: `Cannot find module '...'`

**Solution**:
```bash
# Clean install
rm -rf node_modules
npm install

# Or install in specific app
cd apps/backend && npm install
cd apps/frontend && npm install
```

#### 4. TypeScript Errors
**Error**: Various TypeScript compilation errors

**Solution**:
```bash
# Check for type errors
npm run type-check

# Install missing types
npm install --save-dev @types/node @types/react
```

#### 5. Permission Denied
**Error**: `EACCES: permission denied`

**Solution**:
- Run Command Prompt as Administrator
- Or use PowerShell with elevated privileges

### Getting Help

1. **Check the logs** in your terminal
2. **Verify environment variables** are set correctly
3. **Ensure all services** (PostgreSQL, Redis) are running
4. **Check the API documentation** at `/api/docs`
5. **Review the README.md** for additional information

## 📱 Testing the Application

### 1. Frontend
- Open http://localhost:3000
- Navigate through the pages
- Test responsive design

### 2. Backend API
- Visit http://localhost:3001/api/docs
- Test API endpoints using Swagger UI
- Verify database connections

### 3. Live Features
- Create test auctions
- Test real-time bidding
- Verify WebSocket connections

## 🔒 Security Notes

- **Never commit** your `.env` file to version control
- **Use strong passwords** for database and JWT secrets
- **Keep dependencies updated** regularly
- **Use HTTPS** in production environments

## 🚀 Next Steps

After successful local setup:

1. **Explore the codebase**:
   - Review the project structure
   - Understand the architecture
   - Check the API documentation

2. **Customize the application**:
   - Modify environment variables
   - Add new features
   - Customize the UI

3. **Prepare for production**:
   - Review deployment documentation
   - Set up CI/CD pipelines
   - Configure production environment

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Support

If you encounter issues:

1. Check this guide first
2. Review the troubleshooting section
3. Check the project README.md
4. Review error logs in your terminal
5. Search for similar issues online

---

**Happy Coding! 🎉**

*OnlyFarmers.in - Empowering farmers, connecting buyers, building a better future for agriculture.*
