// ============================================
// SERVICIO ACADÉMICO
// ============================================
import Nota from '../models/Nota.js';
import Student from '../models/Student.js';

/**
 * Recalcula el promedio general de un alumno basándose en todas sus notas.
 * Se ejecuta automáticamente cada vez que se registra una nota nueva.
 *
 * @param {number} studentId - ID del perfil Student
 * @returns {number} El nuevo promedio calculado
 */
export const recalcularPromedio = async (studentId) => {
  try {
    const notas = await Nota.findAll({
      where: { studentId },
      attributes: ['valor'],
    });

    if (notas.length === 0) {
      await Student.update(
        { promedioGeneral: 0 },
        { where: { id: studentId } }
      );
      return 0;
    }

    const suma = notas.reduce((acc, nota) => acc + parseFloat(nota.valor), 0);
    const promedio = parseFloat((suma / notas.length).toFixed(2));

    await Student.update(
      { promedioGeneral: promedio },
      { where: { id: studentId } }
    );

    console.log(`📊 Promedio recalculado para Student #${studentId}: ${promedio}`);
    return promedio;
  } catch (error) {
    console.error('❌ Error al recalcular promedio:', error.message);
    throw error;
  }
};
