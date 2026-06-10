import { useState, useEffect, useCallback } from 'react';
import { teacherService, type CreateAsistenciaPayload, type StudentBasic } from './teacherService';
import type { Curso, Asistencia, EstadoAsistencia } from '../../@types';
import {
  Calendar,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Filter,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const ESTADO_OPTIONS: { value: EstadoAsistencia; label: string; icon: typeof UserCheck; color: string }[] = [
  { value: 'PRESENTE', label: 'Presente', icon: UserCheck, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'AUSENTE', label: 'Ausente', icon: UserX, color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'TARDANZA', label: 'Tardanza', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'JUSTIFICADO', label: 'Justificado', icon: ShieldCheck, color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const AttendanceManagement = () => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [students, setStudents] = useState<StudentBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCurso, setFilterCurso] = useState<string>('');
  const [filterFecha, setFilterFecha] = useState<string>('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Bulk mode: register attendance for an entire class
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkCursoId, setBulkCursoId] = useState<number>(0);
  const [bulkFecha, setBulkFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bulkRecords, setBulkRecords] = useState<Record<number, { estado: EstadoAsistencia; observacion: string }>>({});

  // Single form
  const [formData, setFormData] = useState<CreateAsistenciaPayload>({
    studentId: 0,
    cursoId: 0,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'PRESENTE',
    observacion: '',
  });

  // ── Fetch data ──
  const fetchAsistencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number> = {};
      if (filterCurso) params.cursoId = parseInt(filterCurso);
      if (filterFecha) params.fecha = filterFecha;
      const res = await teacherService.getAsistencias(params);
      setAsistencias(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar asistencias';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filterCurso, filterFecha]);

  const fetchCursosAndStudents = useCallback(async () => {
    try {
      const [cursosRes, studentsRes] = await Promise.all([
        teacherService.getMisCursos(),
        teacherService.getStudents(),
      ]);
      setCursos(cursosRes.data);
      setStudents(studentsRes.data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchAsistencias();
  }, [fetchAsistencias]);

  useEffect(() => {
    fetchCursosAndStudents();
  }, [fetchCursosAndStudents]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ── Handlers ──
  const openSingleModal = () => {
    setBulkMode(false);
    setFormData({
      studentId: students[0]?.id || 0,
      cursoId: cursos[0]?.id || 0,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'PRESENTE',
      observacion: '',
    });
    setShowModal(true);
  };

  const openBulkModal = () => {
    setBulkMode(true);
    setBulkCursoId(cursos[0]?.id || 0);
    setBulkFecha(new Date().toISOString().split('T')[0]);
    // Initialize all students as PRESENTE
    const initial: Record<number, { estado: EstadoAsistencia; observacion: string }> = {};
    students.forEach((s) => {
      initial[s.id] = { estado: 'PRESENTE', observacion: '' };
    });
    setBulkRecords(initial);
    setShowModal(true);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teacherService.registrarAsistencia(formData);
      setToast({ type: 'success', message: 'Asistencia registrada exitosamente' });
      setShowModal(false);
      fetchAsistencias();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar asistencia';
      setToast({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCursoId) return;
    setSaving(true);
    try {
      const promises = Object.entries(bulkRecords).map(([studentId, record]) =>
        teacherService.registrarAsistencia({
          studentId: parseInt(studentId),
          cursoId: bulkCursoId,
          fecha: bulkFecha,
          estado: record.estado,
          observacion: record.observacion || undefined,
        })
      );
      await Promise.all(promises);
      setToast({ type: 'success', message: `Asistencia registrada para ${promises.length} alumnos` });
      setShowModal(false);
      fetchAsistencias();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar asistencias';
      setToast({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  // ── Filtrado por búsqueda ──
  const filteredAsistencias = asistencias.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const nombre = a.student?.user?.nombre?.toLowerCase() || '';
    const apellido = a.student?.user?.apellido?.toLowerCase() || '';
    const cursoNombre = a.curso?.nombre?.toLowerCase() || '';
    return nombre.includes(s) || apellido.includes(s) || cursoNombre.includes(s);
  });

  // Stats
  const stats = {
    total: asistencias.length,
    presentes: asistencias.filter((a) => a.estado === 'PRESENTE').length,
    ausentes: asistencias.filter((a) => a.estado === 'AUSENTE').length,
    tardanzas: asistencias.filter((a) => a.estado === 'TARDANZA').length,
    justificados: asistencias.filter((a) => a.estado === 'JUSTIFICADO').length,
  };

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
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Asistencia</h2>
          <p className="text-sm text-slate-500 mt-1">
            Registra la asistencia diaria de tus alumnos por curso
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openSingleModal}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Individual
          </button>
          <button
            onClick={openBulkModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.97]"
          >
            <Calendar className="w-5 h-5" />
            Pasar Lista
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Presentes', value: stats.presentes, color: 'from-emerald-500 to-teal-600', icon: UserCheck },
          { label: 'Ausentes', value: stats.ausentes, color: 'from-red-500 to-rose-600', icon: UserX },
          { label: 'Tardanzas', value: stats.tardanzas, color: 'from-amber-500 to-orange-600', icon: Clock },
          { label: 'Justificados', value: stats.justificados, color: 'from-blue-500 to-indigo-600', icon: ShieldCheck },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shrink-0', color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por alumno o curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCurso}
            onChange={(e) => setFilterCurso(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all min-w-[160px]"
          >
            <option value="">Todos los cursos</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
            <AlertCircle className="w-10 h-10" />
            <p className="text-sm">{error}</p>
            <button onClick={fetchAsistencias} className="text-blue-600 text-sm font-medium hover:underline">
              Reintentar
            </button>
          </div>
        ) : filteredAsistencias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Calendar className="w-12 h-12" />
            <p className="text-sm">No se encontraron registros de asistencia</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3.5 px-5 font-semibold text-slate-600">Alumno</th>
                  <th className="text-left py-3.5 px-5 font-semibold text-slate-600">Curso</th>
                  <th className="text-center py-3.5 px-5 font-semibold text-slate-600">Fecha</th>
                  <th className="text-center py-3.5 px-5 font-semibold text-slate-600">Estado</th>
                  <th className="text-left py-3.5 px-5 font-semibold text-slate-600">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAsistencias.map((a) => {
                  const estadoInfo = ESTADO_OPTIONS.find((e) => e.value === a.estado);
                  const EstadoIcon = estadoInfo?.icon || UserCheck;
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {a.student?.user?.nombre?.[0] || '?'}{a.student?.user?.apellido?.[0] || '?'}
                          </div>
                          <span className="font-medium text-slate-800">
                            {a.student?.user?.nombre} {a.student?.user?.apellido}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{a.curso?.nombre || '-'}</td>
                      <td className="py-3.5 px-5 text-center text-slate-600">
                        {new Date(a.fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border',
                          estadoInfo?.color
                        )}>
                          <EstadoIcon className="w-3.5 h-3.5" />
                          {estadoInfo?.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-xs max-w-[200px] truncate">
                        {a.observacion || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal ── Single or Bulk */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className={cn(
            "relative bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto",
            bulkMode ? 'w-full max-w-2xl' : 'w-full max-w-lg'
          )}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">
                {bulkMode ? 'Pasar Lista — Asistencia General' : 'Registrar Asistencia Individual'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <span className="text-slate-500 text-xl leading-none">&times;</span>
              </button>
            </div>

            {/* ── Single Mode ── */}
            {!bulkMode && (
              <form onSubmit={handleSingleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alumno *</label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  >
                    <option value={0} disabled>Seleccionar alumno</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.user?.nombre} {s.user?.apellido}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Curso *</label>
                    <select
                      required
                      value={formData.cursoId}
                      onChange={(e) => setFormData({ ...formData, cursoId: parseInt(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    >
                      <option value={0} disabled>Seleccionar curso</option>
                      {cursos.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha *</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Estado *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ESTADO_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = formData.estado === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, estado: opt.value })}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                            isSelected
                              ? cn(opt.color, 'ring-2 ring-offset-1 ring-blue-400')
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Observación</label>
                  <textarea
                    rows={2}
                    value={formData.observacion}
                    onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                    placeholder="Opcional..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-60 shadow-lg shadow-blue-600/25"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Registrar
                  </button>
                </div>
              </form>
            )}

            {/* ── Bulk Mode ── */}
            {bulkMode && (
              <form onSubmit={handleBulkSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Curso *</label>
                    <select
                      required
                      value={bulkCursoId}
                      onChange={(e) => setBulkCursoId(parseInt(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    >
                      <option value={0} disabled>Seleccionar curso</option>
                      {cursos.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha *</label>
                    <input
                      type="date"
                      required
                      value={bulkFecha}
                      onChange={(e) => setBulkFecha(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Student list */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">{students.length} alumnos</span>
                    <div className="flex gap-1">
                      {ESTADO_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            const updated = { ...bulkRecords };
                            Object.keys(updated).forEach((id) => {
                              updated[parseInt(id)] = { ...updated[parseInt(id)], estado: opt.value };
                            });
                            setBulkRecords(updated);
                          }}
                          className="px-2 py-1 text-[10px] font-semibold rounded-md border border-slate-200 text-slate-500 hover:bg-white transition-colors"
                          title={`Marcar todos como ${opt.label}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
                    {students.map((student) => {
                      const record = bulkRecords[student.id] || { estado: 'PRESENTE', observacion: '' };
                      return (
                        <div key={student.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                            {student.user?.nombre?.[0]}{student.user?.apellido?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {student.user?.nombre} {student.user?.apellido}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {ESTADO_OPTIONS.map((opt) => {
                              const Icon = opt.icon;
                              const isSelected = record.estado === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    setBulkRecords((prev) => ({
                                      ...prev,
                                      [student.id]: { ...prev[student.id], estado: opt.value },
                                    }));
                                  }}
                                  className={cn(
                                    'p-1.5 rounded-lg transition-all',
                                    isSelected
                                      ? cn(opt.color, 'border')
                                      : 'text-slate-300 hover:text-slate-500'
                                  )}
                                  title={opt.label}
                                >
                                  <Icon className="w-4 h-4" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-60 shadow-lg shadow-blue-600/25"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Guardar Asistencia ({students.length} alumnos)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
