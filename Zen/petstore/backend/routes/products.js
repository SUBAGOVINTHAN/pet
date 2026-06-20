import express from 'express';
import db from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'petstore', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
});

// ✅ Allow multiple images (up to 5)
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, pet_type, min_price, max_price, sort, featured, page = 1, limit = 12 } = req.query;
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
    const params = [];

    if (category) { query += ' AND c.slug = ?'; params.push(category); }
    if (search) { query += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (pet_type) { query += ' AND p.pet_type = ?'; params.push(pet_type); }
    if (min_price) { query += ' AND p.price >= ?'; params.push(min_price); }
    if (max_price) { query += ' AND p.price <= ?'; params.push(max_price); }
    if (featured === 'true') { query += ' AND p.is_featured = 1'; }

    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else if (sort === 'rating') query += ' ORDER BY p.rating DESC';
    else query += ' ORDER BY p.created_at DESC';

    const offset = (page - 1) * limit;
    const [countResult] = await db.query(query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*) as total'), params);
    query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const [products] = await db.query(query, params);

    res.json({ products, total: countResult[0].total, page: parseInt(page), totalPages: Math.ceil(countResult[0].total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = 1',
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    const [reviews] = await db.query(
      'SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC',
      [rows[0].id]
    );
    // ✅ Parse images JSON
    const product = rows[0];
    if (product.images && typeof product.images === 'string') {
      try { product.images = JSON.parse(product.images); } catch { product.images = []; }
    }
    res.json({ ...product, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add review
router.post('/:id/review', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    await db.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating=?, comment=?',
      [req.user.id, req.params.id, rating, comment, rating, comment]
    );
    res.json({ message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Create product
router.post('/', authenticate, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, discount_price, stock, category_id, is_featured, pet_type } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

    const urls = (req.files || []).map(f => f.path);
    const image  = urls[0] || null;           // ✅ First image = main image
    const images = urls.length > 1 ? JSON.stringify(urls.slice(1)) : null; // ✅ Rest = extra images

    const [result] = await db.query(
      'INSERT INTO products (name, slug, description, price, discount_price, stock, category_id, image, images, is_featured, pet_type) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [name, slug, description, price, discount_price || null, stock, category_id, image, images, is_featured ? 1 : 0, pet_type]
    );
    res.status(201).json({ message: 'Product created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update product
router.put('/:id', authenticate, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, discount_price, stock, category_id, is_featured, pet_type, is_active } = req.body;

    const urls = (req.files || []).map(f => f.path);
    const newImage  = urls[0] || undefined;
    const newImages = urls.length > 1 ? JSON.stringify(urls.slice(1)) : undefined;

    let query = 'UPDATE products SET name=?, description=?, price=?, discount_price=?, stock=?, category_id=?, is_featured=?, pet_type=?, is_active=?';
    const params = [name, description, price, discount_price || null, stock, category_id, is_featured ? 1 : 0, pet_type, is_active ? 1 : 0];

    if (newImage)  { query += ', image=?';  params.push(newImage); }
    if (newImages) { query += ', images=?'; params.push(newImages); }

    query += ' WHERE id=?';
    params.push(req.params.id);
    await db.query(query, params);
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete product
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;