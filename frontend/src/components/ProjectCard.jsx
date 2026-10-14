import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, Maximize2, IndianRupee, Layers, ArrowRight, MessageCircle } from 'lucide-react';

export default function ProjectCard({ project }) {
  const formatINR = (val) => {
    if (!val) return 'N/A';
    return Number(val).toLocaleString('en-IN');
  };

  const costPerSqft = project.cost_per_sqft 
    ? Math.round(project.cost_per_sqft)
    : (project.built_up_area_sqft && project.construction_cost 
        ? Math.round(Number(project.construction_cost) / Number(project.built_up_area_sqft)) 
        : null);

  const whatsappMessage = encodeURIComponent(
    `Hello Saravanan Builders,\nI saw your project "${project.title}" (${project.location}) on your website and would like to enquire about a similar construction for my plot.`
  );

  return (
    <div className="card project-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Project Image Container */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden', backgroundColor: 'var(--color-navy-dark)' }}>
        <img
          src={project.main_image_url || '/uploads/hero_modern_villa.jpg'}
          alt={project.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={(e) => {
            // fallback if local uploads URL
            e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Status Badge */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 2 }}>
          <span className={`badge ${project.status === 'Completed' ? 'badge-completed' : 'badge-ongoing'}`}>
            ● {project.status}
          </span>
        </div>

        {/* House Type Tag */}
        <div style={{ position: 'absolute', bottom: '14px', right: '14px', zIndex: 2 }}>
          <span style={{
            backgroundColor: 'rgba(23, 36, 58, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {project.house_type}
          </span>
        </div>
      </div>

      {/* Project Card Content */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Location & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>
          <MapPin size={15} />
          <span>{project.location}</span>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3 }}>
          <Link to={`/projects/${project.slug || project.id}`} style={{ color: 'var(--color-navy)' }}>
            {project.title}
          </Link>
        </h3>

        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem', flexGrow: 1 }}>
          {project.description?.length > 110 ? `${project.description.substring(0, 110)}...` : project.description}
        </p>

        {/* Specifications Matrix */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          padding: '0.85rem',
          backgroundColor: 'var(--color-bg-light)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: 'var(--color-gray-400)', display: 'block', fontSize: '0.75rem' }}>Built-up Area</span>
            <strong style={{ color: 'var(--color-navy)' }}>{Number(project.built_up_area_sqft).toLocaleString('en-IN')} sq.ft.</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-gray-400)', display: 'block', fontSize: '0.75rem' }}>Total Cost</span>
            <strong style={{ color: 'var(--color-gold)' }}>₹{formatINR(project.construction_cost)}</strong>
          </div>
          {costPerSqft && (
            <div>
              <span style={{ color: 'var(--color-gray-400)', display: 'block', fontSize: '0.75rem' }}>Rate / sq.ft.</span>
              <strong style={{ color: 'var(--color-navy)' }}>₹{costPerSqft.toLocaleString('en-IN')}</strong>
            </div>
          )}
          <div>
            <span style={{ color: 'var(--color-gray-400)', display: 'block', fontSize: '0.75rem' }}>Structure</span>
            <strong style={{ color: 'var(--color-navy)' }}>{project.number_of_floors || 1} Floor(s)</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.6rem' }}>
          <Link
            to={`/projects/${project.slug || project.id}`}
            className="btn btn-navy btn-sm"
            style={{ width: '100%' }}
          >
            <span>View Details</span>
            <ArrowRight size={15} />
          </Link>
          <a
            href={`https://wa.me/917540061497?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
            title="Enquire on WhatsApp"
          >
            <MessageCircle size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
