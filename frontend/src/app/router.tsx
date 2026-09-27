import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { RoleRoute } from '../components/guards/RoleRoute';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { PatientRegisterPage } from '../pages/auth/PatientRegisterPage';
import { DoctorRegisterPage } from '../pages/auth/DoctorRegisterPage';
import { PatientDashboardPage } from '../pages/patient/PatientDashboardPage';
import { PatientHealthProfilePage } from '../pages/patient/PatientHealthProfilePage';
import { MedicalHistoryPage } from '../pages/patient/MedicalHistoryPage';
import { MedicalReportsPage } from '../pages/patient/MedicalReportsPage';
import { MedicalReportDetailPage } from '../pages/patient/MedicalReportDetailPage';
import { VitalsPage } from '../pages/patient/VitalsPage';
import { MedicationsPage } from '../pages/patient/MedicationsPage';
import { MedicationDetailPage } from '../pages/patient/MedicationDetailPage';
import { MedicationAdherencePage } from '../pages/patient/MedicationAdherencePage';
import { DoctorDashboardPage } from '../pages/doctor/DoctorDashboardPage';
import { DoctorProfilePage } from '../pages/doctor/DoctorProfilePage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { ChangePasswordPage } from '../pages/shared/ChangePasswordPage';
import { UnauthorizedPage } from '../pages/shared/UnauthorizedPage';
import { NotFoundPage } from '../pages/shared/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register/patient', element: <PatientRegisterPage /> },
      { path: '/register/doctor', element: <DoctorRegisterPage /> },
    ],
  },
  // Patient Portal
  {
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['PATIENT']}>
          <DashboardLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: '/patient/dashboard', element: <PatientDashboardPage /> },
      { path: '/patient/health-profile', element: <PatientHealthProfilePage /> },
      { path: '/patient/profile', element: <Navigate to="/patient/health-profile" replace /> },
      { path: '/patient/medical-history', element: <MedicalHistoryPage /> },
      { path: '/patient/reports', element: <MedicalReportsPage /> },
      { path: '/patient/reports/:id', element: <MedicalReportDetailPage /> },
      { path: '/patient/vitals', element: <VitalsPage /> },
      { path: '/patient/medications', element: <MedicationsPage /> },
      { path: '/patient/medications/:id', element: <MedicationDetailPage /> },
      { path: '/patient/medications/adherence', element: <MedicationAdherencePage /> },
    ],
  },
  // Doctor Portal
  {
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['DOCTOR']}>
          <DashboardLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: '/doctor/dashboard', element: <DoctorDashboardPage /> },
      { path: '/doctor/profile', element: <DoctorProfilePage /> },
    ],
  },
  // Admin Portal
  {
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['ADMIN']}>
          <DashboardLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: '/admin/dashboard', element: <AdminDashboardPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/audit-logs', element: <AdminAuditLogsPage /> },
    ],
  },
  // Shared Authenticated Routes
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/change-password', element: <ChangePasswordPage /> },
    ],
  },
  // Error & Status Routes
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
]);
