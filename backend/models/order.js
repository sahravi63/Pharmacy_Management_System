const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Define the Order schema using Sequelize
const Order = sequelize.define('Order', {
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  medicine: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Canceled'),
    defaultValue: 'Pending',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

module.exports = Order;
