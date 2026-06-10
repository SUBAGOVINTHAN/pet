import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { testConnection } from './config/db.js';
import db from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import { categoriesRouter, wishlistRouter } from './routes/misc.js';
import paymentRoutes  from './routes/payment.js';

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/payment',  paymentRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ============================================================
// TEMPORARY: Admin password reset route
// Visit http://localhost:5000/api/reset-admin ONCE to fix login
// Then you can delete this block
// ============================================================
app.get('/api/reset-admin', async (req, res) => {
  try {
    const hashed = await bcrypt.hash('Admin@123', 10);
    await db.query("DELETE FROM users WHERE email = 'admin@petstore.com'");
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ['Admin User', 'admin@petstore.com', hashed, 'admin']
    );
    res.json({ success: true, message: '✅ Admin reset! Login: admin@petstore.com / Admin@123' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});
// ============================================================

// Create uploads folder if not exists
import fs from 'fs';
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const PORT = process.env.PORT || 5000;
testConnection().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
