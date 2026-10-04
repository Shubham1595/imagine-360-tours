# Imagine 360 Tours — Production Deployment Guide & Architecture

## 1. Target Production Architecture

The production environment decouples Domain/DNS management (handled via Wix) from the application and API layers. The Express backend connects to a managed MySQL instance, while the React/Vite frontend communicates with the backend via a dedicated subdomain (`api.imagine360tours.in`).

```text
Wix DNS / Domain Registrar
   │
   ├── www.imagine360tours.in (CNAME / Alias)
   │          ↓
   │   Production Frontend (Vercel / Netlify / Cloudflare Pages)
   │   React + Vite + TypeScript + Three.js
   │
   └── api.imagine360tours.in (A Record / CNAME)
              ↓
       Production Backend (Render / Railway / AWS / DigitalOcean)
       Node.js + Express + TypeScript (0.0.0.0:${PORT})
              ↓
          Prisma ORM
              ↓
       Managed MySQL Database (AWS RDS / PlanetScale / DigitalOcean)
```

---

## 2. Wix DNS & Domain Configuration

Wix acts strictly as the **Domain Registrar and DNS Manager**. Do NOT host the Node.js backend or database inside Wix Velo.

In your **Wix Domain Management Dashboard** (`Domains -> Manage DNS Records`), configure the following exact DNS records:

| Record Type | Host / Name | Target / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `www` | `<FRONTEND_HOSTING_TARGET>` *(e.g. `cname.vercel-dns.com` or `custom.cloudflare.com`)* | Auto / 1 Hour | Production React Frontend Application |
| **CNAME** / **A** | `api` | `<BACKEND_HOSTING_TARGET>` *(e.g. `imagine360-api.onrender.com` or container public IP)* | Auto / 1 Hour | Production Express API Server |
| **A / Redirect** | `@` *(Apex)* | Redirect to `https://www.imagine360tours.in` | Auto | Apex canonical root redirect |

> **IMPORTANT:**
> - Do not modify nameservers away from Wix unless you are transferring domain management entirely.
> - Replace `<FRONTEND_HOSTING_TARGET>` and `<BACKEND_HOSTING_TARGET>` with the exact CNAME targets provided by your cloud hosting provider upon service creation.

---

## 3. Environment Variables Reference

### Frontend Environment Variables (`.env.production`)
| Variable | Production Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://api.imagine360tours.in/api` | Base URL for all API requests from the browser |

### Backend Environment Variables (`backend/.env`)
| Variable | Example Production Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` *(or injected by host)* | Port for Express server |
| `HOST` | `0.0.0.0` | Binding host for cloud containers |
| `NODE_ENV` | `production` | Enables error shielding and disables debug logs |
| `DATABASE_URL` | `mysql://user:pass@host:3306/imagine360tours?sslaccept=strict` | Managed MySQL connection string |
| `JWT_SECRET` | `[64-character high-entropy random string]` | Secret for signing auth tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
| `FRONTEND_URL` | `https://www.imagine360tours.in` | Primary frontend web address |
| `CORS_ORIGINS` | `https://www.imagine360tours.in,https://imagine360tours.in` | Comma-separated list of allowed origins |

---

## 4. Frontend Deployment Procedure (e.g. Vercel / Netlify / Cloudflare)

1. **Connect Repository:** Link the Git repository to the hosting platform.
2. **Build Configuration:**
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment Variable:**
   - Set `VITE_API_URL` = `https://api.imagine360tours.in/api`
