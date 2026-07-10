const resolveOrderCustomerName = ({ role, userName, providedCustomerName }) => {
  const trimmedName = typeof providedCustomerName === 'string' ? providedCustomerName.trim() : '';

  if (role === 'customer') {
    return trimmedName || userName || '';
  }

  return trimmedName;
};

module.exports = {
  resolveOrderCustomerName,
};
