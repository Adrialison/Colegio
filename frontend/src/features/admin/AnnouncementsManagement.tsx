import { useState, useEffect, useCallback } from 'react';
import { adminService, type CreateComunicadoPayload } from './adminService';
import type { Comunicado, ComunicadoTipo } from '../../@types';
import {
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Megaphone,
  Clock,
  Tag,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ── Constantes ──
const TIPO_OPTIONS: { value: ComunicadoTipo; label: string; color: string }[] = [
  { value: 'GENERAL', label: 'General', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'URGENTE', label: 'Urgente', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'ACADEMICO', label: 'Académico', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo', color: 'bg-amber-100 text-amber-700 border-amber-200' },
];

const AnnouncementsManagement = () => {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<CreateComunicadoPayload>({
    titulo: '',
    contenido: '',
    tipo: 'GENERAL',
  });

  // ── Fetch ──
  const fetchComunicados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getComunicados();
      setComunicados(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar comunicados';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComunicados();
  }, [fetchComunicados]);

  // ── Toast auto dismiss ──
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ── Create ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.createComunicado(formData);
      setToast({ type: 'success', message: 'Comunicado publicado exitosamente' });
      setShowModal(false);
      setFormData({ titulo: '', contenido: '', tipo: 'GENERAL' });
      fetchComunicados();
    } catch {
      setToast({ type: 'error', message: 'Error al publicar el comunicado' });
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ──
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTipoStyle = (tipo: ComunicadoTipo) => {
    return TIPO_OPTIONS.find((t) => t.value === tipo)?.color || TIPO_OPTIONS[0].color;
  };

  const getTipoLabel = (tipo: ComunicadoTipo) => {
    return TIPO_OPTIONS.find((t) => t.value === tipo)?.label || tipo;
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-[slideIn_0.3s_ease]',
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
          <h2 className="text-2xl font-bold text-slate-800">Comunicados</h2>
          <p className="text-sm text-slate-500 mt-1">
            Publica y gestiona los comunicados de la institución
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ titulo: '', contenido: '', tipo: 'GENERAL' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.97]"
        >
          <Plus className="w-5 h-5" />
          Nuevo Comunicado
        </button>
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
          <button onClick={fetchComunicados} className="text-blue-600 text-sm font-medium hover:underline">
            Reintentar
          </button>
        </div>
      ) : comunicados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <Megaphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Sin comunicados</h3>
          <p className="text-sm text-slate-500 mb-6">
            Aún no se han publicado comunicados. ¡Crea el primero!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Crear Comunicado
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {comunicados.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      c.tipo === 'URGENTE'
                        ? 'bg-red-100'
                        : c.tipo === 'ACADEMICO'
                          ? 'bg-violet-100'
                          : c.tipo === 'ADMINISTRATIVO'
                            ? 'bg-amber-100'
                            : 'bg-blue-100'
                    )}
                  >
                    <Megaphone
                      className={cn(
                        'w-5 h-5',
                        c.tipo === 'URGENTE'
                          ? 'text-red-600'
                          : c.tipo === 'ACADEMICO'
                            ? 'text-violet-600'
                            : c.tipo === 'ADMINISTRATIVO'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-800 truncate">{c.titulo}</h3>
                    {c.author && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Por {c.author.nombre} {c.author.apellido}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border',
                    getTipoStyle(c.tipo)
                  )}>
                    <Tag className="w-3 h-3" />
                    {getTipoLabel(c.tipo)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">
                {c.contenido}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(c.fechaPublicacion)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Nuevo Comunicado</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Reunión de padres de familia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipo *</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIPO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: opt.value })}
                      className={cn(
                        'px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                        formData.tipo === opt.value
                          ? cn(opt.color, 'ring-2 ring-offset-1 ring-blue-400')
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contenido *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  placeholder="Escribe el contenido del comunicado..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                />
              </div>

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
                  Publicar Comunicado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManagement;
