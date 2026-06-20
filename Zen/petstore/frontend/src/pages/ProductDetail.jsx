import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Minus, Plus, ArrowLeft, Package, Truck, X, ZoomIn } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { resolveImage } from '../utils/resolveImage';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    api.get(`/products/${slug}`).then(r => setProduct(r.data)).finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => addToCart(product.id, qty);

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login first'); return; }
    try { await api.post('/wishlist', { product_id: product.id }); toast.success('Added to wishlist!'); }
    catch { toast.error('Already in wishlist'); }
  };

  const submitReview = async () => {
    if (!user) { toast.error('Please login first'); return; }
    setSubmitting(true);
    try {
      await api.post(`/products/${product.id}/review`, review);
      toast.success('Review submitted!');
      const r = await api.get(`/products/${slug}`);
      setProduct(r.data);
    } catch { toast.error('Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="spinner" />;
  if (!product) return <div style={{ textAlign: 'center', padding: 60 }}>Product not found</div>;

  const price = product.discount_price || product.price;
  const discount = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null;

  const imageUrl = resolveImage(product.image);

  // Build full images array: main + extras
  const allImages = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(Boolean).map(resolveImage);

  const currentImage = allImages[activeImg] || imageUrl;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>

      {/* Back link */}
      <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#F97316', fontWeight: 600, fontSize: 14, marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Products
      </Link>

      {/* Main grid — image + info side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 36, alignItems: 'start', marginBottom: 36 }}>

        {/* ── Image Gallery ── */}
        <div>
          {/* Main Image */}
          <div
            onClick={() => currentImage && setLightbox(true)}
            style={{
              borderRadius: 14, border: '1px solid #eee',
              background: '#fff', width: '100%', height: 380,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'zoom-in', position: 'relative', overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{ color: '#ccc', fontSize: 14 }}>No image</div>
            )}
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.4)', borderRadius: 6,
              padding: '3px 8px', display: 'flex', alignItems: 'center',
              gap: 4, color: '#fff', fontSize: 11
            }}>
              <ZoomIn size={12} /> Zoom
            </div>
          </div>

          {/* Thumbnails — only show if more than 1 image */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {allImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: 72, height: 72, borderRadius: 10,
                    border: `2px solid ${activeImg === i ? '#F97316' : '#eee'}`,
                    overflow: 'hidden', cursor: 'pointer',
                    flexShrink: 0, background: '#fff',
                    padding: 3, boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div style={{ paddingTop: 4 }}>

          {/* Category badge */}
          <span style={{ background: '#FFF7F0', color: '#F97316', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
            {product.category_name} • {product.pet_type}
          </span>

          {/* Name */}
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '10px 0 8px', lineHeight: 1.3 }}>{product.name}</h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={15} fill={i <= Math.round(parseFloat(product.rating) || 0) ? '#F59E0B' : 'none'} color="#F59E0B" />
              ))}
            </div>
            <span style={{ color: '#6B7280', fontSize: 13 }}>
              {parseFloat(product.rating || 0).toFixed(1)} ({product.reviews_count || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#1C1C1C' }}>
              ₹{parseFloat(price).toLocaleString()}
            </span>
            {product.discount_price && (
              <>
                <span style={{ fontSize: 16, color: '#9CA3AF', textDecoration: 'line-through' }}>
                  ₹{parseFloat(product.price).toLocaleString()}
                </span>
                <span style={{ background: '#F97316', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p style={{ color: '#555', lineHeight: 1.7, fontSize: 14, marginBottom: 16 }}>{product.description}</p>

          {/* Stock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <Package size={14} color="#F97316" />
            <span style={{ fontSize: 13, color: product.stock > 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Qty + Actions */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '8px 12px', background: '#f9f9f9', border: 'none', cursor: 'pointer' }}><Minus size={13} /></button>
                <span style={{ padding: '0 16px', fontWeight: 700, fontSize: 15 }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ padding: '8px 12px', background: '#f9f9f9', border: 'none', cursor: 'pointer' }}><Plus size={13} /></button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{ padding: '8px 24px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <ShoppingCart size={17} /> Add to Cart
            </button>
            <button className="btn btn-outline" onClick={handleWishlist} style={{ padding: '8px 12px' }}>
              <Heart size={17} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: 12, fontWeight: 600 }}>
            <Truck size={14} /> Free delivery on orders above ₹999
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: 20, cursor: 'zoom-out'
          }}
        >
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '50%', width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff'
            }}
          >
            <X size={18} />
          </button>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 14, padding: 20,
              maxWidth: '88vw', maxHeight: '88vh',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <img
              src={currentImage}
              alt={product.name}
              style={{ maxWidth: '78vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: 8, display: 'block' }}
              onError={e => e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'}
            />
          </div>
        </div>
      )}

      {/* ── Reviews ── */}
      <div style={{ background: '#FFF7F0', borderRadius: 14, padding: 28 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Customer Reviews</h2>

        {user && (
          <div style={{ background: '#fff', borderRadius: 10, padding: 18, marginBottom: 24, border: '1px solid #eee' }}>
            <h4 style={{ marginBottom: 10, fontSize: 15 }}>Write a Review</h4>
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setReview(r => ({ ...r, rating: i }))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Star size={22} fill={i <= review.rating ? '#F59E0B' : 'none'} color="#F59E0B" />
                </button>
              ))}
            </div>
            <textarea
              className="input" rows={3}
              placeholder="Share your experience..."
              value={review.comment}
              onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
              style={{ resize: 'vertical', marginBottom: 10, fontSize: 14 }}
            />
            <button className="btn btn-primary" onClick={submitReview} disabled={submitting} style={{ fontSize: 14 }}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {product.reviews?.length === 0 ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 28, fontSize: 14 }}>No reviews yet. Be the first to review!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(product.reviews || []).map(r => (
              <div key={r.id} style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.user_name}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={13} fill={i <= r.rating ? '#F59E0B' : 'none'} color="#F59E0B" />)}
                </div>
                <p style={{ fontSize: 13, color: '#555' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}