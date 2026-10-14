import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Layers,
  Maximize2,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

export default function ProjectDetails() {
  const { slugOrId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      try {
        const res = await api.get(`/projects/${slugOrId}`);
        if (res.data.success) {
          setProject(res.data.project);
          setActiveImage(res.data.project.main_image_url);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="section container" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-gray-600)' }}>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="section container" style={{ textAlign: 'center', minHeight: '60vh' }}>
        <h2>Project Not Found</h2>
        <p style={{ color: 'var(--color-gray-600)', margin: '1rem 0 2rem 0' }}>The requested project may have been moved or removed.</p>
        <Link to="/projects" className="btn btn-navy">Back to Gallery</Link>
      </div>
    );
  }

  const formatINR = (val) => Number(val || 0).toLocaleString('en-IN');
  const costPerSqft = project.cost_per_sqft || Math.round(Number(project.construction_cost) / Number(project.built_up_area_sqft));

  const whatsappMessage = encodeURIComponent(
    `Hello Saravanan Builders,\nI am viewing your project "${project.title}" (${project.location}) on your website.\n` +
    `- Built-up Area: ${Number(project.built_up_area_sqft).toLocaleString('en-IN')} sq.ft.\n` +
    `- Actual Construction Cost: ₹${formatINR(project.construction_cost)}\n\n` +
    `I would like to schedule a site consultation for my residential property.`
  );

  const galleryImages = [
    { image_url: project.main_image_url, caption: 'Main Elevation' },
    ...(project.images || [])
  ];

  return (
    <div className="project-details-page section">
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gray-600)', fontSize: '0.9rem', fontWeight: 500 }}>
            <ArrowLeft size={16} />
            <span>Back to All Projects</span>
          </Link>
        </div>

        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className={`badge ${project.status === 'Completed' ? 'badge-completed' : 'badge-ongoing'}`}>
                ● {project.status}
              </span>
              <span className="badge badge-gold">{project.house_type}</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-navy)', lineHeight: 1.2 }}>
              {project.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', marginTop: '0.5rem', fontSize: '1rem' }}>
              <MapPin size={18} />
              <span>{project.location}</span>
            </div>
          </div>

          <a
            href={`https://wa.me/917540061497?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-lg"
          >
            <MessageCircle size={20} />
            <span>Enquire on WhatsApp</span>
          </a>
        </div>

        {/* Media Gallery & Key Specs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3.5rem'
        }}>
          {/* Left: Image Gallery */}
          <div>
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              height: '440px',
              backgroundColor: 'var(--color-navy-dark)',
              boxShadow: 'var(--shadow-xl)',
              marginBottom: '1rem'
            }}>
              <img
                src={activeImage || project.main_image_url}
                alt={project.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
                }}
              />
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img.image_url)}
                    style={{
                      width: '84px',
                      height: '60px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: activeImage === img.image_url ? '2px solid var(--color-gold)' : '2px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                      opacity: activeImage === img.image_url ? 1 : 0.65,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Key Specs Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-gray-200)', paddingBottom: '0.75rem' }}>
                Project Specifications & Cost
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-gray-400)', display: 'block' }}>Actual Project Cost</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                    ₹{formatINR(project.construction_cost)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-gray-400)', display: 'block' }}>Built-up Area</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    {Number(project.built_up_area_sqft).toLocaleString('en-IN')} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>sq.ft.</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-gray-400)', display: 'block' }}>Cost Rate</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                    ₹{Number(costPerSqft).toLocaleString('en-IN')} / sq.ft.
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-gray-400)', display: 'block' }}>Number of Floors</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                    {project.number_of_floors || 1} Floor(s)
                  </div>
                </div>

                {project.start_date && (
                  <div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-gray-400)', display: 'block' }}>Commenced</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-navy)' }}>
                      {new Date(project.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}

                {project.completion_date && (
                  <div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-gray-400)', display: 'block' }}>{project.status === 'Completed' ? 'Handed Over' : 'Target Completion'}</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-navy)' }}>
                      {new Date(project.completion_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Badge */}
              <div style={{
                backgroundColor: 'var(--color-gold-soft)',
                border: '1px solid var(--color-gold-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                fontSize: '0.85rem',
                color: 'var(--color-navy)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                <ShieldCheck size={28} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <span>
                  <strong>Certified Real Project:</strong> All costs and metrics shown reflect genuine turnkey delivery audited by Er. Saravanan.
                </span>
              </div>
            </div>

            {/* Quick Estimate CTA */}
            <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--color-navy)', color: '#FFFFFF' }}>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Want a similar house constructed?</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Use our interactive cost estimator to simulate costs for your exact land size and quality tier.
              </p>
              <Link to="/cost-estimator" className="btn btn-primary btn-sm">
                Open Cost Estimator
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>About This Construction Project</h2>
          <p style={{ color: 'var(--color-gray-800)', fontSize: '1.05rem', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
            {project.description}
          </p>
        </div>

        {/* Milestones if present */}
        {project.milestones && project.milestones.length > 0 && (
          <div className="card" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Construction Milestones</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {project.milestones.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-gray-200)',
                    backgroundColor: m.status === 'Completed' ? '#F0FDF4' : 'var(--color-bg-light)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gray-400)' }}>STAGE {m.stage_order}</span>
                    <span className={`badge ${m.status === 'Completed' ? 'badge-completed' : 'badge-ongoing'}`}>
                      {m.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>{m.stage_name}</h4>
                  {m.remarks && <p style={{ fontSize: '0.82rem', color: 'var(--color-gray-600)' }}>{m.remarks}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
