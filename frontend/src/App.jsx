import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import GeminiCopilotFloatingWidget from './components/GeminiCopilotFloatingWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetails from './pages/CaseDetails';
import EmailForensicsPage from './pages/EmailForensicsPage';
import UrlForensicsPage from './pages/UrlForensicsPage';
import NetworkForensicsPage from './pages/NetworkForensicsPage';
import MalwareForensicsPage from './pages/MalwareForensicsPage';
import ThreatIntelPage from './pages/ThreatIntelPage';
import InvestigationReportPage from './pages/InvestigationReportPage';
import AdminPanel from './pages/AdminPanel';
import AdminUsersPage from './pages/AdminUsersPage';
import AnalystPage from './pages/AnalystPage';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'investigator';
    if (!allowedRoles.includes(userRole)) {
      if (userRole === 'analyst') return <Navigate to="/analyst" replace />;
      if (userRole === 'investigator') return <Navigate to="/cases" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

const MainLayout = ({ children }) => {
  const [viewMode, setViewModeState] = useState(() => {
    return localStorage.getItem('sentinel_view_mode') || (window.innerWidth < 768 ? 'mobile' : 'pc');
  });

  const setViewMode = (mode) => {
    setViewModeState(mode);
    localStorage.setItem('sentinel_view_mode', mode);
  };

  const isMobile = viewMode === 'mobile';

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] relative">
      <Navbar viewMode={viewMode} setViewMode={setViewMode} />
      <div className="flex flex-1">
        {!isMobile && <Sidebar />}
        <main className={`flex-1 bg-[#0b0f19]/80 overflow-y-auto ${isMobile ? 'pb-24 px-2' : 'pb-16'}`}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      {isMobile && <MobileBottomNav />}
      <GeminiCopilotFloatingWidget />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Investigator & Admin Only Routes (Hidden & Restricted for Analyst) */}
      <Route
        path="/cases"
        element={
          <ProtectedRoute allowedRoles={['investigator', 'admin']}>
            <MainLayout>
              <Cases />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases/:id"
        element={
          <ProtectedRoute allowedRoles={['investigator', 'admin']}>
            <MainLayout>
              <CaseDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['investigator', 'admin']}>
            <MainLayout>
              <InvestigationReportPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports/:id"
        element={
          <ProtectedRoute allowedRoles={['investigator', 'admin']}>
            <MainLayout>
              <InvestigationReportPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Analyst & Admin Only Routes (Restricted for Investigator) */}
      <Route
        path="/analyst"
        element={
          <ProtectedRoute allowedRoles={['analyst', 'admin']}>
            <MainLayout>
              <AnalystPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Shared Forensic Triage Tools (Available to All Roles) */}
      <Route
        path="/email-forensics"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EmailForensicsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/url-forensics"
        element={
          <ProtectedRoute>
            <MainLayout>
              <UrlForensicsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/network-forensics"
        element={
          <ProtectedRoute>
            <MainLayout>
              <NetworkForensicsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/malware-forensics"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MalwareForensicsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/threat-intelligence"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ThreatIntelPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout>
              <AdminPanel />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout>
              <AdminUsersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
