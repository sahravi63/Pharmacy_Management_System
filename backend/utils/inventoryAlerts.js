const { checkInventoryAlerts } = require('../services/notificationService');

const checkLowStock = async () => {
  const { lowStock } = await checkInventoryAlerts();
  return lowStock;
};

const checkExpiringMedicines = async () => {
  const { expiringSoon } = await checkInventoryAlerts();
  return expiringSoon;
};

module.exports = { checkLowStock, checkExpiringMedicines };
