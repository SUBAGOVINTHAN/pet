import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const PET_TYPES = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'other'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDesktop,  setIsDesktop]  = useState(window.innerWidth > 768);
  const [showFilter, setShowFilter] = useState(window.innerWidth > 768);

  // ── Price range kept in local state; applied via "Apply" or Enter ──────────
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  const page     = parseInt(searchParams.get('page')     || '1');
  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const pet_type = searchParams.get('pet_type') || '';
  const sort     = searchParams.get('sort')     || 'newest';
  const featured = searchParams.get('featured') || '';

  // ── Load categories once ──────────────────────────────────────────────────
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  // ── Track desktop vs mobile reactively ─────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      // When resizing to desktop, always show sidebar
      if (desktop) setShowFilter(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Fetch products whenever searchParams change ───────────────────────────
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12, sort });
    if (search)   params.set('search',    search);
    if (category) params.set('category',  category);
    if (pet_type) params.set('pet_type',  pet_type);
    if (featured) params.set('featured',  featured);

    // Read price directly from searchParams so API call is always in sync
    const spMin = searchParams.get('min_price');
    const spMax = searchParams.get('max_price');
    if (spMin) params.set('min_price', spMin);
    if (spMax) params.set('max_price', spMax);

    api.get(`/products?${params}`)
      .then(r => {
        setProducts(r.data.products);
        setTotal(r.data.total);
        setTotalPages(r.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [searchParams]); // single dependency — searchParams covers everything

  // ── Helper: update a single param, reset to page 1 ───────────────────────
  const setParam = useCallback((key, val) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (val) p.set(key, val); else p.delete(key);
      p.set('page', '1');
      return p;
    });
  }, [setSearchParams]);

  // ── Toggle: clicking the active value deselects it ────────────────────────
  const toggleParam = useCallback((key, val) => {
    setSearchParams(prev => {
      const p   = new URLSearchParams(prev);
      const cur = p.get(key);
      if (cur === val) p.delete(key); else p.set(key, val);
      p.set('page', '1');
      return p;
    });
  }, [setSearchParams]);

  // ── Apply price range to searchParams (triggers fetch) ───────────────────
  const applyPrice = useCallback(() => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (minPrice) p.set('min_price', minPrice); else p.delete('min_price');
      if (maxPrice) p.set('max_price', maxPrice); else p.delete('max_price');
      p.set('page', '1');
      return p;
    });
  }, [minPrice, maxPrice, setSearchParams]);

  // ── Clear all filters (keep featured if present) ──────────────────────────
  const clearAll = useCallback(() => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams(prev => {
      const p = new URLSearchParams();
      // preserve featured so the page context isn't lost
      if (prev.get('featured')) p.set('featured', prev.get('featured'));
      return p;
    });
  }, [setSearchParams]);

  // ── Sync local price inputs when searchParams change externally ───────────
  useEffect(() => {
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
  }, [searchParams]);

  return (
    <div className="container section" style={{ paddingTop: 32 }}>
      <div style={{ display: 'flex', gap: 32 }}>

        {/* ── Sidebar Filters ── */}
        <aside style={{
          width: 240, flexShrink: 0,
          display: showFilter ? 'block' : 'none',
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 20,
            border: '1px solid #eee', position: 'sticky', top: 90,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>Filters</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={clearAll} style={{ fontSize: 12, color: '#F97316', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Clear All
                </button>
                {!isDesktop && (
                  <button onClick={() => setShowFilter(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#555' }}>CATEGORIES</h4>
              {categories.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="radio"
                    name="cat"
                    checked={category === c.slug}
                    onChange={() => toggleParam('category', c.slug)}  // ✅ toggle on/off
                  />
                  {c.name}
                </label>
              ))}
            </div>

            {/* Pet Type */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#555' }}>PET TYPE</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PET_TYPES.map(t => (
                  <button key={t}
                    onClick={() => toggleParam('pet_type', t)}       // ✅ toggle on/off
                    style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: '1.5px solid',
                      borderColor:  pet_type === t ? '#F97316' : '#ddd',
                      background:   pet_type === t ? '#FFF7F0' : '#fff',
                      color:        pet_type === t ? '#F97316' : '#555',
                      cursor: 'pointer', textTransform: 'capitalize',
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#555' }}>PRICE RANGE</h4>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className="input"
                  placeholder="Min"
                  value={minPrice}
                  type="number"
                  min={0}
                  onChange={e => setMinPrice(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyPrice()} // ✅ Enter to apply
                  style={{ padding: '6px 10px', fontSize: 13 }}
                />
                <input
                  className="input"
                  placeholder="Max"
                  value={maxPrice}
                  type="number"
                  min={0}
                  onChange={e => setMaxPrice(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyPrice()} // ✅ Enter to apply
                  style={{ padding: '6px 10px', fontSize: 13 }}
                />
              </div>
              {/* ✅ Explicit Apply button — price now actually triggers a fetch */}
              <button
                onClick={applyPrice}
                style={{
                  width: '100%', padding: '7px 0', borderRadius: 8, fontSize: 13,
                  fontWeight: 600, background: '#F97316', color: '#fff',
                  border: 'none', cursor: 'pointer',
                }}>
                Apply Price
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 22 }}>
                {search   ? `Results for "${search}"` :
                 featured ? 'Featured Products'        :
                 pet_type ? `${pet_type} Products`     : 'All Products'}
              </h1>
              <p style={{ color: '#9CA3AF', fontSize: 13 }}>{total} products found</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select className="input" value={sort} onChange={e => setParam('sort', e.target.value)}
                style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                className="btn btn-sm"
                onClick={() => setShowFilter(v => !v)}
                style={{
                  border: '1.5px solid',
                  borderColor: showFilter ? '#F97316' : '#ddd',
                  background:  showFilter ? '#FFF7F0' : '#fff',
                  color:       showFilter ? '#F97316' : '#555',
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                  fontWeight: 600, fontSize: 13,
                }}>
                <Filter size={14} /> {showFilter ? 'Hide Filters' : 'Filters'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 64 }}>🐾</div>
              <h3 style={{ marginTop: 16, color: '#555' }}>No products found</h3>
              <button onClick={clearAll} className="btn btn-primary" style={{ marginTop: 16 }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setParam('page', p)}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: '1.5px solid',
                        borderColor: page === p ? '#F97316' : '#ddd',
                        background:  page === p ? '#F97316' : '#fff',
                        color:       page === p ? '#fff'    : '#555',
                        fontWeight: 600, cursor: 'pointer',
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}