// backend/utils/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // dotpetfoodsorder@gmail.com
    pass: process.env.EMAIL_PASS,   // jjff lppf qjmc ssfd
  },
});

// ─── Shared item rows HTML ────────────────────────────────────────────────────
const buildItemsHTML = (items) =>
  items.map((item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0e6d3;font-size:14px;color:#333;">${item.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0e6d3;text-align:center;font-size:14px;color:#333;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0e6d3;text-align:right;font-size:14px;font-weight:600;color:#333;">
        ₹${(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>`
  ).join('');

// ─── Shared price breakdown HTML ─────────────────────────────────────────────
const buildPriceHTML = ({ subtotal, discount, shipping_amount, tax, total }) => `
  <table width="100%" cellpadding="5" cellspacing="0">
    <tr>
      <td style="color:#555;font-size:14px;">Subtotal</td>
      <td style="text-align:right;font-size:14px;">₹${parseFloat(subtotal).toFixed(2)}</td>
    </tr>
    ${parseFloat(discount) > 0 ? `
    <tr>
      <td style="color:#10B981;font-size:14px;">Discount</td>
      <td style="text-align:right;color:#10B981;font-size:14px;">-₹${parseFloat(discount).toFixed(2)}</td>
    </tr>` : ''}
    <tr>
      <td style="color:#555;font-size:14px;">Shipping</td>
      <td style="text-align:right;font-size:14px;">
        ${parseFloat(shipping_amount) === 0
          ? '<span style="color:#10B981;font-weight:600;">FREE</span>'
          : `₹${parseFloat(shipping_amount).toFixed(2)}`}
      </td>
    </tr>
    <tr>
      <td style="color:#555;font-size:14px;">GST (18%)</td>
      <td style="text-align:right;font-size:14px;">₹${parseFloat(tax).toFixed(2)}</td>
    </tr>
    <tr>
      <td style="font-weight:700;font-size:17px;padding-top:12px;border-top:2px solid #f0e6d3;">Total</td>
      <td style="text-align:right;font-weight:700;font-size:17px;color:#F97316;padding-top:12px;border-top:2px solid #f0e6d3;">
        ₹${parseFloat(total).toLocaleString('en-IN')}
      </td>
    </tr>
  </table>
`;

// ─── 1. ADMIN EMAIL ───────────────────────────────────────────────────────────
const sendAdminOrderEmail = async (orderData) => {
  const {
    order_number, customer_name, customer_email,
    items, subtotal, discount, shipping_amount, tax, total,
    shipping, payment_method,
  } = orderData;

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
    <div style="max-width:620px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#F97316;padding:24px 32px;">
        <h1 style="margin:0;color:#fff;font-size:22px;">🐾 Dot Pet Foods — New Order!</h1>
        <p style="margin:6px 0 0;color:#fff3e8;font-size:13px;">Admin Notification</p>
      </div>

      <div style="padding:28px 32px;">

        <!-- Alert Banner -->
        <div style="background:#FFF7F0;border-left:4px solid #F97316;border-radius:6px;padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:15px;color:#333;">
            A new order <strong style="color:#F97316;">${order_number}</strong> has been placed.
          </p>
        </div>

        <!-- Customer Info -->
        <h3 style="font-size:15px;color:#1a1a1a;margin:0 0 12px;">👤 Customer Details</h3>
        <div style="background:#f9f9f9;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
          <table width="100%" cellpadding="5" cellspacing="0">
            <tr>
              <td style="color:#888;font-size:13px;width:40%;">Name</td>
              <td style="font-size:14px;font-weight:600;">${customer_name}</td>
            </tr>
            <tr>
              <td style="color:#888;font-size:13px;">Email</td>
              <td style="font-size:14px;">${customer_email || '—'}</td>
            </tr>
            <tr>
              <td style="color:#888;font-size:13px;">Phone</td>
              <td style="font-size:14px;">${shipping.phone}</td>
            </tr>
            <tr>
              <td style="color:#888;font-size:13px;">Payment</td>
              <td style="font-size:14px;">${payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}</td>
            </tr>
          </table>
        </div>

        <!-- Shipping Address -->
        <h3 style="font-size:15px;color:#1a1a1a;margin:0 0 12px;">📦 Shipping Address</h3>
        <div style="background:#f9f9f9;border-radius:8px;padding:14px 18px;margin-bottom:24px;font-size:14px;color:#555;line-height:1.9;">
          ${shipping.name}<br>
          ${shipping.address}<br>
          ${shipping.city}, ${shipping.state} — ${shipping.pincode}<br>
          📞 ${shipping.phone}
        </div>

        <!-- Items -->
        <h3 style="font-size:15px;color:#1a1a1a;margin:0 0 12px;">🛒 Order Items</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:#FFF7F0;">
              <th style="padding:10px 12px;text-align:left;font-size:13px;color:#888;font-weight:600;">Product</th>
              <th style="padding:10px 12px;text-align:center;font-size:13px;color:#888;font-weight:600;">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:13px;color:#888;font-weight:600;">Amount</th>
            </tr>
          </thead>
          <tbody>${buildItemsHTML(items)}</tbody>
        </table>

        <!-- Price Breakdown -->
        <h3 style="font-size:15px;color:#1a1a1a;margin:0 0 12px;">💰 Price Breakdown</h3>
        <div style="background:#f9f9f9;border-radius:8px;padding:14px 18px;">
          ${buildPriceHTML({ subtotal, discount, shipping_amount, tax, total })}
        </div>

      </div>

      <!-- Footer -->
      <div style="background:#1a1a1a;padding:18px 32px;text-align:center;">
        <p style="margin:0;color:#888;font-size:12px;">© 2025 Dot Pet Foods · Admin Panel</p>
        <p style="margin:4px 0 0;color:#666;font-size:12px;">dotpetfoodsorder@gmail.com</p>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: `"Dot Pet Foods Orders" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,   // dotpetfoodsorder@gmail.com
    subject: `🛒 New Order: ${order_number} — ₹${parseFloat(total).toLocaleString('en-IN')} (${payment_method.toUpperCase()})`,
    html,
  });
};

// ─── 2. CUSTOMER THANK YOU EMAIL ──────────────────────────────────────────────
const sendCustomerOrderEmail = async (orderData) => {
  const {
    order_number, customer_name, customer_email,
    items, subtotal, discount, shipping_amount, tax, total,
    shipping, payment_method,
  } = orderData;

  if (!customer_email) return; // skip if no email provided

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#fdf6ee;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#F97316;padding:32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">🐾 Dot Pet Foods</h1>
        <p style="margin:8px 0 0;color:#fff3e8;font-size:14px;">Thank you for your order!</p>
      </div>

      <div style="padding:32px;">

        <!-- Thank You Message -->
        <div style="text-align:center;margin-bottom:28px;">
          <div style="font-size:54px;margin-bottom:12px;">✅</div>
          <h2 style="margin:0;font-size:24px;color:#1a1a1a;">Order Confirmed!</h2>
          <p style="margin:10px 0 0;font-size:15px;color:#555;">
            Hi <strong>${customer_name}</strong>, your order has been placed successfully.
            We'll get it packed and shipped to you soon! 🐾
          </p>
        </div>

        <!-- Order Number Badge -->
        <div style="background:#FFF7F0;border:2px dashed #F97316;border-radius:10px;padding:14px;text-align:center;margin-bottom:28px;">
          <p style="margin:0;font-size:13px;color:#888;">Your Order Number</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#F97316;letter-spacing:1px;">${order_number}</p>
        </div>

        <!-- Items -->
        <h3 style="font-size:15px;color:#1a1a1a;margin:0 0 12px;">🛍️ Items You Ordered</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:#FFF7F0;">
              <th style="padding:10px 12px;text-align:left;font-size:13px;color:#888;font-weight:600;">Product</th>
              <th style="padding:10px 12px;text-align:center;font-size:13px;color:#888;font-weight:600;">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:13px;color:#888;font-weight:600;">Amount</th>
            </tr>
          </thead>
          <tbody>${buildItemsHTML(items)}</tbody>
        </table>

        <!-- Price Breakdown -->
        <div style="background:#f9f9f9;border-radius:8px;padding:16px 18px;margin-bottom:24px;">
          ${buildPriceHTML({ subtotal, discount, shipping_amount, tax, total })}
        </div>

        <!-- Shipping Address -->
        <div style="background:#FFF7F0;border-radius:8px;padding:16px 18px;margin-bottom:24px;">
          <h4 style="margin:0 0 10px;font-size:14px;color:#1a1a1a;">📦 Delivering To</h4>
          <p style="margin:0;font-size:14px;color:#555;line-height:1.9;">
            ${shipping.name}<br>
            ${shipping.address}<br>
            ${shipping.city}, ${shipping.state} — ${shipping.pincode}<br>
            📞 ${shipping.phone}
          </p>
        </div>

        <!-- Payment Method -->
        <div style="background:#f0fdf4;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#333;">
            💳 <strong>Payment:</strong>
            ${payment_method === 'cod' ? 'Cash on Delivery — please keep exact change ready.' : 'Online Payment — your payment is confirmed.'}
          </p>
        </div>

        <!-- Note -->
        <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0;">
          Questions? Reply to this email or contact us at
          <a href="mailto:dotpetfoodsorder@gmail.com" style="color:#F97316;">dotpetfoodsorder@gmail.com</a>
        </p>

      </div>

      <!-- Footer -->
      <div style="background:#1a1a1a;padding:20px 32px;text-align:center;">
        <p style="margin:0;color:#aaa;font-size:13px;">Thank you for choosing <strong style="color:#F97316;">Dot Pet Foods</strong> 🐾</p>
        <p style="margin:6px 0 0;color:#666;font-size:12px;">© 2025 Dot Pet Foods · All rights reserved</p>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: `"Dot Pet Foods" <${process.env.EMAIL_USER}>`,
    to: customer_email,
    subject: `✅ Order Confirmed: ${order_number} — Thank you, ${customer_name}!`,
    html,
  });
};

// ─── Main export: fires both emails ──────────────────────────────────────────
export const sendOrderConfirmationEmail = async (orderData) => {
  await Promise.allSettled([
    sendAdminOrderEmail(orderData),
    sendCustomerOrderEmail(orderData),
  ]);
};