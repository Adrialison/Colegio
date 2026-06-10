import { useState, useEffect } from 'react';
import { adminService } from './adminService';
import type { Grado, Seccion } from '../../@types';
import {
  Layers,
  LayoutGrid,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  School,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const GradosSeccionesManagement = () => {
  const [grados, setGrados] = useState<Grado[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // States for new items
  const [newGrado, setNewGrado] = useState({ nombre: '', nivel: 'PRIMARIA' });
  const [newSeccion, setNewSeccion] = useState({ nombre: '' });
  const [savingGrado, setSavingGrado] = useState(false);
  const [savingSeccion, setSavingSeccion] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [grRes, seRes] = await Promise.all([
        adminService.getGrados(),
        adminService.getSecciones(),
      ]);
      setGrados(grRes.data);
      setSecciones(seRes.data);
    } catch {
      setError('Error al cargar datos académicos');
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

  const handleCreateGrado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrado.nombre) return;
    setSavingGrado(true);
    try {
      await adminService.createGrado(newGrado);
      setToast({ type: 'success', message: 'Grado creado correctamente' });
      setNewGrado({ nombre: '', nivel: 'PRIMARIA' });
      fetchData();
    } catch {
      setToast({ type: 'error', message: 'Error al crear grado' });
    } finally {
      setSavingGrado(false);
    }
  };

  const handleCreateSeccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeccion.nombre) return;
    setSavingSeccion(true);
    try {
      await adminService.createSeccion(newSeccion);
      setToast({ type: 'success', message: 'Sección creada correctamente' });
      setNewSeccion({ nombre: '' });
      fetchData();
    } catch {
      setToast({ type: 'error', message: 'Error al crear sección' });
    } finally {
      setSavingSeccion(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[500px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
        <p className="text-slate-500 font-black uppercase text-xs tracking-widest animate-pulse">Estructurando Institución...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-[1.25rem] shadow-2xl text-sm font-bold animate-in slide-in-from-right-2 duration-300',
          toast.type === 'success' ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-rose-600 text-white shadow-rose-600/20'
        )}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/10 blur-[80px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
           <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
                 <School className="w-3.5 h-3.5" />
                 Arquitectura Escolar
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
                 Gestión de <span className="text-blue-400">Grados</span> & <span className="text-emerald-400">Secciones</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                 Define la estructura académica de la institución. Los grados y secciones que crees aquí estarán disponibles dinámicamente para la matrícula de alumnos y asignación de cursos.
              </p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                 <p className="text-xs font-black text-slate-500 uppercase mb-2 tracking-tighter">Grados</p>
                 <p className="text-4xl font-black">{grados.length}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md translate-y-4">
                 <p className="text-xs font-black text-slate-500 uppercase mb-2 tracking-tighter">Secciones</p>
                 <p className="text-4xl font-black">{secciones.length}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ———— GESTIÓN DE GRADOS ———— */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
                <Layers className="w-7 h-7 text-blue-600" />
                Grados Académicos
             </h2>
          </div>

          <form onSubmit={handleCreateGrado} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 group hover:shadow-xl transition-all">
             <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nombre del Grado</label>
                  <input 
                    required 
                    placeholder="Ejm: 1ero Secundaria"
                    value={newGrado.nombre}
                    onChange={(e) => setNewGrado({...newGrado, nombre: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nivel Institucional</label>
                  <div className="grid grid-cols-3 gap-2">
                     {['INICIAL', 'PRIMARIA', 'SECUNDARIA'].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setNewGrado({...newGrado, nivel: lvl})}
                          className={cn(
                            "px-3 py-3 rounded-2xl border text-[10px] font-black transition-all uppercase tracking-tighter",
                            newGrado.nivel === lvl ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          )}
                        >
                           {lvl}
                        </button>
                     ))}
                  </div>
               </div>
             </div>
             <button 
               type="submit" 
               disabled={savingGrado}
               className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 active:scale-[0.98]"
             >
                {savingGrado ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Registrar Nuevo Grado
             </button>
          </form>

          <div className="grid grid-cols-2 gap-4">
             {grados.map(grado => (
                <div key={grado.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                         <Bookmark className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                         <p className="text-sm font-black text-slate-800 truncate">{grado.nombre}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{grado.nivel}</p>
                      </div>
                   </div>
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                         <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* ———— GESTIÓN DE SECCIONES ———— */}
        <div className="space-y-8">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
                 <LayoutGrid className="w-7 h-7 text-emerald-600" />
                 Secciones
              </h2>
           </div>

           <form onSubmit={handleCreateSeccion} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 group hover:shadow-xl transition-all">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Identificador de Sección</label>
                 <input 
                   required 
                   placeholder="Ejm: A, B, C o Única"
                   value={newSeccion.nombre}
                   onChange={(e) => setNewSeccion({ nombre: e.target.value })}
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-bold"
                 />
              </div>
              <p className="text-[11px] text-slate-500 font-medium px-4 leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                Dato fundamental para organizar los pagos y asistencias por grupos.
              </p>
              <button 
                type="submit" 
                disabled={savingSeccion}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 active:scale-[0.98]"
              >
                 {savingSeccion ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                 Registrar Nueva Sección
              </button>
           </form>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {secciones.map(secc => (
                 <div key={secc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center flex-col justify-center text-center group hover:border-emerald-200 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                       <LayoutGrid className="w-10 h-10" />
                    </div>
                    <p className="text-2xl font-black text-slate-800 mb-1">{secc.nombre}</p>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Activa</p>
                 </div>
              ))}
              {secciones.length === 0 && (
                 <div className="col-span-full py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <p className="text-sm font-black uppercase">Sin secciones todavía</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default GradosSeccionesManagement;
