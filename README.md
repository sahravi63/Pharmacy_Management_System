# 💊 Pharmacy Management System

A full-stack pharmacy management system built with **React** and **Express/Sequelize (MySQL)**. It supports role-based workflows for **Admins**, **Pharmacists**, and **Customers** — inventory and batch tracking, order processing, point-of-sale, purchase orders, supplier management, prescriptions, and real-time low-stock/expiry notifications over Socket.IO.

> ⚠️ **Status:** Active development. See [Known Issues & Roadmap](#-known-issues--roadmap) before deploying this with real user data — a few authorization gaps need to be closed first.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Roles & Permissions](#-roles--permissions)
- [Testing](#-testing)
- [Known Issues & Roadmap](#-known-issues--roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **Authentication** — JWT stored in an `httpOnly` cookie, `bcryptjs` password hashing, per-route rate limiting on login.
- **Role-based access** — `admin`, `pharmacist`, and `customer` roles with route-level guards on both the API and the frontend.
- **Inventory management** — add/update/delete medicines, batch tracking with expiry dates, stock adjustments with full audit trail via notifications.
- **Orders** — customers place orders, pharmacists/admins update order status; stock is reserved/released transactionally as status changes.
- **Point of sale (Sales)** — multi-item sales with automatic stock deduction, edit/delete with automatic stock restoration.
- **Purchase orders & suppliers** — track incoming stock from suppliers.
- **Prescriptions** — record prescriptions against medicines that require one.
- **Real-time notifications** — low-stock and expiring-batch alerts pushed live via Socket.IO, plus a daily scheduled inventory check (`node-cron`) and optional email alerts (`nodemailer`).
- **Dashboard** — customer counts, medicine counts, low-stock counts, total sales, and a 7-day sales trend chart (Recharts).
- **Customer & pharmacist self-service profiles.**

---

## 🧱 Tech Stack

**Frontend**
- React 19, React Router 7
- Axios (`withCredentials: true` for cookie-based auth)
- Recharts (dashboard charts)
- Socket.IO client (live notifications)

**Backend**
- Node.js + Express
- Sequelize ORM (MySQL / `mysql2`)
- JWT (`jsonwebtoken`) + `bcryptjs`
- Socket.IO (real-time notifications)
- `node-cron` (scheduled inventory checks)
- `nodemailer` (optional email alerts)
- `helmet`, `cors`, `express-rate-limit`, `morgan`

---

## 🏗 Architecture

```
┌─────────────────┐        HTTPS / cookies        ┌──────────────────┐
│   React SPA      │ ─────────────────────────────▶│  Express API      │
│  (CRA, port 3000) │◀───────────────────────────── │  (port 5000)       │
└─────────────────┘        JSON responses          └──────────────────┘
        │                                                     │
        │  Socket.IO (notifications:join / notification:new)  │
        └─────────────────────────────────────────────────────┘
                                                                │
                                                        ┌───────────────┐
                                                        │  MySQL (Sequelize) │
                                                        └───────────────┘
                                                                │
                                                ┌────────────────────────────┐
                                                │ node-cron (daily inventory) │
                                                │ nodemailer (optional email) │
                                                └────────────────────────────┘
```

Auth uses a signed JWT set as an `httpOnly`, `sameSite=strict` cookie (`secure` in production) — the frontend never touches the token directly, it just calls `GET /api/auth/profile` on load to check the session.

---

## 📁 Project Structure

```
Pharmacy_Management_System/
├── backend/
│   ├── config/db.js                 # Sequelize/MySQL connection
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification (header or cookie)
│   │   └── requireRole.js           # Role-based route guard
│   ├── models/                      # Sequelize models + associations (models/index.js)
│   ├── routes/                      # One router per resource
│   ├── services/
│   │   ├── emailService.js          # Optional SMTP alerts
│   │   ├── inventoryScheduler.js    # node-cron daily inventory check
│   │   ├── notificationService.js   # Creates + broadcasts notifications
│   │   └── socketService.js         # Socket.IO setup
│   ├── utils/                       # ID generators, stock config, helpers
│   ├── tests/                       # node:test unit tests
│   └── server.js                    # App entrypoint
└── frontend/
    ├── src/
    │   ├── auth/                    # Login / Sign up
    │   ├── components/              # Header, Sidebar, Footer, NotificationsPanel
    │   ├── pages/                   # Dashboard, Inventory, Orders, Sales, Profiles
    │   └── services/                # api.js (axios instance), auth.js
    └── public/
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+ (or compatible, e.g. MariaDB)

### 1. Clone and install

```bash
git clone https://github.com/sahravi63/Pharmacy_Management_System.git
cd Pharmacy_Management_System

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Create `backend/.env` (see [Environment Variables](#-environment-variables) below for the full list):

```env
# Database
DB_NAME=pharmacy_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# Auth
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRE=1h

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Inventory alerts
LOW_STOCK_THRESHOLD=10
EXPIRY_ALERT_DAYS=30
INVENTORY_ALERT_CRON=0 9 * * *

# Optional: email notifications (omit to disable)
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
NOTIFICATION_EMAIL_FROM=
NOTIFICATION_EMAIL_TO=
```

Create a MySQL database matching `DB_NAME`:

```sql
CREATE DATABASE pharmacy_db;
```

The backend uses `sequelize.sync({ alter: true })` outside of production, so tables are created/altered automatically on first run — no manual migrations needed for local dev.

Create `frontend/.env` (optional — defaults to `http://localhost:5000/api` if omitted):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run it

```bash
# Terminal 1 — backend
cd backend
npm start        # or: node server.js

# Terminal 2 — frontend
cd frontend
npm start
```

The frontend runs at `http://localhost:3000`, the API at `http://localhost:5000`.

### 4. Create your first account

Sign up through the UI, then log in. **Note:** at present the sign-up form lets you pick any role, including Admin — see [Known Issues](#-known-issues--roadmap). Until that's fixed, treat this as a local/dev-only convenience for seeding an initial admin account, not something to expose publicly.

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DB_NAME` | ✅ | — | MySQL database name |
| `DB_USER` | ✅ | — | MySQL user |
| `DB_PASSWORD` | ✅ | — | MySQL password |
| `DB_HOST` | – | `localhost` | MySQL host |
| `DB_PORT` | – | `3306` | MySQL port |
| `JWT_SECRET` | ✅ | — | Secret used to sign JWTs. Server refuses to start without this. |
| `JWT_EXPIRE` | – | `1h` | JWT/cookie lifetime |
| `PORT` | – | `5000` | API server port |
| `NODE_ENV` | – | — | `production` disables `sequelize.sync({ alter })` and enables secure cookies |
| `FRONTEND_URL` | – | `http://localhost:3000` | Used for CORS and Socket.IO origin |
| `LOW_STOCK_THRESHOLD` | – | `10` | Stock level that triggers a low-stock notification |
| `EXPIRY_ALERT_DAYS` | – | `30` | Days-to-expiry that triggers an expiring-batch notification |
| `INVENTORY_ALERT_CRON` | – | `0 9 * * *` | Cron schedule for the daily inventory check |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | – | — | Email alerts are disabled unless `SMTP_HOST`, `SMTP_PORT`, and `NOTIFICATION_EMAIL_TO` are all set |
| `NOTIFICATION_EMAIL_FROM` | – | `SMTP_USER` | "From" address for alert emails |
| `NOTIFICATION_EMAIL_TO` | – | — | Recipient for alert emails |
| `REACT_APP_API_URL` (frontend) | – | `http://localhost:5000/api` | Base URL the SPA calls |

`backend/.env` is git-ignored — never commit real credentials.

---

## 📡 API Overview

All endpoints are prefixed with `/api`. Authenticated routes read the JWT from either an `Authorization: Bearer <token>` header or the `token` cookie.

| Resource | Base path | Notes |
|---|---|---|
| Auth | `/auth` | `POST /signup`, `POST /login`, `POST /logout`, `GET /profile`, `GET /user/:identifier` (admin/pharmacist only) |
| Medicines | `/medicines` | CRUD + `PATCH /:id/stock` for manual adjustments |
| Orders | `/orders` | Customers create; admin/pharmacist update status. Stock is reserved/released inside a DB transaction. |
| Sales | `/sales` | Point-of-sale: create/edit/delete multi-item sales with automatic stock deduction/restoration |
| Purchase Orders | `/purchase-orders` | Admin/pharmacist only |
| Suppliers | `/suppliers` | Admin/pharmacist only |
| Prescriptions | `/prescriptions` | Admin/pharmacist only |
| Dashboard | `/dashboard/summary` | Admin/pharmacist only — aggregate stats + 7-day sales trend |
| Notifications | `/notifications` | Admin/pharmacist only — list, mark read, delete, trigger a manual inventory check |
| Customer profile | `/customer/profile` | `GET` / `POST` / `PUT` — self-service |
| Pharmacist profile | `/pharmacist/profile` | `GET` / `PUT` — self-service |

Login attempts are rate-limited to 10 requests per 15 minutes per client.

---

## 👥 Roles & Permissions

| Capability | Admin | Pharmacist | Customer |
|---|:---:|:---:|:---:|
| View dashboard & reports | ✅ | ✅ | ❌ |
| Manage medicines / inventory | ✅ | ✅ | 👁 view only |
| Delete medicines | ✅ | ❌ | ❌ |
| Manage suppliers / purchase orders | ✅ | ✅ | ❌ |
| Record prescriptions | ✅ | ✅ | ❌ |
| Record sales (POS) | ✅ | ✅ | ❌ |
| Place orders | ✅ | ✅ | ✅ |
| Update order status | ✅ | ✅ | ❌ |
| Manage own profile | ✅ | ✅ | ✅ |

---

## 🧪 Testing

Backend unit tests use Node's built-in test runner:

```bash
cd backend
npm test
```

Current coverage is limited to inventory utility logic and the `requireRole` middleware (`backend/tests/`). There is no frontend test suite or API-level integration testing yet — see the roadmap below.

---

## 🛠 Known Issues & Roadmap

This project is functionally solid (transactional stock handling, row-level locking on concurrent sales/orders, live notifications) but has a few gaps to close before it's production-ready:

**Security (high priority)**
- [ ] Sign-up currently allows self-registration as `admin`. Restrict public sign-up to the `customer` role; require an authenticated admin to create pharmacist/admin accounts.
- [ ] `GET /api/orders` and `GET /api/sales` currently return every customer's data to any authenticated user. Scope these to the requesting customer, or restrict to admin/pharmacist and add a dedicated "my orders" endpoint.
- [ ] Add prescription verification before allowing an order for a medicine with `requiresPrescription: true`.
- [ ] Add request-body validation (e.g. `zod`/`joi`) to routes that currently pass `req.body` straight into `Model.create()`.

**Reliability / DX**
- [ ] Add a refresh-token flow so sessions don't hard-expire after `JWT_EXPIRE` with no renewal.
- [ ] Cap `limit`/`offset` query params server-side.
- [ ] Return generic error messages to clients in production; log full errors server-side instead.
- [ ] Add integration tests around the order/sale transaction paths.
- [ ] Add a CI workflow (lint + test on push).
- [ ] Add `.env.example` files for both `backend/` and `frontend/`.
- [ ] Dockerize (API + MySQL + frontend) for one-command local setup.

Contributions addressing any of the above are very welcome.

---

## 🤝 Contributing

1. Fork the repo and create a feature branch.
2. Keep changes scoped and add/update tests where behavior changes.
3. Open a PR describing what changed and why.

---

## 📄 License

No license file is currently included in this repository. Add a `LICENSE` file (e.g. MIT) if you intend for others to reuse this code.