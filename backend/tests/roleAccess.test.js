const test = require('node:test');
const assert = require('node:assert/strict');
const requireRole = require('../middleware/requireRole');

test('requireRole allows admins and pharmacists but blocks customers', () => {
  let nextCalled = 0;
  const req = { user: { role: 'pharmacist' } };
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json() {},
  };

  const middleware = requireRole('admin', 'pharmacist');
  middleware(req, res, () => {
    nextCalled += 1;
  });

  assert.equal(nextCalled, 1);
  assert.equal(res.statusCode, 200);
});

test('requireRole keeps customer routes restricted to customers', () => {
  let nextCalled = 0;
  const req = { user: { role: 'pharmacist' } };
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json() {},
  };

  const middleware = requireRole('customer');
  middleware(req, res, () => {
    nextCalled += 1;
  });

  assert.equal(nextCalled, 0);
  assert.equal(res.statusCode, 403);
});
