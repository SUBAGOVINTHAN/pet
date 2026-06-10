import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart();

  if (loading) return <div className="spinner" />;

  if (cartItems.length === 0) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <ShoppingBag size={80} color="#F97316" style={{ margin: '0 auto 20px', display: 'block', opacity: 0.4 }} />
      <h2 style={{ marginBottom: 12 }}>Your cart is empty</h2>
      <p style={{ color: '#9CA3AF', marginBottom: 24 }}>Add some products to get started</p>
      <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
    </div>
  );

  // Cart doesn't know delivery state yet — show ₹99 as estimate
  const shipping = 99;
  const tax = cartTotal * 0.18;
  const grand = cartTotal + shipping + tax;

  return (
    <div className="container section" style={{ paddingTop: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 32 }}>
        My Cart <span style={{ color: '#9CA3AF', fontSize: 18 }}>({cartItems.length} items)</span>
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cartItems.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'center' }}>
              <div style={{
                width: 90, height: 90, borderRadius: 10, flexShrink: 0,
                backgroundColor: '#FFFFFF',
                backgroundImage: item.image
                  ? `url(${item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image.startsWith('/') ? item.image : '/' + item.image}`})`
                  : 'none',
                backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center', border: '1px solid #f3f4f6',
              }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{item.name}</h3>
                <p style={{ color: '#F97316', fontWeight: 700 }}>₹{(item.discount_price || item.price).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: 8 }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ padding: '0 12px', fontWeight: 700 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Plus size={14} />
                  </button>
                </div>
                <span style={{ fontWeight: 700, width: 80, textAlign: 'right' }}>
                  ₹{((item.discount_price || item.price) * item.quantity).toLocaleString()}
                </span>
                <button onClick={() => removeFromCart(item.id)}
                  style={{ padding: 8, color: '#EF4444', background: '#FEE2E2', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 90 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>Shipping</span>
                <span style={{ fontWeight: 600, color: '#1C1C1C' }}>₹{shipping} <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(est.)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>Tax (18% GST)</span>
                <span style={{ fontWeight: 600 }}>₹{tax.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1.5px dashed #eee', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
                <span>Total</span>
                <span style={{ color: '#F97316' }}>₹{grand.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping info banner */}
            <div style={{ fontSize: 12, background: '#FFF7F0', border: '1px solid #FED7AA', borderRadius: 8, padding: '8px 12px', marginBottom: 16, lineHeight: 1.6 }}>
              🐾 <strong>Tamil Nadu</strong> deliveries: <span style={{ color: '#10B981', fontWeight: 700 }}>FREE shipping!</span><br />
              📦 Other states: <strong>₹99</strong> flat rate.<br />
              <span style={{ color: '#9CA3AF' }}>Exact shipping shown at checkout.</span>
            </div>

            <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#F97316', fontSize: 13, fontWeight: 600 }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}