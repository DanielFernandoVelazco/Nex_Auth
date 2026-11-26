# 🛡️ NexAuth Frontend

Interfaz de la consola IAM **NexAuth**, construida con **Angular 21**, **Tailwind CSS** y **Angular Material 3**.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)
![Material](https://img.shields.io/badge/Material-21-757575?logo=materialdesign)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)

---

## 📖 Tabla de contenidos

- [Descripción](#-descripción)
- [Tech stack](#-tech-stack)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts](#-scripts)
- [Rutas](#-rutas)
- [Estructura](#-estructura)
- [Autenticación](#-autenticación)
- [Design System](#-design-system)
- [Build](#-build)
- [Deploy](#-deploy)

---

## 🎯 Descripción

SPA con **12 pantallas** que consume la API REST del backend NestJS. Implementa autenticación JWT con refresh automático y navegación protegida por guards.

### Pantallas incluidas

**Públicas:**
- `/` — Landing con hero, features y CTA
- `/auth/login` — Login con Passkeys/SSO/email
- `/auth/register` — Registro con tenant slug

**Autenticadas (`/app/*`):**
- Applications — Catálogo OAuth2/OIDC + detail panel
- Users — Directorio con inspector drawer
- Roles — RBAC master-detail con matriz de permisos
- Permissions — Scopes RFC 6749 + modal crear
- API Keys — Credenciales M2M + terminal live
- Sessions — Monitor JWT concurrente
- Audit Logs — Eventos expandibles con forensic
- Security — Connections + MFA + threats
- Settings — Tenant + SMTP + danger zone

---

## 🛠 Tech Stack

| Tecnología | Uso |
|-----------|-----|
| **Angular 21** | Framework + Signals + New control flow |
| **TypeScript 5.7** | Tipado estricto |
| **Tailwind CSS 3** | Utility classes + design tokens |
| **Angular Material 21** | Dialogs, Snackbar, tema Material 3 |
| **RxJS 7.8** | HttpClient + RxJS streams |
| **SCSS** | Estilos globales |

---

## ✅ Requisitos

- **Node.js** ≥ 20.19
- **npm** ≥ 10
- **Backend** corriendo en `http://localhost:3000`

---

## 🚀 Instalación

```bash
cd frontend
npm install
```

---

## ⚙️ Configuración

### 1. Proxy al backend

Crear `frontend/proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

### 2. Configurar en `angular.json`

Verificar que exista en `serve → options`:

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

### 3. Levantar el backend primero

```bash
cd ../backend
npm run start:dev
```

Debe estar en `http://localhost:3000` con Swagger en `/api/docs`.

### 4. Arrancar el frontend

```bash
ng serve
```

Abrir **http://localhost:4200**

---

## 🔐 Credenciales de prueba

```
📧 Email:    sofia.alarcon@acme.com
🔑 Password: admin123
```

---

## 📜 Scripts

```bash
ng serve                   # Dev server (:4200)
ng serve --open            # Dev + abrir navegador
ng build                   # Build producción (dist/)
ng build --watch           # Build con watch
ng test                    # Tests unitarios
ng e2e                     # Tests e2e
ng lint                    # Lint
```

---

## 🗺 Rutas

### Públicas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Landing` | Hero + features + CTA |
| `/auth/login` | `Login` | Card con Passkeys + OAuth + email |
| `/auth/register` | `Register` | Split form + panel beneficios |

### Autenticadas (`/app/*`)

Todas protegidas por `authGuard`. Si no hay sesión → redirige a `/auth/login`.

| Ruta | Componente |
|------|-----------|
| `/app/applications` | `ApplicationsList` |
| `/app/users` | `UserDirectory` |
| `/app/roles` | `RolesList` |
| `/app/permissions` | `PermissionsList` |
| `/app/api-keys` | `ApiKeysList` |
| `/app/sessions` | `SessionsMonitor` |
| `/app/audit-logs` | `AuditLogsList` |
| `/app/security` | `SecuritySettings` |
| `/app/settings` | `TenantSettings` |

---

## 📁 Estructura

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                        # Servicios singleton
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── models/                  # Interfaces (User, Role, etc.)
│   │   │   ├── services/                # 9 servicios
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── application.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── role.service.ts
│   │   │   │   ├── permission.service.ts
│   │   │   │   ├── api-key.service.ts
│   │   │   │   ├── session.service.ts
│   │   │   │   ├── audit-log.service.ts
│   │   │   │   ├── security.service.ts
│   │   │   │   ├── tenant.service.ts
│   │   │   │   └── toast.service.ts
│   │   │   └── utils/
│   │   │       └── format.util.ts
│   │   │
│   │   ├── shared/                      # Reutilizables
│   │   │   └── components/
│   │   │       ├── sidebar/
│   │   │       ├── header/
│   │   │       ├── page-header/
│   │   │       ├── kpi-card/
│   │   │       ├── status-badge/
│   │   │       ├── copy-button/
│   │   │       └── toast/
│   │   │
│   │   ├── layout/
│   │   │   └── main-layout/             # Shell autenticado
│   │   │
│   │   ├── features/
│   │   │   ├── auth/                    # Login + Register
│   │   │   ├── landing/
│   │   │   ├── applications/            # + components/
│   │   │   ├── users/                   # + components/
│   │   │   ├── roles/                   # + components/
│   │   │   ├── permissions/             # + components/
│   │   │   ├── api-keys/                # + components/
│   │   │   ├── sessions/                # + components/
│   │   │   ├── audit-logs/              # + components/
│   │   │   ├── security/                # + components/
│   │   │   └── settings/                # + components/
│   │   │
│   │   ├── app.routes.ts
│   │   ├── app.config.ts
│   │   ├── app.ts
│   │   └── app.html
│   │
│   ├── styles.scss                      # Tailwind + Material tokens
│   └── index.html                       # Fuentes + Material Symbols
│
├── proxy.conf.json                      # Proxy /api → :3000
├── tailwind.config.js
├── angular.json
├── package.json
└── README.md
```

---

## 🔐 Autenticación

### Flujo completo

```
1. Login (AuthService.login)
   ↓
2. POST /api/auth/login → { access_token, refresh_token, user }
   ↓
3. Guardar en localStorage + signal user
   ↓
4. authGuard permite /app/*
   ↓
5. Cada request → authInterceptor añade Bearer token
   ↓
6. Token expira → 401 → interceptor hace refresh automático
   ↓
7. Retry request con nuevo token
   ↓
8. Si refresh falla → logout + redirect a login
```

### AuthService (signals)

```typescript
// Estado
user = signal<AuthUser | null>(null);
isAuthenticated = computed(() => user() !== null);

// Acciones
login(email, password): Promise<boolean>
refresh(): Promise<boolean>
logout(): void
getAccessToken(): string | null
```

### AuthInterceptor (funcional)

```typescript
// Añade Bearer + refresh automático en 401
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Añadir token
  // En 401 → refresh → retry
  // En refresh fail → logout
};
```

### AuthGuard (funcional)

```typescript
export const authGuard: CanActivateFn = () => {
  if (auth.isAuthenticated()) return true;
  router.navigate(['/auth/login']);
  return false;
};
```

---

## 🎨 Design System

### Paleta Material 3

```css
--color-primary: #3525cd;              /* Índigo oscuro */
--color-primary-container: #4f46e5;    /* Índigo brillante */
--color-secondary: #4648d4;
--color-tertiary: #005338;             /* Verde éxito */
--color-tertiary-container: #006e4b;
--color-error: #ba1a1a;
--color-background: #faf8ff;
--color-on-surface: #131b2e;
--color-outline: #777587;
```

### Tipografía

| Token | Font | Size | Weight |
|-------|------|------|--------|
| `headline-xl` | Inter | 30px | 700 |
| `headline-lg` | Inter | 22px | 600 |
| `headline-md` | Inter | 18px | 600 |
| `headline-sm` | Inter | 15px | 600 |
| `body-lg` | Inter | 15px | 400 |
| `body-md` | Inter | 13px | 400 |
| `label-caps` | Inter | 11px | 600 |
| `label-code-md` | JetBrains Mono | 12px | 500 |

### Spacing

```
space-xs: 4px
space-sm: 8px
space-md: 12px
space-lg: 20px
space-xl: 32px
gutter: 16px
gutter-desktop: 24px
```

### Uso en templates

```html
<h1 class="font-headline-xl text-headline-xl text-on-surface">
  Aplicaciones
</h1>

<div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
  <code class="font-label-code-md text-primary">{{ clientId }}</code>
</div>
```

---

## 🧪 Testing

```bash
# Unitarios
ng test

# Coverage
ng test --code-coverage

# E2E (Playwright próximamente)
```

---

## 🏗 Build

```bash
# Producción
ng build --configuration production

# Output
dist/frontend/browser/
├── index.html
├── main-<hash>.js
├── polyfills-<hash>.js
├── styles-<hash>.css
└── chunk-<hash>.js (uno por feature lazy-loaded)
```

### Tamaños esperados

| Archivo | Tamaño |
|---------|--------|
| `main.js` | ~5 kB |
| `styles.css` | ~55 kB |
| `polyfills.js` | ~95 B |
| **Initial total** | **~66 kB** |
| `applications-list` (lazy) | ~132 kB |
| `security-settings` (lazy) | ~108 kB |
| `user-directory` (lazy) | ~106 kB |

### Ajustar budgets

En `angular.json`:

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kB",
    "maximumError": "1MB"
  }
]
```

---

## 🚢 Deploy

### Vercel

```bash
npm i -g vercel
vercel --prod
```

`vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Netlify

`netlify.toml`:

```toml
[build]
  command = "ng build --configuration production"
  publish = "dist/frontend/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Cloudflare Pages

```
Build command:  ng build --configuration production
Output dir:     dist/frontend/browser
```

### Cambiar URL del backend en producción

En `angular.json`:

```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ]
  }
}
```

Y crear los `environment*.ts` con la URL del backend real.

---

## 📝 Licencia

MIT © 2025
