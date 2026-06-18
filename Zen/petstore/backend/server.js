import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { testConnection } from './config/db.js';
import authRoutes    from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes    from './routes/cart.js';
import orderRoutes   from './routes/orders.js';
import adminRoutes   from './routes/admin.js';
import { categoriesRouter, wishlistRouter } from './routes/misc.js';
import paymentRoutes from './routes/payment.js';

dotenv.config();

const app      = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Uploads folder ────────────────────────────────────────────────────────────
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://pet.vasudevantechnologies.com',  
  ],
  credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/wishlist',   wishlistRouter);
app.use('/api/payment',    paymentRoutes);

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', time: new Date() })
);


const frontendPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  // React Router-க்கு — எல்லா routes-உம் index.html-க்கு போகணும்
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}


const PORT = process.env.PORT || 5000;
testConnection().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
});