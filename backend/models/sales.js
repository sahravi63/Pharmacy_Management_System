// models/Sales.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
  }
});

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
  }
});

// Associate SalesItems with Sales (One-to-Many relationship)
Sales.hasMany(SalesItems, { as: 'itemsSold', foreignKey: 'saleId' });
SalesItems.belongsTo(Sales, { foreignKey: 'saleId' });

module.exports = { Sales, SalesItems };
