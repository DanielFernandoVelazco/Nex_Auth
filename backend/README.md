# 🛡️ NexAuth Backend

API REST del sistema IAM **NexAuth**, construida con **NestJS 11**, **Prisma 7** y **PostgreSQL 16**.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![JWT](https://img.shields.io/badge/JWT-Refresh_Tokens-black?logo=jsonwebtokens)

---

## 📖 Tabla de contenidos

- [Descripción](#-descripción)
- [Tech stack](#-tech-stack)
- [Módulos](#-módulos)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Base de datos](#-base-de-datos)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts](#-scripts)
- [Autenticación](#-autenticación)
- [API docs (Swagger)](#-api-docs-swagger)
- [Estructura](#-estructura)
- [Testing](#-testing)
- [Deploy](#-deploy)

---

## 🎯 Descripción

Backend modular con arquitectura **multi-tenant** que expone 46 endpoints REST para gestión de identidades y accesos.

### Capacidades
- Autenticación JWT con refresh tokens rotativos
- Detección de reuso de refresh tokens → revoca todas las sesiones
- Multi-tenant: todos los datos se aíslan por `organizationId`
- RBAC con permisos granulares por recurso/acción
- API keys con SHA-256 (nunca se guarda el plaintext)
- Audit logs inmutables con verificación Merkle
- Configuración por tenant (seguridad, SMTP, MFA)

---

## 🛠 Tech Stack

| Tecnología | Uso |
|-----------|-----|
| **NestJS 11** | Framework principal |
| **Prisma 7** | ORM con driver adapter |
| **PostgreSQL 16** | Base de datos |
| **Passport JWT** | Estrategia de autenticación |
| **bcrypt** | Hash de passwords |
| **class-validator** | Validación de DTOs |
| **Swagger** | Documentación auto |
| **TypeScript 5.7** | Tipado estricto |

---

## 📦 Módulos

| Módulo | Endpoints | Responsabilidad |
|--------|-----------|-----------------|
| **Auth** | 3 | Login, refresh, validación |
| **Applications** | 5 | CRUD de clientes OAuth2/OIDC |
| **Users** | 6 | CRUD + block de usuarios |
| **Roles** | 5 | CRUD de roles con permisos |
| **Permissions** | 5 | CRUD de permisos (recurso/acción) |
| **ApiKeys** | 5 | Generación, rotación, revocación |
| **Sessions** | 3 | Listado y revocación |
| **AuditLogs** | 4 | Eventos + KPIs |
| **Security** | 5 | Config MFA, OAuth, threats |
| **Settings** | 2 | Config tenant + SMTP |

**Total: 46 endpoints REST** (ver `/api/docs`)

---

## ✅ Requisitos

- **Node.js** ≥ 20.19
- **npm** ≥ 10
- **PostgreSQL** 16 (local o Docker)

---

## 🚀 Instalación

### 1. Clonar e instalar

```bash
cd backend
npm install
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

### 3. Crear usuario de aplicación

```bash
docker exec -i nexauth-db psql -U postgres << SQL
CREATE USER nexauth WITH PASSWORD 'nexauth_dev_2025';
ALTER DATABASE nexauth_iam OWNER TO nexauth;
\c nexauth_iam
ALTER SCHEMA public OWNER TO nexauth;
SQL
```

### 4. Configurar `.env`

Crear `backend/.env`:

```env
DATABASE_URL="postgresql://nexauth:nexauth_dev_2025@localhost:5432/nexauth_iam?schema=public"

JWT_SECRET="a7f3e9c2b8d1f6a4e9c3b7d2f8a1e6c4b9d3f7a2e8c1b6d4f9a3e7c2b8d1f6a4"
JWT_REFRESH_SECRET="c9e2b7d4f1a8c3e6b9d2f7a4c1e8b3d6f9a2c7e4b1d8f3a6c9e2b7d4f1a8c3e6"

PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:4200"
```

> **Producción**: usar secrets de 64+ caracteres aleatorios (`openssl rand -hex 32`).

### 5. Migrar la base de datos

```bash
npx prisma generate
npx prisma migrate dev --name init_complete
```

Esto crea **13 tablas**:
- `Organization`, `User`, `UserOrganization`
- `Role`, `Permission`, `RolePermission`
- `Session`, `Application`, `ApiKey`, `AuditLog`
- `SecurityConfig`, `TenantSettings`
- `_prisma_migrations` (interno)

### 6. Cargar datos de prueba

```bash
npx tsx prisma/seed.ts
```

Salida esperada:
```
🌱 Iniciando seed...
✓ Organización: acme-corp
✓ 13 permisos creados
✓ Rol: Security Admin
✓ Usuario: sofia.alarcon@acme.com
✓ Membership creado
✓ 3 aplicaciones creadas

🎉 SEED COMPLETADO

📧 Login: sofia.alarcon@acme.com
🔑 Password: admin123
```

### 7. Arrancar

```bash
# Desarrollo con watch
npm run start:dev

# Producción
npm run build
npm run start:prod
```

Servidor en **http://localhost:3000**

---

## 🗄 Base de datos

### Schema (13 modelos)

```
Organization (tenant)
  ├─→ users (via UserOrganization)
  ├─→ roles
  ├─→ applications
  ├─→ apiKeys
  ├─→ auditLogs
  ├─→ securityConfig   (1:1)
  └─→ tenantSettings   (1:1)

User
  ├─→ organizations (via UserOrganization)
  └─→ sessions

Role
  └─→ permissions (via RolePermission)

Application
  └─→ apiKeys
```

### Modelos clave

| Modelo | Descripción |
|--------|-------------|
| `Organization` | Tenant raíz. Todos los datos cuelgan de aquí |
| `User` | Identidad global (email único) |
| `UserOrganization` | Membresía + rol asignado por organización |
| `Role` | Conjunto de permisos |
| `Permission` | Recurso + acción (`users:read`, `applications:write`) |
| `Session` | Refresh token con hash SHA-256 + rotación |
| `Application` | Cliente OAuth2 con `clientId` único |
| `ApiKey` | Credencial M2M con hash SHA-256 |
| `AuditLog` | Eventos inmutables con JSON detail |
| `SecurityConfig` | Config MFA, OAuth, threats por tenant |
| `TenantSettings` | Config dominio, SMTP, TTLs |

### Comandos Prisma

```bash
npx prisma studio              # UI web para la BD
npx prisma migrate dev         # Nueva migración
npx prisma migrate reset       # Reset + reseed (⚠️ borra todo)
npx prisma generate            # Regenerar cliente
npx prisma format              # Formatear schema
npx prisma validate            # Validar schema
```

---

## 🔐 Autenticación

### Flujo JWT + Refresh

1. **Login** → `POST /auth/login` → devuelve `{ access_token, refresh_token, user }`
2. **Cliente guarda** `access_token` (memory/localStorage) + `refresh_token`
3. **Cada request** → header `Authorization: Bearer <access_token>`
4. **Access token expira (15m)** → `401 Unauthorized`
5. **Cliente hace** `POST /auth/refresh` con `refresh_token` → nuevo par
6. **Rotación** → el refresh anterior se invalida
7. **Detección de reuso** → si se usa un refresh ya rotado → **revoca todas las sesiones del usuario**

### Endpoints

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sofia.alarcon@acme.com","password":"admin123"}'

# Refresh
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<token>"}'

# Validar token
curl -X POST http://localhost:3000/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### Estructura del JWT

```json
{
  "sub": "cmwty2run000fmicnfsxiqov3",
  "email": "sofia.alarcon@acme.com",
  "iat": 1795479567,
  "exp": 1795480467
}
```

---

## 📚 API docs (Swagger)

Con el backend corriendo:

**http://localhost:3000/api/docs**

Interfaz interactiva con:
- 46 endpoints agrupados en 10 tags
- Autorización con Bearer JWT
- Ejemplos de request/response
- Pruebas desde el navegador

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov

# Watch
npm run test:watch
```

---

## 🚢 Deploy

### Railway / Render / Fly.io

```bash
# Build
npm run build

# Variable crítica
DATABASE_URL=postgresql://user:pass@host:5432/db

# Arrancar
node dist/src/main.js
```

### Variables de entorno en producción

```env
DATABASE_URL=<production-db-url>
JWT_SECRET=<64+ chars aleatorios>
JWT_REFRESH_SECRET=<64+ chars aleatorios>
NODE_ENV=production
PORT=3000
CORS_ORIGIN=<frontend-url>
```

### Consideraciones de seguridad

- ✅ Usar secrets de 64+ caracteres (`openssl rand -hex 32`)
- ✅ HTTPS obligatorio en producción
- ✅ Rate limiting con `@nestjs/throttler`
- ✅ Helmet para headers de seguridad
- ✅ CORS estricto al frontend real
- ✅ `NODE_ENV=production` para ocultar stack traces
- ✅ Backup automático de PostgreSQL

---

## 📁 Estructura

```
backend/
├── prisma/
│   ├── schema.prisma          # 13 modelos
│   ├── migrations/            # Historial versionado
│   └── seed.ts                # Datos iniciales
├── generated/
│   └── prisma/                # Cliente generado
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── dto/
│   ├── common/
│   │   └── decorators/
│   │       └── current-user.decorator.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── modules/
│   │   ├── applications/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── api-keys/
│   │   ├── sessions/
│   │   ├── audit-logs/
│   │   ├── security/
│   │   └── settings/
│   ├── app.module.ts
│   └── main.ts
├── .env                       # NO commitear
├── nest-cli.json
├── prisma7.config.ts
├── package.json
└── README.md
```

---

## 🔒 Seguridad

- **Passwords**: bcrypt (10 rounds)
- **Refresh tokens**: SHA-256 + rotación + detección de reuso
- **API keys**: SHA-256 (el plaintext solo se muestra al crear/rotar)
- **JWT**: HS256, expiración corta
- **Multi-tenant**: isolation por `organizationId` en cada query
- **Validación**: class-validator en todos los DTOs
- **CORS**: whitelist por origen

---

## 📝 Licencia

MIT © 2026
