export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  role: Role;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
  studentProfile?: StudentProfile;
}

export interface StudentProfile {
  id: number;
  userId: number;
  promedioGeneral: number | string; // backend often returns string for decimal
  estadoPago: boolean;
  grado?: string;
  seccion?: string;
  gradoId?: number;
  seccionId?: number;
  gradoRef?: Grado;
  seccionRef?: Seccion;
  user?: User;
}

export type ComunicadoTipo = 'GENERAL' | 'URGENTE' | 'ACADEMICO' | 'ADMINISTRATIVO';

export interface Comunicado {
  id: number;
  titulo: string;
  contenido: string;
  tipo: ComunicadoTipo;
  fechaPublicacion: string;
  activo: boolean;
  authorId: number;
  author?: { id: number; nombre: string; apellido: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    users: T[];
    pagination: Pagination;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ── Pago ──
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'OTRO';
export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'ANULADO';

export interface Pago {
  id: number;
  monto: number;
  concepto: string;
  fechaPago: string;
  metodoPago: MetodoPago;
  estado: EstadoPago;
  comprobante?: string;
  studentId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ErrorResponse {
  success: boolean;
  message: string;
}

// ── Curso ──
export interface Curso {
  id: number;
  nombre: string;
  descripcion?: string;
  grado?: string;
  seccion?: string;
  gradoId?: number;
  seccionId?: number;
  gradoRef?: Grado;
  seccionRef?: Seccion;
  horario?: string;
  activo: boolean;
  teacherId?: number;
  teacher?: { id: number; nombre: string; apellido: string; email: string };
  createdAt?: string;
  updatedAt?: string;
}

// ── Nota (Calificación) ──
export type Trimestre = 'PRIMERO' | 'SEGUNDO' | 'TERCERO';

export interface Nota {
  id: number;
  valor: number;
  trimestre: Trimestre;
  comentario?: string;
  studentId: number;
  cursoId: number;
  student?: {
    id: number;
    userId: number;
    user?: { nombre: string; apellido: string; email: string };
  };
  curso?: { id: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

// ── Asistencia ──
export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO';

export interface Asistencia {
  id: number;
  fecha: string;
  estado: EstadoAsistencia;
  observacion?: string;
  studentId: number;
  cursoId: number;
  student?: {
    id: number;
    userId: number;
    user?: { nombre: string; apellido: string };
  };
  curso?: { id: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

// ── Grado y Sección ──
export interface Grado {
  id: number;
  nombre: string;
  nivel: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
}

export interface Seccion {
  id: number;
  nombre: string;
}
