import { useState, useEffect } from 'react';
import { teacherService } from './teacherService';
import type { Curso, Nota, Asistencia } from '../../@types';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
  Users,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const TeacherDashboard = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cursosRes, notasRes, asistenciasRes] = await Promise.all([
          teacherService.getMisCursos(),
          teacherService.getNotas(),
          teacherService.getAsistencias(),
        ]);
        setCursos(cursosRes.data);
        setNotas(notasRes.data);
        setAsistencias(asistenciasRes.data);
      } catch {
        // silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const promedio =
    notas.length > 0
      ? (notas.reduce((acc, n) => acc + Number(n.valor), 0) / notas.length).toFixed(1)
      : '—';

  const hoyStr = new Date().toISOString().split('T')[0];
  const asistenciasHoy = asistencias.filter((a) => a.fecha === hoyStr);

  const cards = [
    {
      title: 'Mis Cursos',
      value: cursos.length,
      subtitle: 'cursos asignados',
      icon: Layers,
      gradient: 'from-blue-500 to-indigo-600',
      link: '/dashboard/teacher/courses',
    },
    {
      title: 'Notas Registradas',
      value: notas.length,
      subtitle: 'calificaciones totales',
      icon: FileText,
      gradient: 'from-violet-500 to-purple-600',
      link: '/dashboard/teacher/grades',
    },
    {
      title: 'Promedio General',
      value: promedio,
      subtitle: 'de todas las notas',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      link: '/dashboard/teacher/grades',
    },
    {
      title: 'Asistencia Hoy',
      value: asistenciasHoy.length,
      subtitle: 'registros de hoy',
      icon: Calendar,
      gradient: 'from-amber-500 to-orange-600',
      link: '/dashboard/teacher/attendance',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -right-4 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Panel Docente</h2>
          </div>
          <p className="text-blue-100 text-sm max-w-lg">
            Bienvenido a tu panel docente. Desde aquí podrás gestionar los cursos asignados,
            registrar notas y tomar asistencia diaria de tus alumnos.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', card.gradient)}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{card.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{card.subtitle}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Grades */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Últimas Notas Registradas</h3>
            <Link to="/dashboard/teacher/grades" className="text-xs text-blue-600 hover:underline font-medium">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {notas.slice(0, 5).map((nota) => (
              <div key={nota.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {nota.student?.user?.nombre?.[0]}{nota.student?.user?.apellido?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {nota.student?.user?.nombre} {nota.student?.user?.apellido}
                  </p>
                  <p className="text-xs text-slate-400">{nota.curso?.nombre}</p>
                </div>
                <span className={cn(
                  'text-sm font-bold px-2 py-0.5 rounded-lg',
                  Number(nota.valor) >= 14 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                )}>
                  {Number(nota.valor).toFixed(1)}
                </span>
              </div>
            ))}
            {notas.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Sin notas registradas aún
              </div>
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Últimas Asistencias</h3>
            <Link to="/dashboard/teacher/attendance" className="text-xs text-blue-600 hover:underline font-medium">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {asistencias.slice(0, 5).map((a) => {
              const isPresente = a.estado === 'PRESENTE';
              return (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {a.student?.user?.nombre?.[0]}{a.student?.user?.apellido?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {a.student?.user?.nombre} {a.student?.user?.apellido}
                    </p>
                    <p className="text-xs text-slate-400">{a.curso?.nombre} — {a.fecha}</p>
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider',
                    isPresente ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                  )}>
                    {a.estado}
                  </span>
                </div>
              );
            })}
            {asistencias.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Sin asistencias registradas aún
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
