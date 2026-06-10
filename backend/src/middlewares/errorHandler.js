// ============================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================

/**
 * Middleware centralizado para manejar errores de Sequelize y errores generales.
 */
export const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error:', err.message);

  // Errores de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Error de validación.',
      errors,
    });
  }

  // Errores de unicidad de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: `El valor '${e.value}' ya existe. Debe ser único.`,
    }));
    return res.status(409).json({
      success: false,
      message: 'Error de duplicado.',
      errors,
    });
  }

  // Errores de FK de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Error de referencia: el registro relacionado no existe.',
    });
  }

  // Error genérico
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor.',
  });
};
