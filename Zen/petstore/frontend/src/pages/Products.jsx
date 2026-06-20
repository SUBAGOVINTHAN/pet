import { useState, useEffect, useCallback } from 'react';
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

  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  const page     = parseInt(searchParams.get('page')     || '1');
  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const pet_type = searchParams.get('pet_type') || '';
  const sort     = searchParams.get('sort')     || 'newest';
  const featured = searchParams.get('featured') || '';

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (desktop) setShowFilter(true);
      else setShowFilter(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12, sort });
    if (search)   params.set('search',   search);
    if (category) params.set('category', category);
    if (pet_type) params.set('pet_type', pet_type);
    if (featured) params.set('featured', featured);
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
  }, [searchParams]);

  const setParam = useCallback((key, val) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (val) p.set(key, val); else p.delete(key);
      p.set('page', '1');
      return p;
    });
  }, [setSearchParams]);

  const toggleParam = useCallback((key, val) => {
    setSearchParams(prev => {
      const p   = new URLSearchParams(prev);
      const cur = p.get(key);
      if (cur === val) p.delete(key); else p.set(key, val);
      p.set('page', '1');
      return p;
    });
  }, [setSearchParams]);

  const applyPrice = useCallback(() => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (minPrice) p.set('min_price', minPrice); else p.delete('min_price');
      if (maxPrice) p.set('max_price', maxPrice); else p.delete('max_price');
      p.set('page', '1');
      return p;
    });
  }, [minPrice, maxPrice, setSearchParams]);

  const clearAll = useCallback(() => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams(prev => {
      const p = new URLSearchParams();
      if (prev.get('featured')) p.set('featured', prev.get('featured'));
      return p;
    });
  }, [setSearchParams]);

  useEffect(() => {
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
  }, [searchParams]);

  // Filter panel content — shared between sidebar and drawer
  const FilterPanel = () => (
    <div style={{
      background: '#fff', borderRadius: isDesktop ? 12 : 0,
      padding: 20, border: isDesktop ? '1px solid #eee' : 'none',
      position: isDesktop ? 'sticky' : 'static', top: 90,
      height: isDesktop ? 'auto' : '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16 }}>Filters</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={clearAll} style={{ fontSize: 12, color: '#F97316', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Clear All
          </button>
          {!isDesktop && (
            <button onClick={() => setShowFilter(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: '#888', letterSpacing: 1 }}>CATEGORIES</h4>
        {categories.map(c => (
          <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="radio"
              name="cat"
              checked={category === c.slug}
              onChange={() => toggleParam('category', c.slug)}
            />
            {c.name}
          </label>
        ))}
      </div>

      {/* Pet Type */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: '#888', letterSpacing: 1 }}>PET TYPE</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PET_TYPES.map(t => (
            <button key={t}
              onClick={() => toggleParam('pet_type', t)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: '1.5px solid',
                borderColor: pet_type === t ? '#F97316' : '#ddd',
                background:  pet_type === t ? '#FFF7F0' : '#fff',
                color:       pet_type === t ? '#F97316' : '#555',
                cursor: 'pointer', textTransform: 'capitalize',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: '#888', letterSpacing: 1 }}>PRICE RANGE</h4>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            className="input"
            placeholder="Min"
            value={minPrice}
            type="number"
            min={0}
            onChange={e => setMinPrice(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyPrice()}
            style={{ padding: '6px 10px', fontSize: 13 }}
          />
          <input
            className="input"
            placeholder="Max"
            value={maxPrice}
            type="number"
            min={0}
            onChange={e => setMaxPrice(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyPrice()}
            style={{ padding: '6px 10px', fontSize: 13 }}
          />
        </div>
        <button
          onClick={applyPrice}
          style={{
            width: '100%', padding: '8px 0', borderRadius: 8, fontSize: 13,
            fontWeight: 600, background: '#F97316', color: '#fff',
            border: 'none', cursor: 'pointer',
          }}>
          Apply Price
        </button>
      </div>
    </div>
  );

  return (
    <div className="container section" style={{ paddingTop: 32 }}>

      {/* ── Mobile Filter Drawer (overlay) ── */}
      {!isDesktop && showFilter && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowFilter(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
              zIndex: 400,
            }}
          />
          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: 280, background: '#fff',
            zIndex: 500, overflowY: 'auto',
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            padding: 0,
          }}>
            <FilterPanel />
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 28 }}>

        {/* ── Desktop Sidebar ── */}
        {isDesktop && showFilter && (
          <aside style={{ width: 240, flexShrink: 0 }}>
            <FilterPanel />
          </aside>
        )}

        {/* ── Main Content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header row */}
          <div style={{ marginBottom: 20 }}>
            {/* Title + count */}
            <div style={{ marginBottom: 12 }}>
              <h1 style={{ fontWeight: 700, fontSize: isDesktop ? 22 : 18, margin: 0 }}>
                {search   ? `Results for "${search}"` :
                 featured ? 'Featured Products'        :
                 pet_type ? `${pet_type} Products`     : 'All Products'}
              </h1>
              <p style={{ color: '#9CA3AF', fontSize: 13, margin: '4px 0 0' }}>{total} products found</p>
            </div>

            {/* Sort + Filter toggle — full width row on mobile */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                className="input"
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                onClick={() => setShowFilter(v => !v)}
                style={{
                  flexShrink: 0,
                  border: '1.5px solid',
                  borderColor: showFilter ? '#F97316' : '#ddd',
                  background:  showFilter ? '#FFF7F0' : '#fff',
                  color:       showFilter ? '#F97316' : '#555',
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                  fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
                }}>
                <Filter size={14} /> {isDesktop ? (showFilter ? 'Hide Filters' : 'Filters') : 'Filters'}
              </button>
            </div>
          </div>

          {/* Products */}
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40, flexWrap: 'wrap' }}>
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