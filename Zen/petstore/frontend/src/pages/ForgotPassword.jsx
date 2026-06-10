import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  // step: 'email' | 'otp' | 'password'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 boxes
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Step 1: Send OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP box keyboard handling ──
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // numbers only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // 1 digit only
    setOtp(newOtp);
    // Auto-focus next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: otpString });
      toast.success('OTP verified!');
      setStep('password');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Minimum 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp: otp.join(''), newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = { width: '100%', maxWidth: 400, padding: '28px 32px' };
  const pageStyle = {
    minHeight: '60vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#FFF7F0', padding: 16
  };

  // ── Progress indicator ──
  const steps = ['Email', 'OTP', 'New Password'];
  const stepIndex = { email: 0, otp: 1, password: 2 };

  return (
    <div style={pageStyle}>
      <div className="card" style={cardStyle}>

        {/* Step progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                background: i <= stepIndex[step] ? '#F97316' : '#E5E7EB',
                color: i <= stepIndex[step] ? '#fff' : '#9CA3AF',
                transition: 'all 0.3s'
              }}>
                {i < stepIndex[step] ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 12, color: i <= stepIndex[step] ? '#F97316' : '#9CA3AF', fontWeight: 500 }}>
                {s}
              </span>
              {i < 2 && <div style={{ width: 20, height: 2, background: i < stepIndex[step] ? '#F97316' : '#E5E7EB', borderRadius: 2 }} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Email ── */}
        {step === 'email' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 40 }}>🔐</span>
              <h2 style={{ fontWeight: 700, fontSize: 22, marginTop: 8, marginBottom: 4 }}>Forgot Password?</h2>
              <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>We'll send an OTP to your email</p>
            </div>
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Email Address</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15 }} disabled={loading}>
                {loading ? '⏳ Sending OTP...' : 'Send OTP'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#555' }}>
              Remember password? <Link to="/login" style={{ color: '#F97316', fontWeight: 600 }}>Login</Link>
            </p>
          </>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 40 }}>📧</span>
              <h2 style={{ fontWeight: 700, fontSize: 22, marginTop: 8, marginBottom: 4 }}>Enter OTP</h2>
              <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>
                Sent to <strong style={{ color: '#F97316' }}>{email}</strong>
              </p>
            </div>
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 6 OTP boxes */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
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
                style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15 }} disabled={loading}>
                {loading ? '⏳ Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#9CA3AF' }}>
              Didn't get it?{' '}
              <button onClick={handleSendOtp} disabled={loading}
                style={{ background: 'none', border: 'none', color: '#F97316', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>
                Resend OTP
              </button>
            </p>
          </>
        )}

        {/* ── STEP 3: New Password ── */}
        {step === 'password' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 40 }}>🔑</span>
              <h2 style={{ fontWeight: 700, fontSize: 22, marginTop: 8, marginBottom: 4 }}>New Password</h2>
              <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>Choose a strong password</p>
            </div>
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>New Password</label>
                <input className="input" type="password" placeholder="Min. 6 characters"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoFocus />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Confirm Password</label>
                <input className="input" type="password" placeholder="Re-enter password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              {/* Password match indicator */}
              {confirmPassword && (
                <p style={{ fontSize: 12, margin: 0, color: newPassword === confirmPassword ? '#16A34A' : '#DC2626' }}>
                  {newPassword === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                </p>
              )}
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15 }} disabled={loading}>
                {loading ? '⏳ Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}