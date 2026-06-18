import express from 'express';
import db from '../config/db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';
import { generateInvoice } from '../utils/invoiceGenerator.js';

const router = express.Router();

const generateOrderNumber = () =>
  'PET-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

// ── POST / — Place order ──────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const {
      shipping,
      payment_method    = 'razorpay',
      coupon_code,
      notes,
      payment_id        = null,
      razorpay_order_id = null,
    } = req.body;

    const [cartItems] = await conn.query(
      `SELECT c.quantity, p.id, p.name, p.price, p.discount_price, p.stock
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    const [userRows] = await conn.query(
      'SELECT email, name FROM users WHERE id = ?',
      [req.user.id]
    );
    const customerEmail = shipping.email?.trim() || userRows[0]?.email || '';
    const customerName  = shipping.name || userRows[0]?.name || 'Customer';

    if (!cartItems.length)
      return res.status(400).json({ message: 'Cart is empty' });

    for (const item of cartItems) {
      if (item.stock < item.quantity)
        return res.status(400).json({ message: `${item.name} is out of stock` });
    }

    let subtotal = cartItems.reduce(
      (s, i) => s + (i.discount_price || i.price) * i.quantity, 0
    );
    let discount = 0;

    if (coupon_code) {
      const [coupons] = await conn.query(
        'SELECT * FROM coupons WHERE code=? AND is_active=1 AND expires_at > NOW() AND used_count < max_uses',
        [coupon_code]
      );
      if (coupons.length) {
        const c = coupons[0];
        if (subtotal >= c.min_order_amount) {
          discount = c.discount_type === 'percentage'
            ? (subtotal * c.discount_value / 100)
            : c.discount_value;
          await conn.query(
            'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
            [c.id]
          );
        }
      }
    }

    const isTN = ['tamil nadu', 'tamilnadu', 'tn'].includes(
      (shipping.state || '').toLowerCase().trim()
    );
    const shipping_amount = isTN ? 0 : 99;
    const tax    = parseFloat((subtotal * 0.18).toFixed(2));
    const total  = parseFloat((subtotal - discount + shipping_amount + tax).toFixed(2));
    const order_number = generateOrderNumber();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (
        user_id, order_number, total_amount, discount_amount,
        shipping_amount, tax_amount, payment_method,
        payment_status, payment_id,
        shipping_name, shipping_email, shipping_phone,
        shipping_address, shipping_city, shipping_state,
        shipping_pincode, notes
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        req.user.id, order_number, total, discount,
        shipping_amount, tax, payment_method,
        payment_id ? 'paid' : 'pending',
        payment_id || null,
        shipping.name, shipping.email, shipping.phone,
        shipping.address, shipping.city, shipping.state,
        shipping.pincode, notes || null,
      ]
    );

    for (const item of cartItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)',
        [orderResult.insertId, item.id, item.quantity, item.discount_price || item.price]
      );
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    await conn.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    await conn.commit();

    sendOrderConfirmationEmail({
      order_id:       orderResult.insertId,
      order_number,
      customer_name:  customerName,
      customer_email: customerEmail,
      items: cartItems.map(i => ({
        name:     i.name,
        quantity: i.quantity,
        price:    i.discount_price || i.price,
      })),
      subtotal, discount, shipping_amount, tax, total,
      shipping, payment_method,
    }).catch(err => console.error('Email error:', err));

    res.status(201).json({
      message:        'Order placed!',
      order_number,
      order_id:       orderResult.insertId,
      payment_status: payment_id ? 'paid' : 'pending',
    });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});

// ── GET /my — User orders ─────────────────────────────────────────────────────
router.get('/my', authenticate, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, GROUP_CONCAT(p.name SEPARATOR ', ') as product_names
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /:id/invoice — MUST be before /:id ────────────────────────────────────
// No authenticate middleware — generateInvoice handles auth itself
// (supports both Bearer header token AND ?token= query param from email links)
router.get('/:id/invoice', generateInvoice);

// ── GET /:id — Order detail ───────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!orders.length)
      return res.status(404).json({ message: 'Order not found' });

    const [items] = await db.query(
      `SELECT oi.*, p.name, p.image
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET / — Admin: all orders ─────────────────────────────────────────────────
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = `SELECT o.*, u.name as customer_name, u.email as customer_email
                 FROM orders o JOIN users u ON o.user_id = u.id`;
    const params = [];
    if (status) { query += ' WHERE o.status = ?'; params.push(status); }
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (page - 1) * parseInt(limit));
    const [orders] = await db.query(query, params);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /:id/status — Admin: update status ────────────────────────────────────
router.put('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, payment_status } = req.body;
    await db.query(
      'UPDATE orders SET status=?, payment_status=COALESCE(?, payment_status) WHERE id=?',
      [status, payment_status, req.params.id]
    );
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;