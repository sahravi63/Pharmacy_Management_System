const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  type: {
    type: DataTypes.ENUM('low_stock', 'out_of_stock', 'restock', 'expiry', 'stock_adjustment', 'order', 'sale'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
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
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Notification;
