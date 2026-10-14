import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    construction_location: '',
    built_up_area_sqft: '',
    budget_range: '',
    message: '',
    hp_field: '' // Hidden spam honeypot
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/enquiries', formData);
      if (res.data.success) {
        setSuccessData(res.data);
        setFormData({
          customer_name: '',
          phone: '',
          email: '',
          construction_location: '',
          built_up_area_sqft: '',
          budget_range: '',
          message: '',
          hp_field: ''
        });
      } else {
        setErrorMsg(res.data.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        'Unable to complete submission and deliver email notification. Please verify your details or contact us directly on WhatsApp.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page section">
      <div className="container">
        {/* Title Header */}
        <div className="section-title-wrap">
          <span className="section-tag">Direct Consultation</span>
          <h1 className="section-title">Connect with Saravanan Builders</h1>
          <p className="section-subtitle">
            Planning to construct your individual home? Share your site details and our chief structural engineer
            will get in touch for a complimentary plot inspection.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'start'
        }}>
          {/* Left: Contact Info Card */}
          <div>
            <div className="card" style={{ padding: '2.5rem', backgroundColor: 'var(--color-navy)', color: '#FFFFFF', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '1.5rem' }}>Direct Contact Information</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(200, 162, 77, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#FFFFFF' }}>Corporate Office</strong>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
                      124, Gandhi Road, Anna Nagar, Chennai, Tamil Nadu - 600040
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(200, 162, 77, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#FFFFFF' }}>Phone Enquiry</strong>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>+91 75400 61497</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(200, 162, 77, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#FFFFFF' }}>Email</strong>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>contact@saravananbuilders.com</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(200, 162, 77, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#FFFFFF' }}>Working Hours</strong>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>Monday to Saturday: 9:00 AM – 7:00 PM</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <a
                  href="https://wa.me/917540061497?text=Hello%20Saravanan%20Builders,%20I%20would%20like%20to%20consult%20regarding%20residential%20construction."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ width: '100%' }}
                >
                  <MessageCircle size={20} />
                  <span>Instant WhatsApp Connect</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Enquiry Form */}
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Send a Construction Enquiry</h3>

            {successData ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={56} style={{ color: 'var(--color-success)', margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.3rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>Enquiry Received & Dispatched!</h4>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  border: '1px solid #A7F3D0'
                }}>
                  <Mail size={14} />
                  <span>Notification delivered to sabarispm7708@gmail.com</span>
                </div>
                <p style={{ color: 'var(--color-gray-600)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {successData.message}
                </p>
                {successData.whatsappUrl && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-gray-600)' }}>
                      Would you like to send this inquiry directly to our WhatsApp as well?
                    </p>
                    <a
                      href={successData.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                    >
                      <MessageCircle size={18} />
                      <span>Open in WhatsApp</span>
                    </a>
                  </div>
                )}
                <button
                  onClick={() => setSuccessData(null)}
                  className="btn btn-outline-gold btn-sm"
                  style={{ marginTop: '1.5rem' }}
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Honeypot Spam Protection Field - invisible to users */}
                <input
                  type="text"
                  name="hp_field"
                  value={formData.hp_field || ''}
                  onChange={handleChange}
                  style={{ display: 'none', position: 'absolute', left: '-9999px', visibility: 'hidden' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

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
                    fontSize: '0.9rem'
                  }}>
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="customer_name"
                      required
                      className="form-input"
                      placeholder="e.g. Suresh Kumar"
                      value={formData.customer_name}
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
                      placeholder="e.g. 98412 87654"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Construction Location *</label>
                    <input
                      type="text"
                      name="construction_location"
                      required
                      className="form-input"
                      placeholder="e.g. Anna Nagar, Chennai"
                      value={formData.construction_location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Approx. Built-up Area (sq.ft.)</label>
                    <input
                      type="number"
                      name="built_up_area_sqft"
                      className="form-input"
                      placeholder="e.g. 2400"
                      value={formData.built_up_area_sqft}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estimated Budget</label>
                    <select
                      name="budget_range"
                      className="form-select"
                      value={formData.budget_range}
                      onChange={handleChange}
                    >
                      <option value="">Select Range</option>
                      <option value="₹40L - ₹55L">₹40L - ₹55L</option>
                      <option value="₹55L - ₹75L">₹55L - ₹75L</option>
                      <option value="₹75L - ₹1 Crore">₹75L - ₹1 Crore</option>
                      <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message / Plot Details *</label>
                  <textarea
                    name="message"
                    required
                    className="form-textarea"
                    placeholder="Tell us about your plot dimension (e.g. 30x40 ft), road width, number of floors planned, or special requirements..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', opacity: loading ? 0.8 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  <Send size={18} />
                  <span>{loading ? 'Submitting & Dispatching Email...' : 'Submit Construction Enquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
