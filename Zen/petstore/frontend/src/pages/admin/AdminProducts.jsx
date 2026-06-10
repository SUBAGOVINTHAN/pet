  import { useState, useEffect } from 'react';
  import api from '../../utils/api';
  import toast from 'react-hot-toast';
  import { Plus, Pencil, Trash2, X, ImageOff } from 'lucide-react';

  const EMPTY = {
    name: '', description: '', price: '', discount_price: '',
    stock: '', category_id: '', pet_type: 'dog', is_featured: false, is_active: true
  };

  // Helper: resolve image URL correctly
  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http')) return imgPath;
    // Strip leading slash and prepend backend URL
    const clean = imgPath.startsWith('/') ? imgPath : '/' + imgPath;
    return `http://localhost:5000${clean}`;
  };

  // Fallback image component
  const ProductImage = ({ src, alt, style }) => {
    const [error, setError] = useState(false);
    const url = getImageUrl(src);

    if (!url || error) {
      return (
        <div style={{ ...style, background: '#FFF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: style?.borderRadius || 8 }}>
          <ImageOff size={20} color="#F97316" />
        </div>
      );
    }
    return <img src={url} alt={alt} style={style} onError={() => setError(true)} />;
  };

  export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const fetchData = () => {
      setLoading(true);
      Promise.all([
        api.get('/products?limit=200'),
        api.get('/categories')
      ]).then(([p, c]) => {
        setProducts(p.data.products);
        setCategories(c.data);
      }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => {
      setForm(EMPTY);
      setEditing(null);
      setImageFile(null);
      setImagePreview(null);
      setModal(true);
    };

    const openEdit = (p) => {
      setForm({
        name: p.name || '',
        description: p.description || '',
        price: p.price || '',
        discount_price: p.discount_price || '',
        stock: p.stock || '',
        category_id: p.category_id || '',
        pet_type: p.pet_type || 'dog',
        is_featured: !!p.is_featured,
        is_active: p.is_active !== 0,
      });
      setEditing(p.id);
      setImageFile(null);
      setImagePreview(getImageUrl(p.image));
      setModal(true);
    };

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    };

    const save = async () => {
      if (!form.name || !form.price || !form.stock) {
        toast.error('Name, price and stock are required');
        return;
      }
      setSaving(true);
      try {
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('description', form.description || '');
        fd.append('price', form.price);
        if (form.discount_price) fd.append('discount_price', form.discount_price);
        fd.append('stock', form.stock);
        if (form.category_id) fd.append('category_id', form.category_id);
        fd.append('pet_type', form.pet_type);
        fd.append('is_featured', form.is_featured ? '1' : '0');
        fd.append('is_active', form.is_active ? '1' : '0');
        if (imageFile) fd.append('image', imageFile);

        if (editing) {
          await api.put(`/products/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          toast.success('Product updated!');
        } else {
          await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          toast.success('Product created!');
        }
        setModal(false);
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Save failed');
      } finally {
        setSaving(false);
      }
    };

    const del = async (id) => {
      if (!confirm('Delete this product?')) return;
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted');
        fetchData();
      } catch { toast.error('Delete failed'); }
    };

    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontWeight: 700, fontSize: 28 }}>Products ({products.length})</h1>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Product
          </button>
        </div>

        <input
          className="input"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320, marginBottom: 20 }}
        />

        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="card" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 700 }}>
              <thead style={{ background: '#F9FAFB' }}>
                <tr>
                  {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No products found</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <ProductImage
                        src={p.image}
                        alt={p.name}
                        style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                      />
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, maxWidth: 180 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      {p.is_featured ? <span style={{ fontSize: 10, color: '#F97316' }}>⭐ Featured</span> : null}
                    </td>
                    <td style={{ padding: '10px 16px', color: '#6B7280', fontSize: 13 }}>{p.category_name || '-'}</td>
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 700 }}>₹{p.discount_price || p.price}</span>
                      {p.discount_price && (
                        <span style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 4 }}>₹{p.price}</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontWeight: 700, color: p.stock === 0 ? '#EF4444' : p.stock < 10 ? '#F59E0B' : '#10B981' }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 20, fontWeight: 600, background: p.is_active ? '#D1FAE5' : '#FEE2E2', color: p.is_active ? '#065F46' : '#991B1B' }}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(p)} style={{ padding: '6px 10px', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => del(p.id)} style={{ padding: '6px 10px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {modal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <h3 style={{ fontWeight: 700, fontSize: 20 }}>{editing ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setModal(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Image Upload Section */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8, color: '#555' }}>
                  Product Image
                </label>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Preview */}
                  <div style={{ width: 100, height: 100, borderRadius: 10, border: '2px dashed #F97316', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF7F0' }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImagePreview(null)} />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#F97316', fontSize: 12 }}>
                        <ImageOff size={24} style={{ margin: '0 auto 4px', display: 'block' }} />
                        No Image
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      style={{ display: 'block', fontSize: 13, marginBottom: 8 }}
                    />
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                      JPG, PNG, WEBP up to 5MB.<br />
                      {editing ? 'Leave empty to keep current image.' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Name */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#555' }}>Product Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Dog Food" style={{ fontSize: 13 }} />
                </div>

                {/* Price */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#555' }}>Price (₹) *</label>
                  <input className="input" type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="999" style={{ fontSize: 13 }} />
                </div>

                {/* Discount Price */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#555' }}>Discount Price (₹)</label>
                  <input className="input" type="number" min="0" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))} placeholder="Leave blank = no discount" style={{ fontSize: 13 }} />
                </div>

                {/* Stock */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#555' }}>Stock *</label>
                  <input className="input" type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="50" style={{ fontSize: 13 }} />
                </div>

                {/* Category */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#555' }}>Category</label>
                  <select className="input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={{ fontSize: 13 }}>
                    <option value="">-- Select --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Pet Type */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#555' }}>Pet Type</label>
                  <select className="input" value={form.pet_type} onChange={e => setForm(f => ({ ...f, pet_type: e.target.value }))} style={{ fontSize: 13 }}>
                    {['dog','cat','bird','fish','rabbit','other'].map(t => (
                      <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#555' }}>Description</label>
                  <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." style={{ fontSize: 13, resize: 'vertical' }} />
                </div>

                {/* Toggles */}
                <div style={{ gridColumn: '1/-1', display: 'flex', gap: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
                    ⭐ Featured Product
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                    ✅ Active (visible to customers)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setModal(false)} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
