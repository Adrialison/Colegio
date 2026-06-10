// ============================================
// MODELO: STUDENT (Perfil de alumno)
// ============================================
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  promedioGeneral: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0.00,
    validate: {
      min: { args: [0], msg: 'El promedio no puede ser negativo.' },
      max: { args: [20], msg: 'El promedio no puede ser mayor a 20.' },
    },
  },
  estadoPago: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'true = al día, false = debe',
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
}, {
  tableName: 'students',
});

export default Student;