4. **Custom Domain:**
   - Add `www.imagine360tours.in` in the hosting domain settings.
   - Configure SSL/HTTPS certificate (auto-provisioned by Vercel/Netlify/Cloudflare via Let's Encrypt).
5. **SPA Rewrites:**
   - Ensure all routes rewrite to `/index.html` (standard for Vite SPAs).

---

## 5. Backend Deployment Procedure (e.g. Render / Railway / AWS ECS)

1. **Root Directory:** `backend`
2. **Runtime:** Node.js (v20+ LTS recommended)
3. **Build Command:** `npm run build` *(executes `prisma generate && tsc`)*
4. **Start Command:** `npm start` *(executes `node dist/server.js`)*
5. **Environment Variables:** Provide all variables listed in Section 3.
6. **Custom Domain:**
   - Bind `api.imagine360tours.in` to the deployed backend service.
   - Verify SSL is active (`https://api.imagine360tours.in/api/health`).

---

## 6. Database Deployment & Migration Procedure

### Safe Migration Policy
- **NEVER** run `prisma migrate reset` in production or staging.
- **NEVER** drop production database tables or truncate CRM records.
- **NEVER** overwrite existing CRM customer or lead records.

### Production Migration Strategy:
1. **Additive Schema Synchronization (Recommended):**
   - The application schema evolves additively (e.g. `website`, `latitude`, `longitude`, `map_url`, and the `Quotation` model).
   - Running `npx prisma db push` safely creates missing tables and adds new columns without altering or truncating existing records.
2. **Managed MySQL Connection String:**
   - Format: `mysql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DB_NAME>?sslaccept=strict`
   - Configure this exclusively in your cloud backend environment dashboard (e.g. Render/Railway/AWS Secrets).
   - **NEVER** hardcode or commit database credentials in source control or documentation.
3. **Execution Steps:**
   ```bash
   # 1. Validate schema integrity
   npx prisma validate

   # 2. Generate client
   npx prisma generate

   # 3. Synchronize schema without data loss
   npx prisma db push
   ```

### 6.1 Production SUPER_ADMIN Provisioning (Zero Test Data)
To provision the initial production admin account without seeding fake customers or demo leads:
```bash
ADMIN_EMAIL="admin@imagine360tours.in" \
ADMIN_PASSWORD="<STRONG_PRODUCTION_PASSWORD>" \
npm run bootstrap:admin
```
- Provisions initial `SUPER_ADMIN` account with hashed password.
- Seeds core spatial services catalog (`360° Virtual Tours`, `Drone & Aerial Capture`, etc.).
- Does **NOT** seed test customers, dummy leads, or development accounts.

---

## 7. Step-by-Step Custom Domain Deployment Sequence

To avoid downtime or DNS misconfiguration, execute deployment in this strict sequence:

1. **Step 1: Deploy Backend to Render**
   - Push repository to GitHub/GitLab.
   - On Render, create a new Web Service using root directory `backend` (or link `render.yaml`).
   - Configure environment variables (`NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `CORS_ORIGINS`).
2. **Step 2: Verify Backend on Temporary URL**
   - Test health check: `https://<service-name>.onrender.com/api/health`
   - Confirm HTTP 200 OK.
3. **Step 3: Deploy Frontend to Vercel**
   - On Vercel, import the project repository.
   - Framework preset: **Vite**. Output directory: `dist`.
   - Temporary environment variable: `VITE_API_URL=https://<service-name>.onrender.com/api`.
4. **Step 4: End-to-End Test on Temporary URLs**
   - Open `https://<project-name>.vercel.app`.
   - Test public enquiry form, admin login, CRM, and quotations.
5. **Step 5: Add Custom Domains**
   - On Vercel: Add `www.imagine360tours.in` and `imagine360tours.in`.
   - On Render: Add custom domain `api.imagine360tours.in`.
6. **Step 6: Configure Wix DNS**
   - In Wix DNS Manager, create CNAME `www` pointing to Vercel's target (`cname.vercel-dns.com`).
   - Create CNAME/A `api` pointing to Render's target (`<service-name>.onrender.com`).
   - Configure root domain `@` redirect to `https://www.imagine360tours.in`.
7. **Step 7: Finalize Production Environment Variables**
   - On Vercel: Update `VITE_API_URL=https://api.imagine360tours.in/api`. Redeploy.
   - On Render: Confirm `FRONTEND_URL=https://www.imagine360tours.in` and `CORS_ORIGINS=https://www.imagine360tours.in,https://imagine360tours.in`.

---

## 8. Security & CORS Architecture

- **Cross-Subdomain Authentication:**
  - JWT tokens are stored client-side in secure `localStorage` (`imagine360_token`) and transmitted via `Authorization: Bearer <token>` headers.
  - This eliminates cross-origin cookie blocking between `www.imagine360tours.in` and `api.imagine360tours.in`.
- **CORS Whitelist:**
  - Production strictly permits only origins listed in `CORS_ORIGINS` (`https://www.imagine360tours.in` and `https://imagine360tours.in`).
  - Wildcard `*` origins are completely disabled for authenticated routes.
- **Error Shielding:**
  - In `NODE_ENV=production`, internal Prisma, SQL, and system stack traces are masked into a clean, safe message: `"Internal server error"` or `"A database operation error occurred"`.
  - An internal `errorId` (`ERR_[timestamp]_[rand]`) is generated and logged server-side for auditability.
- **Role-Based Access Control (RBAC):**
  - Backend authorization middleware (`authorizeRoles`) acts as the ultimate gatekeeper.
  - A client account accessing `/admin` routes receives HTTP 403 Forbidden.

---

## 9. File Storage & In-Memory Processing

- **Spreadsheet Imports (.xlsx, .csv):**
  - Handled 100% in-memory via `multer.memoryStorage()`.
  - No temporary files are written to the server's local disk, ensuring stateless compatibility with serverless and containerized cloud platforms.
- **Future Media Storage (360 Tours / Drone Imagery):**
  - When self-hosted heavy panorama tiles or point clouds are introduced, store assets in Amazon S3, Cloudflare R2, or Google Cloud Storage, referencing CDN URLs in the database rather than storing them on local container disks.

---

## 10. Verification & Health Check

After deployment, test the health endpoint:
```bash
curl -i https://api.imagine360tours.in/api/health
```

Expected Response:
```json
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "status": "ok",
  "timestamp": "2026-10-04T13:20:00.000Z"
}
```

Verify that zero database credentials, secrets, or internal paths are returned.

---

## 11. Rollback & Troubleshooting Procedures

### Rollback Strategy
1. **Frontend Rollback (Vercel):**
   - Navigate to **Deployments** in the Vercel Dashboard.
   - Click the three dots next to the previous stable deployment and select **Instant Rollback**.
   - Traffic instantly switches with zero build delay.
2. **Backend Rollback (Render):**
   - In the Render Dashboard under **Deploys**, select the previous successful build.
   - Click **Rollback to this deploy**.
3. **Database Rollback Considerations:**
   - **Important:** Database schema changes cannot be automatically rolled back with git.
   - Because all current schema additions (`website`, `latitude`, `longitude`, `map_url`, `quotations`) are additive and backward-compatible, older versions of the backend code can run safely against the updated schema without breaking.
   - Always take a managed MySQL snapshot/backup before executing schema synchronization.

### Troubleshooting Matrix

| Symptom | Probable Cause | Resolution |
| :--- | :--- | :--- |
| `CORS Error: Origin ... not authorized` | Mismatched domain in `CORS_ORIGINS` | Verify `CORS_ORIGINS` in backend environment includes exact scheme and domain (e.g. `https://www.imagine360tours.in`). |
| `401 Unauthorized` on all CRM requests | Missing `Authorization` header or expired token | Ensure client has logged in and `imagine360_token` is present in local storage. |
| `P1001: Can't reach database server` | Database firewall or incorrect `DATABASE_URL` | Check MySQL host whitelist/security group rules to permit connections from backend hosting IP/range. Ensure SSL parameters match provider requirements (`?sslaccept=strict`). |
| Frontend routing yields 404 on refresh | Missing SPA fallback | Handled automatically by `vercel.json` and `public/_redirects` (`/* -> /index.html 200`). |

