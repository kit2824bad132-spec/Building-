import React, { useState, useEffect } from 'react';
import { TrendingUp, Upload, CheckCircle2, Circle, AlertCircle, Camera, Calendar, Save } from 'lucide-react';
import api from '../../services/api';

export default function AdminProgressUpdates() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // New Progress Update Form
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateStage, setUpdateStage] = useState('RCC Structural Frame Work');
  const [updatePercentage, setUpdatePercentage] = useState(50);
  const [updateDescription, setUpdateDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const stagesList = [
    'Planning and Architectural Design',
    'Foundation & Earthwork',
    'RCC Structural Frame Work',
    'Brickwork & Masonry',
    'Electrical, Plumbing & Conduit Work',
    'Plastering & Weathering Course',
    'Flooring, Tiling & Wall Painting',
    'Final Inspection & Key Handover'
  ];

  // Fetch all projects for selector
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.get('/projects/admin/all');
        if (res.data.success) {
          setProjects(res.data.projects);
          if (res.data.projects.length > 0) {
            setSelectedProjectId(res.data.projects[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Fetch milestones when selected project changes
  useEffect(() => {
    async function loadMilestones() {
      if (!selectedProjectId) return;
      try {
        const res = await api.get(`/admin/projects/${selectedProjectId}/milestones`);
        if (res.data.success) {
          setMilestones(res.data.milestones);
        }
      } catch (err) {
        console.error('Error fetching project milestones:', err);
      }
    }
    loadMilestones();
  }, [selectedProjectId]);

  const handleMilestoneStatusChange = async (mId, newStatus, currentRemarks) => {
    try {
      const res = await api.put(`/admin/milestones/${mId}`, {
        status: newStatus,
        remarks: currentRemarks,
        completed_at: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null
      });
      if (res.data.success) {
        setMilestones(milestones.map((m) => (m.id === mId ? res.data.milestone : m)));
        setMsg('Milestone updated successfully.');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to update milestone status.');
    }
  };

  const handleMilestoneRemarksBlur = async (mId, remarks, currentStatus) => {
    try {
      await api.put(`/admin/milestones/${mId}`, {
        status: currentStatus,
        remarks
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    const previews = files.map((f) => ({
      previewUrl: URL.createObjectURL(f),
      name: f.name
    }));
    setPhotoPreviews(previews);
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!updateTitle || !updateStage) {
      alert('Please fill in title and stage.');
      return;
    }

    setSubmittingUpdate(true);
    try {
      let uploadedPhotos = [];

      // If photos chosen, upload to backend / Cloudinary
      if (selectedFiles.length > 0) {
        const form = new FormData();
        selectedFiles.forEach((f) => form.append('images', f));

        const uploadRes = await api.post('/projects/admin/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data.success) {
          uploadedPhotos = uploadRes.data.images.map((img) => ({
            url: img.url,
            caption: updateTitle
          }));
        }
      }

      const res = await api.post(`/admin/projects/${selectedProjectId}/progress-updates`, {
        title: updateTitle,
        stage_name: updateStage,
        progress_percentage: Number(updatePercentage),
        description: updateDescription,
        photos: uploadedPhotos,
        update_date: new Date().toISOString().split('T')[0]
      });

      if (res.data.success) {
        setMsg('Progress update published live to client dashboard!');
        setUpdateTitle('');
        setUpdateDescription('');
        setSelectedFiles([]);
        setPhotoPreviews([]);
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post progress update.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', color: 'var(--color-navy)', margin: 0, fontWeight: 800 }}>
          Site Progress & Milestone Manager
        </h1>
        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Upload construction progress photographs, advance milestone statuses, and update completion percentages.
        </p>
      </div>

      {msg && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {msg}
        </div>
      )}

      {/* Select Project to Manage */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', marginBottom: '2rem' }}>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-navy)' }}>
          Active Project Under Inspection
        </label>
        <select
          className="form-select"
          style={{ maxWidth: '500px', fontWeight: 600 }}
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.location}) — [{p.status}]
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left: Publish Progress Update Form */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderTop: '4px solid var(--color-gold)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-navy)' }}>
            <Camera size={20} style={{ color: 'var(--color-gold)' }} />
            <span>Post Field Progress Update & Photos</span>
          </h3>

          <form onSubmit={handlePostUpdate}>
            <div className="form-group">
              <label className="form-label">Update Headline *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Ground Floor Roof Slab Casting Completed"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Current Construction Stage *</label>
                <select
                  className="form-select"
                  value={updateStage}
                  onChange={(e) => setUpdateStage(e.target.value)}
                >
                  {stagesList.map((stg) => (
                    <option key={stg} value={stg}>{stg}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Overall Progress (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="form-input"
                  value={updatePercentage}
                  onChange={(e) => setUpdatePercentage(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Supervising Engineer Remarks</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '90px' }}
                placeholder="Details of materials verified, curing status, next week inspection plan..."
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Photos upload */}
            <div className="form-group">
              <label className="form-label">Site Photographs</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="progress-photo-input"
              />
              <label
                htmlFor="progress-photo-input"
                className="btn btn-outline-gold btn-sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Upload size={16} />
                <span>Select Site Photos from Device</span>
              </label>

              {photoPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {photoPreviews.map((p, idx) => (
                    <div key={idx} style={{ width: '80px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <img src={p.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submittingUpdate}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              <Save size={16} />
              <span>{submittingUpdate ? 'Publishing...' : 'Publish Update to Client Portal'}</span>
            </button>
          </form>
        </div>

        {/* Right: Construction Milestones Checklist */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--color-navy)' }}>
            8-Stage Construction Milestone Checklist
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {milestones.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: m.status === 'Completed' ? '1px solid #10B981' : '1px solid var(--color-gray-200)',
                  backgroundColor: m.status === 'Completed' ? '#F0FDF4' : 'var(--color-bg-light)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gray-600)' }}>STAGE 0{m.stage_order}</span>
                  <select
                    className="form-select"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                    value={m.status}
                    onChange={(e) => handleMilestoneStatusChange(m.id, e.target.value, m.remarks)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-navy)', marginBottom: '0.4rem' }}>
                  {m.stage_name}
                </strong>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem' }}
                  defaultValue={m.remarks || ''}
                  placeholder="Inspector sign-off note (e.g. Cube test passed)..."
                  onBlur={(e) => handleMilestoneRemarksBlur(m.id, e.target.value, m.status)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
