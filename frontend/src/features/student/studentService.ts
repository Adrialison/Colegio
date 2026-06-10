import api from '../../api/axios';
import type { 
  ApiResponse, 
  StudentProfile, 
  Nota, 
  Asistencia, 
  Pago, 
  Comunicado 
} from '../../@types';

export interface MyNotasResponse {
  promedioGeneral: number;
  notas: Nota[];
}

export interface MyPagosResponse {
  estadoPago: boolean;
  pagos: Pago[];
}

export const studentService = {
  getMyProfile: async () => {
    const response = await api.get<ApiResponse<StudentProfile>>('/student/profile');
    return response.data;
  },
  
  getMyNotas: async (params?: { trimestre?: string; cursoId?: number }) => {
    const response = await api.get<ApiResponse<MyNotasResponse>>('/student/notas', { params });
    return response.data;
  },
  
  getMyAsistencias: async (params?: { cursoId?: number; fecha?: string }) => {
    const response = await api.get<ApiResponse<Asistencia[]>>('/student/asistencias', { params });
    return response.data;
  },
  
  getMyPagos: async () => {
    const response = await api.get<ApiResponse<MyPagosResponse>>('/student/pagos');
    return response.data;
  },
  
  getComunicados: async () => {
    const response = await api.get<ApiResponse<Comunicado[]>>('/student/comunicados');
    return response.data;
  },

  getMyCursos: async () => {
    const response = await api.get<ApiResponse<any[]>>('/student/cursos');
    return response.data;
  },
};
