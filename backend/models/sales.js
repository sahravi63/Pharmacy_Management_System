// models/sales.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define Sales model
const Sales = sequelize.define('Sales', {
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
});

// Define SalesItems model
const SalesItems = sequelize.define('SalesItems', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Relationship
Sales.hasMany(SalesItems, { as: 'itemsSold', foreignKey: 'saleId', onDelete: 'CASCADE' });
SalesItems.belongsTo(Sales, { foreignKey: 'saleId' });

module.exports = { Sales, SalesItems };
