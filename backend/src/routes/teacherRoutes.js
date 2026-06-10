// ============================================
// RUTAS: PROFESOR (TEACHER + ADMIN)
// ============================================
import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import {
  registrarNota,
  getNotas,
  updateNota,
  registrarAsistencia,
  getAsistencias,
  getStudents,
  getMisCursos,
} from '../controllers/teacherController.js';

const router = Router();

// Todas las rutas requieren autenticación + rol TEACHER o ADMIN
router.use(verifyToken, checkRole(['TEACHER', 'ADMIN']));

// ── Cursos del profesor ──
router.get('/cursos', getMisCursos);

// ── Notas ──
router.post('/notas', registrarNota);
router.get('/notas', getNotas);
router.put('/notas/:id', updateNota);

// ── Asistencias ──
router.post('/asistencias', registrarAsistencia);
router.get('/asistencias', getAsistencias);

// ── Alumnos (consulta) ──
router.get('/students', getStudents);

export default router;
