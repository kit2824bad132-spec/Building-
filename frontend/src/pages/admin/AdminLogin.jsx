import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await loginAdmin(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-navy-dark)' }}>
      <div className="container" style={{ maxWidth: '460px' }}>
        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', borderTop: '4px solid var(--color-gold)' }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Logo size="lg" layout="column" variant="dark" />
            </div>
            <p style={{ color: 'var(--color-gray-600)', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
              Operations Management Gateway
            </p>
          </div>

          {/* Portal Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            padding: '4px',
            backgroundColor: 'var(--color-bg-light)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            border: '1px solid var(--color-gray-200)'
          }}>
            <Link
              to="/customer/login"
              className="btn btn-sm"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-gray-600)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <UserCheck size={15} />
              <span>Client Login</span>
            </Link>

            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: 'var(--color-navy)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                border: 'none',
                cursor: 'default'
              }}
            >
              <ShieldCheck size={15} style={{ color: 'var(--color-gold)' }} />
              <span>Admin Login</span>
            </button>
          </div>

          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.88rem'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="admin@saravananbuilders.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-navy btn-lg"
              style={{ width: '100%', marginTop: '0.5rem', backgroundColor: 'var(--color-navy)' }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Return to Client Portal Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-gray-200)', fontSize: '0.88rem', color: 'var(--color-gray-600)' }}>
            Are you a homeowner looking for your house tracker?{' '}
            <Link to="/customer/login" style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
              Client Login Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
