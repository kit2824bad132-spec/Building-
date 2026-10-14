import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, Building, MapPin, IndianRupee, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/admin/all');
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error('Error fetching admin projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleTogglePublish = async (project) => {
    try {
      const res = await api.put(`/projects/admin/${project.id}`, {
        is_published: !project.is_published
      });
      if (res.data.success) {
        setProjects(projects.map((p) => (p.id === project.id ? { ...p, is_published: !p.is_published } : p)));
        setMsg(`Project "${project.title}" ${!project.is_published ? 'published live' : 'unpublished'}.`);
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to update project status.');
    }
  };

  const handleDelete = async (id, title) => {
    const ok = window.confirm(`Are you sure you want to delete the project "${title}"? This cannot be undone.`);
    if (!ok) return;

    try {
      const res = await api.delete(`/projects/admin/${id}`);
      if (res.data.success) {
        setProjects(projects.filter((p) => p.id !== id));
        setMsg(`Project "${title}" deleted.`);
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  const formatINR = (val) => Number(val || 0).toLocaleString('en-IN');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-navy)', margin: 0, fontWeight: 800 }}>
            Manage Construction Projects
          </h1>
          <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Add, update, publish, or remove residential house records and uploaded site photographs.
          </p>
        </div>

        <Link to="/admin/projects/new" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add New Project</span>
        </Link>
      </div>

      {msg && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-gray-600)' }}>Loading projects...</div>
      ) : projects.length > 0 ? (
        <div className="card" style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-light)', borderBottom: '1.5px solid var(--color-gray-200)', color: 'var(--color-navy)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Image</th>
                  <th style={{ padding: '1rem' }}>Title & Location</th>
                  <th style={{ padding: '1rem' }}>House Type</th>
                  <th style={{ padding: '1rem' }}>Built-up Area</th>
                  <th style={{ padding: '1rem' }}>Actual Cost</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Public Visibility</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '0.75rem 1rem', width: '80px' }}>
                      <div style={{ width: '64px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--color-navy-dark)' }}>
                        <img src={p.main_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ color: 'var(--color-navy)', display: 'block', fontSize: '0.95rem' }}>{p.title}</strong>
                      <span style={{ color: 'var(--color-gray-400)', fontSize: '0.82rem' }}>{p.location}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>{p.house_type}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {Number(p.built_up_area_sqft).toLocaleString('en-IN')} sq.ft.
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                      ₹{formatINR(p.construction_cost)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${p.status === 'Completed' ? 'badge-completed' : 'badge-ongoing'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleTogglePublish(p)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: 'none',
                          backgroundColor: p.is_published ? '#ECFDF5' : '#F3F4F6',
                          color: p.is_published ? '#065F46' : '#6B7280'
                        }}
                      >
                        {p.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{p.is_published ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Link
                          to={`/admin/projects/edit/${p.id}`}
                          className="btn btn-sm btn-outline-gold"
                          title="Edit Project"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="btn btn-sm btn-navy"
                          title="Delete Project"
                          style={{ padding: '0.35rem 0.6rem', backgroundColor: '#EF4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>No projects created yet. Click "Add New Project" to get started.</p>
        </div>
      )}
    </div>
  );
}
