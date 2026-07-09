const cron = require('node-cron');
const { checkInventoryAlerts } = require('./notificationService');

const startInventoryScheduler = () => {
  const schedule = process.env.INVENTORY_ALERT_CRON || '0 9 * * *';

  if (!cron.validate(schedule)) {
    console.warn(`Invalid INVENTORY_ALERT_CRON "${schedule}". Inventory scheduler not started.`);
    return null;
  }

  const task = cron.schedule(schedule, async () => {
    try {
      await checkInventoryAlerts();
    } catch (error) {
      console.error('Inventory alert check failed:', error);
    }
  });

  return task;
};

module.exports = startInventoryScheduler;
