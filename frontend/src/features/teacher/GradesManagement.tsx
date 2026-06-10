import { useState, useEffect, useCallback } from 'react';
import { teacherService, type CreateNotaPayload, type UpdateNotaPayload, type StudentBasic } from './teacherService';
import type { Curso, Nota, Trimestre } from '../../@types';
import {
  FileText,
  Search,
  Plus,
  Edit3,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Filter,
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

const GradesManagement = () => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [students, setStudents] = useState<StudentBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCurso, setFilterCurso] = useState<string>('');
  const [filterTrimestre, setFilterTrimestre] = useState<string>('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateNotaPayload>({
    studentId: 0,
    cursoId: 0,
    valor: 0,
    trimestre: 'PRIMERO',
    comentario: '',
  });

  // ── Fetch data ──
  const fetchNotas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number> = {};
      if (filterCurso) params.cursoId = parseInt(filterCurso);
      if (filterTrimestre) params.trimestre = filterTrimestre;
      const res = await teacherService.getNotas(params);
      setNotas(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar notas';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filterCurso, filterTrimestre]);

  const fetchCursosAndStudents = useCallback(async () => {
    try {
      const [cursosRes, studentsRes] = await Promise.all([
        teacherService.getMisCursos(),
        teacherService.getStudents(),
      ]);
      setCursos(cursosRes.data);
      setStudents(studentsRes.data);
    } catch {
      // silently fail — notas still load
    }
  }, []);

  useEffect(() => {
    fetchNotas();
  }, [fetchNotas]);

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
  const openCreateModal = () => {
    setEditingNota(null);
    setFormData({
      studentId: students[0]?.id || 0,
      cursoId: cursos[0]?.id || 0,
      valor: 0,
      trimestre: 'PRIMERO',
      comentario: '',
    });
    setShowModal(true);
  };

  const openEditModal = (nota: Nota) => {
    setEditingNota(nota);
    setFormData({
      studentId: nota.studentId,
      cursoId: nota.cursoId,
      valor: nota.valor,
      trimestre: nota.trimestre,
      comentario: nota.comentario || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingNota) {
        const payload: UpdateNotaPayload = {
          valor: formData.valor,
          trimestre: formData.trimestre,
          comentario: formData.comentario,
        };
        await teacherService.updateNota(editingNota.id, payload);
        setToast({ type: 'success', message: 'Nota actualizada exitosamente' });
      } else {
        await teacherService.registrarNota(formData);
        setToast({ type: 'success', message: 'Nota registrada exitosamente' });
      }
      setShowModal(false);
      fetchNotas();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar nota';
      setToast({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  // ── Filtrado por búsqueda ──
  const filteredNotas = notas.filter((n) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const nombre = n.student?.user?.nombre?.toLowerCase() || '';
    const apellido = n.student?.user?.apellido?.toLowerCase() || '';
    const cursoNombre = n.curso?.nombre?.toLowerCase() || '';
    return nombre.includes(s) || apellido.includes(s) || cursoNombre.includes(s);
  });

  const getNotaColor = (valor: number) => {
    if (valor >= 17) return 'text-emerald-600 bg-emerald-50';
    if (valor >= 14) return 'text-blue-600 bg-blue-50';
    if (valor >= 11) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
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
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Notas</h2>
          <p className="text-sm text-slate-500 mt-1">
            Registra y administra las calificaciones de tus alumnos
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.97]"
        >
          <Plus className="w-5 h-5" />
          Registrar Nota
        </button>
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
          <select
            value={filterTrimestre}
            onChange={(e) => setFilterTrimestre(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all min-w-[160px]"
          >
            <option value="">Todos los trimestres</option>
            {TRIMESTRE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
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
            <button onClick={fetchNotas} className="text-blue-600 text-sm font-medium hover:underline">
              Reintentar
            </button>
          </div>
        ) : filteredNotas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <FileText className="w-12 h-12" />
            <p className="text-sm">No se encontraron notas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3.5 px-5 font-semibold text-slate-600">Alumno</th>
                  <th className="text-left py-3.5 px-5 font-semibold text-slate-600">Curso</th>
                  <th className="text-center py-3.5 px-5 font-semibold text-slate-600">Nota</th>
                  <th className="text-center py-3.5 px-5 font-semibold text-slate-600">Trimestre</th>
                  <th className="text-left py-3.5 px-5 font-semibold text-slate-600">Comentario</th>
                  <th className="text-right py-3.5 px-5 font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotas.map((nota) => (
                  <tr key={nota.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {nota.student?.user?.nombre?.[0] || '?'}{nota.student?.user?.apellido?.[0] || '?'}
                        </div>
                        <span className="font-medium text-slate-800">
                          {nota.student?.user?.nombre} {nota.student?.user?.apellido}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{nota.curso?.nombre || '-'}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-bold',
                        getNotaColor(nota.valor)
                      )}>
                        {Number(nota.valor).toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={cn(
                        'inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border',
                        TRIMESTRE_STYLES[nota.trimestre]
                      )}>
                        {TRIMESTRE_OPTIONS.find((t) => t.value === nota.trimestre)?.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 text-xs max-w-[200px] truncate">
                      {nota.comentario || '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => openEditModal(nota)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                          title="Editar nota"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create / Edit Nota */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                {editingNota ? 'Editar Nota' : 'Registrar Nueva Nota'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingNota && (
                <>
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
                          {s.user?.nombre} {s.user?.apellido} {s.grado ? `(${s.grado} - ${s.seccion})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
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
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nota (0-20) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={20}
                    step={0.01}
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trimestre *</label>
                  <select
                    required
                    value={formData.trimestre}
                    onChange={(e) => setFormData({ ...formData, trimestre: e.target.value as Trimestre })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  >
                    {TRIMESTRE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Comentario</label>
                <textarea
                  rows={3}
                  value={formData.comentario}
                  onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                  placeholder="Observaciones sobre la calificación..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Preview */}
              {formData.valor > 0 && (
                <div className={cn(
                  'flex items-center justify-center gap-3 py-3 rounded-xl',
                  getNotaColor(formData.valor)
                )}>
                  <span className="text-3xl font-bold">{formData.valor.toFixed(1)}</span>
                  <span className="text-sm font-medium opacity-75">/ 20</span>
                </div>
              )}

              {/* Actions */}
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
                  {editingNota ? 'Guardar Cambios' : 'Registrar Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesManagement;
