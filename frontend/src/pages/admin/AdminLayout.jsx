import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  MessageSquare,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  HardHat,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview Dashboard' },
    { to: '/admin/projects', icon: Building, label: 'Manage Projects' },
    { to: '/admin/projects/new', icon: PlusCircle, label: 'Add New Project' },
    { to: '/admin/enquiries', icon: MessageSquare, label: 'Customer Enquiries' },
    { to: '/admin/customers', icon: Users, label: 'Customer Accounts' },
    { to: '/admin/progress-updates', icon: TrendingUp, label: 'Site Progress Manager' },
    { to: '/admin/cost-settings', icon: Settings, label: 'Cost Estimator Settings' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-light)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: 'var(--color-navy)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Brand header */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Logo size="sm" variant="light" />
        </div>

        {/* Navigation list */}
        <nav style={{ padding: '1.5rem 1rem', flexGrow: 1, overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/admin/dashboard'}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                      backgroundColor: isActive ? 'var(--color-gold)' : 'transparent',
                      transition: 'all 0.2s ease'
                    })}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer & logout */}
        <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'var(--color-navy-dark)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.full_name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-gold)' }}>Super Admin</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-white"
              title="Logout from Admin"
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <header style={{
          height: '65px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.95rem' }}>
            Saravanan Builders Operations Management
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-gold btn-sm"
            >
              <ExternalLink size={14} />
              <span>View Live Website</span>
            </a>
          </div>
        </header>

        {/* Dynamic Nested Route View */}
        <main style={{ padding: '2.5rem', flexGrow: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
