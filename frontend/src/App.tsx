import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import LeadsPage from '@/pages/LeadsPage';
import LeadDetailPage from '@/pages/LeadDetailPage';
import FollowUpsPage from '@/pages/FollowUpsPage';
import CommunicationsPage from '@/pages/CommunicationsPage';
import ActivitiesPage from '@/pages/ActivitiesPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected routes wrapped in layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/followups" element={<FollowUpsPage />} />
            <Route path="/communications" element={<CommunicationsPage />} />
            <Route path="/activity" element={<ActivitiesPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
