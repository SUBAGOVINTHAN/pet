import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Users</h1>
      <input className="input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320, marginBottom: 20 }} />

      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F9FAFB' }}>
              <tr>
                {['#', 'Name', 'Email', 'Phone', 'Role', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px', color: '#9CA3AF', fontWeight: 600 }}>{u.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>{u.phone || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: u.role === 'admin' ? '#FEF3C7' : '#EFF6FF', color: u.role === 'admin' ? '#92400E' : '#1D4ED8' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9CA3AF', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
