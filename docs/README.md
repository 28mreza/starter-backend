# 📚 Dokumentasi API

Selamat datang di dokumentasi API iVendor SuperApps!

## 📖 Daftar Dokumentasi

### 1. [Authentication & Authorization System](./AUTH_README.md)
Dokumentasi lengkap sistem authentication dengan JWT, role-based access control (RBAC), dan permission management.

**Fitur:**
- JWT Authentication (Access & Refresh Token)
- Role-Based Access Control (RBAC)
- Permission Management
- User Management
- Clean Architecture

### 2. [Status & Troubleshooting](./STATUS.md)
Panduan status sistem dan cara mengatasi masalah umum.

---

## 🚀 Quick Start

### 1. Setup Environment
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi Anda
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database
npm run db:push

# Seed data awal
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000/api`

---

## 🔐 Default Users (After Seeding)

| Email | Password | Role |
|-------|----------|------|
| superadmin@example.com | Password123! | Super Admin |
| admin@example.com | Password123! | Admin |
| manager@example.com | Password123! | Manager |
| user@example.com | Password123! | User |

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### User Management
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/roles` - Assign roles to user

### Role Management
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `POST /api/roles/:id/permissions` - Assign permissions to role

### Permission Management
- `GET /api/permissions` - Get all permissions
- `GET /api/permissions/:id` - Get permission by ID
- `POST /api/permissions` - Create new permission
- `PUT /api/permissions/:id` - Update permission
- `DELETE /api/permissions/:id` - Delete permission
- `GET /api/permissions/resources` - Get all resources
- `GET /api/permissions/grouped` - Get permissions grouped by resource
- `POST /api/permissions/bulk` - Bulk create permissions

---

## 🛠️ Database Scripts

```bash
# Generate Prisma Client
npm run db:generate

# Push schema tanpa migration
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

---

## 📂 Project Structure

```
starter-backend/
├── docs/                    # Dokumentasi
│   ├── README.md           # Index dokumentasi (file ini)
│   ├── AUTH_README.md      # Dokumentasi authentication
│   └── STATUS.md           # Status & troubleshooting
├── prisma/
│   ├── schema.ivendor_reborn.prisma  # Database schema
│   └── seed.ts             # Database seeder
├── src/
│   ├── generated/          # Prisma generated client
│   ├── middlewares/
│   │   ├── auth.ts        # Authentication & authorization
│   │   └── bearerToken.ts
│   ├── routes/
│   │   ├── public/        # Public routes (no auth)
│   │   │   └── auth/
│   │   └── protected/     # Protected routes (auth required)
│   │       ├── auth/
│   │       ├── users/
│   │       ├── roles/
│   │       └── permissions/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── role.service.ts
│   │   └── permission.service.ts
│   ├── utils/
│   │   ├── jwt.ts         # JWT utilities
│   │   ├── password.ts    # Password utilities
│   │   ├── response.ts    # Response formatter
│   │   └── validation.ts  # Validation utilities
│   └── app.ts
├── .env                    # Environment variables
├── .env.example           # Example environment
├── package.json
└── tsconfig.json
```

---

## 🔗 Links

- **Repository**: [GitHub](https://github.com/28mreza/starter-backend)
- **Author**: Muhamad Reza

---

## 📄 License

ISC
