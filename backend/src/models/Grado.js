import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Grado = sequelize.define('Grado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'El nombre del grado es obligatorio.' },
    },
  },
  nivel: {
    type: DataTypes.ENUM('INICIAL', 'PRIMARIA', 'SECUNDARIA'),
    defaultValue: 'PRIMARIA',
  },
}, {
  tableName: 'grados',
});

export default Grado;
