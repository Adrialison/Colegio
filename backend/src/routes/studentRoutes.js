// ============================================
// RUTAS: ALUMNO (STUDENT + ADMIN)
// ============================================
import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import {
  getMyProfile,
  getMyNotas,
  getMyAsistencias,
  getMyPagos,
  getComunicados,
  getMyCursos,
} from '../controllers/studentController.js';

const router = Router();

// Todas las rutas requieren autenticación + rol STUDENT o ADMIN
router.use(verifyToken, checkRole(['STUDENT', 'ADMIN']));

// ── Perfil ──
router.get('/profile', getMyProfile);

// ── Notas (solo propias) ──
router.get('/notas', getMyNotas);

// ── Asistencias (solo propias) ──
router.get('/asistencias', getMyAsistencias);

// ── Pagos (solo propios) ──
router.get('/pagos', getMyPagos);

// ── Comunicados ──
router.get('/comunicados', getComunicados);

// ── Mis Cursos (Horario) ──
router.get('/cursos', getMyCursos);

export default router;
