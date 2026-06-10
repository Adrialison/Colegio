import { useState, useEffect, useCallback } from 'react';
import { studentService } from './studentService';
import type { Asistencia } from '../../@types';
import {
  Calendar,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const ASISTENCIA_STATS = [
  { value: 'PRESENTE', label: 'Presente', icon: UserCheck, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
  { value: 'AUSENTE', label: 'Ausente', icon: UserX, color: 'text-red-500 bg-red-50 border-red-100' },
  { value: 'TARDANZA', label: 'Tardanza', icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-100' },
  { value: 'JUSTIFICADO', label: 'Justificado', icon: ShieldCheck, color: 'text-blue-500 bg-blue-50 border-blue-100' },
];

const StudentAttendance = () => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAsistencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentService.getMyAsistencias();
      setAsistencias(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar tu asistencia';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAsistencias();
  }, [fetchAsistencias]);

  const stats = {
    presente: asistencias.filter(a => a.estado === 'PRESENTE').length,
    ausente: asistencias.filter(a => a.estado === 'AUSENTE').length,
    tardanza: asistencias.filter(a => a.estado === 'TARDANZA').length,
    justificado: asistencias.filter(a => a.estado === 'JUSTIFICADO').length,
    total: asistencias.length,
  };

  const attendanceRate = stats.total > 0 ? ((stats.presente / stats.total) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mi Asistencia</h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualiza tu historial de asistencia y puntualidad por curso
          </p>
        </div>
        
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
              {attendanceRate}%
           </div>
           <div>
              <p className="text-sm font-bold text-slate-800 tracking-tight leading-none">Índice de Asistencia</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                 <div className="bg-blue-500 h-full transition-all" style={{ width: `${attendanceRate}%` }} />
              </div>
           </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {ASISTENCIA_STATS.map(stat => {
            const Icon = stat.icon;
            const value = stats[stat.value.toLowerCase() as keyof typeof stats];
            return (
               <div key={stat.value} className={cn("rounded-2xl border p-4 shadow-sm bg-white transition-all hover:shadow-md", "border-slate-200")}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 border", stat.color)}>
                     <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{value}</p>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
               </div>
            )
         })}
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Analizando historial de asistencia...</p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center mt-24 px-6 text-center text-red-500">
             <AlertCircle className="w-12 h-12 mb-4" />
             <p className="font-semibold">{error}</p>
           </div>
        ) : asistencias.length === 0 ? (
           <div className="flex flex-col items-center justify-center mt-24 text-slate-400 text-center px-6">
             <Calendar className="w-16 h-16 opacity-20 mb-4" />
             <p className="text-lg font-medium text-slate-600">Nada registrado aún</p>
             <p className="text-sm mt-2">Parece que no hay registros de asistencia en tu historial.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">Fecha</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">Curso</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-600">Estado</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {asistencias.map((a) => {
                   const style = ASISTENCIA_STATS.find(s => s.value === a.estado);
                   const Icon = style?.icon || UserCheck;
                   return (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-700 font-mono">
                      {new Date(a.fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-bold">{a.curso?.nombre}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                        style?.color
                      )}>
                        <Icon className="w-3.5 h-3.5" />
                        {style?.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 italic text-xs max-w-sm truncate whitespace-nowrap">
                       {a.observacion || '—'}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
