import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';

// Admin pages
import AdminDashboard from '../features/admin/AdminDashboard';
import UsersManagement from '../features/admin/UsersManagement';
import PaymentsManagement from '../features/admin/PaymentsManagement';
import AnnouncementsManagement from '../features/admin/AnnouncementsManagement';
import AcademicAssignment from '../features/admin/AcademicAssignment';
import GradosSeccionesManagement from '../features/admin/GradosSeccionesManagement';

// Teacher pages
import TeacherDashboard from '../features/teacher/TeacherDashboard';
import TeacherCourses from '../features/teacher/TeacherCourses';
import GradesManagement from '../features/teacher/GradesManagement';
import AttendanceManagement from '../features/teacher/AttendanceManagement';

// Student
import StudentDashboard from '../features/student/StudentDashboard';
import StudentGrades from '../features/student/StudentGrades';
import StudentPayments from '../features/student/StudentPayments';
import StudentAttendance from '../features/student/StudentAttendance';
import StudentSchedule from '../features/student/StudentSchedule';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <ProtectedRoute />,
        children: [
          {
            path: 'admin',
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
              { path: '', element: <AdminDashboard /> },
              { path: 'users', element: <UsersManagement /> },
              { path: 'payments', element: <PaymentsManagement /> },
              { path: 'announcements', element: <AnnouncementsManagement /> },
              { path: 'academic-assignment', element: <AcademicAssignment /> },
              { path: 'sections', element: <GradosSeccionesManagement /> },
            ],
          },
          {
            path: 'teacher',
            element: <ProtectedRoute allowedRoles={['TEACHER']} />,
            children: [
              { path: '', element: <TeacherDashboard /> },
              { path: 'courses', element: <TeacherCourses /> },
              { path: 'grades', element: <GradesManagement /> },
              { path: 'attendance', element: <AttendanceManagement /> },
            ],
          },
          {
            path: 'student',
            element: <ProtectedRoute allowedRoles={['STUDENT']} />,
            children: [
              { path: '', element: <StudentDashboard /> },
              { path: 'grades', element: <StudentGrades /> },
              { path: 'payments', element: <StudentPayments /> },
              { path: 'attendance', element: <StudentAttendance /> },
              { path: 'schedule', element: <StudentSchedule /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <div>Acceso no autorizado</div>,
  },
  {
    path: '*',
    element: <div>404 No encontrado</div>,
  },
]);

