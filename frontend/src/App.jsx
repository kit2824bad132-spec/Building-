import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/Home';
import ProjectGallery from './pages/ProjectGallery';
import ProjectDetails from './pages/ProjectDetails';
import CostEstimator from './pages/CostEstimator';
import Contact from './pages/Contact';

// Customer Pages
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import CustomerDashboard from './pages/CustomerDashboard';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import AdminAddEditProject from './pages/admin/AdminAddEditProject';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminProgressUpdates from './pages/admin/AdminProgressUpdates';
import AdminCostSettings from './pages/admin/AdminCostSettings';

// Protected Route wrappers
function CustomerProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Validating session...</div>;
  if (!user) return <Navigate to="/customer/login" replace />;
  return children;
}

function AdminProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Validating admin privileges...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Show Public Navbar & Floating WhatsApp on public & customer pages */}
      {!isAdminRoute && <Navbar />}

      <div style={{ flexGrow: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectGallery />} />
          <Route path="/projects/:slugOrId" element={<ProjectDetails />} />
          <Route path="/cost-estimator" element={<CostEstimator />} />
          <Route path="/contact" element={<Contact />} />

          {/* Customer Auth & Portal */}
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/register" element={<CustomerRegister />} />
          <Route
            path="/customer/dashboard"
            element={
              <CustomerProtectedRoute>
                <CustomerDashboard />
              </CustomerProtectedRoute>
            }
          />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Console */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/new" element={<AdminAddEditProject />} />
            <Route path="projects/edit/:id" element={<AdminAddEditProject />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="progress-updates" element={<AdminProgressUpdates />} />
            <Route path="cost-settings" element={<AdminCostSettings />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Show Public Footer and Floating WhatsApp only on non-admin console routes */}
      {!isAdminRoute && (
        <>
          <Footer />
          <FloatingWhatsApp />
        </>
      )}
    </div>
  );
}
