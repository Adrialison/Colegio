// ============================================
// MODELO: COMUNICADO
// ============================================
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Comunicado = sequelize.define('Comunicado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El título no puede estar vacío.' },
    },
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El contenido no puede estar vacío.' },
    },
  },
  tipo: {
    type: DataTypes.ENUM('GENERAL', 'URGENTE', 'ACADEMICO', 'ADMINISTRATIVO'),
    defaultValue: 'GENERAL',
  },
  fechaPublicacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'comunicados',
});

export default Comunicado;
