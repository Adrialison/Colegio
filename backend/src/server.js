// ============================================
// SERVER.JS - Punto de entrada de la aplicación
// ============================================
import 'dotenv/config';
import app from './app.js';
import { testConnection, syncDatabase } from './config/db.js';

// Importar modelos para registrar las asociaciones
import './models/index.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. Probar conexión a la BD
    await testConnection();

    // 2. Sincronizar modelos (crear/actualizar tablas)
    await syncDatabase();

    // 3. Levantar servidor HTTP
    app.listen(PORT, () => {
      console.log('══════════════════════════════════════════════');
      console.log(`🏫 Sistema de Gestión Escolar - API REST`);
      console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`📋 Health check:          http://localhost:${PORT}/api/health`);
      console.log(`🌍 Entorno:               ${process.env.NODE_ENV || 'development'}`);
      console.log('══════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
