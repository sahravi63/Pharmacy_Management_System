const Medicine = require('../models/Medicine');
const { sendEmail } = require('./emailService');

const checkLowStock = async (threshold = 10) => {
  const lowStockItems = await Medicine.findAll({
    where: {
      stock: {
        [Op.lte]: threshold
      }
    }
  });
  
  if (lowStockItems.length > 0) {
    await sendInventoryAlert(lowStockItems);
  }
  
  return lowStockItems;
};

const checkExpiringMedicines = async (days = 30) => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + days);
  
  const expiringSoon = await Medicine.findAll({
    where: {
      expiryDate: {
        [Op.between]: [new Date(), thresholdDate]
      }
    }
  });
  
  if (expiringSoon.length > 0) {
    await sendExpiryAlert(expiringSoon);
  }
  
  return expiringSoon;
};

module.exports = { checkLowStock, checkExpiringMedicines };