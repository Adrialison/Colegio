// ============================================
// MODELO: PAGO
// ============================================
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El monto no puede ser negativo.' },
      notNull: { msg: 'El monto es obligatorio.' },
    },
  },
  concepto: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El concepto no puede estar vacío.' },
    },
  },
  fechaPago: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  metodoPago: {
    type: DataTypes.ENUM('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'),
    defaultValue: 'EFECTIVO',
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'PAGADO', 'ANULADO'),
    defaultValue: 'PENDIENTE',
  },
  comprobante: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
}, {
  tableName: 'pagos',
});

export default Pago;
