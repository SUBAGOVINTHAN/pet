import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, LogOut, Package, LayoutDashboard, X, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.jpg';

// ✅ Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const debouncedSearch = useDebounce(search, 300);

  // ✅ Fetch suggestions
  useEffect(() => {
    if (debouncedSearch.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}/products?search=${encodeURIComponent(debouncedSearch)}&limit=6`)
      .then(r => r.json())
      .then(data => {
        setSuggestions(data.products || []);
        setShowSuggestions(true);
        setActiveIndex(-1);
      })
      .catch(() => setSuggestions([]));
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${search}`);
      setSearch('');
      setSearchOpen(false);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.slug}`);
    setSearch('');
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchOpen(false);
  };

  // ✅ Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenu(false);
    setMenuOpen(false);
  };

  // ✅ Reusable suggestion dropdown
  const SuggestionDropdown = () => (
    showSuggestions && suggestions.length > 0 ? (
      <div style={{
        position: 'absolute', top: '110%', left: 0, right: 0,
        background: '#fff', border: '1px solid #eee',
        borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 999, overflow: 'hidden',
      }}>
        {suggestions.map((p, i) => (
          <div
            key={p.id}
            onMouseDown={() => handleSuggestionClick(p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', cursor: 'pointer',
              background: activeIndex === i ? '#FFF7F0' : '#fff',
              borderBottom: i < suggestions.length - 1 ? '1px solid #f5f5f5' : 'none',
              transition: 'background 0.15s',
            }}
          >
            {/* Product image */}
            {p.image ? (
              <img src={p.image} alt={p.name}
                style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, background: '#f9f9f9', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 6, background: '#FFF7F0', flexShrink: 0 }} />
            )}
            {/* Name + price */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.name}
              </div>
              <div style={{ fontSize: 12, color: '#F97316', fontWeight: 700 }}>
                ₹{(p.discount_price || p.price).toLocaleString()}
                {p.discount_price && (
                  <span style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 5 }}>
                    ₹{p.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <Search size={13} style={{ color: '#ccc', flexShrink: 0 }} />
          </div>
        ))}
        {/* View all results */}
        <div
          onMouseDown={handleSearch}
          style={{
            padding: '10px 14px', fontSize: 13, fontWeight: 600,
            color: '#F97316', textAlign: 'center', cursor: 'pointer',
            background: '#FFF7F0', borderTop: '1px solid #fee',
          }}
        >
          View all results for "{search}" →
        </div>
      </div>
    ) : null
  );

  return (
    <>
      <nav style={{
        background: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'clip'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: 64,
          width: '100%',
          boxSizing: 'border-box',
          padding: '0 16px',
          gap: 8
        }}>

          {/* Logo */}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0, textDecoration: 'none'
          }}>
            <img src={logo} alt="PetStore" style={{
              height: 40, width: 40, borderRadius: '50%',
              objectFit: 'cover', border: '2px solid #F97316'
            }} />
            <span className="brand-name" style={{
              fontWeight: 800, fontSize: 18,
              color: '#0d0d0d', fontFamily: 'Poppins, sans-serif'
            }}>Dot Pet Foods</span>
          </Link>

          {/* ✅ Desktop Search with suggestions */}
          <div ref={searchRef} className="desktop-search" style={{
            flex: 1, maxWidth: 420, position: 'relative', marginLeft: 8
          }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', position: 'relative' }}>
              <input
                className="input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search products, pets..."
                style={{ paddingRight: 44, borderRadius: 24, width: '100%' }}
                autoComplete="off"
              />
              <button type="submit" style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: '#F97316', cursor: 'pointer'
              }}>
                <Search size={18} />
              </button>
            </form>
            <SuggestionDropdown />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} className="mobile-spacer" />

          {/* Right Side Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>

            {/* Mobile Search Toggle */}
            <button
              className="mobile-only"
              onClick={() => { setSearchOpen(!searchOpen); setShowSuggestions(false); }}
              style={{
                background: 'none', border: 'none',
                padding: '8px 6px', color: '#555', cursor: 'pointer',
                display: 'flex', alignItems: 'center'
              }}
            >
              <Search size={22} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" style={{
              position: 'relative', padding: '8px 6px', color: '#555', display: 'flex'
            }}>
              <Heart size={22} />
            </Link>

            {/* Cart */}
            <Link to="/cart" style={{
              position: 'relative', padding: '8px 6px', color: '#555', display: 'flex'
            }}>
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="badge" style={{
                  position: 'absolute', top: 2, right: 2, width: 18, height: 18, fontSize: 10
                }}>{cartCount}</span>
              )}
            </Link>

            {/* Desktop User Menu */}
            {user ? (
              <div className="desktop-only" style={{ position: 'relative', marginLeft: 4 }} ref={userMenuRef}>
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#FFF7F0', border: '1.5px solid #F97316',
                    borderRadius: 24, padding: '6px 14px',
                    fontWeight: 600, fontSize: 13, color: '#F97316', cursor: 'pointer'
                  }}
                >
                  <User size={16} /> {user.name.split(' ')[0]}
                </button>

                {userMenu && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    background: '#fff', border: '1px solid #eee',
                    borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    minWidth: 180, zIndex: 999, overflow: 'hidden'
                  }}>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenu(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 16px', fontSize: 14, fontWeight: 600,
                        color: '#F97316', borderBottom: '1px solid #eee', textDecoration: 'none'
                      }}>
                        <LayoutDashboard size={16} /> Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setUserMenu(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px', fontSize: 14, color: '#333', textDecoration: 'none'
                    }}>
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenu(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px', fontSize: 14, color: '#333', textDecoration: 'none'
                    }}>
                      <Package size={16} /> My Orders
                    </Link>
                    <button onClick={handleLogout} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px', fontSize: 14, color: '#EF4444',
                      width: '100%', background: 'none', border: 'none',
                      cursor: 'pointer', borderTop: '1px solid #eee'
                    }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm desktop-only" style={{ marginLeft: 4 }}>Login</Link>
            )}

            {/* Mobile Hamburger */}
            <button
              className="mobile-only"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none', border: 'none',
                padding: '8px 0 8px 6px',
                color: '#333', cursor: 'pointer',
                display: 'flex', alignItems: 'center', flexShrink: 0
              }}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ✅ Mobile Search Bar with suggestions */}
        {searchOpen && (
          <div ref={mobileSearchRef} className="mobile-only" style={{
            padding: '8px 16px 12px',
            borderTop: '1px solid #f0f0f0',
            position: 'relative',
          }}>
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input
                autoFocus
                className="input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products, pets..."
                style={{ paddingRight: 44, borderRadius: 24, width: '100%', boxSizing: 'border-box' }}
                autoComplete="off"
              />
              <button type="submit" style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: '#F97316', cursor: 'pointer'
              }}>
                <Search size={18} />
              </button>
            </form>
            <SuggestionDropdown />
          </div>
        )}
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.35)', zIndex: 200
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0,
            width: 260, height: '100%',
            background: '#fff', zIndex: 201,
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column', overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 16px 16px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#FFF7F0', border: '2px solid #F97316',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316'
                  }}>
                    <User size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{user.email}</div>
                  </div>
                </div>
              ) : (
                <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Menu</span>
              )}
              <button onClick={() => setMenuOpen(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#555'
              }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '8px 0', flex: 1 }}>
              <Link to="/products" onClick={() => setMenuOpen(false)} style={drawerLink}>
                <Package size={18} style={{ color: '#F97316' }} /> Shop All Products
              </Link>
              {user && isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ ...drawerLink, color: '#F97316', fontWeight: 600 }}>
                  <LayoutDashboard size={18} /> Admin Panel
                </Link>
              )}
              {user && (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={drawerLink}>
                    <User size={18} style={{ color: '#F97316' }} /> My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} style={drawerLink}>
                    <Package size={18} style={{ color: '#F97316' }} /> My Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)} style={drawerLink}>
                    <Heart size={18} style={{ color: '#F97316' }} /> Wishlist
                  </Link>
                </>
              )}
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
              {user ? (
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, width: '100%', padding: '12px',
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: 10, color: '#EF4444', fontWeight: 600, fontSize: 14, cursor: 'pointer'
                }}>
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '12px', background: '#F97316',
                  borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none'
                }}>
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .mobile-only { display: none !important; }
        .desktop-search { display: flex !important; }
        .desktop-only { display: flex !important; }
        .mobile-spacer { display: none !important; }

        @media (max-width: 640px) {
          .mobile-only { display: flex !important; }
          .desktop-search { display: none !important; }
          .desktop-only { display: none !important; }
          .brand-name { font-size: 15px !important; }
          .mobile-spacer { display: block !important; flex: 1; }
        }
      `}</style>
    </>
  );
}

const drawerLink = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '14px 20px', fontSize: 15, color: '#1C1C1C',
  textDecoration: 'none', borderBottom: '1px solid #f9f9f9', fontWeight: 500,
};