import { useState, useEffect } from 'react';
import { adminService, type DashboardStats } from './adminService';
import {
  Users,
  GraduationCap,
  CreditCard,
  Layers,
  TrendingUp,
  Activity,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        setStats(res.data);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Cargando métricas institucionales...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Alumnos',
      value: stats?.totalAlumnos || 0,
      icon: GraduationCap,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-600',
      link: '/dashboard/admin/users?role=STUDENT',
      footer: 'Estudiantes matriculados',
    },
    {
      title: 'Total Profesores',
      value: stats?.totalProfesores || 0,
      icon: Briefcase,
      color: 'bg-violet-500',
      gradient: 'from-violet-500 to-purple-600',
      link: '/dashboard/admin/users?role=TEACHER',
      footer: 'Docentes activos',
    },
    {
      title: 'Pagos Pendientes',
      value: stats?.pagosPendientes || 0,
      icon: CreditCard,
      color: 'bg-red-500',
      gradient: 'from-red-500 to-rose-600',
      link: '/dashboard/admin/payments',
      footer: 'Pendientes este mes',
    },
    {
      title: 'Secciones Activas',
      value: stats?.seccionesActivas || 0,
      icon: Layers,
      color: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-teal-600',
      link: '/dashboard/admin/sections',
      footer: 'Grados y secciones',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                 <ShieldCheck className="w-3.5 h-3.5" />
                 Panel de Control Admin
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                 Gestión <span className="text-blue-400">Institucional</span> Centralizada
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                 Supervisa el rendimiento académico, controla las finanzas y administra la estructura de grados de forma eficiente en un solo lugar.
              </p>
           </div>
           
           <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="w-40 h-40 bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col justify-between backdrop-blur-md">
                 <Activity className="w-6 h-6 text-blue-400" />
                 <div>
                    <p className="text-3xl font-bold">100%</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Sincronización</p>
                 </div>
              </div>
              <div className="w-40 h-40 bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col justify-between backdrop-blur-md translate-y-6">
                 <TrendingUp className="w-6 h-6 text-emerald-400" />
                 <div>
                    <p className="text-3xl font-bold">Live</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Métricas en Tiempo Real</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link 
              key={stat.title} 
              to={stat.link}
              className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg", stat.gradient)}>
                   <Icon className="w-7 h-7" />
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                   <ArrowRight className="w-5 h-5 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <p className="text-4xl font-black text-slate-900 mb-1">{stat.value}</p>
              <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wide">{stat.title}</h3>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-400 text-xs font-bold">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 {stat.footer}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Admin Modules Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
               <Activity className="w-5 h-5 text-blue-600" />
               Estado Operativo
            </h2>
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
               <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="relative w-40 h-40 shrink-0">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-blue-500" strokeDasharray={440} strokeDashoffset={440 * (1 - 0.85)} />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center font-black">
                        <span className="text-3xl">85%</span>
                        <span className="text-[10px] text-slate-400 uppercase">Salud</span>
                     </div>
                  </div>
                  <div className="space-y-6 flex-1">
                     <div className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-bold text-slate-600">Alumnos con pagos al día</span>
                           <span className="text-sm font-black text-slate-800">
                             {stats ? (( (stats.totalAlumnos - stats.pagosPendientes) / stats.totalAlumnos) * 100).toFixed(0) : 0}%
                           </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                           <div className="bg-emerald-500 h-full" style={{ width: stats ? `${(( (stats.totalAlumnos - stats.pagosPendientes) / stats.totalAlumnos) * 100)}%` : '0%' }} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-bold text-slate-600">Docentes activos</span>
                           <span className="text-sm font-black text-slate-800">100%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                           <div className="bg-blue-500 h-full" style={{ width: '100%' }} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
               <AlertCircle className="w-5 h-5 text-amber-500" />
               Avisos Críticos
            </h2>
            <div className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-8 space-y-6">
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                     <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                     <p className="text-sm font-black text-amber-900 uppercase tracking-tighter mb-1">Pagos Pendientes</p>
                     <p className="text-sm text-amber-700 leading-snug">
                        Hay <span className="font-bold">{stats?.pagosPendientes} alumnos</span> que aún no han regularizado su pensión del mes actual.
                     </p>
                  </div>
               </div>
               <div className="flex gap-4 pt-4 border-t border-amber-200/50">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                     <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                     <p className="text-sm font-black text-blue-900 uppercase tracking-tighter mb-1">Nuevas Solicitudes</p>
                     <p className="text-sm text-blue-700 leading-snug">
                       El sistema de matrículas 2026 está listo para recibir nuevos registros.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
