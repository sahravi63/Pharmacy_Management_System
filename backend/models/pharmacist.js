const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pharmacist = sequelize.define('Pharmacist', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  pharmacistID: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  qualification: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  experience: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Pharmacist;
