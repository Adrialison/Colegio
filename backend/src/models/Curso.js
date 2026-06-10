// ============================================
// MODELO: CURSO
// ============================================
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Curso = sequelize.define('Curso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre del curso no puede estar vacío.' },
    },
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  grado: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  seccion: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  gradoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  seccionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  horario: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Ejm: Lunes 08:00 - 10:00',
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'cursos',
});

export default Curso;
