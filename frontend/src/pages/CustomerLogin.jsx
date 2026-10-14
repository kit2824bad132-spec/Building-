import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginCustomer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await loginCustomer(email, password);
      navigate('/customer/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', borderTop: '4px solid var(--color-gold)' }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Logo size="lg" layout="column" variant="dark" />
            </div>
            <p style={{ color: 'var(--color-gray-600)', fontSize: '0.88rem', margin: '0.5rem 0 0 0' }}>
              Client Construction Tracking Portal
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
              <UserCheck size={15} style={{ color: 'var(--color-gold)' }} />
              <span>Client Login</span>
            </button>

            <Link
              to="/admin/login"
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
              <ShieldCheck size={15} />
              <span>Admin Login</span>
            </Link>
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
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Links Section */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-gray-200)', fontSize: '0.9rem', color: 'var(--color-gray-600)' }}>
            Do not have a client account?{' '}
            <Link to="/customer/register" style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
              Register Here
            </Link>
          </div>

          {/* Quick Admin Gateway Button */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link
              to="/admin/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                color: 'var(--color-navy)',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-light)',
                border: '1px solid var(--color-gray-200)',
                transition: 'all 0.2s ease'
              }}
            >
              <ShieldCheck size={15} style={{ color: 'var(--color-gold)' }} />
              <span>Are you a Builder / Admin? Sign In Here</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
