import React, { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';

export default function ProjectGallery() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const res = await api.get('/projects');
        if (res.data.success) {
          setProjects(res.data.projects);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="projects-page section" style={{ minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div className="section-title-wrap">
          <span className="section-tag">Residential Portfolio</span>
          <h1 className="section-title">Actual Construction Projects</h1>
          <p className="section-subtitle">
            Explore individual residential houses, custom duplexes, and luxury villas designed and constructed by Saravanan Builders.
          </p>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-gray-600)' }}>
            Loading construction projects...
          </div>
        ) : projects.length > 0 ? (
          <div>
            <div style={{ marginBottom: '1.75rem', color: 'var(--color-gray-600)', fontSize: '0.95rem' }}>
              Showing <strong>{projects.length}</strong> verified residential project{projects.length !== 1 ? 's' : ''}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
              gap: '2.25rem'
            }}>
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <Home size={48} style={{ color: 'var(--color-gold)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Projects Available</h3>
            <p style={{ color: 'var(--color-gray-600)' }}>
              Projects will appear here once published by Saravanan Builders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
