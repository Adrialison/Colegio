import { useState, useEffect, useCallback } from "react";
import { adminService } from "./adminService";
import type { User, Seccion } from "../../@types";
import {
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  CircleDot,
  LayoutGrid,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../lib/utils";

const PaymentsManagement = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [studentsRes, seccionesRes] = await Promise.all([
        adminService.getAllUsers(1, 1000, "STUDENT"),
        adminService.getSecciones(),
      ]);
      setStudents(studentsRes.data.users);
      setSecciones(seccionesRes.data);
    } catch (err: unknown) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const togglePago = async (user: User) => {
    if (!user.studentProfile) return;
    const newStatus = !user.studentProfile.estadoPago;
    setUpdatingId(user.id);
    try {
      await adminService.updatePago(user.studentProfile.id, newStatus);
      setToast({
        type: "success",
        message: `Estado de pago actualizado para ${user.nombre}`,
      });
      fetchData();
    } catch {
      setToast({
        type: "error",
        message: "Error al actualizar el estado de pago",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Agrupamiento por Sección ──
  const studentsBySection = secciones.map((secc) => ({
    ...secc,
    students: students.filter(
      (s) =>
        s.studentProfile?.seccionId === secc.id &&
        (!search ||
          `${s.nombre} ${s.apellido}`
            .toLowerCase()
            .includes(search.toLowerCase())),
    ),
  }));

  const studentsWithoutSection = students.filter(
    (s) =>
      !s.studentProfile?.seccionId &&
      (!search ||
        `${s.nombre} ${s.apellido}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );

  // ── Stats ──
  const pendingCount = students.filter(
    (s) => !s.studentProfile?.estadoPago,
  ).length;
  const paidCount = students.length - pendingCount;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium tracking-tight">
          Cargando módulos financieros...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-right-2 duration-300",
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Control de Pagos
          </h2>
          <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">
            Finanzas & Mensualidades
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
              Pendientes
            </p>
            <p className="text-2xl font-black text-rose-500 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              {pendingCount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
              Al Día
            </p>
            <p className="text-2xl font-black text-emerald-500 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {paidCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Buscar alumno por nombre en todas las secciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-400"
        />
      </div>

      {/* Content - Cards by Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {studentsBySection.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all h-full"
          >
            <div className="p-8 pb-4 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Sección {section.nombre}
                </h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mt-0.5">
                  {section.students.length} Alumnos asignados
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <LayoutGrid className="w-6 h-6" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] p-6 space-y-3 custom-scrollbar">
              {section.students.length === 0 ? (
                <div className="py-10 text-center space-y-2 opacity-30">
                  <p className="text-xs font-bold text-slate-400">
                    Sin registros
                  </p>
                </div>
              ) : (
                section.students.map((student) => {
                  const isPaid = student.studentProfile?.estadoPago;
                  const isUpdating = updatingId === student.id;
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-white transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400 shrink-0 uppercase">
                          {student.nombre[0]}
                          {student.apellido[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate leading-none">
                            {student.nombre} {student.apellido.split(" ")[0]}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isPaid ? "bg-emerald-500" : "bg-rose-500",
                              )}
                            />
                            <span
                              className={cn(
                                "text-[9px] font-black uppercase tracking-tighter",
                                isPaid ? "text-emerald-600" : "text-rose-600",
                              )}
                            >
                              {isPaid ? "Al día" : "Pendiente"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => togglePago(student)}
                        disabled={isUpdating}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                          isPaid
                            ? "bg-white text-rose-500 border border-slate-100 hover:bg-rose-50"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/10",
                          isUpdating && "animate-pulse",
                        )}
                        title={
                          isPaid
                            ? "Marcar como pendiente"
                            : "Marcar como pagado"
                        }
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isPaid ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <DollarSign className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-50 mt-auto">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Recaudación</span>
                <span className="text-slate-900">
                  {
                    section.students.filter((s) => s.studentProfile?.estadoPago)
                      .length
                  }{" "}
                  / {section.students.length}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-700"
                  style={{
                    width:
                      section.students.length > 0
                        ? `${(section.students.filter((s) => s.studentProfile?.estadoPago).length / section.students.length) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Alumnos sin sección */}
        {studentsWithoutSection.length > 0 && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col opacity-70">
            <h3 className="text-lg font-black text-slate-400 mb-6">
              Sin Sección Asignada
            </h3>
            <div className="space-y-3">
              {studentsWithoutSection.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-xl"
                >
                  <p className="text-[10px] font-bold text-slate-500">
                    {student.nombre} {student.apellido}
                  </p>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                    Revisar perfil
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsManagement;
