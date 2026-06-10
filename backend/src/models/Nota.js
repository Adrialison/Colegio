// ============================================
// MODELO: NOTA (Calificación)
// ============================================
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Nota = sequelize.define('Nota', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  valor: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'La nota no puede ser menor a 0.' },
      max: { args: [20], msg: 'La nota no puede ser mayor a 20.' },
      notNull: { msg: 'El valor de la nota es obligatorio.' },
    },
  },
  trimestre: {
    type: DataTypes.ENUM('PRIMERO', 'SEGUNDO', 'TERCERO'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['PRIMERO', 'SEGUNDO', 'TERCERO']],
        msg: 'El trimestre debe ser PRIMERO, SEGUNDO o TERCERO.',
      },
    },
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'notas',
});

export default Nota;
