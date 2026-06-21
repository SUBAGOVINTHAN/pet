import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ImageOff } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { resolveImage } from '../utils/resolveImage';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const imageUrl = resolveImage(product.image);
  const [inWishlist, setInWishlist] = useState(false);

  const discount = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null;

  // ── Page load-ல் wishlist check ──
  useEffect(() => {
    if (!user) return;
    api.get('/wishlist').then(r => {
      const ids = r.data.map(w => w.product_id);
      setInWishlist(ids.includes(product.id));
    }).catch(() => {});
  }, [user, product.id]);

  // ── Toggle wishlist ──
  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login first'); return; }

    if (inWishlist) {
      try {
        await api.delete(`/wishlist/${product.id}`);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } catch { toast.error('Failed to remove'); }
    } else {
      try {
        await api.post('/wishlist', { product_id: product.id });
        setInWishlist(true);
        toast.success('Added to wishlist!');
      } catch { toast.error('Failed to add'); }
    }
  };

  return (
    <div
      className="card"
      style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(249,115,22,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <Link to={`/products/${product.slug}`} style={{ display: 'block', position: 'relative' }}>

        {/* ── Image ── */}
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
            alignItems: 'center', justifyContent: 'center', color: '#F97316'
          }}>
            <ImageOff size={40} style={{ opacity: 0.4 }} />
            <p style={{ fontSize: 12, marginTop: 8, color: '#9CA3AF' }}>No image</p>
          </div>
        )}

        {/* ── Discount badge ── */}
        {discount && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: '#F97316', color: '#fff',
            borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700
          }}>
            -{discount}%
          </span>
        )}

        {/* ── Wishlist button ── */}
        <button
          onClick={toggleWishlist}
          style={{
            position: 'absolute', top: 10, right: 10,
            background: inWishlist ? '#FEE2E2' : 'rgba(255,255,255,0.9)',
            border: 'none', borderRadius: '50%',
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: inWishlist ? '#EF4444' : '#F97316',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <Heart size={16} fill={inWishlist ? '#EF4444' : 'none'} />
        </button>
      </Link>

      {/* ── Card Info ── */}
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 11, color: '#F97316', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
          {product.category_name || product.pet_type}
        </p>

        <Link to={`/products/${product.slug}`}>
          <h3 style={{
            fontSize: 15, fontWeight: 600, marginBottom: 8,
            lineHeight: 1.4, color: '#1C1C1C',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {product.name}
          </h3>
        </Link>

        {/* ── Stars ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={12} fill={i <= Math.round(product.rating || 0) ? '#F59E0B' : 'none'} color="#F59E0B" />
          ))}
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>({product.reviews_count || 0})</span>
        </div>

        {/* ── Price + Add button ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
           <span style={{ fontWeight: 700, fontSize: 18, color: '#1C1C1C' }}>
            <span style={{ fontFamily: 'Arial, sans-serif' }}>₹</span>
            {(product.discount_price || product.price).toLocaleString()}
          </span>
            {product.discount_price && (
              <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 6 }}>
              <span style={{ fontFamily: 'Arial, sans-serif' }}>₹</span>
              {product.price.toLocaleString()}
            </span>
            )}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.preventDefault(); addToCart(product.id); }}
            disabled={product.stock === 0}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            {product.stock === 0 ? 'Out of Stock' : <><ShoppingCart size={14} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}