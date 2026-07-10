const test = require('node:test');
const assert = require('node:assert/strict');
const { getPaginationOptions, validatePrescriptionPayload } = require('../utils/validation');

test('getPaginationOptions caps oversized limits and normalizes offset', () => {
  const options = getPaginationOptions({ limit: '999999', offset: '-5' }, { maxLimit: 100 });

  assert.equal(options.limit, 100);
  assert.equal(options.offset, 0);
});

test('validatePrescriptionPayload rejects missing required fields', () => {
  const result = validatePrescriptionPayload({});

  assert.equal(result.isValid, false);
  assert.match(result.message, /patient name/i);
});
