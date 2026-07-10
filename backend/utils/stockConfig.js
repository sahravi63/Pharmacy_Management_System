const DEFAULT_LOW_STOCK_THRESHOLD = 10;
const DEFAULT_EXPIRY_ALERT_DAYS = 30;

const getLowStockThreshold = (env = process.env) => {
  const parsed = Number(env.LOW_STOCK_THRESHOLD);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_LOW_STOCK_THRESHOLD;
};

const getExpiryAlertDays = (env = process.env) => {
  const parsed = Number(env.EXPIRY_ALERT_DAYS);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_EXPIRY_ALERT_DAYS;
};

module.exports = {
  DEFAULT_LOW_STOCK_THRESHOLD,
  DEFAULT_EXPIRY_ALERT_DAYS,
  getLowStockThreshold,
  getExpiryAlertDays,
};
