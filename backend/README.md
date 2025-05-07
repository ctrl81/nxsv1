# Nexus Trade Backend

This is the backend service for the Nexus Trade platform, providing APIs for user authentication, trading, deposits, and withdrawals.

## Features

- User authentication (register/login)
- Trading functionality (place/close trades)
- Deposit and withdrawal management
- PostgreSQL database with Prisma ORM
- TypeScript for type safety
- Input validation with Zod
- JWT-based authentication

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexus_trade"
   JWT_SECRET="your-super-secret-key-change-this-in-production"
   PORT=3001
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Trading
- POST `/api/trade` - Place a new trade
- GET `/api/trade` - Get user's trades
- POST `/api/trade/:id/close` - Close a trade

### Deposits
- POST `/api/deposit` - Create a deposit request
- GET `/api/deposit` - Get user's deposits

### Withdrawals
- POST `/api/withdraw` - Create a withdrawal request
- GET `/api/withdraw` - Get user's withdrawals

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## Security Notes

- Change the JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting
- Add proper error handling
- Add request validation
- Add proper logging 