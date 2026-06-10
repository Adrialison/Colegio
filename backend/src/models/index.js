// ============================================
// ÍNDICE DE MODELOS Y ASOCIACIONES
// ============================================
import User from './User.js';
import Student from './Student.js';
import Curso from './Curso.js';
import Nota from './Nota.js';
import Pago from './Pago.js';
import Asistencia from './Asistencia.js';
import Comunicado from './Comunicado.js';
import Grado from './Grado.js';
import Seccion from './Seccion.js';

// ── ASOCIACIONES ──────────────────────────────

// User 1:1 Student
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User (TEACHER) 1:N Curso
User.hasMany(Curso, { foreignKey: 'teacherId', as: 'cursos' });
Curso.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// Grado 1:N Student
Grado.hasMany(Student, { foreignKey: 'gradoId', as: 'students' });
Student.belongsTo(Grado, { foreignKey: 'gradoId', as: 'gradoRef' });

// Seccion 1:N Student
Seccion.hasMany(Student, { foreignKey: 'seccionId', as: 'students' });
Student.belongsTo(Seccion, { foreignKey: 'seccionId', as: 'seccionRef' });

// Grado 1:N Curso
Grado.hasMany(Curso, { foreignKey: 'gradoId', as: 'cursos' });
Curso.belongsTo(Grado, { foreignKey: 'gradoId', as: 'gradoRef' });

// Seccion 1:N Curso
Seccion.hasMany(Curso, { foreignKey: 'seccionId', as: 'cursos' });
Curso.belongsTo(Seccion, { foreignKey: 'seccionId', as: 'seccionRef' });

// Student 1:N Nota
Student.hasMany(Nota, { foreignKey: 'studentId', as: 'notas' });
Nota.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Curso 1:N Nota
Curso.hasMany(Nota, { foreignKey: 'cursoId', as: 'notas' });
Nota.belongsTo(Curso, { foreignKey: 'cursoId', as: 'curso' });

// Student 1:N Pago
Student.hasMany(Pago, { foreignKey: 'studentId', as: 'pagos' });
Pago.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Student 1:N Asistencia
Student.hasMany(Asistencia, { foreignKey: 'studentId', as: 'asistencias' });
Asistencia.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Curso 1:N Asistencia
Curso.hasMany(Asistencia, { foreignKey: 'cursoId', as: 'asistencias' });
Asistencia.belongsTo(Curso, { foreignKey: 'cursoId', as: 'curso' });

// User (ADMIN) 1:N Comunicado
User.hasMany(Comunicado, { foreignKey: 'authorId', as: 'comunicados' });
Comunicado.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

export {
  User,
  Student,
  Curso,
  Nota,
  Pago,
  Asistencia,
  Comunicado,
  Grado,
  Seccion,
};
