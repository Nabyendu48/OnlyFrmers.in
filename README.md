# OnlyFarmers.in

A live auction + bargaining marketplace to connect farmers and buyers.

## 🚀 Quick Start - Run Locally

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **PostgreSQL**: Version 12 or higher
- **Redis**: Version 6.0 or higher (optional, for production features)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd OnlyFrmers.in

# Install all dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### 2. Database Setup

#### PostgreSQL Setup
```bash
# Install PostgreSQL (Windows)
# Download from: https://www.postgresql.org/download/windows/

# Create database
createdb onlyfarmers_dev

# Or using psql
psql -U postgres
CREATE DATABASE onlyfarmers_dev;
\q
```

#### Redis Setup (Optional)
```bash
# Install Redis (Windows)
# Download from: https://github.com/microsoftarchive/redis/releases
# Or use Docker: docker run -d -p 6379:6379 redis:alpine
```

### 3. Environment Configuration

Create `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=onlyfarmers_dev

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Razorpay (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# App
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run the Application

#### Option 1: Run Everything Together
```bash
# Start both frontend and backend
npm run dev
```

#### Option 2: Run Separately

**Backend (Terminal 1):**
```bash
cd apps/backend
npm run start:dev
# Backend will run on http://localhost:3001
```

**Frontend (Terminal 2):**
```bash
cd apps/frontend
npm run dev
# Frontend will run on http://localhost:3000
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## 🏗️ Project Structure

```
OnlyFrmers.in/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # Next.js 14 App
├── packages/              # Shared packages
├── infra/                 # Terraform infrastructure
├── docs/                  # Documentation
└── package.json           # Root package.json
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build all apps
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

## 📱 Features

- **Live Auctions**: Real-time bidding with WebSocket support
- **Payment Integration**: Razorpay payment gateway
- **Escrow System**: 10% buyer deposit before inspection
- **User Management**: Farmer and buyer authentication
- **Real-time Updates**: Live auction room with Socket.io

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:
- Users (Farmers/Buyers)
- Farms
- Listings
- Auctions
- Bids
- Payments
- Escrow Holds

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (Farmer/Buyer/Admin)
- Secure password hashing with bcrypt

## 💳 Payment Integration

- Razorpay payment gateway
- Escrow system for buyer deposits
- Secure payment processing
- Webhook verification

## 🚀 Deployment

For production deployment, see the `infra/` directory for Terraform configurations and the `.github/workflows/` directory for CI/CD pipelines.

## 📚 API Documentation

Once the backend is running, visit `http://localhost:3001/api/docs` for interactive API documentation powered by Swagger.

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in `.env` file
2. **Database connection failed**: Check PostgreSQL service and credentials
3. **Module not found**: Run `npm install` in both `apps/backend` and `apps/frontend`
4. **TypeScript errors**: Run `npm run type-check` to identify issues

### Getting Help

- Check the logs in your terminal
- Verify environment variables are set correctly
- Ensure all services (PostgreSQL, Redis) are running
- Check the API documentation at `/api/docs`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.