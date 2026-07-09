const { Op } = require('sequelize');
const Medicine = require('../models/Medicine');
const Notification = require('../models/Notification');
const { sendNotificationEmail } = require('./emailService');

const DEFAULT_LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 10;
let io = null;

const setNotificationSocket = (socketServer) => {
  io = socketServer;
};

const emitNotification = (notification) => {
  if (io) {
    io.to('notifications').emit('notification:new', notification);
  }
};

const deliverNotification = async (notification) => {
  emitNotification(notification);

  try {
    await sendNotificationEmail(notification);
  } catch (error) {
    console.error('Notification email failed:', error.message);
  }
};

const createNotification = async ({ type, title, message, medicineId = null, metadata = null }, options = {}) => {
  const notification = await Notification.create({
    type,
    title,
    message,
    medicineId,
    metadata,
  }, options);

  if (options.transaction) {
    options.transaction.afterCommit(() => deliverNotification(notification));
  } else {
    await deliverNotification(notification);
  }

  return notification;
};

const notifyStockLevel = async (medicine, options = {}) => {
  const threshold = Number(process.env.LOW_STOCK_THRESHOLD) || DEFAULT_LOW_STOCK_THRESHOLD;

  if (Number(medicine.stock) <= 0) {
    return createNotification({
      type: 'out_of_stock',
      title: 'Medicine out of stock',
      message: `${medicine.name} is out of stock.`,
      medicineId: medicine.id,
      metadata: { stock: medicine.stock },
    }, options);
  }

  if (Number(medicine.stock) <= threshold) {
    return createNotification({
      type: 'low_stock',
      title: 'Low stock warning',
      message: `${medicine.name} has only ${medicine.stock} units remaining.`,
      medicineId: medicine.id,
      metadata: { stock: medicine.stock, threshold },
    }, options);
  }

  return null;
};

const notifyRestock = async (medicine, previousStock, options = {}) => {
  if (Number(medicine.stock) > Number(previousStock)) {
    return createNotification({
      type: 'restock',
      title: 'Medicine restocked',
      message: `${medicine.name} stock increased from ${previousStock} to ${medicine.stock}.`,
      medicineId: medicine.id,
      metadata: { previousStock, stock: medicine.stock },
    }, options);
  }

  return null;
};

const checkInventoryAlerts = async () => {
  const threshold = Number(process.env.LOW_STOCK_THRESHOLD) || DEFAULT_LOW_STOCK_THRESHOLD;
  const now = new Date();
  const expiryLimit = new Date();
  expiryLimit.setDate(now.getDate() + (Number(process.env.EXPIRY_ALERT_DAYS) || 30));

  const lowStock = await Medicine.findAll({
    where: { stock: { [Op.lte]: threshold } },
  });

  const expiringSoon = await Medicine.findAll({
    where: {
      expiryDate: {
        [Op.between]: [now, expiryLimit],
      },
    },
  });

  for (const medicine of lowStock) {
    await notifyStockLevel(medicine);
  }

  for (const medicine of expiringSoon) {
    await createNotification({
      type: 'expiry',
      title: 'Medicine expiring soon',
      message: `${medicine.name} expires on ${new Date(medicine.expiryDate).toLocaleDateString()}.`,
      medicineId: medicine.id,
      metadata: { expiryDate: medicine.expiryDate },
    });
  }

  return { lowStock, expiringSoon };
};

module.exports = {
  createNotification,
  notifyRestock,
  notifyStockLevel,
  checkInventoryAlerts,
  setNotificationSocket,
};
