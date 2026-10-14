import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminCostSettings() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingTierId, setSavingTierId] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cost-estimator/settings');
      if (res.data.success) {
        setTiers(res.data.settings);
      }
    } catch (err) {
      console.error('Failed to load estimator settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleFieldChange = (id, field, value) => {
    setTiers(tiers.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleSaveTier = async (tier) => {
    setSavingTierId(tier.id);
    try {
      const res = await api.put(`/cost-estimator/admin/settings/${tier.id}`, {
        price_per_sqft: Number(tier.price_per_sqft),
        tier_title: tier.tier_title,
        description: tier.description
      });
      if (res.data.success) {
        setMsg(`Settings for "${tier.tier_title}" saved successfully!`);
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to save tier settings.');
    } finally {
      setSavingTierId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', color: 'var(--color-navy)', margin: 0, fontWeight: 800 }}>
          Construction Cost Settings
        </h1>
        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Configure live base rates per square foot and tier specifications used in the public cost estimator.
        </p>
      </div>

      {msg && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray-600)' }}>Loading settings...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {tiers.map((tier) => (
            <div key={tier.id} className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderLeft: '4px solid var(--color-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span className="badge badge-gold">{tier.quality_tier} Quality Tier</span>
                <button
                  onClick={() => handleSaveTier(tier)}
                  disabled={savingTierId === tier.id}
                  className="btn btn-primary btn-sm"
                >
                  <Save size={15} />
                  <span>{savingTierId === tier.id ? 'Saving...' : 'Save Tier Rates'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Tier Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tier.tier_title}
                    onChange={(e) => handleFieldChange(tier.id, 'tier_title', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Base Price Per Square Foot (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={tier.price_per_sqft}
                    onChange={(e) => handleFieldChange(tier.id, 'price_per_sqft', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tier Summary Description</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                  value={tier.description || ''}
                  onChange={(e) => handleFieldChange(tier.id, 'description', e.target.value)}
                ></textarea>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
