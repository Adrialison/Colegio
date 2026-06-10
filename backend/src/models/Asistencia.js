// ============================================
// MODELO: ASISTENCIA
// ============================================
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Asistencia = sequelize.define('Asistencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  estado: {
    type: DataTypes.ENUM('PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO'),
    allowNull: false,
    defaultValue: 'PRESENTE',
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'asistencias',
});

export default Asistencia;
