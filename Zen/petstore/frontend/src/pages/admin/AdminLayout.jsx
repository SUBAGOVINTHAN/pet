import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: <Package size={18} />, label: 'Products' },
  { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
  { to: '/admin/users', icon: <Users size={18} />, label: 'Users' },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#1C1C1C', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #333' }}>
          <div style={{ color: '#F97316', fontWeight: 800, fontSize: 20, fontFamily: 'Playfair Display, serif' }}>🐾 PetStore</div>
          <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Admin Panel</div>
        </div>
        <div style={{ padding: '16px 12px', flex: 1 }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10,
                marginBottom: 4, fontWeight: 600, fontSize: 14, color: isActive ? '#fff' : '#888',
                background: isActive ? '#F97316' : 'transparent', transition: 'all 0.2s'
              })}>
              {n.icon} {n.label}
            </NavLink>
          ))}
        </div>
        <div style={{ padding: '16px 12px', borderTop: '1px solid #333' }}>
          <div style={{ color: '#888', fontSize: 12, padding: '0 14px 10px' }}>{user?.name}</div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontSize: 14, fontWeight: 600, borderRadius: 10 }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
