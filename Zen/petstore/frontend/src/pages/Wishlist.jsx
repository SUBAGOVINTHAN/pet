import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Heart, ImageOff } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

// ── Image URL helper ──
const resolveImage = (imgPath) => {
  if (!imgPath) return null;
  if (imgPath.startsWith('http') || imgPath.startsWith('blob')) return imgPath;
  const clean = imgPath.startsWith('/') ? imgPath : '/' + imgPath;
  return `http://localhost:5000${clean}`;
};

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = () => {
    api.get('/wishlist').then(r => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const remove = async (product_id) => {
    await api.delete(`/wishlist/${product_id}`);
    toast.success('Removed from wishlist');
    fetchWishlist();
  };

  if (loading) return <div className="spinner" />;

  if (!items.length) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <Heart size={80} color="#F97316" style={{ margin: '0 auto 20px', display: 'block', opacity: 0.3 }} />
      <h2>Your wishlist is empty</h2>
      <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Products</Link>
    </div>
  );

  return (
    <div className="container section" style={{ paddingTop: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 28 }}>
        My Wishlist <span style={{ color: '#9CA3AF', fontSize: 18 }}>({items.length})</span>
      </h1>

      <div className="products-grid">
        {items.map(item => {
          const imageUrl = resolveImage(item.image);
          return (
            <div key={item.id} className="card" style={{ overflow: 'hidden' }}>

              {/* ── Image ── */}
              <Link to={`/products/${item.slug || item.product_id}`}>
                {imageUrl ? (
                  <div style={{
                    width: '100%',
                    height: 200,
                    backgroundColor: '#FFFFFF',
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }} />
                ) : (
                  <div style={{
                    width: '100%', height: 200, background: '#FFF7F0',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ImageOff size={40} color="#F97316" style={{ opacity: 0.4 }} />
                    <p style={{ fontSize: 12, marginTop: 8, color: '#9CA3AF' }}>No image</p>
                  </div>
                )}
              </Link>

              {/* ── Info ── */}
              <div style={{ padding: 16 }}>
                <Link to={`/products/${item.slug || item.product_id}`}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: '#1C1C1C' }}>
                    {item.name}
                  </h3>
                </Link>
                <p style={{ fontWeight: 700, color: '#F97316', fontSize: 18, marginBottom: 12 }}>
                  ₹{(item.discount_price || item.price).toLocaleString()}
                  {item.discount_price && (
                    <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 6 }}>
                      ₹{item.price.toLocaleString()}
                    </span>
                  )}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => addToCart(item.product_id)}
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                  <button
                    onClick={() => remove(item.product_id)}
                    style={{ padding: '6px 10px', background: '#FEE2E2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#EF4444' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}