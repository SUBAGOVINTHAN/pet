import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP step state
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [adminEmail, setAdminEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // ── Step 1: Login ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);

      // Admin needs OTP
      if (res.data.requireOtp) {
        setAdminEmail(form.email);
        setStep('otp');
        toast.success('OTP sent to your email!');
        return;
      }

      // Regular user — store token and redirect
      // const user = await login(form.email, form.password);
      // toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      // navigate('/', { replace: true });

      // Token received (admin or user)
localStorage.setItem('token', res.data.token);
localStorage.setItem('user', JSON.stringify(res.data.user));
toast.success(`Welcome, ${res.data.user.name.split(' ')[0]}!`);

if (res.data.user.role === 'admin') {
  window.location.href = '/admin';
} else {
  window.location.href = '/';
}
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check email and password.';
      setErrorMsg(msg);
      toast.error(msg);
      setForm(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling ──
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`admin-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`admin-otp-${index - 1}`)?.focus();
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/admin-verify-otp', { email: adminEmail, otp: otpString });
      // Save token manually (same as AuthContext login)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success(`Welcome, ${res.data.user.name}! 🎉`);
      // Force page reload to pick up auth state
      window.location.href = '/admin';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('admin-otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post('/auth/login', { email: adminEmail, password: form.password });
      toast.success('OTP resent!');
      setOtp(['', '', '', '', '', '']);
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '70vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#FFF7F0', padding: 24
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '24px 30px' }}>

        {/* ── LOGIN STEP ── */}
        {step === 'login' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 36 }}>🐾</span>
              <h2 style={{ fontWeight: 700, fontSize: 26, marginTop: 12 }}>Welcome Back!</h2>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Login to your PetStore account</p>
            </div>

            {errorMsg && (
              <div style={{
                background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8,
                padding: '10px 14px', marginBottom: 16, color: '#991B1B', fontSize: 13, fontWeight: 500
              }}>
                ❌ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required autoComplete="email" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: 12, color: '#F97316', fontWeight: 500 }}>Forgot Password?</Link>
                </div>
                <input className="input" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required autoComplete="current-password" />
              </div>
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8, fontSize: 15 }}
                disabled={loading}>
                {loading ? '⏳ Logging in...' : 'Login'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#555' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#F97316', fontWeight: 600 }}>Register</Link>
            </p>

            <div style={{
              marginTop: 20, padding: 12, background: '#FFF7F0',
              borderRadius: 8, fontSize: 12, color: '#555', textAlign: 'center', lineHeight: 1.8
            }}>
              <strong>Admin Demo:</strong><br />
              admin@petstore.com / Admin@123
            </div>
          </>
        )}

        {/* ── OTP STEP (Admin only) ── */}
        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 40 }}>🔐</span>
              <h2 style={{ fontWeight: 700, fontSize: 22, marginTop: 8, marginBottom: 4 }}>Admin Verification</h2>
              <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>
                OTP sent to <strong style={{ color: '#F97316' }}>{adminEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 6 OTP boxes */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`admin-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    style={{
                      width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700,
                      border: `2px solid ${digit ? '#F97316' : '#E5E7EB'}`,
                      borderRadius: 10, outline: 'none', background: '#fff',
                      transition: 'border-color 0.2s'
                    }}
                  />
                ))}
              </div>

              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15 }}
                disabled={loading}>
                {loading ? '⏳ Verifying...' : '✅ Verify & Enter Admin Panel'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#9CA3AF' }}>
              Didn't get it?{' '}
              <button onClick={handleResend} disabled={loading}
                style={{ background: 'none', border: 'none', color: '#F97316', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>
                Resend OTP
              </button>
            </p>

            <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13 }}>
              <button onClick={() => { setStep('login'); setOtp(['','','','','','']); }}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 13 }}>
                ← Back to Login
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}