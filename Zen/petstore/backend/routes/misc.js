import express from 'express';
import db from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

export const categoriesRouter = express.Router();
export const wishlistRouter = express.Router();

// Categories
categoriesRouter.get('/', async (req, res) => {
  try {
    const [cats] = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

categoriesRouter.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await db.query('INSERT INTO categories (name, slug, description) VALUES (?,?,?)', [name, slug, description]);
    res.status(201).json({ message: 'Category created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Wishlist
wishlistRouter.get('/', authenticate, async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT w.id, p.id as product_id, p.name, p.price, p.discount_price, p.image, p.rating FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?',
      [req.user.id]
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

wishlistRouter.post('/', authenticate, async (req, res) => {
  try {
    const { product_id } = req.body;
    await db.query('INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?,?)', [req.user.id, product_id]);
    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

wishlistRouter.delete('/:product_id', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM wishlist WHERE user_id=? AND product_id=?', [req.user.id, req.params.product_id]);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
