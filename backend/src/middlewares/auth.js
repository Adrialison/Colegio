// ============================================
// MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
// ============================================
import jwt from 'jsonwebtoken';

/**
 * verifyToken
 * Valida que el request contenga un JWT válido en el header Authorization.
 * Formato esperado: "Bearer <token>"
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.',
      });
    }

    // Soporta "Bearer <token>" y "<token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjunta la información del usuario al request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado. Inicie sesión nuevamente.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno al verificar el token.',
    });
  }
};

/**
 * checkRole
 * Middleware factory que recibe un array de roles permitidos.
 * Deniega el acceso si el rol del usuario no está en la lista.
 *
 * @param {string[]} roles - Array de roles permitidos (e.g. ['ADMIN', 'TEACHER'])
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No se ha autenticado. Use verifyToken antes de checkRole.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}.`,
      });
    }

    next();
  };
};
