import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import { Package, ArrowLeft } from 'lucide-react';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  if (!orders.length) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <Package size={80} color="#F97316" style={{ margin: '0 auto 20px', display: 'block', opacity: 0.3 }} />
      <h2>No orders yet</h2>
      <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Start Shopping</Link>
    </div>
  );

  return (
    <div className="container section" style={{ paddingTop: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 28 }}>My Orders</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {orders.map(order => (
          <div key={order.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{order.order_number}</p>
                <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {order.product_names && (
                  <p style={{ fontSize: 13, color: '#555', marginTop: 6 }}>{order.product_names.substring(0, 60)}...</p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status-pill status-${order.status}`}>{order.status}</span>
                <p style={{ fontWeight: 700, fontSize: 18, marginTop: 6, color: '#F97316' }}>
                  ₹{parseFloat(order.total_amount).toLocaleString()}
                </p>
                <Link to={`/orders/${order.id}`} style={{ fontSize: 13, color: '#F97316', fontWeight: 600, display: 'block', marginTop: 8 }}>
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!order) return <div style={{ textAlign: 'center', padding: 60 }}>Order not found</div>;

  const totalAmount    = parseFloat(order.total_amount    || 0);
  const shippingAmount = parseFloat(order.shipping_amount || 0);
  const taxAmount      = parseFloat(order.tax_amount      || 0);
  const discountAmount = parseFloat(order.discount_amount || 0);
  const subtotal       = totalAmount - shippingAmount - taxAmount + discountAmount;

  const priceRows = [
    ['Subtotal', `₹${subtotal.toFixed(2)}`],
    ['Shipping', shippingAmount > 0 ? `₹${shippingAmount.toFixed(2)}` : 'FREE'],
    ['GST',      `₹${taxAmount.toFixed(2)}`],
    ...(discountAmount > 0 ? [['Discount', `-₹${discountAmount.toFixed(2)}`]] : []),
  ];

  return (
    <div className="container section" style={{ paddingTop: 32, maxWidth: 720 }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#F97316', fontWeight: 600, fontSize: 14, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="card" style={{ padding: 28 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 20 }}>{order.order_number}</h2>
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>
              {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          </div>
          <span className={`status-pill status-${order.status}`} style={{ fontSize: 14, padding: '6px 16px' }}>
            {order.status}
          </span>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {order.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <img
                src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`) : 'https://via.placeholder.com/60'}
                alt={item.name}
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                onError={e => e.target.src = 'https://via.placeholder.com/60'}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600 }}>{item.name}</p>
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>Qty: {item.quantity}</p>
              </div>
              <p style={{ fontWeight: 700 }}>₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        <div style={{ background: '#FFF7F0', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 10 }}>Shipping Address</h4>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>
            {order.shipping_name}<br />
            {order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}<br />
            📞 {order.shipping_phone}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, borderTop: '2px solid #eee', paddingTop: 10, marginTop: 4 }}>
            <span>Total</span>
            <span style={{ color: '#F97316' }}>₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;