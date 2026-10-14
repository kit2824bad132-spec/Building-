import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  HardHat,
  Home,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Image as ImageIcon,
  MessageCircle,
  LogOut,
  MapPin,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [myEnquiries, setMyEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('project'); // 'project' | 'enquiries'

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [projRes, enqRes] = await Promise.all([
          api.get('/customer/my-projects'),
          api.get('/enquiries/my-enquiries')
        ]);

        if (projRes.data.success) {
          setProjects(projRes.data.projects);
          if (projRes.data.projects.length > 0) {
            setSelectedProjectId(projRes.data.projects[0].id);
          }
        }
        if (enqRes.data.success) {
          setMyEnquiries(enqRes.data.enquiries);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Fetch full details whenever selectedProjectId changes
  useEffect(() => {
    async function fetchProjectDetails() {
      if (!selectedProjectId) return;
      try {
        const res = await api.get(`/customer/my-projects/${selectedProjectId}`);
        if (res.data.success) {
          setProjectDetails(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load project progress details:', err);
      }
    }
    fetchProjectDetails();
  }, [selectedProjectId]);

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

  return (
    <div className="customer-dashboard section" style={{ minHeight: '85vh', backgroundColor: 'var(--color-bg-light)' }}>
      <div className="container">
        {/* Top Header Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-navy)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700
              }}>
                {user?.full_name ? user.full_name[0] : 'C'}
              </div>
              <div>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--color-navy)', margin: 0 }}>
                  Welcome, {user?.full_name}
                </h1>
                <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
                  Client Portal • Registered Contact: {user?.phone} ({user?.email})
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setActiveTab('project')}
                className={`btn btn-sm ${activeTab === 'project' ? 'btn-primary' : 'btn-outline-gold'}`}
              >
                <HardHat size={16} />
                <span>My Construction Progress</span>
              </button>
              <button
                onClick={() => setActiveTab('enquiries')}
                className={`btn btn-sm ${activeTab === 'enquiries' ? 'btn-primary' : 'btn-outline-gold'}`}
              >
                <MessageCircle size={16} />
                <span>My Enquiries ({myEnquiries.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: Construction Progress */}
        {activeTab === 'project' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-gray-600)' }}>
                Loading your construction progress data...
              </div>
            ) : projects.length === 0 ? (
              <div className="card" style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
                <Home size={54} style={{ color: 'var(--color-gold)', margin: '0 auto 1.25rem auto' }} />
                <h3 style={{ fontSize: '1.4rem', color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
                  No Construction Project Assigned Yet
                </h3>
                <p style={{ color: 'var(--color-gray-600)', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                  Once your plot registration and agreement with Saravanan Builders is completed, our administrator
                  will link your residential project here. You will receive live photo updates, structural stage transitions, and completion milestones.
                </p>
                <Link to="/contact" className="btn btn-navy">
                  Contact Project Manager
                </Link>
              </div>
            ) : (
              <div>
                {/* Project Selector if client has multiple projects */}
                {projects.length > 1 && (
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProjectId(p.id)}
                        className={`btn btn-sm ${selectedProjectId === p.id ? 'btn-navy' : 'btn-outline-gold'}`}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                )}

                {projectDetails && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Live Progress Card */}
                    <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', borderTop: '4px solid var(--color-gold)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <span className="badge badge-ongoing">● {projectDetails.project.status}</span>
                            <span className="badge badge-gold">{projectDetails.project.house_type}</span>
                          </div>
                          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                            {projectDetails.project.title}
                          </h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold)', marginTop: '0.4rem' }}>
                            <MapPin size={16} />
                            <span>{projectDetails.project.location}</span>
                          </div>
                        </div>

                        {/* Progress Meter Ring/Box */}
                        <div style={{
                          backgroundColor: 'var(--color-navy)',
                          color: '#FFFFFF',
                          padding: '1.25rem 2rem',
                          borderRadius: 'var(--radius-lg)',
                          textAlign: 'center',
                          boxShadow: 'var(--shadow-md)'
                        }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                            Overall Progress
                          </span>
                          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', lineHeight: 1.1 }}>
                            {projectDetails.overall_progress_percentage}%
                          </div>
                          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                            Current: {projectDetails.current_stage}
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                          <span>Construction Completion Tracker</span>
                          <span style={{ color: 'var(--color-gold)' }}>{projectDetails.overall_progress_percentage}% Completed</span>
                        </div>
                        <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--color-gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${projectDetails.overall_progress_percentage}%`,
                              height: '100%',
                              backgroundColor: 'var(--color-gold)',
                              borderRadius: 'var(--radius-full)',
                              transition: 'width 0.8s ease'
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* 8-Stage Visual Pipeline */}
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--color-navy)' }}>
                          Residential Construction Stages
                        </h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '1rem'
                        }}>
                          {projectDetails.milestones && projectDetails.milestones.map((m, idx) => {
                            const isCompleted = m.status === 'Completed';
                            const isInProgress = m.status === 'In Progress';
                            return (
                              <div
                                key={m.id || idx}
                                style={{
                                  padding: '1.25rem',
                                  borderRadius: 'var(--radius-md)',
                                  border: isCompleted
                                    ? '1.5px solid #10B981'
                                    : isInProgress
                                      ? '1.5px solid var(--color-gold)'
                                      : '1px solid var(--color-gray-200)',
                                  backgroundColor: isCompleted
                                    ? '#F0FDF4'
                                    : isInProgress
                                      ? 'var(--color-gold-soft)'
                                      : 'var(--color-bg-light)',
                                  position: 'relative'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gray-600)' }}>
                                    STAGE 0{m.stage_order || idx + 1}
                                  </span>
                                  {isCompleted ? (
                                    <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                                  ) : isInProgress ? (
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-gold)' }}></span>
                                  ) : (
                                    <Circle size={16} style={{ color: 'var(--color-gray-400)' }} />
                                  )}
                                </div>
                                <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>
                                  {m.stage_name}
                                </strong>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: isCompleted ? '#065F46' : isInProgress ? 'var(--color-gold)' : 'var(--color-gray-400)'
                                }}>
                                  {m.status}
                                </span>
                                {m.completed_at && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-600)', marginTop: '0.35rem' }}>
                                    Completed: {new Date(m.completed_at).toLocaleDateString('en-IN')}
                                  </div>
                                )}
                                {m.remarks && (
                                  <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-600)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                                    "{m.remarks}"
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Progress Photographs & Chronological Updates */}
                    <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
                      <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ImageIcon size={22} style={{ color: 'var(--color-gold)' }} />
                        <span>Site Progress Photographs & Field Updates</span>
                      </h3>

                      {projectDetails.progress_updates && projectDetails.progress_updates.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                          {projectDetails.progress_updates.map((update) => (
                            <div
                              key={update.id}
                              style={{
                                borderLeft: '3px solid var(--color-gold)',
                                paddingLeft: '1.5rem',
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', margin: 0 }}>
                                  {update.title}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <span className="badge badge-gold">{update.stage_name}</span>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Calendar size={14} />
                                    {new Date(update.update_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>

                              <p style={{ color: 'var(--color-gray-600)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                                {update.description}
                              </p>

                              {/* Photos Grid */}
                              {update.photos && (Array.isArray(update.photos) ? update.photos : JSON.parse(update.photos || '[]')).length > 0 && (
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                  gap: '1rem'
                                }}>
                                  {(Array.isArray(update.photos) ? update.photos : JSON.parse(update.photos || '[]')).map((ph, pIdx) => (
                                    <div key={pIdx} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', backgroundColor: 'var(--color-navy-dark)' }}>
                                      <img
                                        src={typeof ph === 'string' ? ph : ph.url}
                                        alt={ph.caption || 'Site progress photo'}
                                        style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                                        onError={(e) => {
                                          e.target.src = '/uploads/construction_site.jpg';
                                        }}
                                      />
                                      {ph.caption && (
                                        <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#FFFFFF', fontSize: '0.82rem', color: 'var(--color-navy)', fontWeight: 500 }}>
                                          {ph.caption}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-600)' }}>
                          No site progress photographs uploaded yet. Check back soon after the upcoming site inspection.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: My Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Your Submitted Enquiries</h3>
            {myEnquiries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {myEnquiries.map((enq) => (
                  <div key={enq.id} style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', backgroundColor: 'var(--color-bg-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--color-navy)' }}>
                        {enq.construction_location}
                      </strong>
                      <span className={`badge ${enq.status === 'New' ? 'badge-ongoing' : 'badge-completed'}`}>
                        {enq.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--color-gray-600)', marginBottom: '0.75rem' }}>
                      {enq.built_up_area_sqft && <span>Area: {enq.built_up_area_sqft} sqft • </span>}
                      {enq.budget_range && <span>Budget: {enq.budget_range} • </span>}
                      <span>Submitted on: {new Date(enq.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: 'var(--color-navy)', margin: 0, fontStyle: 'italic' }}>
                      "{enq.message}"
                    </p>
                    {enq.admin_notes && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--color-gold-soft)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <strong>Remark from Saravanan Builders:</strong> {enq.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray-600)' }}>
                You have not submitted any enquiries yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
