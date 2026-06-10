import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/useAuthStore';
import type { Role } from '../@types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    // No autenticado, redirigir al login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Autenticado pero sin los permisos adecuados
    return <Navigate to="/unauthorized" replace />;
  }

  // Se permite el acceso
  return <Outlet />;
};
