import db from '../config/db.js';
import PDFDocument from 'pdfkit';

export const generateInvoice = async (req, res) => {
  try {

    if (!req.user) {
      const queryToken = req.query.token;
      if (queryToken) {
        try {
          const jwt = await import('jsonwebtoken');
          req.user = jwt.default.verify(queryToken, process.env.JWT_SECRET);
        } catch {
          return res.status(401).json({ message: 'Invalid or expired token' });
        }
      } else {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }

    const { id } = req.params;

    // ── Fetch order ──────────────────────────────────────────────────────────
    const [orders] = await db.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );
    if (!orders.length)
      return res.status(404).json({ message: 'Order not found' });
    const order = orders[0];

    // ── Fetch items ──────────────────────────────────────────────────────────
    const [items] = await db.query(
      `SELECT oi.*, p.name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    // ── Compute subtotal ─────────────────────────────────────────────────────
    const totalAmount    = parseFloat(order.total_amount    || 0);
    const shippingAmount = parseFloat(order.shipping_amount || 0);
    const taxAmount      = parseFloat(order.tax_amount      || 0);
    const discountAmount = parseFloat(order.discount_amount || 0);
    const subtotal       = totalAmount - shippingAmount - taxAmount + discountAmount;

    // ── Build PDF ────────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${order.order_number}.pdf"`
    );
    doc.pipe(res);

    const W = doc.page.width;   // 595
    const M = 50;               // margin

    // ── ORANGE HEADER ────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 80).fill('#F97316');
    doc.fillColor('#fff').fontSize(22).font('Helvetica-Bold')
       .text('Dot Pet Foods', M, 22);
    doc.fontSize(11).font('Helvetica')
       .text('Tax Invoice', M, 50);
    doc.fontSize(10)
       .text('dotpetfoodsorder@gmail.com', W - 240, 30)
       .text('www.dotpetfoods.com',        W - 240, 48);

    // ── ORDER INFO BOX ───────────────────────────────────────────────────────
    doc.rect(M, 95, W - 100, 72).fillAndStroke('#FFF7F0', '#f0e6d3');
    doc.fillColor('#1a1a1a').fontSize(11).font('Helvetica-Bold')
       .text('Order Details', M, 100);

    doc.fillColor('#555').fontSize(10).font('Helvetica')
       .text('Order Number:',  M + 10, 118)
       .text('Order Date:',    M + 10, 136)
       .text('Payment:',       M + 10, 154);

    doc.fillColor('#1a1a1a').font('Helvetica-Bold')
       .text(order.order_number, M + 120, 118)
       .text(new Date(order.created_at).toLocaleDateString('en-IN', {
           day: '2-digit', month: 'long', year: 'numeric'
        }), M + 120, 136)
       .text(order.payment_method === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery',
             M + 120, 154);

    // ── BILL TO / SHIP TO ────────────────────────────────────────────────────
    const secY = 185;
    const col2 = W / 2 + 10;

    doc.fillColor('#1a1a1a').fontSize(11).font('Helvetica-Bold')
       .text('Bill To',  M,    secY)
       .text('Ship To',  col2, secY);

    doc.moveTo(M,    secY + 16).lineTo(M + 200,    secY + 16).strokeColor('#F97316').lineWidth(1.5).stroke();
    doc.moveTo(col2, secY + 16).lineTo(col2 + 200, secY + 16).strokeColor('#F97316').lineWidth(1.5).stroke();

    doc.fillColor('#444').fontSize(10).font('Helvetica')
       .text(order.customer_name  || order.shipping_name,  M, secY + 24)
       .text(order.customer_email || order.shipping_email, M, secY + 39)
       .text(order.shipping_phone || '',                   M, secY + 54);

    doc.fillColor('#444').fontSize(10).font('Helvetica')
       .text(order.shipping_name,    col2, secY + 24)
       .text(order.shipping_address, col2, secY + 39, { width: 220 })
       .text(`${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`,
             col2, secY + 54)
       .text(`Ph: ${order.shipping_phone}`, col2, secY + 69);

    // ── ITEMS TABLE ──────────────────────────────────────────────────────────
    const tY = secY + 100;

    doc.rect(M, tY, W - 100, 24).fill('#F97316');
    doc.fillColor('#fff').fontSize(10).font('Helvetica-Bold')
       .text('#',        M + 8,   tY + 7)
       .text('Product',  M + 30,  tY + 7)
       .text('Qty',      M + 295, tY + 7)
       .text('Price',    M + 345, tY + 7)
       .text('Amount',   M + 405, tY + 7);

    let rowY = tY + 24;
    items.forEach((item, i) => {
      doc.rect(M, rowY, W - 100, 22).fill(i % 2 === 0 ? '#fff' : '#FFF7F0');
      doc.fillColor('#333').fontSize(10).font('Helvetica')
         .text(String(i + 1),  M + 8,   rowY + 6)
         .text(item.name,      M + 30,  rowY + 6, { width: 255 })
         .text(String(item.quantity), M + 295, rowY + 6)
         .text(`Rs.${parseFloat(item.price).toFixed(2)}`,
               M + 335, rowY + 6)
         .text(`Rs.${(parseFloat(item.price) * item.quantity).toFixed(2)}`,
               M + 395, rowY + 6);
      rowY += 22;
    });

    doc.moveTo(M, rowY).lineTo(M + W - 100, rowY)
       .strokeColor('#f0e6d3').lineWidth(1).stroke();

    // ── PRICE SUMMARY ────────────────────────────────────────────────────────
    rowY += 20;
    const sumX = W - 230;

    const addRow = (label, value, bold = false, color = '#333') => {
      doc.fillColor(color).fontSize(10)
         .font(bold ? 'Helvetica-Bold' : 'Helvetica')
         .text(label, sumX,       rowY)
         .text(value, sumX + 110, rowY, { align: 'right', width: 70 });
      rowY += 20;
    };

    addRow('Subtotal:',  `Rs.${subtotal.toFixed(2)}`);
    if (discountAmount > 0)
      addRow('Discount:', `-Rs.${discountAmount.toFixed(2)}`, false, '#10B981');
    addRow('Shipping:',
      shippingAmount === 0 ? 'FREE' : `Rs.${shippingAmount.toFixed(2)}`);
    addRow('GST (18%):', `Rs.${taxAmount.toFixed(2)}`);

    doc.moveTo(sumX, rowY).lineTo(sumX + 180, rowY)
       .strokeColor('#F97316').lineWidth(1.5).stroke();
    rowY += 8;
    addRow('TOTAL:', `Rs.${totalAmount.toFixed(2)}`, true, '#F97316');

    // ── PAYMENT STATUS BADGE ─────────────────────────────────────────────────
    rowY += 10;
    const badgeBg = order.payment_status === 'paid' ? '#D1FAE5' : '#FEF3C7';
    const badgeTx = order.payment_status === 'paid' ? '#065F46' : '#92400E';
    doc.rect(M, rowY, 200, 24).fill(badgeBg);
    doc.fillColor(badgeTx).fontSize(10).font('Helvetica-Bold')
       .text(
         order.payment_status === 'paid' ? '✓ Payment Confirmed' : '⏳ Payment Pending',
         M + 8, rowY + 7
       );
    if (order.payment_id) {
      doc.fillColor('#9CA3AF').fontSize(9).font('Helvetica')
         .text(`Payment ID: ${order.payment_id}`, M, rowY + 30);
    }

    // ── FOOTER ───────────────────────────────────────────────────────────────
    // FIX: PDFKit auto-adds a new page when text() is called at a y position
    // that exceeds (page.height - margin.bottom). Since the footer sits in the
    // bottom 60px, fY+14 and fY+32 both exceed that boundary, triggering two
    // extra blank pages. Setting margin.bottom = 0 right before the footer
    // text calls raises the allowed boundary to page.height itself, so no
    // extra pages are created. The margin change only affects the cursor check;
    // it does not alter any visible output.
    const fY = doc.page.height - 60;
    doc.rect(0, fY, W, 60).fill('#1a1a1a');

    doc.page.margins.bottom = 0; // ← prevents blank pages from footer text
    doc.fillColor('#ccc').fontSize(10).font('Helvetica')
       .text('Thank you for shopping with Dot Pet Foods!',
             0, fY + 14, { align: 'center', width: W });
    doc.fillColor('#666').fontSize(9)
       .text('dotpetfoodsorder@gmail.com  |  www.dotpetfoods.com',
             0, fY + 32, { align: 'center', width: W });

    doc.end();

  } catch (err) {
    console.error('Invoice error:', err);
    if (!res.headersSent)
      res.status(500).json({ message: 'Failed to generate invoice' });
  }
};