import express from 'express';
import db from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const [[{ total_orders }]] = await db.query('SELECT COUNT(*) as total_orders FROM orders');
    const [[{ total_revenue }]] = await db.query("SELECT COALESCE(SUM(total_amount),0) as total_revenue FROM orders WHERE payment_status='paid'");
    const [[{ total_users }]] = await db.query('SELECT COUNT(*) as total_users FROM users WHERE role="user"');
    const [[{ total_products }]] = await db.query('SELECT COUNT(*) as total_products FROM products WHERE is_active=1');
    const [recent_orders] = await db.query(
      'SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10'
    );
    const [top_products] = await db.query(
      'SELECT p.name, p.image, SUM(oi.quantity) as sold FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.id ORDER BY sold DESC LIMIT 5'
    );
    res.json({ total_orders, total_revenue, total_users, total_products, recent_orders, top_products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
