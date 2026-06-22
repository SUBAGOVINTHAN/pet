import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import { Package, ArrowLeft, Download } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Rupee symbol fix ──
const Rs = () => <span style={{ fontFamily: 'Arial, sans-serif' }}>₹</span>;

// ── Responsive styles ─────────────────────────────────────────────────────────
const styles = `
  .orders-card-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
  }
  .orders-card-right {
    text-align: right;
  }
  .orders-action-btns {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 8px;
  }
  .order-detail-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 12px;
  }
  .order-detail-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .order-item-row {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
  }
  .invoice-btn-full {
    display: none;
  }
  @media (max-width: 600px) {
    .orders-card-row {
      flex-direction: column;
      gap: 10px;
    }
    .orders-card-right {
      text-align: left;
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
    .orders-card-right-amount {
      margin-left: auto;
      margin-top: 0 !important;
    }
    .orders-action-btns {
      width: 100%;
      justify-content: flex-start;
      margin-top: 4px;
    }
    .orders-action-btns a,
    .orders-action-btns button {
      flex: 1;
      justify-content: center;
      text-align: center;
    }
    .order-detail-topbar {
      flex-direction: row;
      flex-wrap: wrap;
    }
    .invoice-btn-desktop {
      display: none !important;
    }
    .invoice-btn-full {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: #F97316;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(249,115,22,0.3);
    }
    .order-item-row {
      gap: 10px;
    }
    .order-item-img {
      width: 48px !important;
      height: 48px !important;
    }
    .order-detail-card {
      padding: 16px !important;
    }
    .order-payment-row {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 6px !important;
    }
  }
`;

// ── Download helper ───────────────────────────────────────────────────────────
const downloadInvoice = async (orderId, orderNumber) => {
  try {
    const res  = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `invoice-${orderNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    toast.success('Invoice downloaded!');
  } catch {
    toast.error('Failed to download invoice');
  }
};

// ── Orders List ───────────────────────────────────────────────────────────────
export function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  if (!orders.length) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <Package size={80} color="#F97316"
        style={{ margin: '0 auto 20px', display: 'block', opacity: 0.3 }} />
      <h2>No orders yet</h2>
      <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
        Start Shopping
      </Link>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="container section" style={{ paddingTop: 24 }}>
        <h1 style={{ fontWeight: 700, fontSize: 24, marginBottom: 20 }}>My Orders</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => (
            <div key={order.id} className="card" style={{ padding: 16 }}>
              <div className="orders-card-row">

                {/* Left: order info */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{order.order_number}</p>
                  <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 3 }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                  {order.product_names && (
                    <p style={{
                      fontSize: 13, color: '#555', marginTop: 5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      maxWidth: '100%',
                    }}>
                      {order.product_names.substring(0, 60)}…
                    </p>
                  )}
                </div>

                {/* Right: status, amount, actions */}
                <div className="orders-card-right">
                  <span className={`status-pill status-${order.status}`}>
                    {order.status}
                  </span>
                  <p className="orders-card-right-amount"
                    style={{ fontWeight: 700, fontSize: 17, marginTop: 6, color: '#F97316' }}>
                    <Rs />{parseFloat(order.total_amount).toLocaleString()}
                  </p>
                  <div className="orders-action-btns">
                    <Link
                      to={`/orders/${order.id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, color: '#F97316', fontWeight: 600,
                        padding: '6px 12px', border: '1.5px solid #F97316',
                        borderRadius: 6, textDecoration: 'none',
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Order Detail ──────────────────────────────────────────────────────────────
export function OrderDetail() {
  const { id }              = useParams();
  const [order,   setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!order)  return <div style={{ textAlign: 'center', padding: 60 }}>Order not found</div>;

  const totalAmount    = parseFloat(order.total_amount    || 0);
  const shippingAmount = parseFloat(order.shipping_amount || 0);
  const taxAmount      = parseFloat(order.tax_amount      || 0);
  const discountAmount = parseFloat(order.discount_amount || 0);
  const subtotal       = totalAmount - shippingAmount - taxAmount + discountAmount;

  // ✅ priceRows now uses JSX — so Rs component works
  const priceRows = [
    ['Subtotal', <><Rs />{subtotal.toFixed(2)}</>],
    ['Shipping', shippingAmount > 0 ? <><Rs />{shippingAmount.toFixed(2)}</> : 'FREE'],
    ['GST',      <><Rs />{taxAmount.toFixed(2)}</>],
    ...(discountAmount > 0 ? [['Discount', <>-<Rs />{discountAmount.toFixed(2)}</>]] : []),
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="container section" style={{ paddingTop: 24, maxWidth: 720 }}>

        {/* ── TOP BAR ── */}
        <div className="order-detail-topbar">
          <Link
            to="/orders"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: '#F97316', fontWeight: 600, fontSize: 14,
            }}
          >
            <ArrowLeft size={16} /> Back to Orders
          </Link>
        </div>

        {/* Mobile: full-width invoice button */}
        <button
          className="invoice-btn-full"
          onClick={() => downloadInvoice(order.id, order.order_number)}
        >
          <Download size={16} /> Download Invoice
        </button>

        <div className="card order-detail-card" style={{ padding: 24 }}>

          {/* Header */}
          <div className="order-detail-header">
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 18 }}>{order.order_number}</h2>
              <p style={{ color: '#9CA3AF', fontSize: 13 }}>
                {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </p>
            </div>
            <span className={`status-pill status-${order.status}`}
              style={{ fontSize: 13, padding: '5px 14px', alignSelf: 'flex-start' }}>
              {order.status}
            </span>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
            {order.items?.map(item => (
              <div key={item.id} className="order-item-row">
                <img
                  className="order-item-img"
                  src={item.image
                    ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`)
                    : 'https://via.placeholder.com/60'}
                  alt={item.name}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                  onError={e => e.target.src = 'https://via.placeholder.com/60'}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: 13, color: '#9CA3AF' }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <Rs />{(parseFloat(item.price) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          <div style={{ background: '#FFF7F0', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Shipping Address</h4>
            <p style={{ fontSize: 12, color: '#F97316', marginBottom: 6 }}>
              <a href="mailto:dotpetfoods@gmail.com" style={{ color: '#F97316', textDecoration: 'none' }}>
                dotpetfoods@gmail.com
              </a>
            </p>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8 }}>
              {order.shipping_name}<br />
             {order.shipping_city},<br />
              {order.shipping_state} – {order.shipping_pincode}<br />
            </p>
          </div>

          {/* Price Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {priceRows.map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>{label}</span>
                <span>{val}</span>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontWeight: 700, fontSize: 17,
              borderTop: '2px solid #eee', paddingTop: 10, marginTop: 4,
            }}>
              <span>Total</span>
              <span style={{ color: '#F97316' }}><Rs />{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment status */}
          <div className="order-payment-row"
            style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600,
              background: order.payment_status === 'paid' ? '#D1FAE5' : '#FEF3C7',
              color:      order.payment_status === 'paid' ? '#065F46' : '#92400E',
            }}>
              {order.payment_status === 'paid' ? '✅ Payment Confirmed' : '⏳ Payment Pending'}
            </span>
            {order.payment_id && (
              <span style={{ fontSize: 11, color: '#9CA3AF', wordBreak: 'break-all' }}>
                ID: {order.payment_id}
              </span>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default Orders;