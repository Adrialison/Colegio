// ============================================
// RUTAS: AUTENTICACIÓN
// ============================================
import { Router } from 'express';
import { login, register, getProfile } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

// Rutas públicas
router.post('/login', login);
router.post('/register', register);

// Rutas protegidas
router.get('/profile', verifyToken, getProfile);

export default router;
