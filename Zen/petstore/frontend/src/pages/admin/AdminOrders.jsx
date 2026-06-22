import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];

const downloadInvoice = async (orderId, orderNumber) => {
  try {
    const res  = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `invoice-${orderNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    toast.success('Invoice downloaded!');
  } catch { toast.error('Failed to download invoice'); }
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetch = () => {
    const q = filter ? `?status=${filter}` : '';
    api.get(`/orders${q}`).then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Order updated!');
      fetch();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Orders</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
              borderColor: filter === s ? '#F97316' : '#ddd',
              background: filter === s ? '#F97316' : '#fff',
              color: filter === s ? '#fff' : '#555',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize'
            }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F9FAFB' }}>
              <tr>
                {['Order #', 'Customer', 'Amount', 'Payment', 'Status', 'Date', 'Invoice', 'Update'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontWeight: 600, fontSize: 12, color: '#6B7280'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderTop: '1px solid #F3F4F6' }}>

                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 12 }}>
                    {o.order_number}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{o.customer_email}</div>
                  </td>

                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    ₹{parseFloat(o.total_amount).toLocaleString()}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 12, padding: '3px 8px', borderRadius: 6,
                      background: o.payment_status === 'paid' ? '#D1FAE5' : '#FEF3C7',
                      color: o.payment_status === 'paid' ? '#065F46' : '#92400E',
                      fontWeight: 600
                    }}>
                      {o.payment_status} | {o.payment_method}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span className={`status-pill status-${o.status}`}>{o.status}</span>
                  </td>

                  <td style={{ padding: '12px 16px', color: '#9CA3AF', fontSize: 12 }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>

                  {/* ── Invoice Download ── */}
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => downloadInvoice(o.id, o.order_number)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '6px 10px', borderRadius: 6,
                        border: '1.5px solid #F97316',
                        background: '#FFF7F0', color: '#F97316',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <Download size={13} /> Invoice
                    </button>
                  </td>

                  {/* ── Status Update ── */}
                  <td style={{ padding: '12px 16px' }}>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      style={{
                        padding: '6px 10px', borderRadius: 6,
                        border: '1.5px solid #ddd', fontSize: 12,
                        cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
                      }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>

                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}