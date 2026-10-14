import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Phone, MapPin, Mail, ArrowRight, AlertCircle, HardHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import Logo from '../components/Logo';

export default function CustomerRegister() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      return setErrorMsg('Passwords do not match.');
    }

    if (formData.password.length < 6) {
      return setErrorMsg('Password must be at least 6 characters long.');
    }

    setLoading(true);

    try {
      await registerCustomer({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address
      });
      navigate('/customer/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', borderTop: '4px solid var(--color-gold)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Logo size="lg" layout="column" variant="dark" />
            </div>
            <p style={{ color: 'var(--color-gray-600)', fontSize: '0.88rem', margin: '0.5rem 0 0 0' }}>
              Homeowner Registration for Live Site Tracking
            </p>
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
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="full_name"
                required
                className="form-input"
                placeholder="e.g. Karthik Ramanathan"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="form-input"
                  placeholder="e.g. 75400 61497"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="form-input"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Current Residential Address</label>
              <textarea
                name="address"
                className="form-textarea"
                style={{ minHeight: '80px' }}
                placeholder="Plot/Door No, Street, City"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <span>{loading ? 'Creating Account...' : 'Register as Client'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-gray-200)', fontSize: '0.9rem', color: 'var(--color-gray-600)' }}>
            Already have an account?{' '}
            <Link to="/customer/login" style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
