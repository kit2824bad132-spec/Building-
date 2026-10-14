import React, { useState, useEffect } from 'react';
import { Users, Building, Plus, Trash2, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Modal / Assignment form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        api.get('/admin/customers'),
        api.get('/projects/admin/all')
      ]);

      if (cRes.data.success) {
        setCustomers(cRes.data.customers);
      }
      if (pRes.data.success) {
        setAllProjects(pRes.data.projects);
      }
    } catch (err) {
      console.error('Error fetching customers/projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignProject = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProjectId) {
      alert('Please select both a customer and a project.');
      return;
    }

    setAssigning(true);
    try {
      const res = await api.post('/admin/customer-projects/assign', {
        customer_id: Number(selectedCustomerId),
        project_id: Number(selectedProjectId),
        notes: assignmentNotes
      });

      if (res.data.success) {
        setMsg('Project successfully assigned to customer!');
        setSelectedCustomerId('');
        setSelectedProjectId('');
        setAssignmentNotes('');
        fetchData();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign project.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (customerId, projectId) => {
    if (!window.confirm('Remove project assignment from this customer?')) return;
    try {
      const res = await api.delete(`/admin/customer-projects/unassign/${customerId}/${projectId}`);
      if (res.data.success) {
        setMsg('Project assignment removed.');
        fetchData();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to remove assignment.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', color: 'var(--color-navy)', margin: 0, fontWeight: 800 }}>
          Customer Accounts & Project Assignments
        </h1>
        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          View registered homeowners and link their custom construction projects to their client portal.
        </p>
      </div>

      {msg && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {msg}
        </div>
      )}

      {/* Assignment Card Form */}
      <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', marginBottom: '2.5rem', borderTop: '4px solid var(--color-gold)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={20} style={{ color: 'var(--color-gold)' }} />
          <span>Assign Construction Project to Client</span>
        </h3>

        <form onSubmit={handleAssignProject}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Select Registered Client *</label>
              <select
                className="form-select"
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Choose Client --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Select Construction Project *</label>
              <select
                className="form-select"
                required
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">-- Choose Project --</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Assignment Notes (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Master contract signoff completed..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={assigning} className="btn btn-primary btn-sm">
            <span>{assigning ? 'Assigning...' : 'Assign Project to Client'}</span>
          </button>
        </form>
      </div>

      {/* Customer List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray-600)' }}>Loading customer accounts...</div>
      ) : customers.length > 0 ? (
        <div className="card" style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-light)', borderBottom: '1.5px solid var(--color-gray-200)', color: 'var(--color-navy)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Client Name</th>
                  <th style={{ padding: '1rem' }}>Contact Info</th>
                  <th style={{ padding: '1rem' }}>Address</th>
                  <th style={{ padding: '1rem' }}>Assigned Residential Projects</th>
                  <th style={{ padding: '1rem' }}>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const assignedList = Array.isArray(c.assigned_projects) ? c.assigned_projects : JSON.parse(c.assigned_projects || '[]');
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                        {c.full_name}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem' }}>
                          <span>{c.email}</span>
                          <span style={{ color: 'var(--color-gray-400)' }}>{c.phone}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--color-gray-600)', fontSize: '0.85rem' }}>
                        {c.address || '—'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {assignedList.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {assignedList.map((ap) => (
                              <div key={ap.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-bg-light)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ap.title}</span>
                                <span className={`badge ${ap.status === 'Completed' ? 'badge-completed' : 'badge-ongoing'}`} style={{ fontSize: '0.7rem' }}>
                                  {ap.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUnassign(c.id, ap.id)}
                                  title="Unassign project"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '2px' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-gray-400)', fontSize: '0.82rem' }}>No project linked yet</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--color-gray-400)', fontSize: '0.82rem' }}>
                        {new Date(c.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>No customers registered yet.</p>
        </div>
      )}
    </div>
  );
}
