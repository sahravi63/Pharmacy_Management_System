const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  medicine: {
    type: DataTypes.STRING,
    allowNull: false
  },

  medicineId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Medicines',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Delivered', 'Cancelled'),
    defaultValue: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = Order;
