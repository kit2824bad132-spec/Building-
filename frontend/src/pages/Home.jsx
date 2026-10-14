import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Clock,
  Compass,
  Hammer,
  Layers,
  ArrowRight,
  PhoneCall,
  MessageCircle,
  Calculator,
  Building,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.get('/projects/featured');
        if (res.data.success) {
          setFeaturedProjects(res.data.projects);
        }
      } catch (err) {
        console.error('Error fetching featured projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <img
          src="/uploads/hero_modern_villa.jpg"
          alt="Saravanan Builders Luxury Residential Home"
          className="hero-bg-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80';
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Premier Individual House Builders</span>
            </div>

            <h1 className="hero-title">
              Building Your Dream Home with <span>Trust and Quality.</span>
            </h1>

            <p className="hero-description">
              From architectural blueprint to the moment we hand you the golden keys,
              Saravanan Builders crafts bespoke individual residences and luxury villas.
              Enjoy transparent itemized pricing, superior structural engineering, and live mobile progress updates.
            </p>

            <div className="hero-cta-group">
              <Link to="/projects" className="btn btn-primary btn-lg">
                <span>Explore Projects</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/cost-estimator" className="btn btn-outline-white btn-lg">
                <Calculator size={18} />
                <span>Estimate Construction Cost</span>
              </Link>
              <Link to="/contact" className="btn btn-navy btn-lg">
                <PhoneCall size={18} />
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEY STATS BANNER */}
      <section style={{ backgroundColor: 'var(--color-navy)', color: '#FFFFFF', padding: '2.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', lineHeight: 1.1 }}>18+</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.4rem' }}>Years of Construction Excellence</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', lineHeight: 1.1 }}>250+</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.4rem' }}>Custom Houses Delivered</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', lineHeight: 1.1 }}>100%</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.4rem' }}>Approved Soil & Structural Audits</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', lineHeight: 1.1 }}>10 Yrs</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.4rem' }}>Structural Core Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SARAVANAN BUILDERS */}
      <section className="section" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'center'
          }}>
            <div>
              <span className="section-tag">About Saravanan Builders</span>
              <h2 className="section-title">Rooted in Engineering Integrity, Dedicated to Your Family's Comfort.</h2>
              <p style={{ color: 'var(--color-gray-600)', marginBottom: '1.25rem', fontSize: '1rem', lineHeight: 1.7 }}>
                Founded by <strong>Er. Saravanan B.E.</strong>, Saravanan Builders has emerged as one of the most reliable residential
                construction names in Tamil Nadu. Unlike mass developers, we specialize exclusively in <strong>individual residential homes, duplex houses, and independent villas</strong>.
              </p>
              <p style={{ color: 'var(--color-gray-600)', marginBottom: '1.75rem', fontSize: '1rem', lineHeight: 1.7 }}>
                We believe that building a home is a once-in-a-lifetime journey. We back every project with high-grade Tata Tiscon steel,
                first-quality red bricks, rigorous water-curing protocols, and an exclusive online customer tracking portal so you witness every milestone from foundation to plastering.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--color-gold)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>No Hidden Costs</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--color-gold)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Vastu-Compliant Architecture</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--color-gold)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Live Site Photo Updates</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--color-gold)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>On-Time Handover</span>
                </div>
              </div>

              <Link to="/contact" className="btn btn-navy">
                <span>Schedule a Free Site Inspection</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '4px solid #FFFFFF'
              }}>
                <img
                  src="/uploads/duplex_house.jpg"
                  alt="Saravanan Builders Craftsmanship"
                  style={{ width: '100%', height: '420px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVICES SECTION */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-tag">Our Services</span>
            <h2 className="section-title">Comprehensive Residential Construction Solutions</h2>
            <p className="section-subtitle">
              We handle every phase of your home construction journey with dedicated project supervisors and turnkey accountability.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
                <Building size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Turnkey Individual House Construction</h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Complete end-to-end building from earthwork excavation, soil stabilization, RCC structural framing, brickwork, all the way to finishing and key handover.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
                <Compass size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Architectural 2D & 3D Elevation Design</h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Vastu-compliant floor plans, photorealistic 3D elevations, structural column beam drawings, and municipal corporation plan sanctions.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
                <Hammer size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Luxury Villa & Duplex Construction</h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Tailored architectural villas featuring Italian marble, teak wood entries, double-height ceilings, home automation wiring, and landscape gardening.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
                <Layers size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Renovation & Floor Expansion</h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Adding first or second floors onto existing foundations with structural column strengthening, modernizing old facades, and waterproofing upgrades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PROJECTS SECTION */}
      <section className="section" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="section-tag">Featured Residential Projects</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Built With Precision & Care</h2>
            </div>
            <Link to="/projects" className="btn btn-outline-gold">
              <span>View All Projects</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray-600)' }}>Loading actual projects...</div>
          ) : featuredProjects.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {featuredProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>No featured projects currently found.</div>
          )}
        </div>
      </section>

      {/* 6. CONSTRUCTION PROCESS SECTION */}
      <section className="section" style={{ backgroundColor: 'var(--color-navy)', color: '#FFFFFF' }}>
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-tag" style={{ backgroundColor: 'rgba(200, 162, 77, 0.15)', borderColor: 'var(--color-gold)', color: 'var(--color-gold-light)' }}>
              How We Build
            </span>
            <h2 className="section-title" style={{ color: '#FFFFFF' }}>Our 4-Step Structured Construction Workflow</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Every home follows a time-tested systematic engineering process monitored with digital stage approvals.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', marginBottom: '0.75rem' }}>01</div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Design & Soil Analysis</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Site inspection, soil bearing capacity testing, vastu architecture, 3D elevation drawings, and local body approvals.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', marginBottom: '0.75rem' }}>02</div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Foundation & Framing</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Earthwork, anti-termite treatment, isolated footings, plinth beam casting, and certified RCC frame columns.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', marginBottom: '0.75rem' }}>03</div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Masonry & Services</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Wire-cut red brick walls, concealed plumbing with pressure checks, fire-retardant electrical conduits, and double-coat plastering.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', marginBottom: '0.75rem' }}>04</div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Finishing & Handover</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Vitrified tiles, Burma teak doors, sanitary fixtures, multi-coat paint, deep cleaning, and ceremonial key handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE US */}
      <section className="section" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-tag">Why Choose Us</span>
            <h2 className="section-title">The Saravanan Builders Advantage</h2>
            <p className="section-subtitle">
              We stand apart through complete transparency, engineering discipline, and customer-first care.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem'
          }}>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Uncompromised Branded Materials</h4>
                <p style={{ color: 'var(--color-gray-600)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  We strictly build using Tata Tiscon/JSW 550D TMT, UltraTech/Coromandel cement, Finolex cabling, and Jaquar bath fittings.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                <Clock size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Real-Time Client Dashboard</h4>
                <p style={{ color: 'var(--color-gray-600)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Track your home's construction stages, review weekly photo uploads, and check completion percentages from anywhere in the world.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                <Award size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Clear Itemized Contracts</h4>
                <p style={{ color: 'var(--color-gray-600)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  No vague clauses. Every square foot, specification grade, and payment schedule is documented upfront before work begins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-tag">Homeowner Stories</span>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-subtitle">Real experiences from families living in Saravanan Builders constructed homes.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', color: 'var(--color-gold)', marginBottom: '1rem' }}>
                {'★'.repeat(5)}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--color-navy)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                "Saravanan Sir and his engineering team built our 3BHK villa in Anna Nagar. The best part was the online portal—I work in Singapore, and I could view weekly photo updates of every slab and brickwork. Delivered exactly on schedule!"
              </p>
              <div>
                <strong style={{ display: 'block', color: 'var(--color-navy)' }}>Karthik Ramanathan</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-400)' }}>Villa Homeowner — Anna Nagar, Chennai</span>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', color: 'var(--color-gold)', marginBottom: '1rem' }}>
                {'★'.repeat(5)}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--color-navy)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                "Building with Saravanan Builders was completely stress-free. The pricing per square foot was transparent, materials used were 100% original, and the structural strength of our duplex house is remarkable."
              </p>
              <div>
                <strong style={{ display: 'block', color: 'var(--color-navy)' }}>Dr. Meenakshi Sundaram</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-400)' }}>Duplex Homeowner — Coimbatore</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. BOTTOM ACTION BANNER */}
      <section style={{ backgroundColor: 'var(--color-navy-dark)', color: '#FFFFFF', padding: '4.5rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <h2 style={{ fontSize: '2.4rem', color: '#FFFFFF', marginBottom: '1rem', fontWeight: 700 }}>
            Ready to Build Your Individual Home?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Book a complimentary on-site visit with our chief structural engineer. We will review your plot dimensions, soil quality, and provide an initial architectural consultation.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary btn-lg">
              <span>Book Free Site Visit</span>
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/917540061497?text=Hello%20Saravanan%20Builders,%20I%20would%20like%20to%20schedule%20a%20site%20visit."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg"
            >
              <MessageCircle size={18} />
              <span>WhatsApp Us Directly</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
