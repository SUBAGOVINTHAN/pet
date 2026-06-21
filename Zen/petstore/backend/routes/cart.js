import express from 'express';
import db from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get cart
router.get('/', authenticate, async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, 
       p.discount_price, p.image, p.stock,
       CASE WHEN p.id IS NULL THEN 1 ELSE 0 END as is_deleted
       FROM cart c 
       LEFT JOIN products p ON c.product_id = p.id  
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    const total = items
      .filter(i => !i.is_deleted)
      .reduce((sum, i) => sum + (i.discount_price || i.price) * i.quantity, 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add to cart
router.post('/', authenticate, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    await db.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
      [req.user.id, product_id, quantity, quantity]
    );
    res.json({ message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update quantity
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    } else {
      await db.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    }
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove item
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clear cart
router.delete('/', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
