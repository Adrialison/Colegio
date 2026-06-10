import { useState, useEffect, useCallback } from 'react';
import { studentService, type MyNotasResponse } from './studentService';
import type { Trimestre } from '../../@types';
import {
  FileText,
  Loader2,
  AlertCircle,
  Filter,
  Award,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const TRIMESTRE_OPTIONS: { value: Trimestre; label: string }[] = [
  { value: 'PRIMERO', label: '1er Trimestre' },
  { value: 'SEGUNDO', label: '2do Trimestre' },
  { value: 'TERCERO', label: '3er Trimestre' },
];

const TRIMESTRE_STYLES: Record<Trimestre, string> = {
  PRIMERO: 'bg-blue-100 text-blue-700 border-blue-200',
  SEGUNDO: 'bg-amber-100 text-amber-700 border-amber-200',
  TERCERO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const StudentGrades = () => {
  const [data, setData] = useState<MyNotasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTrimestre, setFilterTrimestre] = useState<string>('');

  const fetchNotas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number> = {};
      if (filterTrimestre) params.trimestre = filterTrimestre;
      const res = await studentService.getMyNotas(params);
      setData(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar tus notas';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filterTrimestre]);

  useEffect(() => {
    fetchNotas();
  }, [fetchNotas]);

  const getNotaColor = (valor: number) => {
    if (valor >= 17) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (valor >= 14) return 'text-blue-500 bg-blue-50 border-blue-100';
    if (valor >= 11) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-red-500 bg-red-50 border-red-100';
  };

  const getNotaBadgeColor = (valor: number) => {
    if (valor >= 11) return 'bg-emerald-100 text-emerald-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mis Calificaciones</h2>
          <p className="text-sm text-slate-500 mt-1">
            Revisa tu rendimiento académico por cada trimestre y curso
          </p>
        </div>
        
        {data && (
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
            <div className={cn(
               "w-12 h-12 rounded-xl flex items-center justify-center text-white",
               Number(data.promedioGeneral) >= 14 ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20 shadow-lg" : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20 shadow-lg"
            )}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {Number(data.promedioGeneral).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 font-medium">Promedio General</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterTrimestre}
            onChange={(e) => setFilterTrimestre(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none min-w-[150px]"
          >
            <option value="">Todos los trimestres</option>
            {TRIMESTRE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Cargando calificaciones...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center mt-24 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="text-slate-700 font-semibold mb-2">{error}</p>
            <button onClick={fetchNotas} className="text-blue-600 font-medium hover:underline text-sm">
              Intentar de nuevo
            </button>
          </div>
        ) : !data || data.notas.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24 text-slate-400 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 opacity-30" />
            </div>
            <p className="text-lg font-medium text-slate-600">Sin registros</p>
            <p className="text-sm max-w-xs mx-auto mt-2">
              Aún no tienes notas registradas para este periodo o filtro.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">Curso</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-600">Trimestre</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-600">Nota</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-600">Estado</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.notas.map((nota) => (
                  <tr key={nota.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6">
                       <span className="font-bold text-slate-800">{nota.curso?.nombre}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        'inline-flex px-3 py-1 rounded-full text-xs font-bold border',
                        TRIMESTRE_STYLES[nota.trimestre]
                      )}>
                        {TRIMESTRE_OPTIONS.find((t) => t.value === nota.trimestre)?.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center w-12 h-8 rounded-xl font-bold border transition-all hover:scale-110',
                        getNotaColor(nota.valor)
                      )}>
                        {Number(nota.valor).toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider',
                        getNotaBadgeColor(nota.valor)
                      )}>
                        {nota.valor >= 11 ? 'Aprobado' : 'Reprobado'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs text-slate-500 italic max-w-sm truncate whitespace-nowrap">
                        {nota.comentario || '—'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGrades;
