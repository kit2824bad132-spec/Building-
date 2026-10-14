import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, MapPin, Calendar, MessageCircle, Check, Trash2, Search, Filter } from 'lucide-react';
import api from '../../services/api';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/enquiries/admin/all', { params });
      if (res.data.success) {
        setEnquiries(res.data.enquiries);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus, currentNotes) => {
    try {
      const res = await api.put(`/enquiries/admin/${id}/status`, {
        status: newStatus,
        admin_notes: currentNotes
      });
      if (res.data.success) {
        setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
        setMsg(`Enquiry #${id} status updated to "${newStatus}".`);
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleNotesChange = async (id, notes, currentStatus) => {
    try {
      await api.put(`/enquiries/admin/${id}/status`, {
        status: currentStatus,
        admin_notes: notes
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer enquiry record?')) return;
    try {
      const res = await api.delete(`/enquiries/admin/${id}`);
      if (res.data.success) {
        setEnquiries(enquiries.filter((e) => e.id !== id));
      }
    } catch (err) {
      alert('Failed to delete enquiry.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-navy)', margin: 0, fontWeight: 800 }}>
            Customer Enquiries & Leads
          </h1>
          <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Review incoming site consultation requests and follow up directly via WhatsApp or phone.
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem 1rem', width: 'auto' }}
          >
            <option value="all">All Enquiries</option>
            <option value="New">New Uncontacted</option>
            <option value="Contacted">Contacted</option>
            <option value="Quotation Sent">Quotation Sent</option>
            <option value="Converted">Converted to Client</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {msg && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-gray-600)' }}>Loading enquiries...</div>
      ) : enquiries.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {enquiries.map((enq) => {
            const cleanPhone = (enq.phone || '').replace(/[^\d]/g, '');
            const waText = encodeURIComponent(
              `Hello ${enq.customer_name},\nThis is Er. Saravanan from Saravanan Builders. Thank you for your inquiry regarding individual house construction in ${enq.construction_location}. How can I assist you with your plot inspection?`
            );
            return (
              <div key={enq.id} className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)', margin: 0 }}>
                        {enq.customer_name}
                      </h3>
                      <span className={`badge ${enq.status === 'New' ? 'badge-ongoing' : enq.status === 'Converted' ? 'badge-completed' : 'badge-gold'}`}>
                        {enq.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--color-gray-600)', marginTop: '0.35rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Phone size={14} style={{ color: 'var(--color-gold)' }} />
                        <strong>{enq.phone}</strong>
                      </span>
                      {enq.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Mail size={14} style={{ color: 'var(--color-gold)' }} />
                          {enq.email}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} style={{ color: 'var(--color-gold)' }} />
                        {enq.construction_location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} style={{ color: 'var(--color-gold)' }} />
                        {new Date(enq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions & WhatsApp button */}
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                    >
                      <MessageCircle size={16} />
                      <span>WhatsApp Customer</span>
                    </a>

                    <button
                      onClick={() => handleDelete(enq.id)}
                      className="btn btn-sm"
                      title="Delete enquiry"
                      style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Scope details */}
                <div style={{ display: 'flex', gap: '1.5rem', backgroundColor: 'var(--color-bg-light)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.88rem' }}>
                  {enq.built_up_area_sqft && (
                    <div>
                      <span style={{ color: 'var(--color-gray-400)', display: 'block', fontSize: '0.75rem' }}>Area Planned</span>
                      <strong>{Number(enq.built_up_area_sqft).toLocaleString('en-IN')} sq.ft.</strong>
                    </div>
                  )}
                  {enq.budget_range && (
                    <div>
                      <span style={{ color: 'var(--color-gray-400)', display: 'block', fontSize: '0.75rem' }}>Customer Budget</span>
                      <strong style={{ color: 'var(--color-gold)' }}>{enq.budget_range}</strong>
                    </div>
                  )}
                  {enq.project_title && (
                    <div>
                      <span style={{ color: 'var(--color-gray-400)', display: 'block', fontSize: '0.75rem' }}>Referenced Project</span>
                      <strong>{enq.project_title}</strong>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>Customer Message:</span>
                  <p style={{ margin: '0.35rem 0 0 0', color: 'var(--color-navy)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    "{enq.message}"
                  </p>
                </div>

                {/* Status selector & internal notes */}
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', borderTop: '1px solid var(--color-gray-200)', paddingTop: '1rem', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-600)', display: 'block', marginBottom: '0.35rem' }}>
                      Update Lead Status
                    </label>
                    <select
                      className="form-select"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                      value={enq.status}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value, enq.admin_notes)}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Quotation Sent">Quotation Sent</option>
                      <option value="Converted">Converted to Client</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-600)', display: 'block', marginBottom: '0.35rem' }}>
                      Admin Internal Follow-up Notes
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                      defaultValue={enq.admin_notes || ''}
                      placeholder="Add remarks (e.g. Site visit scheduled for Saturday 11am)..."
                      onBlur={(e) => handleNotesChange(enq.id, e.target.value, enq.status)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <p>No enquiries found matching this filter.</p>
        </div>
      )}
    </div>
  );
}
