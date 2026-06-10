import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.jpg';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [search, setSearch] = useState('');
  const userMenuRef = useRef(null); // ← இது missing இருந்தது!

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/products?search=${search}`); setSearch(''); }
  };

  const handleLogout = () => { logout(); navigate('/'); setUserMenu(false); };

  return (
    <nav style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 70 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img src={logo} alt="PetStore" style={{ height: 44, width: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F97316' }} />
          <span style={{ fontWeight: 800, fontSize: 20, color: '#0d0d0d', fontFamily: 'Poppins, sans-serif' }}>Dot Pet Foods</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', maxWidth: 480, position: 'relative' }}>
          <input
            className="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, pets..."
            style={{ paddingRight: 44, borderRadius: 24 }}
          />
          <button type="submit" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#F97316', cursor: 'pointer' }}>
            <Search size={18} />
          </button>
        </form>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
          <Link to="/products" style={{ padding: '8px 14px', fontWeight: 500, color: '#1C1C1C', borderRadius: 8, fontSize: 14 }}>Shop</Link>

          <Link to="/wishlist" style={{ position: 'relative', padding: 8, color: '#555', display: 'flex' }}>
            <Heart size={22} />
          </Link>

          <Link to="/cart" style={{ position: 'relative', padding: 8, color: '#555', display: 'flex' }}>
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="badge" style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, fontSize: 10 }}>{cartCount}</span>
            )}
          </Link>

          {user ? (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                onClick={() => setUserMenu(!userMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFF7F0', border: '1.5px solid #F97316', borderRadius: 24, padding: '6px 14px', fontWeight: 600, fontSize: 13, color: '#F97316' }}
              >
                <User size={16} /> {user.name.split(' ')[0]}
              </button>

              {userMenu && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #eee', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180, zIndex: 999, overflow: 'hidden' }}>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#F97316', borderBottom: '1px solid #eee' }}>
                      <LayoutDashboard size={16} /> Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: '#333' }}>
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: '#333' }}>
                    <Package size={16} /> My Orders
                  </Link>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: '#EF4444', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #eee' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width:640px){ .desktop-nav { gap: 4px; } .desktop-nav a[href="/products"] { display: none; } }
      `}</style>
    </nav>
  );
}