import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle, Shield } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand Info */}
          <div className="footer-col">
            <div style={{ marginBottom: '1.25rem' }}>
              <Logo size="md" variant="light" />
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              Specialists in individual villa and residential home construction across Tamil Nadu.
              Crafting premium dream homes with uncompromising structural integrity, transparent pricing,
              and live digital milestone tracking for homeowners.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href="https://wa.me/917540061497?text=Hello%20Saravanan%20Builders,%20I%20would%20like%20to%20consult%20regarding%20residential%20house%20construction."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/projects">Project Gallery</Link></li>
              <li><Link to="/cost-estimator">Construction Cost Estimator</Link></li>
              <li><Link to="/contact">Book Free Site Visit</Link></li>
              <li><Link to="/customer/login">Client Progress Portal</Link></li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="footer-col">
            <h4>Our Expertise</h4>
            <ul className="footer-links">
              <li>Individual Luxury Villas</li>
              <li>Contemporary Duplex Homes</li>
              <li>Turnkey Residential Contracts</li>
              <li>RCC Structural Engineering</li>
              <li>Architectural 3D & Elevation</li>
              <li>Renovation & Expansion</li>
            </ul>
          </div>

          {/* Col 4: Contact Details */}
          <div className="footer-col">
            <h4>Head Office</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <MapPin size={20} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '2px' }} />
                <span>124, Gandhi Road, Anna Nagar, Chennai, Tamil Nadu - 600040</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Phone size={18} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <span>+91 75400 61497</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Mail size={18} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <span>contact@saravananbuilders.com</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Clock size={18} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <span>Mon – Sat: 9:00 AM – 7:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Saravanan Builders. All Rights Reserved. Built with Trust & Excellence.</p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/admin/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
              <Shield size={14} />
              <span>Admin Gateway</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
