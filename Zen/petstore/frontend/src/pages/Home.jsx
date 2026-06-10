import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RefreshCw, Phone } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import banner from '../assets/banner.jpg';
import promoBanner from '../assets/section2.jpg';

const FEATURES = [
  { icon: <Truck size={28} />, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: <Shield size={28} />, title: '100% Authentic', desc: 'Trusted pet products' },
  { icon: <RefreshCw size={28} />, title: 'Easy Returns', desc: 'As per terms & conditions' },
  { icon: <Phone size={28} />, title: 'Support', desc: 'Always here for you' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?featured=true&limit=8'),
      api.get('/categories')
    ]).then(([prod, cats]) => {
      setFeatured(prod.data.products);
      const desiredOrder = ['Pets', 'Aquarium', 'Pet Foods', 'Grooming', 'Health & Wellness', 'Pet Accessories'];
      const sortedCategories = cats.data.sort((a, b) => {
        return desiredOrder.indexOf(a.name) - desiredOrder.indexOf(b.name);
      });
      setCategories(sortedCategories);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#FFF7F0' }}>
        <img src={banner} alt="Pet Store Banner" style={{ width: '100%', height: '650px', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,247,240,0.3) 0%, transparent 60%)' }} />
      </section>

      {/* Features bar */}
      <section style={{ background: '#F97316', padding: '20px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
              <div style={{ opacity: 0.9 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{f.title}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section" style={{ background: '#FFF7F0', paddingTop: 48, paddingBottom: 48 }}>
          <div className="container">
            <h2 className="section-title">Pet Essentials by <span>Category</span></h2>
            <p className="section-subtitle">Everything your pet needs in one place</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  style={{
                    background: '#F97316', color: '#ffffff', borderRadius: 12,
                    padding: '22px 18px', textAlign: 'center', border: 'none',
                    transition: 'all 0.3s', fontWeight: 600, fontSize: 16.5,
                    minHeight: '64px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EA580C'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F97316'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

     
     
      {/* ── Promo Banner Image ── */}
        <section style={{ padding: '0', lineHeight: 0 }}>
          <img
            src={promoBanner}
            alt="Dot Pet Foods Promotion"
            style={{ 
              width: '100%',
              height: '680px',
              objectFit: 'cover',
              objectPosition: 'center 40%',
              display: 'block'
            }}
          />
        </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Featured <span>Products</span></h2>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              View All <ArrowRight size={14} />
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

      {/* CTA Banner */}
      <section style={{ background: 'linear-gradient(135deg, #1C1C1C 0%, #333 100%)', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Use Code <span style={{ color: '#F97316' }}>WELCOME10</span> for 10% Off!
          </h2>
          <p style={{ color: '#aaa', marginBottom: 28, fontSize: 16 }}>On your first order above ₹500</p>
          <Link to="/products" className="btn btn-primary btn-lg">Shop Now <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}