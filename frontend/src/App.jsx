import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import GeminiCopilotFloatingWidget from './components/GeminiCopilotFloatingWidget';
import MobileBottomNav from './components/MobileBottomNav';
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

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
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
          {children}
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

      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Cases />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CaseDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

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

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InvestigationReportPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InvestigationReportPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AdminPanel />
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
