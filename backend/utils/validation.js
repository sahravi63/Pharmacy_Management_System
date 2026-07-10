const MAX_PAGINATION_LIMIT = 100;

const toPositiveInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getPaginationOptions = (query = {}, { maxLimit = MAX_PAGINATION_LIMIT } = {}) => {
  const rawLimit = toPositiveInteger(query.limit, maxLimit);
  const rawOffset = toPositiveInteger(query.offset, 0);
  return {
    limit: Math.min(rawLimit, maxLimit),
    offset: Math.max(rawOffset, 0),
  };
};

const validatePrescriptionPayload = (payload = {}) => {
  const { patientName, medicineId, status } = payload;

  if (!patientName || typeof patientName !== 'string' || !patientName.trim()) {
    return { isValid: false, message: 'Patient name is required' };
  }

  if (!medicineId || Number.isNaN(Number(medicineId))) {
    return { isValid: false, message: 'Medicine ID is required' };
  }

  if (status && !['Pending', 'Filled', 'Cancelled'].includes(status)) {
    return { isValid: false, message: 'Status must be Pending, Filled, or Cancelled' };
  }

  return { isValid: true };
};

const validatePurchaseOrderPayload = (payload = {}) => {
  const { medicineId, supplierId, quantity, status } = payload;

  if (!medicineId || Number.isNaN(Number(medicineId))) {
    return { isValid: false, message: 'Medicine ID is required' };
  }

  if (!supplierId || Number.isNaN(Number(supplierId))) {
    return { isValid: false, message: 'Supplier ID is required' };
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    return { isValid: false, message: 'Quantity must be a positive integer' };
  }

  if (status && !['Pending', 'Received', 'Cancelled'].includes(status)) {
    return { isValid: false, message: 'Status must be Pending, Received, or Cancelled' };
  }

  return { isValid: true };
};

const validateSupplierPayload = (payload = {}) => {
  const { name, email, phone } = payload;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return { isValid: false, message: 'Supplier name is required' };
  }

  if (email && typeof email !== 'string') {
    return { isValid: false, message: 'Email must be a string' };
  }

  if (phone && typeof phone !== 'string') {
    return { isValid: false, message: 'Phone must be a string' };
  }

  return { isValid: true };
};

const validateCustomerProfilePayload = (payload = {}) => {
  const { name, email, phone, address } = payload;

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return { isValid: false, message: 'Name must be a non-empty string' };
  }

  if (email !== undefined && (typeof email !== 'string' || !email.trim())) {
    return { isValid: false, message: 'Email must be a non-empty string' };
  }

  if (phone !== undefined && (typeof phone !== 'string' || !phone.trim())) {
    return { isValid: false, message: 'Phone must be a non-empty string' };
  }

  if (address !== undefined && typeof address !== 'string') {
    return { isValid: false, message: 'Address must be a string' };
  }

  return { isValid: true };
};

module.exports = {
  MAX_PAGINATION_LIMIT,
  getPaginationOptions,
  validatePrescriptionPayload,
  validatePurchaseOrderPayload,
  validateSupplierPayload,
  validateCustomerProfilePayload,
};
