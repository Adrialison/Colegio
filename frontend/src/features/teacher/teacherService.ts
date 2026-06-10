import api from '../../api/axios';
import type {
  Curso,
  Nota,
  Asistencia,
  Trimestre,
  EstadoAsistencia,
  ApiResponse,
} from '../../@types';

// ── Payloads ──
export interface CreateNotaPayload {
  studentId: number;
  cursoId: number;
  valor: number;
  trimestre: Trimestre;
  comentario?: string;
}

export interface UpdateNotaPayload {
  valor?: number;
  trimestre?: Trimestre;
  comentario?: string;
}

export interface CreateAsistenciaPayload {
  studentId: number;
  cursoId: number;
  fecha?: string;
  estado: EstadoAsistencia;
  observacion?: string;
}

// ── Student básico para listados ──
export interface StudentBasic {
  id: number;
  userId: number;
  promedioGeneral: number;
  grado?: string;
  seccion?: string;
  user?: { id: number; nombre: string; apellido: string; email: string };
}

// ── Servicio Teacher ──
export const teacherService = {
  // ── Cursos del profesor ──
  getMisCursos: async () => {
    const response = await api.get<ApiResponse<Curso[]>>('/teacher/cursos');
    return response.data;
  },

  // ── Notas ──
  getNotas: async (params?: { studentId?: number; cursoId?: number; trimestre?: string }) => {
    const response = await api.get<ApiResponse<Nota[]>>('/teacher/notas', { params });
    return response.data;
  },

  registrarNota: async (data: CreateNotaPayload) => {
    const response = await api.post<ApiResponse<{ nota: Nota; nuevoPromedio: number }>>('/teacher/notas', data);
    return response.data;
  },

  updateNota: async (id: number, data: UpdateNotaPayload) => {
    const response = await api.put<ApiResponse<{ nota: Nota; nuevoPromedio: number }>>(`/teacher/notas/${id}`, data);
    return response.data;
  },

  // ── Asistencias ──
  getAsistencias: async (params?: { studentId?: number; cursoId?: number; fecha?: string }) => {
    const response = await api.get<ApiResponse<Asistencia[]>>('/teacher/asistencias', { params });
    return response.data;
  },

  registrarAsistencia: async (data: CreateAsistenciaPayload) => {
    const response = await api.post<ApiResponse<Asistencia>>('/teacher/asistencias', data);
    return response.data;
  },

  // ── Alumnos ──
  getStudents: async () => {
    const response = await api.get<ApiResponse<StudentBasic[]>>('/teacher/students');
    return response.data;
  },
};
