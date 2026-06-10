import { useState, useEffect, useCallback } from 'react';
import { teacherService } from './teacherService';
import type { Curso } from '../../@types';
import {
  Layers,
  Loader2,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Users,
  MapPin,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const TeacherCourses = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCursos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await teacherService.getMisCursos();
      setCursos(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar cursos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const gradientColors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-sky-600',
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all animate-[slideIn_0.3s_ease]',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          )}
        >
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mis Cursos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Cursos que tienes asignados para el periodo académico actual
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
          <Layers className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">{cursos.length} cursos asignados</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle className="w-10 h-10" />
          <p className="text-sm">{error}</p>
          <button onClick={fetchCursos} className="text-blue-600 text-sm font-medium hover:underline">
            Reintentar
          </button>
        </div>
      ) : cursos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">Sin cursos asignados</h3>
          <p className="text-sm text-slate-400">Aún no tienes cursos asignados. Contacta al administrador.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cursos.map((curso, i) => (
            <div
              key={curso.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group"
            >
              {/* Banner de color */}
              <div className={cn('h-28 bg-gradient-to-br flex items-center justify-center relative', gradientColors[i % gradientColors.length])}>
                <BookOpen className="w-12 h-12 text-white/30 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider',
                    curso.activo
                      ? 'bg-white/20 text-white backdrop-blur-sm'
                      : 'bg-red-500/80 text-white'
                  )}>
                    {curso.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-1">{curso.nombre}</h3>
                {curso.descripcion && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{curso.descripcion}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {curso.grado && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      {curso.grado}
                    </span>
                  )}
                  {curso.seccion && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                      <Users className="w-3.5 h-3.5" />
                      Sección {curso.seccion}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;
