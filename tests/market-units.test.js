'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { _internals } = require('../api/cloud');

test('cloud sanitiser preserves Nigerian selling-unit conversions and product currency', () => {
  const state = _internals.cleanState({
    products: [{
      id: 'P-1', name: 'Rice', category: 'Grains', price: 1000, opening: 20,
      baseUnit: 'kg', currency: 'NGN',
      units: [{ name: 'kg', factor: 1 }, { name: 'Bag', factor: 50 }, { name: 'Half bag', factor: 25 }]
    }]
  });
  assert.deepEqual(state.products[0].units, [
    { name: 'kg', factor: 1 }, { name: 'Bag', factor: 50 }, { name: 'Half bag', factor: 25 }
  ]);
  assert.equal(state.products[0].baseUnit, 'kg');
  assert.equal(state.products[0].currency, 'NGN');
});

test('cloud sanitiser retains immutable sale conversion snapshots on daily rows', () => {
  const state = _internals.cleanState({
    days: {
      '2026-11-09': {
        date: '2026-11-09', updatedAt: '2026-11-09T10:00:00.000Z',
        rows: [{
          id: 'P-1', name: 'Rice', category: 'Grains', opening: 50, added: 0, closing: 25,
          price: 1000, baseUnit: 'kg', currency: 'NGN', salesTotal: 25000,
          units: [{ name: 'kg', factor: 1 }, { name: 'Half bag', factor: 25 }],
          transactions: [{ id: 'TX-1', qty: 1, unit: 'Half bag', factor: 25, baseQty: 25, unitPrice: 25000, currency: 'NGN', total: 25000, at: '2026-11-09T10:00:00.000Z' }]
        }]
      }
    }
  });
  const row = state.days['2026-11-09'].rows[0];
  assert.equal(row.transactions[0].unit, 'Half bag');
  assert.equal(row.transactions[0].factor, 25);
  assert.equal(row.transactions[0].baseQty, 25);
  assert.equal(row.transactions[0].currency, 'NGN');
  assert.equal(row.salesTotal, 25000);
});

test('cloud merge keeps product units and transaction history across sync', () => {
  const merged = _internals.mergeState({}, {
    products: [{ id: 'P-1', name: 'Palm Oil', baseUnit: 'litre', currency: 'USD', units: [{ name: 'litre', factor: 1 }, { name: 'Drum', factor: 200 }] }],
    days: { '2026-11-09': { date: '2026-11-09', updatedAt: '2026-11-09T10:00:00.000Z', rows: [{
      id: 'P-1', name: 'Palm Oil', baseUnit: 'litre', currency: 'USD', opening: 200, added: 0, closing: 0,
      price: 1, salesTotal: 200, transactions: [{ id: 'TX-1', qty: 1, unit: 'Drum', factor: 200, baseQty: 200, unitPrice: 200, currency: 'USD', total: 200 }]
    }] } }
  });
  assert.equal(merged.products[0].units[1].name, 'Drum');
  assert.equal(merged.products[0].currency, 'USD');
  assert.equal(merged.days['2026-11-09'].rows[0].transactions[0].factor, 200);
});
