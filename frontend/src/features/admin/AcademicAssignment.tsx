import { useState, useEffect } from "react";
import { adminService, type CursoUpdatePayload } from "./adminService";
import type { User, Curso, Grado, Seccion } from "../../@types";
import {
  BookOpen,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Layers,
  LayoutGrid,
  Briefcase,
  Edit,
  Clock,
} from "lucide-react";
import { cn } from "../../lib/utils";

const AcademicAssignment = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState<
    CursoUpdatePayload & { nombre: string }
  >({
    nombre: "",
    descripcion: "",
    teacherId: undefined,
    gradoId: undefined,
    seccionId: undefined,
    horario: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [curRes, teaRes, grRes, seRes] = await Promise.all([
        adminService.getAllCursos(),
        adminService.getAllUsers(1, 200, "TEACHER"),
        adminService.getGrados(),
        adminService.getSecciones(),
      ]);
      setCursos(curRes.data);
      setTeachers(teaRes.data.users);
      setGrados(grRes.data);
      setSecciones(seRes.data);
    } catch {
      setError("Error al sincronizar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const openEditModal = (curso: Curso | null = null) => {
    if (curso) {
      setEditingCurso(curso);
      setFormData({
        nombre: curso.nombre,
        descripcion: curso.descripcion || "",
        teacherId: curso.teacherId,
        gradoId: curso.gradoId,
        seccionId: curso.seccionId,
        horario: curso.horario || "",
      });
    } else {
      setEditingCurso(null);
      setFormData({
        nombre: "",
        descripcion: "",
        teacherId: undefined,
        gradoId: undefined,
        seccionId: undefined,
        horario: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCurso) {
        await adminService.updateCurso(editingCurso.id, formData);
        setToast({ type: "success", message: "Asignación actualizada" });
      } else {
        await adminService.createCurso(formData);
        setToast({ type: "success", message: "Curso creado con éxito" });
      }
      setShowModal(false);
      fetchData();
    } catch {
      setToast({ type: "error", message: "No se pudo procesar el cambio" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[500px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
        <p className="text-slate-500 font-black uppercase text-xs tracking-widest">
          Sincronizando Currículo...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-[1.25rem] shadow-2xl text-sm font-bold animate-in slide-in-from-right-2 duration-300",
            toast.type === "success"
              ? "bg-indigo-600 text-white shadow-indigo-600/20"
              : "bg-rose-600 text-white shadow-rose-600/20",
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 order-1 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Asignación{" "}
            <span className="text-blue-600 underline decoration-blue-200 decoration-8 underline-offset-8">
              Académica
            </span>
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-4 max-w-2xl leading-relaxed">
            Diseña la estructura operativa de la institución vinculando docentes
            a cursos específicos con su grado, sección y horario
            correspondiente.
          </p>
        </div>
        <button
          onClick={() => openEditModal()}
          className="bg-slate-950 hover:bg-black text-white px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all shadow-2xl shadow-slate-950/20 active:scale-95 flex items-center gap-2 group shrink-0"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Vincular Nuevo Curso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cursos.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold tracking-tight">
              No hay cursos registrados para la asignación.
            </p>
          </div>
        ) : (
          cursos.map((curso) => {
            const hasAssignment = !!curso.teacher;
            return (
              <div
                key={curso.id}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden group"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:bg-blue-50 transition-colors" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-lg">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <button
                      onClick={() => openEditModal(curso)}
                      className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 truncate group-hover:text-blue-600 transition-colors">
                    {curso.nombre}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-8">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-tighter text-slate-600">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {curso.gradoRef?.nombre || curso.grado || "S/G"}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-tighter text-slate-600">
                      <LayoutGrid className="w-3 h-3 text-slate-400" />
                      Secc: {curso.seccionRef?.nombre || curso.seccion || "S/S"}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                          hasAssignment
                            ? "bg-blue-50 border-blue-100 text-blue-600"
                            : "bg-rose-50 border-rose-100 text-rose-500",
                        )}
                      >
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Docente
                        </p>
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {hasAssignment
                            ? `${curso.teacher?.nombre} ${curso.teacher?.apellido}`
                            : "Sin asignar"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Horario
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          {curso.horario || "No definido"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {hasAssignment && (
                    <div className="mt-6 flex justify-end">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Curso Operativo
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-2xl"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingCurso ? "Editar Asignación" : "Nueva Asociación"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-widest">
                  Configuración Institucional
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-12 h-12 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                    Nombre del Curso *
                  </label>
                  <input
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                    Docente Asignado
                  </label>
                  <select
                    value={formData.teacherId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teacherId: Number(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-6 py-4 rounded-2xl bg-slate-100 border-none outline-none text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="">Sin Asignar</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} {t.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                    Grado Académico
                  </label>
                  <select
                    value={formData.gradoId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gradoId: Number(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-6 py-4 rounded-2xl bg-blue-50 text-blue-900 border-none outline-none text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    {grados.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                    Sección
                  </label>
                  <select
                    value={formData.seccionId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seccionId: Number(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-6 py-4 rounded-2xl bg-emerald-50 text-emerald-900 border-none outline-none text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    {secciones.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                  Horario de Clase
                </label>
                <input
                  placeholder="Ej: Lunes 08:00 - 10:00"
                  value={formData.horario}
                  onChange={(e) =>
                    setFormData({ ...formData, horario: e.target.value })
                  }
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold shadow-sm"
                />
              </div>

              <div className="pt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-10 py-4 rounded-2xl font-black text-slate-500 transition-colors"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-12 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all shadow-2xl shadow-slate-900/40 active:scale-95 disabled:opacity-50 flex items-center gap-3"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCurso ? "Actualizar Enlace" : "Confirmar Asociación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicAssignment;
