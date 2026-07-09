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
