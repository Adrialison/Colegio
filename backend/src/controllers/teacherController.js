// ============================================
// CONTROLADOR: PROFESOR
// ============================================
import { Nota, Asistencia, Student, Curso, User } from '../models/index.js';
import { recalcularPromedio } from '../services/academicService.js';

// ── REGISTRO DE NOTAS ─────────────────────────

/**
 * POST /api/teacher/notas
 * Registra una nota para un alumno. Valida rango 0-20.
 * Recalcula automáticamente el promedio del alumno.
 */
export const registrarNota = async (req, res, next) => {
  try {
    const { studentId, cursoId, valor, trimestre, comentario } = req.body;

    // Validar campos obligatorios
    if (!studentId || !cursoId || valor === undefined || !trimestre) {
      return res.status(400).json({
        success: false,
        message: 'studentId, cursoId, valor y trimestre son obligatorios.',
      });
    }

    // Validar rango de nota
    const notaValor = parseFloat(valor);
    if (isNaN(notaValor) || notaValor < 0 || notaValor > 20) {
      return res.status(400).json({
        success: false,
        message: 'La nota debe ser un número entre 0 y 20.',
      });
    }

    // Verificar que el alumno exista
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Alumno no encontrado.',
      });
    }

    // Verificar que el curso exista
    const curso = await Curso.findByPk(cursoId);
    if (!curso) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado.',
      });
    }

    // Crear la nota
    const nota = await Nota.create({
      studentId,
      cursoId,
      valor: notaValor,
      trimestre,
      comentario: comentario || null,
    });

    // Recalcular promedio del alumno
    const nuevoPromedio = await recalcularPromedio(studentId);

    return res.status(201).json({
      success: true,
      message: 'Nota registrada exitosamente.',
      data: {
        nota,
        nuevoPromedio,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/teacher/notas
 * Lista notas con filtros opcionales.
 */
export const getNotas = async (req, res, next) => {
  try {
    const { studentId, cursoId, trimestre } = req.query;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (cursoId) where.cursoId = cursoId;
    if (trimestre) where.trimestre = trimestre;

    const notas = await Nota.findAll({
      where,
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['nombre', 'apellido', 'email'] }] },
        { model: Curso, as: 'curso', attributes: ['id', 'nombre'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: notas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/teacher/notas/:id
 * Actualiza una nota existente.
 */
export const updateNota = async (req, res, next) => {
  try {
    const nota = await Nota.findByPk(req.params.id);

    if (!nota) {
      return res.status(404).json({
        success: false,
        message: 'Nota no encontrada.',
      });
    }

    const { valor, trimestre, comentario } = req.body;

    if (valor !== undefined) {
      const notaValor = parseFloat(valor);
      if (isNaN(notaValor) || notaValor < 0 || notaValor > 20) {
        return res.status(400).json({
          success: false,
          message: 'La nota debe ser un número entre 0 y 20.',
        });
      }
    }

    await nota.update({
      valor: valor !== undefined ? parseFloat(valor) : nota.valor,
      trimestre: trimestre || nota.trimestre,
      comentario: comentario !== undefined ? comentario : nota.comentario,
    });

    // Recalcular promedio
    const nuevoPromedio = await recalcularPromedio(nota.studentId);

    return res.status(200).json({
      success: true,
      message: 'Nota actualizada exitosamente.',
      data: {
        nota,
        nuevoPromedio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── REGISTRO DE ASISTENCIAS ────────────────────

/**
 * POST /api/teacher/asistencias
 * Registra una asistencia para un alumno.
 */
export const registrarAsistencia = async (req, res, next) => {
  try {
    const { studentId, cursoId, fecha, estado, observacion } = req.body;

    if (!studentId || !cursoId || !estado) {
      return res.status(400).json({
        success: false,
        message: 'studentId, cursoId y estado son obligatorios.',
      });
    }

    // Verificar que el alumno exista
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Alumno no encontrado.',
      });
    }

    const asistencia = await Asistencia.create({
      studentId,
      cursoId,
      fecha: fecha || new Date(),
      estado,
      observacion: observacion || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Asistencia registrada exitosamente.',
      data: asistencia,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/teacher/asistencias
 * Lista asistencias con filtros opcionales.
 */
export const getAsistencias = async (req, res, next) => {
  try {
    const { studentId, cursoId, fecha } = req.query;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (cursoId) where.cursoId = cursoId;
    if (fecha) where.fecha = fecha;

    const asistencias = await Asistencia.findAll({
      where,
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['nombre', 'apellido'] }] },
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
 * GET /api/teacher/cursos
 * Lista los cursos asignados al profesor autenticado.
 */
export const getMisCursos = async (req, res, next) => {
  try {
    const cursos = await Curso.findAll({
      where: { teacherId: req.user.id },
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
 * GET /api/teacher/students
 * Lista todos los alumnos (para que el profesor pueda buscar).
 */
export const getStudents = async (req, res, next) => {
  try {
    const students = await Student.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'nombre', 'apellido', 'email'] }],
      order: [[{ model: User, as: 'user' }, 'apellido', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};
