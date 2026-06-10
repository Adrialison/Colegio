// ============================================
// CONTROLADOR: AUTENTICACIÓN
// ============================================
import jwt from 'jsonwebtoken';
import { User, Student } from '../models/index.js';

/**
 * POST /api/auth/login
 * Inicia sesión y retorna un JWT con id, role y email.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son obligatorios.',
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas.',
      });
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.',
      });
    }

    // Comparar contraseñas
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas.',
      });
    }

    // Generar JWT
    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: {
        token,
        user: user.toSafeJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/register
 * Registra un nuevo usuario. Solo ADMIN puede registrar TEACHER y ADMIN.
 * El registro público solo permite crear STUDENT.
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, role, nombre, apellido, grado, seccion } = req.body;

    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({
        success: false,
        message: 'Email, contraseña, nombre y apellido son obligatorios.',
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con ese email.',
      });
    }

    const userRole = role || 'STUDENT';

    // Crear usuario
    const newUser = await User.create({
      email,
      password,
      role: userRole,
      nombre,
      apellido,
    });

    // Si es STUDENT, crear perfil Student automáticamente
    if (userRole === 'STUDENT') {
      await Student.create({
        userId: newUser.id,
        promedioGeneral: 0,
        estadoPago: false,
        grado: grado || null,
        seccion: seccion || null,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: newUser.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/profile
 * Retorna el perfil del usuario autenticado.
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: req.user.role === 'STUDENT'
        ? [{ model: Student, as: 'studentProfile' }]
        : [],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
