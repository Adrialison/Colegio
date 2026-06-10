// ============================================
// CONTROLADOR: ADMINISTRADOR
// ============================================
import { User, Student, Pago, Comunicado, Curso, Grado, Seccion } from '../models/index.js';

/**
 * GET /api/admin/dashboard/stats
 * Retorna estadísticas rápidas para el dashboard.
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalAlumnos = await Student.count();
    const totalProfesores = await User.count({ where: { role: 'TEACHER', activo: true } });
    const pagosPendientes = await Student.count({ where: { estadoPago: false } });
    const seccionesActivas = await Seccion.count();

    return res.status(200).json({
      success: true,
      data: {
        totalAlumnos,
        totalProfesores,
        pagosPendientes,
        seccionesActivas,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── CRUD DE USUARIOS ──────────────────────────

/**
 * GET /api/admin/users
 * Lista todos los usuarios con paginación.
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        { 
          model: Student, 
          as: 'studentProfile', 
          required: false,
          include: [
            { model: Grado, as: 'gradoRef' },
            { model: Seccion, as: 'seccionRef' }
          ]
        }
      ],
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id
 * Obtiene un usuario por ID.
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { 
          model: Student, 
          as: 'studentProfile', 
          required: false,
          include: [
            { model: Grado, as: 'gradoRef' },
            { model: Seccion, as: 'seccionRef' }
          ]
        }
      ],
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

/**
 * POST /api/admin/users
 * Crea un nuevo usuario (cualquier rol).
 */
export const createUser = async (req, res, next) => {
  try {
    const { email, password, role, nombre, apellido, gradoId, seccionId } = req.body;

    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({
        success: false,
        message: 'Email, contraseña, nombre y apellido son obligatorios.',
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con ese email.',
      });
    }

    const newUser = await User.create({
      email,
      password,
      role: role || 'STUDENT',
      nombre,
      apellido,
    });

    // Si es STUDENT, crear perfil automáticamente
    if (newUser.role === 'STUDENT') {
      await Student.create({
        userId: newUser.id,
        promedioGeneral: 0,
        estadoPago: false,
        gradoId: gradoId || null,
        seccionId: seccionId || null,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente.',
      data: newUser.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id
 * Actualiza un usuario existente.
 */
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    const { email, password, role, nombre, apellido, activo } = req.body;

    await user.update({
      email: email || user.email,
      password: password || user.password,
      role: role || user.role,
      nombre: nombre || user.nombre,
      apellido: apellido || user.apellido,
      activo: activo !== undefined ? activo : user.activo,
    });

    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente.',
      data: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Elimina un usuario (soft delete: desactiva).
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    // Soft delete: desactivar usuario
    await user.update({ activo: false });

    return res.status(200).json({
      success: true,
      message: 'Usuario desactivado exitosamente.',
    });
  } catch (error) {
    next(error);
  }
};

// ── GESTIÓN DE PAGOS ──────────────────────────

/**
 * PUT /api/admin/students/:studentId/pago
 * Actualiza el estado de pago (deuda) de un alumno.
 */
export const updatePago = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { estadoPago } = req.body;

    if (estadoPago === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El campo estadoPago es obligatorio (true/false).',
      });
    }

    const student = await Student.findByPk(studentId, {
      include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Alumno no encontrado.',
      });
    }

    await student.update({ estadoPago });

    return res.status(200).json({
      success: true,
      message: `Estado de pago actualizado a: ${estadoPago ? 'AL DÍA' : 'DEBE'}.`,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// ── GESTIÓN DE COMUNICADOS ─────────────────────

/**
 * POST /api/admin/comunicados
 * Crea un nuevo comunicado.
 */
export const createComunicado = async (req, res, next) => {
  try {
    const { titulo, contenido, tipo } = req.body;

    const comunicado = await Comunicado.create({
      titulo,
      contenido,
      tipo: tipo || 'GENERAL',
      authorId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Comunicado creado exitosamente.',
      data: comunicado,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/comunicados
 * Lista todos los comunicados.
 */
export const getAllComunicados = async (req, res, next) => {
  try {
    const comunicados = await Comunicado.findAll({
      include: [{ model: User, as: 'author', attributes: ['id', 'nombre', 'apellido'] }],
      order: [['fechaPublicacion', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: comunicados,
    });
  } catch (error) {
    next(error);
  }
};

// ── GESTIÓN DE CURSOS ──────────────────────────

/**
 * POST /api/admin/cursos
 * Crea un nuevo curso.
 */
export const createCurso = async (req, res, next) => {
  try {
    const { nombre, descripcion, grado, seccion, teacherId } = req.body;

    const curso = await Curso.create({
      nombre,
      descripcion,
      grado,
      seccion,
      teacherId: teacherId || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente.',
      data: curso,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/cursos
 * Lista todos los cursos.
 */
export const getAllCursos = async (req, res, next) => {
  try {
    const cursos = await Curso.findAll({
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'nombre', 'apellido', 'email'] },
        { model: Grado, as: 'gradoRef' },
        { model: Seccion, as: 'seccionRef' }
      ],
      order: [['nombre', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: cursos,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/cursos/:id
 * Actualiza la asignación de un curso (profesor, grado, sección, horario).
 */
export const updateCurso = async (req, res, next) => {
  try {
    const { nombre, descripcion, teacherId, gradoId, seccionId, horario } = req.body;
    const curso = await Curso.findByPk(req.params.id);

    if (!curso) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado.' });
    }

    await curso.update({
      nombre: nombre || curso.nombre,
      descripcion: descripcion || curso.descripcion,
      teacherId: teacherId !== undefined ? teacherId : curso.teacherId,
      gradoId: gradoId !== undefined ? gradoId : curso.gradoId,
      seccionId: seccionId !== undefined ? seccionId : curso.seccionId,
      horario: horario !== undefined ? horario : curso.horario,
    });

    return res.status(200).json({
      success: true,
      message: 'Asignación de curso actualizada.',
      data: curso,
    });
  } catch (error) {
    next(error);
  }
};

// ── GESTIÓN DE GRADOS Y SECCIONES ───────────────

export const getAllGrados = async (req, res, next) => {
  try {
    const grados = await Grado.findAll({ order: [['nombre', 'ASC']] });
    return res.status(200).json({ success: true, data: grados });
  } catch (error) {
    next(error);
  }
};

export const createGrado = async (req, res, next) => {
  try {
    const { nombre, nivel } = req.body;
    const grado = await Grado.create({ nombre, nivel });
    return res.status(201).json({ success: true, message: 'Grado creado.', data: grado });
  } catch (error) {
    next(error);
  }
};

export const getAllSecciones = async (req, res, next) => {
  try {
    const secciones = await Seccion.findAll({ order: [['nombre', 'ASC']] });
    return res.status(200).json({ success: true, data: secciones });
  } catch (error) {
    next(error);
  }
};

export const createSeccion = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const seccion = await Seccion.create({ nombre });
    return res.status(201).json({ success: true, message: 'Sección creada.', data: seccion });
  } catch (error) {
    next(error);
  }
};
