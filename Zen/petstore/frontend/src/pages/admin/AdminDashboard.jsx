import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const STAT_CARDS = [
    { label: 'Total Orders', value: stats.total_orders, icon: <ShoppingBag size={24} />, color: '#3B82F6' },
    { label: 'Revenue (Paid)', value: `₹${parseFloat(stats.total_revenue || 0).toLocaleString()}`, icon: <TrendingUp size={24} />, color: '#10B981' },
    { label: 'Customers', value: stats.total_users, icon: <Users size={24} />, color: '#8B5CF6' },
    { label: 'Active Products', value: stats.total_products, icon: <Package size={24} />, color: '#F97316' },
  ];

  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 28 }}>Dashboard</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: s.color + '20', color: s.color, borderRadius: 12, padding: 14, display: 'flex' }}>{s.icon}</div>
            <div>
              <p style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontWeight: 800, fontSize: 24 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Recent Orders */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Recent Orders</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  {['Order #', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#9CA3AF', fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders?.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 12 }}>{o.order_number}</td>
                    <td style={{ padding: '10px 12px' }}>{o.customer_name}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>₹{parseFloat(o.total_amount).toLocaleString()}</td>
                    <td style={{ padding: '10px 12px' }}><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                    <td style={{ padding: '10px 12px', color: '#9CA3AF', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Top Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.top_products?.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 800, color: '#F97316', width: 20 }}>#{i + 1}</span>
               <img src={
              p.image
                ? (p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`)
                : 'https://via.placeholder.com/40'
            } alt={p.name}
                  style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                  onError={e => e.target.src = 'https://via.placeholder.com/40'} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>{p.sold} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
