import api from '../../api/axios';
import type { 
  User, 
  StudentProfile, 
  Comunicado, 
  PaginatedResponse, 
  ApiResponse, 
  Role, 
  ComunicadoTipo, 
  Grado, 
  Seccion, 
  Curso 
} from '../../@types';

// ── Tipos para peticiones ──
export interface CreateUserPayload {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  role: Role;
  gradoId?: number;
  seccionId?: number;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  role?: Role;
  activo?: boolean;
}

export interface CreateComunicadoPayload {
  titulo: string;
  contenido: string;
  tipo: ComunicadoTipo;
}

export interface DashboardStats {
  totalAlumnos: number;
  totalProfesores: number;
  pagosPendientes: number;
  seccionesActivas: number;
}

export interface CursoUpdatePayload {
  nombre?: string;
  descripcion?: string;
  teacherId?: number;
  gradoId?: number;
  seccionId?: number;
  horario?: string;
}

// ── Servicio Admin ──
export const adminService = {
  // ── DASHBOARD ──
  getDashboardStats: async () => {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
    return response.data;
  },

  // ── USUARIOS ──
  getAllUsers: async (page = 1, limit = 50, role?: string) => {
    const params: Record<string, string | number> = { page, limit };
    if (role) params.role = role;
    const response = await api.get<PaginatedResponse<User>>('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserPayload) => {
    const response = await api.post<ApiResponse<User>>('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserPayload) => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/admin/users/${id}`);
    return response.data;
  },

  // ── PAGOS ──
  updatePago: async (studentId: number, estadoPago: boolean) => {
    const response = await api.put<ApiResponse<StudentProfile>>(`/admin/students/${studentId}/pago`, { estadoPago });
    return response.data;
  },

  // ── COMUNICADOS ──
  getComunicados: async () => {
    const response = await api.get<ApiResponse<Comunicado[]>>('/admin/comunicados');
    return response.data;
  },

  createComunicado: async (data: CreateComunicadoPayload) => {
    const response = await api.post<ApiResponse<Comunicado>>('/admin/comunicados', data);
    return response.data;
  },

  // ── CURSOS (ASIGNACIÓN) ──
  getAllCursos: async () => {
    const response = await api.get<ApiResponse<Curso[]>>('/admin/cursos');
    return response.data;
  },

  createCurso: async (data: CursoUpdatePayload) => {
    const response = await api.post<ApiResponse<Curso>>('/admin/cursos', data);
    return response.data;
  },

  updateCurso: async (id: number, data: CursoUpdatePayload) => {
    const response = await api.put<ApiResponse<Curso>>(`/admin/cursos/${id}`, data);
    return response.data;
  },

  // ── GRADOS Y SECCIONES ──
  getGrados: async () => {
    const response = await api.get<ApiResponse<Grado[]>>('/admin/grados');
    return response.data;
  },

  createGrado: async (data: { nombre: string; nivel: string }) => {
    const response = await api.post<ApiResponse<Grado>>('/admin/grados', data);
    return response.data;
  },

  getSecciones: async () => {
    const response = await api.get<ApiResponse<Seccion[]>>('/admin/secciones');
    return response.data;
  },

  createSeccion: async (data: { nombre: string }) => {
    const response = await api.post<ApiResponse<Seccion>>('/admin/secciones', data);
    return response.data;
  },
};
