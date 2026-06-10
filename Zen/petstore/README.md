# 🐾 PetStore — Full Stack E-Commerce App

A complete pet store e-commerce application built with **React + Vite**, **Node.js + Express**, and **MySQL**.

---

## 📁 Project Structure

```
petstore/
├── backend/          ← Node.js + Express API
│   ├── config/       ← Database connection
│   ├── middleware/   ← JWT auth middleware
│   ├── routes/       ← All API routes
│   ├── uploads/      ← Product image uploads
│   ├── database.sql  ← MySQL schema + seed data
│   ├── server.js     ← Entry point
│   ├── .env          ← Environment variables
│   └── package.json
│
└── frontend/         ← React + Vite app
    ├── src/
    │   ├── assets/       ← Your brand images
    │   ├── components/   ← Navbar, Footer, ProductCard
    │   ├── context/      ← Auth & Cart context
    │   ├── pages/        ← All pages + admin panel
    │   └── utils/        ← Axios API helper
    ├── index.html
    └── package.json
```

---

## ✅ STEP-BY-STEP SETUP

### Step 1 — Install Prerequisites

Make sure you have these installed:
- **Node.js** v18+ → https://nodejs.org
- **MySQL** v8+ → https://dev.mysql.com/downloads/
- **Git** (optional)

---

### Step 2 — Setup the Database

1. Open **MySQL Workbench** or the MySQL command line
2. Run the SQL file to create the database, tables, and seed data:

```bash
mysql -u root -p < backend/database.sql
```

Or in MySQL Workbench:
- Open `backend/database.sql`
- Click **⚡ Execute** (Ctrl+Shift+Enter)

This creates:
- Database: `petstore_db`
- All tables (users, products, categories, orders, etc.)
- Sample categories and products
- Admin user: `admin@petstore.com` / `Admin@123`
- Sample coupons: `WELCOME10`, `FLAT100`

---

### Step 3 — Configure Backend Environment

Edit `backend/.env` with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD   ← change this
DB_NAME=petstore_db
JWT_SECRET=your_super_secret_key_change_in_production
CLIENT_URL=http://localhost:5173
```

---

### Step 4 — Install & Run Backend

```bash
cd backend
npm install
npm run dev
```

✅ You should see:
```
✅ MySQL Connected successfully
🚀 Server running on http://localhost:5000
```

Test the API: http://localhost:5000/api/health

---

### Step 5 — Install & Run Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

✅ You should see:
```
VITE ready in 500ms
➜  Local:   http://localhost:5173/
```

Open: **http://localhost:5173**

---

## 🎯 Features

### 👤 Customer Features
| Feature | Description |
|---------|-------------|
| 🏠 Homepage | Hero banner, pet categories, featured products, promo banner |
| 🛍 Shop | Browse all products with filters (category, pet type, price, sort) |
| 🔍 Search | Search products by name/description |
| 📦 Product Detail | Full info, image, reviews, add to cart |
| 🛒 Cart | Add/update/remove items, auto totals |
| 💳 Checkout | Shipping form, COD/Stripe, coupon codes |
| ❤️ Wishlist | Save favourite products |
| 📋 Orders | View all orders, track status |
| 👤 Profile | Update info, change password |

### 🔧 Admin Features
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Revenue, orders, users, top products |
| 📦 Products | Add/edit/delete products, image upload |
| 🛒 Orders | View & update order status |
| 👥 Users | View all registered customers |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@petstore.com | Admin@123 |
| Customer | Register a new account | - |

---

## 🛒 Coupon Codes (Pre-loaded)

| Code | Type | Value | Min Order |
|------|------|-------|-----------|
| `WELCOME10` | 10% Off | 10% | ₹500 |
| `FLAT100` | Flat Discount | ₹100 | ₹800 |

---

## 🌐 API Endpoints Reference

### Auth
```
POST /api/auth/register     ← Register
POST /api/auth/login        ← Login
GET  /api/auth/profile      ← Get profile (🔒)
PUT  /api/auth/profile      ← Update profile (🔒)
PUT  /api/auth/change-password ← Change password (🔒)
```

### Products
```
GET  /api/products                       ← List (with filters)
GET  /api/products/:slug                 ← Single product
POST /api/products/:id/review            ← Add review (🔒)
POST /api/products                       ← Create (🔒 Admin)
PUT  /api/products/:id                   ← Update (🔒 Admin)
DELETE /api/products/:id                 ← Delete (🔒 Admin)
```

### Cart
```
GET    /api/cart         ← View cart (🔒)
POST   /api/cart         ← Add to cart (🔒)
PUT    /api/cart/:id     ← Update qty (🔒)
DELETE /api/cart/:id     ← Remove item (🔒)
DELETE /api/cart         ← Clear cart (🔒)
```

### Orders
```
POST /api/orders           ← Place order (🔒)
GET  /api/orders/my        ← My orders (🔒)
GET  /api/orders/:id       ← Order detail (🔒)
GET  /api/orders           ← All orders (🔒 Admin)
PUT  /api/orders/:id/status ← Update status (🔒 Admin)
```

### Others
```
GET  /api/categories        ← All categories
GET  /api/wishlist          ← My wishlist (🔒)
POST /api/wishlist          ← Add to wishlist (🔒)
DELETE /api/wishlist/:pid   ← Remove (🔒)
GET  /api/admin/stats       ← Dashboard stats (🔒 Admin)
GET  /api/admin/users       ← All users (🔒 Admin)
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Routing | React Router v6 |
| State | Context API |
| HTTP Client | Axios |
| Styling | Pure CSS (custom, no frameworks) |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Backend | Node.js + Express |
| Database | MySQL 8 with mysql2 |
| Auth | JWT + bcryptjs |
| File Uploads | Multer |
| Environment | dotenv |

---

## 🚀 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Output in: frontend/dist/
```

### Deploy Backend
1. Set `NODE_ENV=production` in `.env`
2. Use **PM2** to keep the server running:
```bash
npm install -g pm2
pm2 start server.js --name petstore-api
```

### Serve Frontend
- Upload `frontend/dist/` to **Nginx** or **Apache**
- Or deploy to **Vercel** / **Netlify** (frontend only)
- Backend: **Railway**, **Render**, or **DigitalOcean**

---

## ❓ Common Issues

**MySQL Connection Refused**
→ Make sure MySQL service is running: `sudo service mysql start`

**Port 5000 in use**
→ Change `PORT` in `.env` to another port like `5001`

**Images not showing**
→ Make sure `backend/uploads/` folder exists and has write permissions

**CORS errors**
→ Confirm `CLIENT_URL` in `.env` matches your frontend URL exactly

---

## 📞 Support
For any issues, check the browser console and backend terminal for error messages.
