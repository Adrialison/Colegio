// ============================================
// ÍNDICE DE RUTAS
// ============================================
import { Router } from 'express';

import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import teacherRoutes from './teacherRoutes.js';
import studentRoutes from './studentRoutes.js';

const router = Router();

// Montar rutas con sus prefijos
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API del Sistema de Gestión Escolar funcionando correctamente.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

export default router;
