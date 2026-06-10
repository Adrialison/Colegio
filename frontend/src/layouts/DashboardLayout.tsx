import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/useAuthStore";
import { cn } from "../lib/utils";
import {
  LogOut,
  Users,
  Settings,
  BookOpen,
  Calendar,
  Layers,
  FileText,
  Activity,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

export const DashboardLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Definición de menú por roles
  const menuItems = {
    ADMIN: [
      { name: "Dashboard Admin", path: "/dashboard/admin", icon: Settings },
      { name: "Gestión Usuarios", path: "/dashboard/admin/users", icon: Users },
      {
        name: "Asignación Académica",
        path: "/dashboard/admin/academic-assignment",
        icon: BookOpen,
      },
      {
        name: "Grados y Secciones",
        path: "/dashboard/admin/sections",
        icon: Layers,
      },
      {
        name: "Pagos y Finanzas",
        path: "/dashboard/admin/payments",
        icon: Activity,
      },
      {
        name: "Comunicados",
        path: "/dashboard/admin/announcements",
        icon: FileText,
      },
    ],
    TEACHER: [
      { name: "Panel Profesor", path: "/dashboard/teacher", icon: BookOpen },
      { name: "Mis Cursos", path: "/dashboard/teacher/courses", icon: Layers },
      { name: "Notas", path: "/dashboard/teacher/grades", icon: FileText },
      {
        name: "Asistencia",
        path: "/dashboard/teacher/attendance",
        icon: Calendar,
      },
    ],
    STUDENT: [
      { name: "Portal Alumno", path: "/dashboard/student", icon: BookOpen },
      { name: "Mis Notas", path: "/dashboard/student/grades", icon: FileText },
      {
        name: "Mi Asistencia",
        path: "/dashboard/student/attendance",
        icon: Calendar,
      },
      {
        name: "Mi Horario",
        path: "/dashboard/student/schedule",
        icon: Calendar,
      },
      { name: "Pagos", path: "/dashboard/student/payments", icon: Activity },
    ],
  };

  const currentMenu = menuItems[user.role] || [];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20",
          sidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
          {sidebarOpen && (
            <div className="flex items-center space-x-2 text-primary">
              <BookOpen className="w-8 h-8" />
              <span className="font-bold text-lg text-slate-800 tracking-tight">
                EduManage
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors mx-auto"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {currentMenu.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.name}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2.5 transition-all text-sm font-medium",
                  isActive
                    ? "bg-primary-50 text-primary-dark"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon
                  className={cn(
                    "shrink-0",
                    sidebarOpen ? "mr-3 w-5 h-5" : "mx-auto w-6 h-6",
                    isActive
                      ? "text-primary"
                      : "text-slate-500 group-hover:text-slate-700",
                  )}
                />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 flex-shrink-0">
          <div
            className={cn(
              "flex items-center",
              sidebarOpen ? "justify-between" : "justify-center",
            )}
          >
            {sidebarOpen && (
              <div className="flex flex-col overflow-hidden mr-3">
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {user.nombre} {user.apellido}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {user.email}
                </span>
                <span className="text-[10px] font-bold text-primary-dark mt-0.5 uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            )}
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight capitalize">
            {location.pathname.split("/").pop()?.replace("-", " ") ||
              "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">
              Sistema Online
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
