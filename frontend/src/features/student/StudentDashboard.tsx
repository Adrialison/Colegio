import { useState, useEffect, useCallback } from 'react';
import { studentService, type MyNotasResponse, type MyPagosResponse } from './studentService';
import type { Comunicado } from '../../@types';
import { Link } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  Loader2,
  Users,
  TrendingUp,
  MessageSquare,
  Bell,
  Star,
  Award,
  DollarSign,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../auth/useAuthStore';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [notasData, setNotasData] = useState<MyNotasResponse | null>(null);
  const [pagosData, setPagosData] = useState<MyPagosResponse | null>(null);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [notasRes, pagosRes, comunicadosRes] = await Promise.all([
        studentService.getMyNotas(),
        studentService.getMyPagos(),
        studentService.getComunicados(),
      ]);
      setNotasData(notasRes.data);
      setPagosData(pagosRes.data);
      setComunicados(comunicadosRes.data);
    } catch {
      // silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cards = [
    {
      title: 'Mi Promedio',
      value: notasData ? Number(notasData.promedioGeneral).toFixed(2) : '0.00',
      subtitle: 'promedio general',
      icon: Award,
      gradient: 'from-blue-600 to-indigo-700 shadow-blue-500/20 shadow-lg',
      link: '/dashboard/student/grades',
    },
    {
      title: 'Pensiones',
      value: pagosData?.estadoPago ? 'Al Día' : 'Pendiente',
      subtitle: 'estado de pagos',
      icon: DollarSign,
      gradient: pagosData?.estadoPago ? 'from-emerald-500 to-teal-600 shadow-emerald-500/20 shadow-lg' : 'from-red-500 to-rose-600 shadow-red-500/20 shadow-lg',
      link: '/dashboard/student/payments',
    },
    {
      title: 'Notas Totales',
      value: notasData?.notas.length || 0,
      subtitle: 'notas registradas',
      icon: FileText,
      gradient: 'from-violet-500 to-purple-600 shadow-purple-500/20 shadow-lg',
      link: '/dashboard/student/grades',
    },
    {
       title: 'Comunicados',
       value: comunicados.length || 0,
       subtitle: 'nuevos avisos',
       icon: Bell,
       gradient: 'from-amber-500 to-orange-600 shadow-amber-500/20 shadow-lg',
       link: '/dashboard/student',
    }
  ];

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center py-20 min-h-[500px]">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Cargando tu información académica...</p>
       </div>
     );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />
         <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/10 blur-[80px] rounded-full" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm animate-bounce-slow">
                     <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  </div>
                  <span className="text-indigo-200 font-bold uppercase tracking-widest text-xs">AÑO ACADÉMICO 2026</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  ¡Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">{user?.nombre}</span>! 👋
               </h1>
               <p className="text-indigo-200/80 text-lg max-w-lg leading-relaxed font-medium">
                  Bienvenido a tu portal. Tienes <span className="text-white font-bold">{comunicados.length} comunicados</span> nuevos y tus calificaciones están al día.
               </p>
               <div className="flex gap-4 pt-2">
                  <Link to="/dashboard/student/grades" className="px-6 py-3 bg-white text-slate-950 rounded-2xl font-bold hover:scale-105 transition-transform text-sm shadow-xl shadow-white/10">
                     Ver Mis Notas
                  </Link>
                  <Link to="/dashboard/student/payments" className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all text-sm backdrop-blur-sm">
                     Consultar Pagos
                  </Link>
               </div>
            </div>
            
            <div className="hidden lg:block">
               <div className="w-64 h-64 bg-white/5 rounded-[3rem] border border-white/10 p-6 flex flex-col justify-between backdrop-blur-md">
                   <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-blue-300" />
                      <span className="font-bold text-white text-sm">Rendimiento</span>
                   </div>
                   <div>
                      <p className="text-5xl font-black text-white">{notasData ? Number(notasData.promedioGeneral).toFixed(1) : '0.0'}</p>
                      <p className="text-xs text-indigo-300 font-medium mt-1 uppercase tracking-widest">Promedio Actual</p>
                   </div>
                   <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                       <div className="bg-gradient-to-r from-blue-400 to-indigo-400 h-full" style={{ width: `${Number(notasData?.promedioGeneral || 0) * 5}%` }} />
                   </div>
               </div>
            </div>
         </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-white', card.gradient)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                   <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-widest">{card.title}</p>
              <p className="text-2xl font-black text-slate-800">{card.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{card.subtitle}</p>
            </Link>
          );
        })}
      </div>

      {/* Panels Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Content: Grades & Courses */}
          <div className="xl:col-span-8 space-y-10">
              {/* Recent Grades */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                     <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-800">Últimas Calificaciones</h3>
                     </div>
                     <Link to="/dashboard/student/grades" className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors">
                        Ver historial completo
                     </Link>
                  </div>
                  <div className="p-2">
                      <div className="divide-y divide-slate-100">
                          {notasData?.notas.slice(0, 5).map((nota) => (
                             <div key={nota.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all rounded-2xl group">
                                <div className="flex items-center gap-5">
                                   <div className={cn(
                                       "w-14 h-14 rounded-[1.25rem] border flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110",
                                       Number(nota.valor) >= 14 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                   )}>
                                      {Number(nota.valor).toFixed(1)}
                                   </div>
                                   <div>
                                      <h4 className="font-bold text-slate-800 text-lg">{nota.curso?.nombre}</h4>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{nota.trimestre}</p>
                                   </div>
                                </div>
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-bold text-slate-700 italic">" {nota.comentario || 'Buen desempeño' } "</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">COMENTARIO DEL DOCENTE</p>
                                </div>
                             </div>
                          ))}
                          {(notasData?.notas.length === 0) && (
                             <div className="py-20 text-center text-slate-400">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-bold">Aún no tienes notas registradas en este periodo.</p>
                             </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Sidebar Area: Announcements */}
          <div className="xl:col-span-4 space-y-10">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden h-full shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl" />
                   
                   <div className="flex items-center gap-3 mb-8">
                       <MessageSquare className="w-6 h-6 text-blue-400" />
                       <h3 className="text-xl font-bold">Avisos del Colegio</h3>
                   </div>
                   
                   <div className="space-y-6">
                       {comunicados.slice(0, 4).map((com) => (
                          <div key={com.id} className="group cursor-pointer">
                             <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:translate-x-1">
                                <div className={cn(
                                   "w-2 h-2 rounded-full mt-2 shrink-0",
                                   com.tipo === 'URGENTE' ? "bg-red-500 animate-pulse" : "bg-blue-500"
                                )} />
                                <div>
                                   <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">
                                      {new Date(com.fechaPublicacion).toLocaleDateString()}
                                   </p>
                                   <h4 className="font-bold text-white text-sm leading-snug mb-1 group-hover:text-blue-300 transition-colors">
                                      {com.titulo}
                                   </h4>
                                   <p className="text-indigo-200/50 text-xs line-clamp-2">
                                      {com.contenido}
                                   </p>
                                </div>
                             </div>
                          </div>
                       ))}
                       {comunicados.length === 0 && (
                          <div className="text-center py-10 opacity-30">
                             <Bell className="w-12 h-12 mx-auto mb-4 border border-white/20 p-3 rounded-full" />
                             <p className="text-sm font-medium">No hay comunicados activos</p>
                          </div>
                       )}
                   </div>
                   
                   <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm text-indigo-200 hover:bg-white/10 transition-all">
                      Ver todos los comunicados
                   </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
