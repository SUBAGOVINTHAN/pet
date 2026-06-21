import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { resolveImage } from '../utils/resolveImage';

const Rs = () => <span style={{ fontFamily: 'Arial, sans-serif' }}>₹</span>;

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

  const shipping = 99;
  const tax = cartTotal * 0.18;
  const grand = cartTotal + shipping + tax;

  return (
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      padding: '24px 16px',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <h1 style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>
        My Cart <span style={{ color: '#9CA3AF', fontSize: 15 }}>({cartItems.length} items)</span>
      </h1>

      <div className="cart-layout">

        {/* ── Items List ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cartItems.map(item => (
            <div key={item.id} style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #f3f4f6',
              padding: 14,
              boxSizing: 'border-box',
              width: '100%',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>

              {/* Row 1: Image + Name/Price + Delete */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

                {/* Image */}
                <div style={{
                  width: 68, height: 68,
                  borderRadius: 8, flexShrink: 0,
                  backgroundColor: '#fafafa',
                  backgroundImage: resolveImage(item.image) ? `url(${resolveImage(item.image)})` : 'none',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  border: '1px solid #f3f4f6',
                }} />

                {/* Name + Price */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontWeight: 600, fontSize: 14,
                    marginBottom: 4, lineHeight: 1.3,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'break-word',
                  }}>
                    {item.name}
                  </h3>
                  <p style={{ color: '#F97316', fontWeight: 700, fontSize: 14, margin: 0 }}>
                    <Rs />{(item.discount_price || item.price).toLocaleString()}
                  </p>
                  <p style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2, marginBottom: 0 }}>per unit</p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    flexShrink: 0,
                    padding: 7,
                    color: '#EF4444',
                    background: '#FEE2E2',
                    border: 'none',
                    borderRadius: 7,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Row 2: Qty controls + Line total */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 12,
              }}>
                {/* Qty stepper */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      width: 34, height: 34,
                      background: 'none', border: 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#555',
                    }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{
                    minWidth: 32, textAlign: 'center',
                    fontWeight: 700, fontSize: 14,
                    borderLeft: '1px solid #e5e7eb',
                    borderRight: '1px solid #e5e7eb',
                    padding: '0 4px', lineHeight: '34px',
                  }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    style={{
                      width: 34, height: 34,
                      background: 'none', border: 'none',
                      cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer',
                      opacity: item.quantity >= item.stock ? 0.4 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#555',
                    }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Line total */}
                <span style={{ fontWeight: 700, fontSize: 15, color: '#111', flexShrink: 0 }}>
                  <Rs />{((item.discount_price || item.price) * item.quantity).toLocaleString()}
                </span>
              </div>

            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="cart-summary-wrapper">
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            padding: 20,
          }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 18 }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 16 }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}><Rs />{cartTotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>Shipping</span>
                <span style={{ fontWeight: 600 }}>
                  <Rs />{shipping} <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(est.)</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>Tax (18% GST)</span>
                <span style={{ fontWeight: 600 }}><Rs />{tax.toFixed(2)}</span>
              </div>

              <div style={{
                borderTop: '1.5px dashed #e5e7eb',
                paddingTop: 12,
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700, fontSize: 17,
              }}>
                <span>Total</span>
                <span style={{ color: '#F97316' }}><Rs />{grand.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping info banner */}
            <div style={{
              fontSize: 12,
              background: '#FFF7F0',
              border: '1px solid #FED7AA',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 16,
              lineHeight: 1.7,
            }}>
              🐾 <strong>Tamil Nadu</strong> deliveries:{' '}
              <span style={{ color: '#10B981', fontWeight: 700 }}>FREE shipping!</span><br />
              📦 Other states: <strong><Rs />99</strong> flat rate.<br />
              <span style={{ color: '#9CA3AF' }}>Exact shipping shown at checkout.</span>
            </div>

            <Link
              to="/checkout"
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                padding: '13px',
                boxSizing: 'border-box',
              }}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <Link
              to="/products"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: 12,
                color: '#F97316',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>

      <style>{`
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          align-items: start;
        }
        .cart-summary-wrapper > div {
          position: sticky;
          top: 90px;
        }
        @media (max-width: 768px) {
          .cart-layout {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .cart-summary-wrapper > div {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}