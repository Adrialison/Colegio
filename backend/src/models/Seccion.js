import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Seccion = sequelize.define('Seccion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'El nombre de la sección es obligatorio (e.g., A, B).' },
    },
  },
}, {
  tableName: 'secciones',
});

export default Seccion;
