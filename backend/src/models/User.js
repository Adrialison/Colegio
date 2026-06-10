// ============================================
// MODELO: USER (Usuario del sistema)
// ============================================
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Debe proporcionar un email válido.' },
      notEmpty: { msg: 'El email no puede estar vacío.' },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La contraseña no puede estar vacía.' },
      len: {
        args: [6, 100],
        msg: 'La contraseña debe tener al menos 6 caracteres.',
      },
    },
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'TEACHER', 'STUDENT'),
    allowNull: false,
    defaultValue: 'STUDENT',
    validate: {
      isIn: {
        args: [['ADMIN', 'TEACHER', 'STUDENT']],
        msg: 'El rol debe ser ADMIN, TEACHER o STUDENT.',
      },
    },
  },
  nombre: {
    type: DataTypes.STRING(80),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre no puede estar vacío.' },
    },
  },
  apellido: {
    type: DataTypes.STRING(80),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El apellido no puede estar vacío.' },
    },
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

/**
 * Método de instancia: compara la contraseña proporcionada con la almacenada
 */
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Método de instancia: retorna el usuario sin el campo password
 */
User.prototype.toSafeJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;
