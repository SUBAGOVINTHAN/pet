import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const sendBrevoEmail = async ({ to, subject, htmlContent }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'PetStore', email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Brevo error: ${err}`);
  }
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const [exists] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashed, phone || null]
    );
    const token = jwt.sign({ id: result.insertId, email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Registered successfully', token, user: { id: result.insertId, name, email, role: 'user' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.role === 'admin') {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/admin-verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expires > NOW() AND role = ?',
      [email, otp, 'admin']
    );
    if (!rows.length) return res.status(400).json({ message: 'Invalid or expired OTP' });
    const user = rows[0];
    await db.query('UPDATE users SET otp = NULL, otp_expires = NULL WHERE id = ?', [user.id]);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/profile', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, phone, address, city, state, pincode, role, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body;
    await db.query('UPDATE users SET name=?, phone=?, address=?, city=?, state=?, pincode=? WHERE id=?',
      [name, phone, address, city, state, pincode, req.user.id]);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) return res.status(400).json({ message: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const [rows] = await db.query('SELECT id, name FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(404).json({ message: 'No account found with this email' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await db.query('UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?', [otp, expires, email]);

    await sendBrevoEmail({
      to: email,
      subject: 'Your OTP - PetStore Password Reset',
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
          <h2 style="color:#F97316">🐾 PetStore</h2>
          <p>Hi ${rows[0].name},</p>
          <p>Your password reset OTP is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#F97316;text-align:center;padding:16px;background:#FFF7F0;border-radius:8px;margin:16px 0">
            ${otp}
          </div>
          <p style="color:#888;font-size:13px">Expires in <strong>10 minutes</strong>. Do not share it.</p>
        </div>
      `,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
    const [rows] = await db.query(
      'SELECT id FROM users WHERE email = ? AND otp = ? AND otp_expires > NOW()',
      [email, otp]
    );
    if (!rows.length) return res.status(400).json({ message: 'Invalid or expired OTP' });
    res.json({ message: 'OTP verified', verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const [rows] = await db.query(
      'SELECT id FROM users WHERE email = ? AND otp = ? AND otp_expires > NOW()',
      [email, otp]
    );
    if (!rows.length) return res.status(400).json({ message: 'Invalid or expired OTP' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ?, otp = NULL, otp_expires = NULL WHERE id = ?', [hashed, rows[0].id]);
    res.json({ message: 'Password reset successfully! Please login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;