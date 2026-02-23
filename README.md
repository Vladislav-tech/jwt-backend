# JWT Backend Server

A **Node.js + TypeScript** backend server with JWT authentication, email-based account activation, and favorite tickers management.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Data Models](#-data-models)
- [Request Examples](#-request-examples)

---

## ✨ Features

- **User registration** with email and password validation
- **Account activation** via email link (24-hour expiration)
- **Login/Logout** using JWT (access + refresh tokens)
- **Token refresh** for session extension
- **Favorite tickers management** (add/remove/view)
- **User info retrieval**
- **Rate limiting** (125 requests per 10 minutes)
- **CORS** with credentials support
- **HttpOnly cookies** for refresh token
- **Beautiful HTML emails** for account activation

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Language** | TypeScript |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (jsonwebtoken) |
| **Hashing** | bcrypt |
| **Email** | Nodemailer |
| **Validation** | express-validator |
| **Security** | cors, cookie-parser, express-rate-limit |
| **Utilities** | uuid, dotenv, module-alias |

---

## 📁 Project Structure

```
server/
├── src/
│   ├── index.ts              # Entry point, Express setup
│   ├── controllers/          # Request handlers
│   │   └── user-controller.ts
│   ├── service/              # Business logic
│   │   ├── user-service.ts
│   │   ├── token-service.ts
│   │   └── mail-service.ts
│   ├── models/               # Mongoose models
│   │   ├── user-model.ts
│   │   └── token-model.ts
│   ├── dtos/                 # Data Transfer Objects
│   │   └── user-dto.ts
│   ├── middlewares/          # Express middleware
│   │   ├── auth-middleware.ts
│   │   └── error-middleware.ts
│   ├── router/               # API routes
│   │   └── index.ts
│   ├── exceptions/           # Error classes
│   │   └── api-error.ts
│   ├── types/                # TypeScript types
│   │   └── express.d.ts
│   └── utils/                # Utilities and constants
│       └── constants.ts
├── register.js               # module-alias setup for production
├── tsconfig.json             # TypeScript configuration
├── package.json
└── .env                      # Environment variables (not in git)
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- SMTP server for sending emails

### Install Dependencies

```bash
npm install
```

### Run Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development: TypeScript watch + nodemon |
| `npm run dev:fast` | Fast development with ts-node-dev (no explicit compilation) |
| `npm run build` | Build project to `dist/` |
| `npm start` | Run production build |

---

## ⚙️ Configuration

Create a `.env` file in the project root:

```env
# Server port
PORT=5000

# MongoDB connection string
DB_URL=mongodb://localhost:27017/jwt-app

# Client URL (for CORS and activation)
CLIENT_URL=http://localhost:3000

# API URL (for emails)
API_URL=http://localhost:5000

# JWT secrets
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# SMTP settings for sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Environment (production/development)
NODE_ENV=development

# Application name (for emails)
APP_NAME=MyApp
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/registration` | Register a new user | ❌ |
| `POST` | `/api/login` | Login to the system | ❌ |
| `POST` | `/api/logout` | Logout from the system | ❌ |
| `GET` | `/api/refresh` | Refresh access token | ❌ |
| `GET` | `/api/activate/:link` | Activate user account | ❌ |

### User

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/me` | Get current user info | ✅ |
| `GET` | `/api/favorites` | Get favorite tickers list | ✅ |
| `POST` | `/api/favorites/add` | Add ticker to favorites | ✅ |
| `DELETE` | `/api/favorites/remove` | Remove ticker from favorites | ✅ |

---

## 📊 Data Models

### User

```typescript
{
  email: string;           // Unique, required
  password: string;        // Hash, required
  isActivated: boolean;    // Activation status
  activationLink: string;  // Activation link
  activationExpires: Date; // Link expiration date
  favorites: string[];     // Array of tickers (e.g., ["btcusdt", "ethusdt"])
  name: string;            // User name, required
  registrationDate: Date;  // Registration date (immutable, set by backend)
  lastSignInDate: Date;    // Last sign-in date (updated on login/refresh)
}
```

### Token

```typescript
{
  user: ObjectId;         // Reference to User
  refreshToken: string;   // JWT refresh token
}
```

---

## 📝 Request Examples

### Registration

```bash
curl -X POST http://localhost:5000/api/registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Pass123!",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "65f8a9b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "isActivated": false,
    "favorites": [],
    "registrationDate": "2026-02-23T10:00:00.000Z",
    "lastSignInDate": "2026-02-23T12:30:00.000Z",
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Pass123!"
  }'
```

### Add Ticker to Favorites

```bash
curl -X POST http://localhost:5000/api/favorites/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "ticker": "btcusdt"
  }'
```

**Response:**
```json
{
  "favorites": ["btcusdt"]
}
```

### Get Favorite Tickers

```bash
curl -X GET http://localhost:5000/api/favorites \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get User Info

```bash
curl -X GET http://localhost:5000/api/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "favorites": 5,
  "lastSignInDate": "2026-02-23T12:30:00.000Z",
  "registrationDate": "2026-02-23T10:00:00.000Z"
}
```

---

## 🔐 Security

- **Passwords** are hashed using bcrypt (salt rounds = 10)
- **Password requirements**: minimum 8 characters, must contain letter, digit, and special character
- **Access token** expires in 15 minutes
- **Refresh token** expires in 30 days, stored in httpOnly cookie
- **Rate limiting**: 125 requests per 10 minutes per IP
- **CORS** configured for specific origin from `CLIENT_URL`
- **Activation link** expires in 24 hours

---

## 📦 Dependencies

### Production
- `bcrypt` — password hashing
- `cookie-parser` — cookie handling
- `cors` — CORS configuration
- `dotenv` — environment variables
- `express` — web framework
- `express-rate-limit` — request limiting
- `express-validator` — data validation
- `jsonwebtoken` — JWT tokens
- `module-alias` — import aliases (@/)
- `mongodb`, `mongoose` — MongoDB operations
- `nodemailer` — email sending
- `uuid` — unique link generation

### Development
- `nodemon`, `concurrently` — hot-reload
- `ts-node`, `ts-node-dev` — TypeScript execution
- `typescript` — TS compiler
- `@types/*` — type definitions

---

## 📄 License

ISC
