// ============================================
// CONTROLADOR: ALUMNO (STUDENT)
// ============================================
import { User, Student, Nota, Asistencia, Pago, Curso, Comunicado } from '../models/index.js';

/**
 * Obtiene el perfil Student vinculado al userId del JWT.
 * Helper reutilizable en todos los endpoints de este controlador.
 */
const getStudentProfile = async (userId) => {
  const student = await Student.findOne({
    where: { userId },
    include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
  });
  return student;
};

/**
 * GET /api/student/profile
 * Retorna el perfil completo del alumno autenticado.
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const student = await getStudentProfile(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Perfil de alumno no encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/student/notas
 * Retorna solo las notas del alumno autenticado.
 */
export const getMyNotas = async (req, res, next) => {
  try {
    const student = await getStudentProfile(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Perfil de alumno no encontrado.',
      });
    }

    const { trimestre, cursoId } = req.query;
    const where = { studentId: student.id };
    if (trimestre) where.trimestre = trimestre;
    if (cursoId) where.cursoId = cursoId;

    const notas = await Nota.findAll({
      where,
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: {
        promedioGeneral: student.promedioGeneral,
        notas,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/student/asistencias
 * Retorna solo las asistencias del alumno autenticado.
 */
export const getMyAsistencias = async (req, res, next) => {
  try {
    const student = await getStudentProfile(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Perfil de alumno no encontrado.',
      });
    }

    const { cursoId, fecha } = req.query;
    const where = { studentId: student.id };
    if (cursoId) where.cursoId = cursoId;
    if (fecha) where.fecha = fecha;

    const asistencias = await Asistencia.findAll({
      where,
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre'] },
      ],
      order: [['fecha', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: asistencias,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/student/pagos
 * Retorna solo los pagos del alumno autenticado.
 */
export const getMyPagos = async (req, res, next) => {
  try {
    const student = await getStudentProfile(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Perfil de alumno no encontrado.',
      });
    }

    const pagos = await Pago.findAll({
      where: { studentId: student.id },
      order: [['fechaPago', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: {
        estadoPago: student.estadoPago,
        pagos,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/student/comunicados
 * Retorna los comunicados activos.
 */
export const getComunicados = async (req, res, next) => {
  try {
    const comunicados = await Comunicado.findAll({
      where: { activo: true },
      include: [{ model: User, as: 'author', attributes: ['nombre', 'apellido'] }],
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

/**
 * GET /api/student/cursos
 * Retorna los cursos asignados al grado y sección del alumno autenticado.
 */
export const getMyCursos = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id }
    });

    if (!student || !student.gradoId || !student.seccionId) {
      return res.status(200).json({ 
        success: true, 
        data: [],
        message: 'No tienes una sección académica asignada todavía.'
      });
    }

    const cursos = await Curso.findAll({
      where: {
        gradoId: student.gradoId,
        seccionId: student.seccionId,
        activo: true
      },
      include: [
        { model: User, as: 'teacher', attributes: ['nombre', 'apellido'] }
      ],
      order: [['nombre', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: cursos
    });
  } catch (error) {
    next(error);
  }
};
