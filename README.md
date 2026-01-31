# 🚀 iVendor SuperApps API

Backend API untuk iVendor SuperApps dengan sistem authentication & authorization lengkap menggunakan JWT, Role-Based Access Control (RBAC), dan Permission Management.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Default Users](#-default-users)
- [Development](#-development)
- [Testing with Postman](#-testing-with-postman)

## ✨ Features

### Authentication & Authorization
- ✅ JWT Authentication (Access Token & Refresh Token)
- ✅ Token expiry & automatic refresh
- ✅ Secure password hashing (bcrypt)
- ✅ Role-Based Access Control (RBAC)
- ✅ Dynamic Permission Management
- ✅ Resource-based authorization

### User Management
- ✅ User CRUD operations
- ✅ User role assignment
- ✅ Soft delete support
- ✅ Email validation
- ✅ Password strength validation
- ✅ User search & pagination

### Role Management
- ✅ Role CRUD operations
- ✅ Dynamic role creation
- ✅ Permission assignment to roles
- ✅ Role hierarchy support

### Permission Management
- ✅ Permission CRUD operations
- ✅ Resource-action based permissions
- ✅ Bulk permission creation
- ✅ Grouped permissions by resource
- ✅ Permission validation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js + TypeScript
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Routing**: express-file-routing
- **Validation**: Custom utilities
- **Logger**: Morgan

## 📦 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm atau yarn

## 🔧 Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd starter-backend
```

2. **Install dependencies**
```bash
npm install
```

## ⚙️ Configuration

1. **Copy environment file**
```bash
cp .env.example .env
```

2. **Configure environment variables**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## 🗄️ Database Setup

1. **Generate Prisma Client**
```bash
npm run db:generate
```

2. **Push schema to database**
```bash
npm run db:push
```

3. **Seed database with default data**
```bash
npm run db:seed
```

Seeder akan membuat:
- 4 default users (Super Admin, Admin, Manager, User)
- 4 default roles dengan permissions
- 30 permissions (6 resources × 5 actions)

4. **Open Prisma Studio (optional)**
```bash
npm run db:studio
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Server akan berjalan di `http://localhost:3000/api`

### Production Mode
```bash
npm run build
npm start
```

## 📚 API Documentation

Dokumentasi lengkap tersedia di folder `docs/`:
- [docs/README.md](docs/README.md) - Index dokumentasi
- [docs/AUTH_README.md](docs/AUTH_README.md) - Authentication & Authorization
- [docs/STATUS.md](docs/STATUS.md) - Status & Troubleshooting
- [docs/POSTMAN_COLLECTION.md](docs/POSTMAN_COLLECTION.md) - Postman Collection Guide

### Quick API Reference

#### Authentication
```
POST   /api/public/auth/register      - Register user baru
POST   /api/public/auth/login         - Login user
POST   /api/public/auth/refresh       - Refresh access token
GET    /api/protected/auth/profile    - Get user profile
POST   /api/protected/auth/logout     - Logout user
```

#### User Management
```
GET    /api/protected/users           - Get all users
GET    /api/protected/users/:id       - Get user by ID
POST   /api/protected/users           - Create user
PUT    /api/protected/users/:id       - Update user
DELETE /api/protected/users/:id       - Delete user
POST   /api/protected/users/:id/roles - Assign roles
```

#### Role Management
```
GET    /api/protected/roles                 - Get all roles
GET    /api/protected/roles/:id             - Get role by ID
POST   /api/protected/roles                 - Create role
PUT    /api/protected/roles/:id             - Update role
DELETE /api/protected/roles/:id             - Delete role
POST   /api/protected/roles/:id/permissions - Assign permissions
```

#### Permission Management
```
GET    /api/protected/permissions           - Get all permissions
GET    /api/protected/permissions/:id       - Get permission by ID
POST   /api/protected/permissions           - Create permission
PUT    /api/protected/permissions/:id       - Update permission
DELETE /api/protected/permissions/:id       - Delete permission
GET    /api/protected/permissions/resources - Get all resources
GET    /api/protected/permissions/grouped   - Get grouped permissions
POST   /api/protected/permissions/bulk      - Bulk create permissions
```

## 📁 Project Structure

```
starter-backend/
├── docs/                       # Dokumentasi
│   ├── README.md              # Index dokumentasi
│   ├── AUTH_README.md         # Auth documentation
│   ├── STATUS.md              # Status & troubleshooting
│   └── POSTMAN_COLLECTION.md  # Postman guide
├── prisma/
│   ├── schema.ivendor_reborn.prisma  # Database schema
│   └── seed.ts                # Database seeder
├── src/
│   ├── generated/             # Prisma generated client
│   ├── middlewares/
│   │   ├── auth.ts           # Auth & authorization middleware
│   │   └── bearerToken.ts
│   ├── routes/
│   │   ├── index.ts          # Root route
│   │   ├── public/           # Public routes (no auth)
│   │   │   └── auth/
│   │   │       ├── register.ts
│   │   │       ├── login.ts
│   │   │       └── refresh.ts
│   │   └── protected/        # Protected routes (auth required)
│   │       ├── auth/
│   │       │   ├── logout.ts
│   │       │   └── profile.ts
│   │       ├── users/
│   │       ├── roles/
│   │       └── permissions/
│   ├── services/
│   │   ├── auth.service.ts   # Authentication logic
│   │   ├── user.service.ts   # User management logic
│   │   ├── role.service.ts   # Role management logic
│   │   └── permission.service.ts  # Permission logic
│   ├── utils/
│   │   ├── jwt.ts            # JWT utilities
│   │   ├── password.ts       # Password utilities
│   │   ├── response.ts       # Response formatter
│   │   └── validation.ts     # Validation utilities
│   ├── tools/
│   │   ├── common.ts
│   │   ├── logger.ts
│   │   └── memcached.ts
│   └── app.ts                # Application entry point
├── collection.json           # Postman collection
├── .env                      # Environment variables
├── .env.example             # Environment template
├── package.json
├── tsconfig.json
└── README.md                # This file
```

## 👥 Default Users

Setelah menjalankan seeder, Anda dapat login dengan:

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| superadmin@example.com | Password123! | Super Admin | All (30) |
| admin@example.com | Password123! | Admin | Most (28) |
| manager@example.com | Password123! | Manager | Limited (12) |
| user@example.com | Password123! | User | Minimal (2) |

### Permission Breakdown

**Resources**: users, roles, permissions, dashboard, settings, reports

**Actions**: create, read, update, delete, view

**Super Admin**: Full access (all 30 permissions)
- All CRUD operations on all resources

**Admin**: Almost full access (28 permissions)
- Cannot delete roles and permissions

**Manager**: Limited access (12 permissions)
- Can read/view all resources
- Can create/update reports
- Read-only for users, roles, permissions

**User**: Minimal access (2 permissions)
- Can view dashboard
- Can view reports

## 🔨 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Build
npm run build            # Compile TypeScript to JavaScript

# Production
npm start                # Run production build

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed database with default data
npm run db:studio        # Open Prisma Studio

# Linting & Formatting (if configured)
npm run lint             # Run linter
npm run format           # Format code
```

### Code Style

- TypeScript dengan strict mode
- Clean architecture (services, middleware, utilities separation)
- RESTful API design
- Error handling middleware
- Consistent response format

## 🧪 Testing with Postman

1. **Import Collection**
   - Buka Postman
   - Import file `collection.json` dari root folder
   - Atau lihat [docs/POSTMAN_COLLECTION.md](docs/POSTMAN_COLLECTION.md)

2. **Setup Environment**
   - Buat environment baru
   - Tambahkan variables:
     - `base_url`: `http://localhost:3000/api`
     - `access_token`: (kosongkan, akan auto-fill)
     - `refresh_token`: (kosongkan, akan auto-fill)

3. **Testing Flow**
   - Login menggunakan salah satu default user
   - Tokens akan otomatis tersimpan
   - Test endpoints lainnya
   - Refresh token jika expired

### Example: Login Request

```bash
curl -X POST http://localhost:3000/api/public/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "Password123!"
  }'
```

### Example: Get Profile (with token)

```bash
curl -X GET http://localhost:3000/api/protected/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔒 Security Features

- Password hashing dengan bcrypt (10 salt rounds)
- JWT token dengan expiry
- Refresh token rotation
- Token revocation support
- Role-based access control
- Permission-based authorization
- SQL injection protection (Prisma)
- Input validation
- Secure headers (CORS configured)

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| PORT | Server port | 3000 | No |
| NODE_ENV | Environment mode | development | No |
| DATABASE_URL | MySQL connection string | - | Yes |
| JWT_SECRET | JWT signing secret | - | Yes |
| JWT_ACCESS_EXPIRY | Access token expiry | 15m | No |
| JWT_REFRESH_EXPIRY | Refresh token expiry | 7d | No |

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

ISC

## 👨‍💻 Author

**Muhamad Reza**

## 📞 Support

Untuk pertanyaan atau dukungan, silakan buka issue di repository ini.

---

**Built with ❤️ using Express.js, TypeScript, Prisma, and JWT**