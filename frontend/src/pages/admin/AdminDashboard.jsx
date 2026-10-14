import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  PlusCircle,
  TrendingUp,
  ExternalLink,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentEnquiries(res.data.recent_enquiries || []);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading live operational statistics...</div>;
  }

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', color: 'var(--color-navy)', margin: 0, fontWeight: 800 }}>
          Operational Dashboard
        </h1>
        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Real-time summary of projects, client progress pipelines, and incoming customer leads.
        </p>
      </div>

      {/* 4-Stat Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Card 1: Total Projects */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-navy)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)', fontWeight: 600 }}>Total Projects</span>
            <Building size={20} style={{ color: 'var(--color-navy)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)' }}>
            {stats?.total_projects || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-400)', marginTop: '0.25rem' }}>
            {stats?.published_projects || 0} Published on Website
          </div>
        </div>

        {/* Card 2: Active Ongoing Houses */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)', fontWeight: 600 }}>Ongoing Construction</span>
            <Clock size={20} style={{ color: 'var(--color-gold)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-gold)' }}>
            {stats?.ongoing_projects || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-400)', marginTop: '0.25rem' }}>
            Active structural & masonry sites
          </div>
        </div>

        {/* Card 3: Completed Projects */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)', fontWeight: 600 }}>Handed Over</span>
            <CheckCircle2 size={20} style={{ color: '#10B981' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>
            {stats?.completed_projects || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-400)', marginTop: '0.25rem' }}>
            Successfully delivered homes
          </div>
        </div>

        {/* Card 4: Leads & Enquiries */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)', fontWeight: 600 }}>Total Enquiries</span>
            <MessageSquare size={20} style={{ color: '#3B82F6' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3B82F6' }}>
            {stats?.total_enquiries || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 600, marginTop: '0.25rem' }}>
            {stats?.new_enquiries || 0} New Uncontacted
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <Link to="/admin/projects/new" className="btn btn-primary btn-sm">
          <PlusCircle size={16} />
          <span>Add New House Project</span>
        </Link>
        <Link to="/admin/progress-updates" className="btn btn-navy btn-sm">
          <TrendingUp size={16} />
          <span>Post Site Progress & Photos</span>
        </Link>
        <Link to="/admin/enquiries" className="btn btn-outline-gold btn-sm">
          <MessageSquare size={16} />
          <span>Manage Enquiries</span>
        </Link>
      </div>

      {/* Recent Enquiries Table */}
      <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', margin: 0 }}>Recent Customer Enquiries</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-gray-400)' }}>Latest direct plot consultation requests</span>
          </div>
          <Link to="/admin/enquiries" style={{ fontSize: '0.88rem', color: 'var(--color-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentEnquiries.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--color-gray-200)', color: 'var(--color-gray-600)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Client Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.map((enq) => (
                  <tr key={enq.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--color-navy)' }}>{enq.customer_name}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{enq.phone}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{enq.construction_location}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span className={`badge ${enq.status === 'New' ? 'badge-ongoing' : 'badge-completed'}`}>
                        {enq.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--color-gray-400)', fontSize: '0.82rem' }}>
                      {new Date(enq.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <a
                        href={`https://wa.me/${(enq.phone || '').replace(/[^\d]/g, '')}?text=Hello%20${encodeURIComponent(enq.customer_name || 'Client')},%20this%20is%20Er.%20Saravanan%20from%20Saravanan%20Builders%20following%20up%20on%20your%20house%20construction%20enquiry.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                      >
                        <MessageCircle size={14} />
                        <span>Chat</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-600)' }}>
            No recent customer enquiries recorded.
          </div>
        )}
      </div>
    </div>
  );
}
