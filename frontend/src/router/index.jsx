import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '../components/layout/AppShell';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import StudentsPage from '../pages/admin/StudentsPage';
import StudentProfilePage from '../pages/admin/StudentProfilePage';
import TeachersPage from '../pages/admin/TeachersPage';
import AttendancePage from '../pages/admin/AttendancePage';
import GradesPage from '../pages/admin/GradesPage';
import FeesPage from '../pages/admin/FeesPage';
import CalendarPage from '../pages/admin/CalendarPage';
import StudentPortalPage from '../pages/student/StudentPortalPage';
import ParentPortalPage from '../pages/parent/ParentPortalPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
          { path: '/admin/dashboard',    element: <DashboardPage /> },
          { path: '/admin/students',     element: <StudentsPage /> },
          { path: '/admin/students/:id', element: <StudentProfilePage /> },
          { path: '/admin/teachers',     element: <TeachersPage /> },
          { path: '/admin/attendance',   element: <AttendancePage /> },
          { path: '/admin/grades',       element: <GradesPage /> },
          { path: '/admin/fees',         element: <FeesPage /> },
          { path: '/admin/calendar',     element: <CalendarPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/student/portal', element: <StudentPortalPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['parent']} />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/parent/portal', element: <ParentPortalPage /> },
        ],
      },
    ],
  },
]);
