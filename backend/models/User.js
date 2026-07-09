const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  role: {
    type: DataTypes.ENUM('admin', 'pharmacist', 'customer'),
    allowNull: false
  },

  pharmacistID: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },

  customerID: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = User;
