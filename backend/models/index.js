const User = require('./User');
const Customer = require('./customer');
const Pharmacist = require('./pharmacist');
const Staff = require('./Staff');
const Medicine = require('./Medicine');
const Order = require('./order');
const { Sales, SalesItems } = require('./sales');
const Notification = require('./Notification');

User.hasOne(Customer, { foreignKey: 'userId', onDelete: 'CASCADE' });
Customer.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Pharmacist, { foreignKey: 'userId', onDelete: 'CASCADE' });
Pharmacist.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Staff, { foreignKey: 'id', onDelete: 'CASCADE' });
Staff.belongsTo(User, { foreignKey: 'id' });

Medicine.hasMany(Notification, { foreignKey: 'medicineId', onDelete: 'SET NULL' });
Notification.belongsTo(Medicine, { foreignKey: 'medicineId' });

module.exports = {
  User,
  Customer,
  Pharmacist,
  Staff,
  Medicine,
  Order,
  Sales,
  SalesItems,
  Notification,
};
