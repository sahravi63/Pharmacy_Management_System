const { DataTypes } = require('sequelize');
const {sequelize }= require('../config/db'); // Ensure this path points to your database config

const Sales = sequelize.define('Sales', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  itemsSold: {
    type: DataTypes.JSON, // Store an array of items in JSON format
    allowNull: false,
  },
});

module.exports = Sales;
