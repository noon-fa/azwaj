import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import { AuthProvider } from '@/src/contexts/AuthContext';

import { AboutPage } from '@/src/pages/public/AboutPage';
import { BrotherDetailPage } from '@/src/pages/public/BrotherDetailPage';
import { ContactPage } from '@/src/pages/public/ContactPage';
import { CounsellingPage } from '@/src/pages/public/CounsellingPage';
import { HomePage } from '@/src/pages/public/HomePage';
import { HowItWorksPage } from '@/src/pages/public/HowItWorksPage';
import { MarriageDirectoryPage } from '@/src/pages/public/MarriageDirectoryPage';
import { PrivacyPage } from '@/src/pages/public/PrivacyPage';
import { ScholarDetailPage } from '@/src/pages/public/ScholarDetailPage';
import { ScholarsPage } from '@/src/pages/public/ScholarsPage';
import { TermsPage } from '@/src/pages/public/TermsPage';

import { AuthActionPage } from '@/src/pages/auth/AuthActionPage';
import { AuthCompletePage } from '@/src/pages/auth/AuthCompletePage';
import { SignInPage } from '@/src/pages/auth/SignInPage';

import { BrotherDashboardPage } from '@/src/pages/brother/BrotherDashboardPage';
import { BrotherLayout } from '@/src/pages/brother/BrotherLayout';
import { BrotherProfilePage } from '@/src/pages/brother/BrotherProfilePage';
import { BrotherRequestsPage } from '@/src/pages/brother/BrotherRequestsPage';
import { BrotherSettingsPage } from '@/src/pages/brother/BrotherSettingsPage';

import { ScholarAvailabilityPage } from '@/src/pages/scholar/ScholarAvailabilityPage';
import { ScholarBookingsPage } from '@/src/pages/scholar/ScholarBookingsPage';
import { ScholarDashboardPage } from '@/src/pages/scholar/ScholarDashboardPage';
import { ScholarLayout } from '@/src/pages/scholar/ScholarLayout';
import { ScholarProfilePage } from '@/src/pages/scholar/ScholarProfilePage';

import { AdminAuditLogsPage } from '@/src/pages/admin/AdminAuditLogsPage';
import { AdminBookingsPage } from '@/src/pages/admin/AdminBookingsPage';
import { AdminBrothersPage } from '@/src/pages/admin/AdminBrothersPage';
import { AdminLayout } from '@/src/pages/admin/AdminLayout';
import { AdminOverviewPage } from '@/src/pages/admin/AdminOverviewPage';
import { AdminRequestsPage } from '@/src/pages/admin/AdminRequestsPage';
import { AdminScholarsPage } from '@/src/pages/admin/AdminScholarsPage';
import { AdminSettingsPage } from '@/src/pages/admin/AdminSettingsPage';
import { AdminUsersPage } from '@/src/pages/admin/AdminUsersPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/marriage" element={<MarriageDirectoryPage />} />
              <Route path="/marriage/:brotherId" element={<BrotherDetailPage />} />
              <Route path="/scholars" element={<ScholarsPage />} />
              <Route path="/scholars/:scholarId" element={<ScholarDetailPage />} />
              <Route path="/counselling" element={<CounsellingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Auth Routes */}
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/auth/action" element={<AuthActionPage />} />
              <Route path="/auth/complete" element={<AuthCompletePage />} />
            </Route>

            {/* Brother Portal */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['brother', 'admin', 'staff']}>
                  <BrotherLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<BrotherDashboardPage />} />
              <Route path="profile" element={<BrotherProfilePage />} />
              <Route path="requests" element={<BrotherRequestsPage />} />
              <Route path="settings" element={<BrotherSettingsPage />} />
            </Route>

            {/* Scholar Portal */}
            <Route
              path="/scholar"
              element={
                <ProtectedRoute allowedRoles={['scholar', 'admin']}>
                  <ScholarLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/scholar/dashboard" replace />} />
              <Route path="dashboard" element={<ScholarDashboardPage />} />
              <Route path="availability" element={<ScholarAvailabilityPage />} />
              <Route path="bookings" element={<ScholarBookingsPage />} />
              <Route path="profile" element={<ScholarProfilePage />} />
            </Route>

            {/* Admin & Staff Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="brothers" element={<AdminBrothersPage />} />
              <Route path="marriage-requests" element={<AdminRequestsPage />} />
              <Route path="scholars" element={<AdminScholarsPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors />
      </AuthProvider>
    </ErrorBoundary>
  );
}
