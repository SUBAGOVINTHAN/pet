import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', city: '', state: '', pincode: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      updateUser(form);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    setSaving(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const tabStyle = (t) => ({
    padding: '10px 20px', border: 'none', background: tab === t ? '#F97316' : 'transparent',
    color: tab === t ? '#fff' : '#555', fontWeight: 600, fontSize: 14, cursor: 'pointer', borderRadius: 8
  });

  return (
    <div className="container section" style={{ paddingTop: 32, maxWidth: 640 }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>My Profile</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#f9f9f9', padding: 6, borderRadius: 10 }}>
        <button style={tabStyle('profile')} onClick={() => setTab('profile')}>Profile Info</button>
        <button style={tabStyle('password')} onClick={() => setTab('password')}>Change Password</button>
      </div>

      {tab === 'profile' ? (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Full Name', 'name'], ['Phone', 'phone'], ['Address', 'address'], ['City', 'city'], ['State', 'state'], ['Pincode', 'pincode']].map(([label, key]) => (
              <div key={key} style={key === 'address' ? { gridColumn: '1/-1' } : {}}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#555' }}>{label}</label>
                <input className="input" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: '#FFF7F0', borderRadius: 8, fontSize: 13 }}>
            <strong>Email:</strong> {user?.email} &nbsp;|&nbsp; <strong>Role:</strong> {user?.role}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[['Current Password', 'currentPassword'], ['New Password', 'newPassword']].map(([label, key]) => (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#555' }}>{label}</label>
                <input className="input" type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={changePassword} disabled={saving}>
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
