import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PublicFeed from './pages/PublicFeed';
import HowItWorks from './pages/HowItWorks';
import Statistics from './pages/Statistics';
import Heatmap from './pages/Heatmap';
import RouteRisk from './pages/RouteRisk';
import Profile from './pages/Profile';

// Protected Components
import DashboardLayout from './components/layout/DashboardLayout';
import PrivateRoute from './components/common/PrivateRoute';
import ScrollToTop from './components/common/ScrollToTop';
import MainLayout from './components/layout/MainLayout';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import MyComplaints from './pages/dashboard/MyComplaints';
import SubmitComplaint from './pages/dashboard/SubmitComplaint';
import ComplaintDetail from './pages/dashboard/ComplaintDetail';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminComplaintsList from './pages/admin/ComplaintsList';
import AdminComplaintDetail from './pages/admin/ComplaintDetail';
import AdminEngagement from './pages/admin/Engagement';
import AdminRoute from './components/common/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-right" />
        <Routes>
          {/* Main Site Layout (Navbar + Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/feed" element={<PublicFeed />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/route-risk" element={<RouteRisk />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Protected routes under main layout */}
            <Route
              path="/complaints/:id"
              element={
                <PrivateRoute>
                  <ComplaintDetail />
                </PrivateRoute>
              }
            />

            {/* Dashboard routes also under main layout for consistent Navbar */}
            <Route
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/complaints" element={<MyComplaints />} />
              <Route path="/dashboard/submit" element={<SubmitComplaint />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<AdminComplaintsList />} />
            <Route path="/admin/complaints/:id" element={<AdminComplaintDetail />} />
            <Route path="/admin/engagement" element={<AdminEngagement />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Auth Routes (Standalone layouts) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
