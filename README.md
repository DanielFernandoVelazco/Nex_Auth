# 🛡️ NexAuth — IAM Console

Sistema completo de **Gestión de Identidades y Accesos (IAM)** con arquitectura full-stack. Construido con Angular 21, NestJS 11, PostgreSQL y Prisma 7.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Tabla de contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tech Stack](#-tech-stack)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Quick Start](#-quick-start)
- [Credenciales de prueba](#-credenciales-de-prueba)
- [Scripts disponibles](#-scripts-disponibles)
- [Endpoints principales](#-endpoints-principales)
- [Deploy](#-deploy)
- [Licencia](#-licencia)

---

## 🎯 Descripción

**NexAuth** es una consola IAM de nivel producción que incluye:

- 🔐 **Autenticación JWT** con refresh tokens rotativos y detección de reuso
- 🏢 **Multi-tenant** con aislamiento por `organizationId`
- 👥 **Directorio de usuarios** con roles, MFA y estados
- 🎭 **RBAC** (Role-Based Access Control) con permisos granulares
- 📱 **Gestión de aplicaciones** OAuth2/OIDC (SPA, Web, M2M, Native)
- 🔑 **API Keys** para autenticación Machine-to-Machine
- 📊 **Auditoría inmutable** con verificación Merkle
- 🖥️ **Monitoreo de sesiones** con inspector JWT en tiempo real
- 🛡️ **Configuración de seguridad** con políticas MFA y threat detection
- ⚙️ **Settings** del tenant con SMTP y plantillas de email

---

## ✨ Características

### Autenticación y Autorización
- Login con email/password (bcrypt)
- JWT access tokens (15 min) + refresh tokens (7 días)
- Rotación automática de refresh tokens
- Detección de reuso → revoca todas las sesiones del usuario
- Guards de ruta (`authGuard`) y HTTP interceptor con refresh automático
- Roles y permisos por organización

### UI/UX
- 12 pantallas con design system Material 3
- Lazy loading por ruta (initial bundle: 66 kB)
- Responsive (mobile-first con Tailwind)
- Toasts con MatSnackBar
- Modales con MatDialog
- Tema custom Material 3 (primary índigo #4f46e5)

### Backend
- 10 módulos NestJS
- 46 endpoints REST
- Swagger auto-generado (`/api/docs`)
- Prisma 7 con driver adapter PostgreSQL
- Validación de DTOs con class-validator
- Contraseñas hasheadas con bcrypt
- API keys con SHA-256 (nunca se guarda el plaintext)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Angular 21)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Landing / Login / Register (públicas)           │   │
│  │  Shell autenticado (Sidebar + Header + Router)   │   │
│  │  9 pantallas IAM + AuthService + Guard           │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│                    HTTP /api/* (proxy)                   │
│                            ▼                             │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (NestJS 11)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  AuthModule (JWT + refresh)                      │   │
│  │  ApplicationsModule │ UsersModule │ RolesModule  │   │
│  │  PermissionsModule │ ApiKeysModule               │   │
│  │  SessionsModule │ AuditLogsModule                │   │
│  │  SecurityModule │ SettingsModule                 │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│                    Prisma 7 (adapter-pg)                 │
│                            ▼                             │
├─────────────────────────────────────────────────────────┤
│                  DATABASE (PostgreSQL 16)                │
│  13 tablas con relaciones + índices + cascadas          │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Angular | 21 | Framework principal |
| TypeScript | 5.7 | Tipado |
| Tailwind CSS | 3.4 | Estilos |
| Angular Material | 21 | Componentes + tema |
| RxJS | 7.8 | Reactividad |
| Signals | nativo | Estado |

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| NestJS | 11 | Framework |
| Prisma | 7 | ORM |
| PostgreSQL | 16 | Base de datos |
| Passport JWT | 4 | Autenticación |
| bcrypt | 6 | Hash passwords |
| Swagger | 11 | API docs |
| class-validator | 0.14 | Validación DTOs |

---

## 📁 Estructura del proyecto

```
Nex_Auth/
├── frontend/                  # Angular 21
│   ├── src/app/
│   │   ├── core/              # Guards, interceptors, servicios, modelos
│   │   ├── shared/            # Componentes reutilizables
│   │   ├── layout/            # MainLayout (shell)
│   │   ├── features/          # 10 features (auth, landing, app/*)
│   │   └── app.routes.ts
│   ├── proxy.conf.json        # Proxy /api → localhost:3000
│   └── README.md
│
├── backend/                   # NestJS 11
│   ├── prisma/
│   │   ├── schema.prisma      # 13 modelos
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── generated/prisma/      # Cliente generado
│   ├── src/
│   │   ├── auth/              # JWT, strategies, controller
│   │   ├── prisma/            # PrismaService
│   │   ├── common/            # Decoradores
│   │   └── modules/           # 10 módulos de negocio
│   └── README.md
│
├── README.md                  # Este archivo
└── .gitignore
```

---

## 🚀 Quick Start

### Prerrequisitos

- **Node.js** ≥ 20.19 ([descargar](https://nodejs.org))
- **PostgreSQL 16** o **Docker** ([descargar](https://docker.com))
- **npm** ≥ 10

### 1. Clonar el repo

```bash
git clone <repo-url> Nex_Auth
cd Nex_Auth
```

### 2. Levantar PostgreSQL

```bash
docker run --name nexauth-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nexauth_iam \
  -p 5432:5432 \
  -d postgres:16
```

### 3. Backend

```bash
cd backend
npm install

# Crear .env
cat > .env << EOF
DATABASE_URL="postgresql://nexauth:nexauth_dev_2025@localhost:5432/nexauth_iam?schema=public"
JWT_SECRET="a7f3e9c2b8d1f6a4e9c3b7d2f8a1e6c4b9d3f7a2e8c1b6d4f9a3e7c2b8d1f6a4"
JWT_REFRESH_SECRET="c9e2b7d4f1a8c3e6b9d2f7a4c1e8b3d6f9a2c7e4b1d8f3a6c9e2b7d4f1a8c3e6"
PORT=3000
EOF

# Crear usuario nexauth en PostgreSQL
docker exec -i nexauth-db psql -U postgres << SQL
CREATE USER nexauth WITH PASSWORD 'nexauth_dev_2025';
ALTER DATABASE nexauth_iam OWNER TO nexauth;
\c nexauth_iam
ALTER SCHEMA public OWNER TO nexauth;
SQL

# Migrar + seed
npx prisma generate
npx prisma migrate dev --name init_complete
npx tsx prisma/seed.ts

# Correr
npm run start:dev
```

### 4. Frontend

```bash
cd ../frontend
npm install
ng serve
```

### 5. Abrir en el navegador

| URL | Descripción |
|-----|-------------|
| http://localhost:4200 | Frontend |
| http://localhost:3000/api/docs | Swagger API |
| http://localhost:4200/auth/login | Login |

---

## 🔐 Credenciales de prueba

```
📧 Email:    sofia.alarcon@acme.com
🔑 Password: admin123
🏢 Tenant:   acme-corp
```

---

## 📜 Scripts disponibles

### Backend

```bash
cd backend
npm run start:dev      # Desarrollo con watch
npm run start:prod     # Producción
npm run build          # Compilar
npm run test           # Tests unitarios
npm run lint           # Lint

npx prisma studio      # UI para la BD
npx prisma migrate dev # Nueva migración
npx tsx prisma/seed.ts # Ejecutar seed
```

### Frontend

```bash
cd frontend
ng serve               # Servidor de desarrollo
ng build               # Build producción
ng test                # Tests unitarios
ng lint                # Lint
```

---

## 🌐 Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login con email/password |
| POST | `/auth/refresh` | Refresh token rotation |
| GET | `/applications` | Listar aplicaciones |
| POST | `/applications` | Crear aplicación |
| GET | `/users` | Listar usuarios |
| PATCH | `/users/:id/block` | Bloquear usuario |
| GET | `/roles` | Listar roles con permisos |
| POST | `/roles` | Crear rol |
| GET | `/permissions` | Listar permisos |
| POST | `/api-keys` | Generar API key |
| PATCH | `/api-keys/:id/rotate` | Rotar key |
| GET | `/sessions` | Listar sesiones activas |
| PATCH | `/sessions/:id/revoke` | Revocar sesión |
| GET | `/audit-logs` | Listar audit logs |
| GET | `/audit-logs/kpis` | KPIs agregados |
| GET | `/security` | Configuración seguridad |
| PATCH | `/security/mfa-policy` | Actualizar MFA |
| GET | `/settings` | Configuración tenant |
| PATCH | `/settings` | Actualizar tenant |

Ver documentación completa en **http://localhost:3000/api/docs**

---

## 🚢 Deploy

### Backend → Railway / Render / Fly.io

```bash
cd backend
npm run build
# Subir dist/ + variables de entorno
```

### Base de datos → Supabase / Neon / Railway

Actualizar `DATABASE_URL` con la conexión de producción.

### Frontend → Vercel / Netlify / Cloudflare Pages

```bash
cd frontend
ng build --configuration production
# Subir dist/frontend/browser/
```

Configurar `_redirects` o `vercel.json` para SPA fallback:

```
/*    /index.html   200
```

---

## 📝 Licencia

MIT © 2025 — Proyecto de demostración.

---

## 🤝 Contribuir

1. Fork
2. Crear branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Pull Request

---

**Hecho con ❤️ usando Angular 21 + NestJS 11 + PostgreSQL 16**
