import express  from 'express';
import Razorpay from 'razorpay';
import crypto   from 'crypto';
import db       from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Create Razorpay Order ──────────────────────────────────────────────────
router.post('/create-order', authenticate, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ message: 'Invalid amount' });
  try {
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // ₹ to paise
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
});

// ── Verify Payment Signature ───────────────────────────────────────────────
router.post('/verify', authenticate, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return res.status(400).json({ message: 'Missing payment details' });

  const body     = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature)
    return res.status(400).json({ message: 'Payment verification failed' });

  res.json({ verified: true, payment_id: razorpay_payment_id });
});

export default router;