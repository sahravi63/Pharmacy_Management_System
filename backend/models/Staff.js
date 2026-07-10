const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
}, {
  timestamps: true,
});

module.exports = Staff;
