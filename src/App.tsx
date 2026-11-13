import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { SuperAdminDashboard } from './pages/dashboards/SuperAdminDashboard';
import { CoordinatorDashboard } from './pages/dashboards/CoordinatorDashboard';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';

import { ResourcesPage } from './pages/resources/ResourcesPage';
import { ResourceDetailPage } from './pages/resources/ResourceDetailPage';

import { BookingsPage } from './pages/bookings/BookingsPage';
import { BookingDetailPage } from './pages/bookings/BookingDetailPage';

import { SchedulesPage } from './pages/schedules/SchedulesPage';
import { EventsPage } from './pages/events/EventsPage';
import { EquipmentPage } from './pages/equipment/EquipmentPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

import { DepartmentsPage } from './pages/departments/DepartmentsPage';
import { UsersPage } from './pages/users/UsersPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Role-based route guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Root index redirect based on user role
const RootRedirect: React.FC = () => {
  const { user, isSuperAdmin, isCoordinator } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'WEBSITE_ADMIN') return <Navigate to="/unauthorized" replace />;
  if (isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isCoordinator) return <Navigate to="/coordinator/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Authenticated Dashboard Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RootRedirect />} />

                {/* Role Dashboards */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/coordinator/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['COORDINATOR', 'SUPER_ADMIN']}>
                      <CoordinatorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/coordinator/approvals"
                  element={
                    <ProtectedRoute allowedRoles={['COORDINATOR', 'SUPER_ADMIN']}>
                      <BookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'COORDINATOR', 'SUPER_ADMIN']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Operational screens: students & coordinators only (not Super Admin) */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'COORDINATOR', 'SUPER_ADMIN']}>
                      <Outlet />
                    </ProtectedRoute>
                  }
                >
                {/* Resources */}
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/resources/:id" element={<ResourceDetailPage />} />

                {/* Bookings */}
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/bookings/:id" element={<BookingDetailPage />} />
                <Route path="/my-bookings" element={<BookingsPage />} />

                {/* Schedules & Events */}
                <Route path="/schedules" element={<SchedulesPage />} />
                <Route path="/events" element={<EventsPage />} />

                {/* Equipment */}
                <Route path="/equipment" element={<EquipmentPage />} />
                <Route path="/equipment/transactions" element={<EquipmentPage />} />

                {/* Maintenance */}
                <Route path="/maintenance" element={<MaintenancePage />} />

                {/* Reports & Analytics */}
                <Route path="/reports" element={<ReportsPage />} />

                </Route>

                {/* Notifications */}
                <Route path="/notifications" element={<NotificationsPage />} />

                {/* Super Admin Management Pages */}
                <Route
                  path="/admin/departments"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <DepartmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 Wildcard */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
