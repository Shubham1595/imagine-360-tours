# Imagine 360 Tours — Enterprise Spatial Technology, CRM & CMS Platform

> **"See Your World From Every Angle."**

Imagine 360 Tours is an enterprise-grade spatial technology and visual experience platform for interactive 360° virtual tours, aerial drone surveys, photorealistic 3D visualization, architectural digital twins, LiDAR point clouds, and spatial SaaS software.

Headquartered in **Pune / Pimpri-Chinchwad, Maharashtra, India**.

---

## 1. System Architecture

The application is structured as a decoupled monorepo where the **Admin Panel is the authoritative master** of website business data and CRM operations:

```text
ADMIN PANEL (Staff / Executive Control)
      │
      ▼
EXPRESS BACKEND API (Node.js + TypeScript + JWT + RBAC)
      │
      ▼
MYSQL DATABASE (Prisma ORM - Managed Instance)
      │
      ▼
PUBLIC API (/api/public/services, /api/public/projects, /api/public/settings)
      │
      ▼
REACT WEBSITE (High-Performance Client Application)
```

---

## 2. Technology Stack

### Frontend Application
- **Core:** React 19, TypeScript 5.8, Vite 8.3
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), custom spatial dark UI tokens (`#07090C`, `#00F2FE`)
- **3D Spatial Engine:** Three.js (custom WebGL canvas, PBR shaders, ACES Filmic tone mapping, hotspot raycasting)
- **Icons & Motion:** Lucide React, Framer Motion
- **Architecture:** Client-side SPA with centralized API proxy client and Bearer JWT state

### Backend Application & API
- **Runtime:** Node.js v20+ LTS, Express 4.21, TypeScript
- **Database & ORM:** MySQL 8.0, Prisma ORM 6.4 (additive, zero-loss schema management)
- **Security:** Helmet, CORS whitelist regex matching, Bcrypt password hashing, Bearer JWT authentication
- **Document Processing:** In-memory spreadsheet parsing via `multer` and `xlsx` (stateless container compatible)
- **Telemetry & CMS:** Live audit logging, service availability conflict enforcement (`HTTP 409`), data-minimized public endpoints

---

## 3. Repository Structure

```text
/                                ── Frontend root (React 19 + Vite)
├── src/                         ── Frontend React source code
│   ├── components/              ── UI primitives (Badge, Modal, Navbar, Footer, etc.)
│   ├── context/                 ── React Context (AuthContext)
│   ├── data/                    ── CRM constants and classifications
│   ├── lib/                     ── Centralized API client (api.ts)
│   ├── pages/                   ── Public & Admin views
│   │   ├── admin/               ── CRM, Quotations, Customer 360, CMS & Telemetry
│   │   └── auth/                ── Login, Register, Forgot Password
│   └── sections/                ── Public landing sections (Hero, DigitalTwin, Services, etc.)
├── public/                      ── Static assets (robots.txt, sitemap.xml, favicons, _redirects)
├── shared/                      ── Common TypeScript types
├── package.json                 ── Frontend dependencies and build scripts
├── vite.config.ts               ── Vite bundler configuration & dev server proxy
├── vercel.json                  ── Vercel SPA routing and HTTP security headers
├── render.yaml                  ── Render cloud backend deployment blueprint
├── PRODUCTION_DEPLOYMENT.md     ── In-depth deployment operations guide
│
└── backend/                     ── Backend root (Express + Prisma + MySQL)
    ├── prisma/                  ── Prisma schema (schema.prisma)
    ├── src/
    │   ├── config/              ── Environment and database connection pooling
    │   ├── controllers/         ── Business logic (CMS, CRM, Auth, Quotations, Public)
    │   ├── middleware/          ── Authentication, strict RBAC, and error shielding
    │   ├── routes/              ── Express API route definitions
    │   ├── prisma/              ── Database bootstrap & seed utilities
    │   └── server.ts            ── Express container entrypoint (0.0.0.0:${PORT})
    └── package.json             ── Backend dependencies and scripts
```

---

## 4. Local Development Quickstart

### Prerequisites
- Node.js v20+ LTS
- MySQL 8.0 local server or connection URL

### 1. Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Configure your local database in backend/.env:
# DATABASE_URL="mysql://root:password@localhost:3306/imagine360tours"
# JWT_SECRET="your_local_secret"

# Initialize database schema
npx prisma generate
npx prisma db push --skip-generate

# Start backend dev server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
# Return to repository root
cd ..
npm install

# Start Vite dev server (runs on http://localhost:5173 with proxy to backend)
npm run dev
```

---

## 5. Production Admin Provisioning

To initialize the production `SUPER_ADMIN` and baseline spatial service catalog on a fresh database:

```bash
cd backend
ADMIN_EMAIL="admin@imagine360tours.in" \
ADMIN_PASSWORD="<STRONG_PRODUCTION_PASSWORD>" \
npm run bootstrap:admin
```

- Safe and idempotent (never overwrites an existing admin).
- Seeds the 6 core services with complete CMS attributes.
- Seeds company baseline website settings.
- **Never creates fake customers, demo leads, or dummy bookings.**

---

## 6. Automated Verification Test Suites

The backend includes a comprehensive, real-world automated testing suite covering all CRM flows, website CMS control, availability security, and runtime error masking:

```bash
cd backend

# Run CMS Master Control verification (15 tests)
npx tsx src/test_cms_control.ts

# Run Production Runtime & Security simulation (13 tests)
npx tsx src/test_production_runtime.ts

# Run Master End-to-End flow (23 tests)
npx tsx src/test_end_to_end_master.ts

# Run CRM Pipeline & Business Flow verification (40 tests)
npx tsx src/test_business_flow.ts

# Run Website Field & Import normalization (26 tests)
npx tsx src/test_website_crm.ts

# Run Location, Map Coordinates & Site Visits (15 tests)
npx tsx src/test_location_crm.ts

# Run Health & Secret Leaks check (4 tests)
npx tsx src/test_health_and_security.ts
```

---

## 7. Production Deployment Architecture

```text
Wix DNS Manager
  ├── www.imagine360tours.in (CNAME) ──► Vercel (React Frontend)
  │                                           │ (VITE_API_URL)
  └── api.imagine360tours.in (CNAME) ──► Render (Express API)
                                              │
                                              ▼
                                       Managed MySQL
```

### Deploying to Render (Backend)
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Required Environment Variables:**
  - `NODE_ENV`: `production`
  - `HOST`: `0.0.0.0`
  - `DATABASE_URL`: `mysql://user:pass@host:port/db?sslaccept=strict`
  - `JWT_SECRET`: High-entropy random secret
  - `FRONTEND_URL`: `https://www.imagine360tours.in`
  - `CORS_ORIGINS`: `https://www.imagine360tours.in,https://imagine360tours.in`

### Deploying to Vercel (Frontend)
- **Root Directory:** `./` (Repository root)
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:**
  - `VITE_API_URL`: `https://api.imagine360tours.in/api`

---

## 8. License & Commercial Rights

Copyright © 2026 **Imagine 360 Tours**. All rights reserved. Commercial spatial computing and enterprise CRM platform.
