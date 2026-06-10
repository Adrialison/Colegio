// ============================================
// RUTAS: ADMINISTRADOR (Solo ADMIN)
// ============================================
import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePago,
  createComunicado,
  getAllComunicados,
  createCurso,
  getAllCursos,
  updateCurso,
  getDashboardStats,
  getAllGrados,
  createGrado,
  getAllSecciones,
  createSeccion,
} from '../controllers/adminController.js';

const router = Router();

// Todas las rutas requieren autenticación + rol ADMIN
router.use(verifyToken, checkRole(['ADMIN']));

// ── Dashboard ──
router.get('/dashboard/stats', getDashboardStats);

// ── CRUD de Usuarios ──
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ── Gestión de Pagos ──
router.put('/students/:studentId/pago', updatePago);

// ── Comunicados ──
router.get('/comunicados', getAllComunicados);
router.post('/comunicados', createComunicado);

// ── Cursos (Asignación Académica) ──
router.get('/cursos', getAllCursos);
router.post('/cursos', createCurso);
router.put('/cursos/:id', updateCurso);

// ── Grados y Secciones ──
router.get('/grados', getAllGrados);
router.post('/grados', createGrado);
router.get('/secciones', getAllSecciones);
router.post('/secciones', createSeccion);

export default router;
