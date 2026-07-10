const consumeStockFromBatches = (batches = [], requestedQuantity) => {
  const sorted = [...batches].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  const updated = [];
  let remaining = requestedQuantity;

  for (const batch of sorted) {
    if (remaining <= 0) {
      updated.push({ ...batch, quantity: batch.quantity });
      continue;
    }

    if (batch.quantity <= 0) {
      updated.push({ ...batch, quantity: 0 });
      continue;
    }

    const consumed = Math.min(batch.quantity, remaining);
    remaining -= consumed;
    updated.push({ ...batch, quantity: batch.quantity - consumed });
  }

  return { updated, remaining };
};

const createBatchEntry = ({ quantity, expiryDate, batchNo, medicineId, costPrice = 0 }) => ({
  medicineId,
  batchNo: batchNo || `BATCH-${Date.now()}`,
  expiryDate,
  quantity,
  costPrice,
});

module.exports = {
  consumeStockFromBatches,
  createBatchEntry,
};
