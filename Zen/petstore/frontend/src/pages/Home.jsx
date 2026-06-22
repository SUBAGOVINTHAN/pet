import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RefreshCw, Phone } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import banner from '../assets/banner.jpg';
import promoBanner from '../assets/section2.jpg';
import bannerMobile from '../assets/banner_mobile.png';

const FEATURES = [
  { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: <Shield size={24} />, title: '100% Authentic', desc: 'Trusted pet products' },
  { icon: <RefreshCw size={24} />, title: 'Easy Returns', desc: 'As per terms & conditions' },
  { icon: <Phone size={24} />, title: 'Support', desc: 'Always here for you' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/products?featured=true&limit=50'),
      api.get('/categories')
    ]).then(([prod, cats]) => {
      setFeatured(prod.data.products);
      const desiredOrder = ['Pets', 'Aquarium', 'Pet Foods', 'Grooming', 'Health & Wellness', 'Pet Accessories'];
      const sortedCategories = cats.data.sort((a, b) =>
        desiredOrder.indexOf(a.name) - desiredOrder.indexOf(b.name)
      );
      setCategories(sortedCategories);
    }).finally(() => setLoading(false));
  }, []);

  return (
    // ✅ FIX: NO overflowX here — App.jsx <main> handles it now.
    // Having overflow:hidden on a child div causes content shift on scroll on mobile.
    <div>

      {/* ── Hero Banner ── */}
      <section style={{ position: 'relative', background: '#FFF7F0' }}>
  {isMobile ? (
  <>
    <div style={{ position: 'relative' }}>
      <img
        src={bannerMobile}
        alt="Pet Store Banner"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: 'contain',  // ✅ full image show aagum
          background: '#FFF7F0'
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <Link
          to="/products"
          className="btn btn-primary"
          style={{ fontSize: 14, padding: '10px 28px', whiteSpace: 'nowrap' }}
        >
          Shop Now <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} />
        </Link>
      </div>
    </div>
  </>
        ) : (
          <>
            <img
              src={banner}
              alt="Pet Store Banner"
              style={{ width: '100%', height: '650px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, rgba(255,247,240,0.3) 0%, transparent 60%)'
            }} />
          </>
        )}
      </section>

      {/* ── Features Bar ── */}
      <section style={{ background: '#F97316', padding: isMobile ? '14px 0' : '20px 0' }}>
        {/* ✅ plain div — no .container class that can override padding */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 12 : 16,
          padding: isMobile ? '0 16px' : '0 24px',
          maxWidth: 1200,
          margin: '0 auto'
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <div style={{ opacity: 0.9, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: isMobile ? 12 : 14 }}>{f.title}</div>
                <div style={{ fontSize: isMobile ? 10 : 12, opacity: 0.85 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section style={{ background: '#FFF7F0', paddingTop: 32, paddingBottom: 32 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
            <h2 className="section-title">Pet Essentials by <span>Category</span></h2>
            <p className="section-subtitle">Everything your pet needs in one place</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: isMobile ? 10 : 16
            }}>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  style={{
                    background: '#F97316', color: '#ffffff', borderRadius: 10,
                    padding: isMobile ? '14px 8px' : '22px 18px',
                    textAlign: 'center', border: 'none', transition: 'all 0.3s',
                    fontWeight: 600, fontSize: isMobile ? 12 : 16.5,
                    minHeight: '52px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    whiteSpace: 'normal', lineHeight: 1.3, wordBreak: 'break-word',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EA580C'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F97316'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Promo Banner ── */}
      <section style={{ padding: 0, lineHeight: 0 }}>
        <img
          src={promoBanner}
          alt="Dot Pet Foods Promotion"
          style={{
            width: '100%',
            height: isMobile ? 'auto' : '680px',
            objectFit: isMobile ? 'contain' : 'cover',
            objectPosition: 'center 40%',
            display: 'block',
            background: '#1a0a00'
          }}
        />
      </section>

      {/* ── Featured Products ── */}
      <section className="section">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 8
          }}>
            <h2 className="section-title" style={{ marginBottom: 0, fontSize: isMobile ? 20 : undefined }}>
              Featured <span>Products</span>
            </h2>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: isMobile ? 12 : undefined }}>
              View All <ArrowRight size={isMobile ? 5 : 14} />
            </Link>
          </div>
          <p className="section-subtitle">Handpicked favourites loved by pet owners</p>
          {loading ? <div className="spinner" /> : (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1C1C1C 0%, #333 100%)',
        padding: isMobile ? '40px 16px' : '60px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 0 : '0 24px' }}>
          <h2 style={{ color: '#fff', fontSize: isMobile ? 22 : 32, fontWeight: 800, marginBottom: 12 }}>
            Use Code <span style={{ color: '#F97316' }}>WELCOME10</span> for 10% Off!
          </h2>
          <p style={{ color: '#aaa', marginBottom: 28, fontSize: isMobile ? 14 : 16 }}>
            On your first order above ₹500
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}