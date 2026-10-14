import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, HardHat, Calculator, PhoneCall, User, ShieldCheck, Menu, X, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import Logo from './Logo';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, isCustomer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" onClick={() => setMobileOpen(false)} style={{ display: 'inline-flex' }}>
          <Logo size="md" variant="dark" />
        </Link>

        {/* Desktop Navigation Links */}
        <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <li>
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              Project Gallery
            </NavLink>
          </li>
          <li>
            <NavLink to="/cost-estimator" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              Cost Estimator
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              Contact Us
            </NavLink>
          </li>

          {/* Conditional links for customer portal */}
          {user && isCustomer && (
            <li>
              <NavLink to="/customer/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                My House Project
              </NavLink>
            </li>
          )}

          {/* Conditional links for admin */}
          {user && isAdmin && (
            <li>
              <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                Admin Panel
              </NavLink>
            </li>
          )}
        </ul>

        {/* Action Buttons */}
        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to={isAdmin ? '/admin/dashboard' : '/customer/dashboard'}
                className="btn btn-outline-gold btn-sm"
                title="Open Dashboard"
              >
                <User size={16} />
                <span>{user.full_name?.split(' ')[0] || 'Dashboard'}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-navy btn-sm" title="Log Out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/customer/login" className="btn btn-outline-gold btn-sm">
                <User size={15} />
                <span>Client Login</span>
              </Link>
              <a
                href="https://wa.me/917540061497?text=Hello%20Saravanan%20Builders,%20I%20am%20interested%20in%20constructing%20an%20individual%20house."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
              >
                <MessageCircle size={16} />
                <span className="hidden-mobile">WhatsApp</span>
              </a>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
