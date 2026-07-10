const test = require('node:test');
const assert = require('node:assert/strict');
const { consumeStockFromBatches, createBatchEntry } = require('../utils/inventoryUtils');

test('consumeStockFromBatches uses earliest expiry first', () => {
  const batches = [
    { id: 1, quantity: 5, expiryDate: new Date('2025-01-01') },
    { id: 2, quantity: 10, expiryDate: new Date('2026-01-01') },
  ];

  const result = consumeStockFromBatches(batches, 7);

  assert.equal(result.remaining, 0);
  assert.deepEqual(result.updated.map((batch) => ({ id: batch.id, quantity: batch.quantity })), [
    { id: 1, quantity: 0 },
    { id: 2, quantity: 8 },
  ]);
});

test('createBatchEntry builds a batch record with defaults', () => {
  const batch = createBatchEntry({ quantity: 4, expiryDate: '2027-01-01', batchNo: 'B-001' });

  assert.equal(batch.batchNo, 'B-001');
  assert.equal(batch.quantity, 4);
  assert.equal(batch.costPrice, 0);
});
