const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  medicineId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Medicines',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Suppliers',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Received', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  expectedArrivalDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = PurchaseOrder;
