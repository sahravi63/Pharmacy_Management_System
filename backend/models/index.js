const User = require('./User');
const Customer = require('./customer');
const Pharmacist = require('./pharmacist');
const Staff = require('./Staff');
const Medicine = require('./Medicine');
const Order = require('./order');
const { Sales, SalesItems } = require('./sales');
const Notification = require('./Notification');
const Batch = require('./Batch');
const Supplier = require('./Supplier');
const PurchaseOrder = require('./PurchaseOrder');
const Prescription = require('./Prescription');

User.hasOne(Customer, { foreignKey: 'userId', onDelete: 'CASCADE' });
Customer.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Pharmacist, { foreignKey: 'userId', onDelete: 'CASCADE' });
Pharmacist.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Staff, { foreignKey: 'id', onDelete: 'CASCADE' });
Staff.belongsTo(User, { foreignKey: 'id' });

Medicine.hasMany(Notification, { foreignKey: 'medicineId', onDelete: 'SET NULL' });
Notification.belongsTo(Medicine, { foreignKey: 'medicineId' });

Medicine.hasMany(Batch, { foreignKey: 'medicineId', as: 'batches', onDelete: 'CASCADE' });
Batch.belongsTo(Medicine, { foreignKey: 'medicineId' });

Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId', onDelete: 'SET NULL' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId' });

Medicine.hasMany(PurchaseOrder, { foreignKey: 'medicineId', onDelete: 'SET NULL' });
PurchaseOrder.belongsTo(Medicine, { foreignKey: 'medicineId' });

Medicine.hasMany(Prescription, { foreignKey: 'medicineId', onDelete: 'SET NULL' });
Prescription.belongsTo(Medicine, { foreignKey: 'medicineId' });

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
  Batch,
  Supplier,
  PurchaseOrder,
  Prescription,
};
