import { useState, useEffect, useCallback } from 'react';
import { adminService, type CreateUserPayload, type UpdateUserPayload } from './adminService';
import type { User, Role, Pagination, Grado, Seccion } from '../../@types';
import {
  UserPlus,
  Search,
  Edit3,
  Trash2,
  X,
  Shield,
  GraduationCap,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users as UsersIcon,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ── Constantes ──
const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Administradores' },
  { value: 'TEACHER', label: 'Profesores' },
  { value: 'STUDENT', label: 'Alumnos' },
];

const ROLE_STYLES: Record<Role, string> = {
  ADMIN: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  TEACHER: 'bg-violet-100 text-violet-700 border-violet-200',
  STUDENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const ROLE_ICONS: Record<Role, typeof Shield> = {
  ADMIN: Shield,
  TEACHER: BookOpen,
  STUDENT: GraduationCap,
};

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros adicionales para alumnos
  const [filterGradoId, setFilterGradoId] = useState<string>('');
  const [filterSeccionId, setFilterSeccionId] = useState<string>('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateUserPayload & { activo?: boolean }>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    role: 'STUDENT',
    gradoId: undefined,
    seccionId: undefined,
  });

  // ── Fetch Initial Data ──
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, gradosRes, seccionesRes] = await Promise.all([
        adminService.getAllUsers(currentPage, 50, roleFilter || undefined),
        adminService.getGrados(),
        adminService.getSecciones(),
      ]);
      setUsers(usersRes.data.users);
      setPagination(usersRes.data.pagination);
      setGrados(gradosRes.data);
      setSecciones(seccionesRes.data);
    } catch (err: unknown) {
      setError('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ── Handlers ──
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', password: '', nombre: '', apellido: '', role: 'STUDENT' });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      nombre: user.nombre,
      apellido: user.apellido,
      role: user.role,
      gradoId: user.studentProfile?.gradoId,
      seccionId: user.studentProfile?.seccionId,
      activo: user.activo,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        const payload: UpdateUserPayload = {
          email: formData.email,
          nombre: formData.nombre,
          apellido: formData.apellido,
          role: formData.role,
          activo: formData.activo,
        };
        if (formData.password) payload.password = formData.password;
        await adminService.updateUser(editingUser.id, payload);
        setToast({ type: 'success', message: 'Usuario actualizado' });
      } else {
        await adminService.createUser(formData);
        setToast({ type: 'success', message: 'Usuario creado exitosamente' });
      }
      setShowModal(false);
      fetchData();
    } catch (err: unknown) {
      setToast({ type: 'error', message: 'Error al procesar la solicitud' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Desactivar al usuario ${user.nombre}?`)) return;
    try {
      await adminService.deleteUser(user.id);
      setToast({ type: 'success', message: 'Usuario desactivado' });
      fetchData();
    } catch {
      setToast({ type: 'error', message: 'Error al desactivar' });
    }
  };

  // ── Filtrado Local ──
  const filteredUsers = users.filter((u) => {
    const matchSearch = !search || 
      `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    
    // Filtros de Alumno
    if (u.role === 'STUDENT') {
      const matchGrado = !filterGradoId || u.studentProfile?.gradoId?.toString() === filterGradoId;
      const matchSeccion = !filterSeccionId || u.studentProfile?.seccionId?.toString() === filterSeccionId;
      return matchSearch && matchGrado && matchSeccion;
    }

    return matchSearch;
  });

  const getStats = (role: Role) => users.filter(u => u.role === role).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold transition-all animate-in fade-in slide-in-from-right-4',
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        )}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h2>
          <p className="text-slate-500 font-medium mt-1">Administra el personal y alumnado de la institución</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-[1.25rem] font-bold transition-all shadow-xl shadow-slate-900/20 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Registro
        </button>
      </div>

      {/* Role Summary Cards (Independent Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ROLE_OPTIONS.map((opt) => {
          const Icon = ROLE_ICONS[opt.value];
          const isActive = roleFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => {
                setRoleFilter(isActive ? '' : opt.value);
                setCurrentPage(1);
              }}
              className={cn(
                "p-8 rounded-[2.5rem] border-2 transition-all text-left group relative overflow-hidden",
                isActive 
                  ? "bg-slate-950 border-slate-950 text-white shadow-2xl shadow-slate-900/40" 
                  : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
              )}>
                 <Icon className="w-6 h-6" />
              </div>
              <p className={cn("text-xs font-black uppercase tracking-widest mb-1", isActive ? "text-slate-400" : "text-slate-500")}>
                {opt.label}
              </p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-black">{users.filter(u => u.role === opt.value).length}</h3>
                <div className={cn(
                   "w-8 h-8 rounded-full flex items-center justify-center transition-transform",
                   isActive ? "bg-white/10" : "bg-slate-50",
                   "group-hover:translate-x-1"
                )}>
                   <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Special Controls for Students in the Card if Active */}
              {isActive && opt.value === 'STUDENT' && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-3" onClick={(e) => e.stopPropagation()}>
                   <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={filterGradoId} 
                        onChange={(e) => setFilterGradoId(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-400"
                      >
                         <option value="" className="text-black">Todo Grado</option>
                         {grados.map(g => <option key={g.id} value={g.id} className="text-black">{g.nombre}</option>)}
                      </select>
                      <select 
                        value={filterSeccionId} 
                        onChange={(e) => setFilterSeccionId(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-400"
                      >
                         <option value="" className="text-black">Todo Secc.</option>
                         {secciones.map(s => <option key={s.id} value={s.id} className="text-black">{s.nombre}</option>)}
                      </select>
                   </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main List */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm">
           <Search className="w-5 h-5 text-slate-400 ml-2" />
           <input 
             type="text" 
             placeholder="Buscar por nombre, apellido o email..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-slate-400"
           />
           {filteredUsers.length !== users.length && (
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                {filteredUsers.length} resultados
              </span>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-[2rem]" />
             ))
           ) : filteredUsers.length === 0 ? (
             <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                   <UsersIcon className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold">No se encontraron usuarios con estos criterios.</p>
             </div>
           ) : (
             filteredUsers.map((user) => {
               const RoleIcon = ROLE_ICONS[user.role];
               return (
                 <div key={user.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="flex items-start justify-between mb-6">
                       <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-lg text-slate-500 overflow-hidden shrink-0 border border-white">
                          {user.nombre[0]}{user.apellido[0]}
                       </div>
                       <div className="flex gap-1">
                          <button onClick={() => openEditModal(user)} className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                             <Edit3 className="w-4.5 h-4.5" />
                          </button>
                          <button onClick={() => handleDelete(user)} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                             <Trash2 className="w-4.5 h-4.5" />
                          </button>
                       </div>
                    </div>
                    
                    <div className="space-y-1">
                       <h4 className="font-black text-slate-900 truncate leading-tight">
                         {user.nombre} {user.apellido}
                       </h4>
                       <p className="text-xs text-slate-500 font-medium truncate mb-4">{user.email}</p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                       <span className={cn(
                         "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 border",
                         ROLE_STYLES[user.role]
                       )}>
                          <RoleIcon className="w-3 h-3" />
                          {user.role}
                       </span>
                       
                       {user.role === 'STUDENT' && user.studentProfile && (
                         <div className="flex items-center gap-1.5">
                            <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100">
                               {user.studentProfile.gradoRef?.nombre || 'S/G'}
                            </span>
                            <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100">
                               {user.studentProfile.seccionRef?.nombre || 'S/S'}
                            </span>
                         </div>
                       )}
                    </div>

                    {!user.activo && (
                      <div className="absolute top-0 right-0 left-0 h-1 bg-rose-500" />
                    )}
                 </div>
               );
             })
           )}
        </div>
      </div>

      {/* Modal - Dynamic Grados/Secciones */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingUser ? 'Actualizar Usuario' : 'Nuevo Registro'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Completa los campos obligatorios (*)</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Nombre *</label>
                    <input 
                      required 
                      value={formData.nombre} 
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Apellido *</label>
                    <input 
                      required 
                      value={formData.apellido} 
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email Empresarial *</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                  {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso *'}
                </label>
                <input 
                  type="password" 
                  required={!editingUser} 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                  placeholder={editingUser ? 'Dejar en blanco' : 'Mínimo 6 caracteres'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Asignar Rol Institucional</label>
                <div className="grid grid-cols-3 gap-2">
                   {ROLE_OPTIONS.map(opt => (
                     <button
                       key={opt.value}
                       type="button"
                       onClick={() => setFormData({...formData, role: opt.value})}
                       className={cn(
                         "px-3 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-tighter transition-all",
                         formData.role === opt.value ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                       )}
                     >
                        {opt.value}
                     </button>
                   ))}
                </div>
              </div>

              {formData.role === 'STUDENT' && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Grado Académico</label>
                    <select 
                      value={formData.gradoId || ''} 
                      onChange={(e) => setFormData({...formData, gradoId: Number(e.target.value)})}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none"
                    >
                       <option value="">Seleccionar...</option>
                       {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Sección</label>
                    <select 
                      value={formData.seccionId || ''} 
                      onChange={(e) => setFormData({...formData, seccionId: Number(e.target.value)})}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none"
                    >
                       <option value="">Seleccionar...</option>
                       {secciones.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={() => setShowModal(false)}
                   className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                 >
                    Descartar
                 </button>
                 <button 
                   type="submit" 
                   disabled={saving}
                   className="px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 flex items-center gap-2"
                 >
                   {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                   {editingUser ? 'Guardar Cambios' : 'Confirmar Registro'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
