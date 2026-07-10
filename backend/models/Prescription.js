const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Prescription = sequelize.define('Prescription', {
  medicineId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  doctorName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Filled', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending',
  },
}, {
  timestamps: true,
});

module.exports = Prescription;
