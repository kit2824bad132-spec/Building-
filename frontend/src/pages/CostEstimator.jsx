import React, { useState, useEffect } from 'react';
import { Calculator, Check, AlertCircle, MessageCircle, Sparkles, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function CostEstimator() {
  const [tiers, setTiers] = useState([]);
  const [loadingTiers, setLoadingTiers] = useState(true);

  // Form Inputs
  const [area, setArea] = useState(1800);
  const [qualityTier, setQualityTier] = useState('Standard');
  const [floors, setFloors] = useState(2);
  const [selectedAddons, setSelectedAddons] = useState(['modular_kitchen', 'false_ceiling']);

  // Calculated Results
  const [estimateData, setEstimateData] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Load tiers from backend
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/cost-estimator/settings');
        if (res.data.success) {
          setTiers(res.data.settings);
        }
      } catch (err) {
        console.error('Failed to load estimator settings:', err);
      } finally {
        setLoadingTiers(false);
      }
    }
    loadSettings();
  }, []);

  // Run calculation whenever inputs change
  useEffect(() => {
    async function doCalculate() {
      if (!area || area <= 0) return;
      setCalculating(true);
      try {
        const res = await api.post('/cost-estimator/calculate', {
          built_up_area_sqft: area,
          quality_tier: qualityTier,
          number_of_floors: floors,
          add_ons: selectedAddons
        });
        if (res.data.success) {
          setEstimateData(res.data.data);
        }
      } catch (err) {
        console.error('Calculation failed:', err);
      } finally {
        setCalculating(false);
      }
    }
    const timer = setTimeout(doCalculate, 250);
    return () => clearTimeout(timer);
  }, [area, qualityTier, floors, selectedAddons]);

  const toggleAddon = (key) => {
    if (selectedAddons.includes(key)) {
      setSelectedAddons(selectedAddons.filter((k) => k !== key));
    } else {
      setSelectedAddons([...selectedAddons, key]);
    }
  };

  const formatINR = (val) => Number(val || 0).toLocaleString('en-IN');

  const addOnOptions = [
    { key: 'modular_kitchen', name: 'Modular Kitchen (Acrylic Finish + Soft-close Hinges)', cost: '₹1,80,000' },
    { key: 'false_ceiling', name: 'Designer Gypsum False Ceiling with LED Cove Lighting', cost: '₹110 / sq.ft.' },
    { key: 'wardrobes', name: 'Custom Marine Ply Bedroom Wardrobes', cost: '₹2,20,000' },
    { key: 'solar_rooftop', name: '3 kW On-Grid Solar Rooftop Power System', cost: '₹1,95,000' },
    { key: 'landscaping', name: 'Architectural Lawn & Paved Walkway Landscaping', cost: '₹75,000' }
  ];

  return (
    <div className="estimator-page section">
      <div className="container">
        {/* Title Header */}
        <div className="section-title-wrap">
          <span className="section-tag">Interactive Planning Tool</span>
          <h1 className="section-title">Residential Construction Cost Estimator</h1>
          <p className="section-subtitle">
            Calculate an instant, itemized estimate for your individual house based on your plot area,
            floors, and choice of construction specification grade.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* LEFT: Inputs Form */}
          <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calculator size={22} style={{ color: 'var(--color-gold)' }} />
              <span>Project Parameters</span>
            </h3>

            {/* 1. Built-up Area */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Built-up Area (Square Feet)</label>
                <span style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.1rem' }}>
                  {Number(area).toLocaleString('en-IN')} sq.ft.
                </span>
              </div>
              <input
                type="range"
                min="600"
                max="6000"
                step="50"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-gold)', height: '6px', marginBottom: '0.75rem', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1000, 1500, 2000, 2500, 3500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setArea(preset)}
                    className="btn btn-sm"
                    style={{
                      flex: 1,
                      backgroundColor: area === preset ? 'var(--color-navy)' : 'var(--color-bg-light)',
                      color: area === preset ? '#FFFFFF' : 'var(--color-navy)',
                      border: '1px solid var(--color-gray-200)',
                      fontSize: '0.78rem'
                    }}
                  >
                    {preset} sqft
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Number of Floors */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Number of Floors</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                {[1, 2, 3, 4].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFloors(f)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: floors === f ? '2px solid var(--color-gold)' : '1px solid var(--color-gray-200)',
                      backgroundColor: floors === f ? 'var(--color-gold-soft)' : '#FFFFFF',
                      color: 'var(--color-navy)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {f === 1 ? 'Ground' : f === 2 ? 'G + 1' : f === 3 ? 'G + 2' : 'G + 3'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Construction Quality Tier */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Construction Quality Tier</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tiers.map((tier) => {
                  const isSelected = qualityTier.toLowerCase() === tier.quality_tier.toLowerCase();
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setQualityTier(tier.quality_tier)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-gold)' : '1px solid var(--color-gray-200)',
                        backgroundColor: isSelected ? 'var(--color-gold-soft)' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: isSelected ? '5px solid var(--color-gold)' : '2px solid var(--color-gray-400)',
                            backgroundColor: '#FFFFFF'
                          }}></div>
                          <strong style={{ color: 'var(--color-navy)' }}>{tier.tier_title}</strong>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>
                          ₹{Number(tier.price_per_sqft).toLocaleString('en-IN')}/sq.ft
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-gray-600)', margin: '0.35rem 0 0.5rem 1.7rem' }}>
                        {tier.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Optional Add-ons */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Optional Add-ons & Customizations</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {addOnOptions.map((item) => {
                  const isChecked = selectedAddons.includes(item.key);
                  return (
                    <label
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-gray-200)',
                        backgroundColor: isChecked ? '#F0F9FF' : 'var(--color-bg-light)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(item.key)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--color-navy)' }}>
                          {item.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-gray-600)' }}>
                        {item.cost}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Results Breakdown & WhatsApp Request */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
            {estimateData ? (
              <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderTop: '4px solid var(--color-gold)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Sparkles size={16} />
                  <span>PRELIMINARY ESTIMATE BREAKDOWN</span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)' }}>Total Indicative Estimated Cost</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', lineHeight: 1.15 }}>
                    ₹{formatINR(estimateData.total_estimated_cost)}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)' }}>
                    (Includes structural shell, masonry, branded fixtures & selected add-ons)
                  </span>
                </div>

                {/* Calculation Rows */}
                <div style={{ borderTop: '1px solid var(--color-gray-200)', borderBottom: '1px solid var(--color-gray-200)', padding: '1rem 0', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--color-gray-600)' }}>Base Rate:</span>
                    <strong>₹{formatINR(estimateData.base_rate_per_sqft)} / sq.ft.</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--color-gray-600)' }}>Base Construction ({estimateData.built_up_area_sqft} sq.ft.):</span>
                    <strong>₹{formatINR(estimateData.base_construction_cost)}</strong>
                  </div>

                  {estimateData.add_ons && estimateData.add_ons.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--color-gray-200)' }}>
                      <span style={{ color: 'var(--color-navy)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                        Selected Upgrades:
                      </span>
                      {estimateData.add_ons.map((ao, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-600)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          <span>{ao.name}</span>
                          <span>+ ₹{formatINR(ao.cost)}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--color-navy)', marginTop: '0.5rem' }}>
                        <span>Total Add-ons:</span>
                        <span>₹{formatINR(estimateData.add_ons_total)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Quotation Button */}
                <a
                  href={estimateData.whatsapp_quotation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg"
                  style={{ width: '100%', marginBottom: '1rem' }}
                >
                  <MessageCircle size={20} />
                  <span>Request Official Quotation on WhatsApp</span>
                </a>

                {/* Preliminary Notice Disclaimer */}
                <div style={{
                  display: 'flex',
                  gap: '0.6rem',
                  alignItems: 'flex-start',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  color: '#92400E'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Preliminary Planning Notice:</strong> All results generated are preliminary estimates based on standard residential structural assumptions.
                    This is <em>not a final binding quotation</em>. An official stamped quotation is provided after site soil inspection and architectural drawings sign-off.
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Enter area above to calculate instant estimate...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
