import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (result.ok) {
      navigate('/', { replace: true });
    } else {
      setError(result.error ?? 'Registration failed.');
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleRegister(); };

  return (
    <div style={{ minHeight: '100vh', background: '#1A2D4F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏠</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>House Budget</div>
        <div style={{ fontSize: 13, color: '#A0B4C8', marginTop: 4 }}>Track every shekel of your build</div>
      </div>

      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A2D4F', marginBottom: 20 }}>Create Account</div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 12px', borderRadius: 8, fontSize: 14, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Full Name</label>
        <input
          className="form-input" value={name}
          onChange={e => setName(e.target.value)} onKeyDown={handleKey}
          placeholder="e.g. Saleh Ahmed" autoComplete="name"
          style={{ marginBottom: 14, display: 'block', width: '100%' }}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Email</label>
        <input
          className="form-input" type="email" value={email}
          onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
          placeholder="your@email.com" autoComplete="email"
          style={{ marginBottom: 14, display: 'block', width: '100%' }}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Password</label>
        <input
          className="form-input" type="password" value={password}
          onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
          placeholder="Min. 6 characters" autoComplete="new-password"
          style={{ marginBottom: 14, display: 'block', width: '100%' }}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Confirm Password</label>
        <input
          className="form-input" type="password" value={confirm}
          onChange={e => setConfirm(e.target.value)} onKeyDown={handleKey}
          placeholder="Repeat password" autoComplete="new-password"
          style={{ marginBottom: 22, display: 'block', width: '100%' }}
        />

        <button
          onClick={handleRegister} disabled={loading}
          style={{ width: '100%', background: '#4A90E2', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 16, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: '#666' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4A90E2', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
