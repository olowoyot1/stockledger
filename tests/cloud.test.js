const test = require('node:test');
const assert = require('node:assert/strict');
const { _internals } = require('../api/cloud');

test('salted credential hashes verify', () => {
  const a = _internals.hashPin('4821');
  const b = _internals.hashPin('4821');
  assert.notEqual(a, b);
  assert.equal(_internals.verifyPin('4821', a), true);
  assert.equal(_internals.verifyPin('wrong', a), false);
});

test('legacy hashes still verify', () => {
  const crypto = require('node:crypto');
  const legacy = crypto.createHash('sha256').update('1234').digest('hex');
  assert.equal(_internals.verifyPin('1234', legacy), true);
  assert.equal(_internals.verifyPin('wrong', legacy), false);
});

test('merge retains remote-only records and prefers incoming matching IDs', () => {
  assert.deepEqual(_internals.mergeById([{id:'a',v:1},{id:'b',v:1}],[{id:'b',v:2},{id:'c',v:3}]), [{id:'a',v:1},{id:'b',v:2},{id:'c',v:3}]);
});

test('merge keeps remote-only days and chooses the newer snapshot', () => {
  const result = _internals.mergeState({days:{'2026-10-01':{updatedAt:'2026-10-01T10:00:00Z',total:10},'2026-10-02':{updatedAt:'2026-10-02T10:00:00Z',total:20}}},{days:{'2026-10-01':{updatedAt:'2026-10-01T11:00:00Z',total:11}}});
  assert.equal(result.days['2026-10-01'].total, 11);
  assert.equal(result.days['2026-10-02'].total, 20);
});

test('access: trial, active, expired and suspended workspaces', () => {
  const day = 86400000, now = Date.now(), iso = ms => new Date(now + ms).toISOString();
  const { access } = _internals;
  assert.equal(access({ plan: 'trial', trial_ends_at: iso(5 * day) }, now).canWrite, true);
  assert.equal(access({ plan: 'trial', trial_ends_at: iso(-day) }, now).canWrite, false);
  assert.equal(access({ plan: 'active', paid_until: iso(day) }, now).canWrite, true);
  assert.equal(access({ plan: 'active', paid_until: iso(-day) }, now).canWrite, false);
  assert.equal(access({ plan: 'suspended', trial_ends_at: iso(5 * day) }, now).canWrite, false);
});

test('pricing is 1,500 NGN per user per month', () => {
  const ws = { plan: 'active', paid_until: new Date(Date.now() + 86400000).toISOString() };
  assert.equal(_internals.PRICE_PER_USER, 1500);
  assert.equal(_internals.access(ws, Date.now(), { users: 4 }).monthlyAmount, 6000);
  assert.equal(_internals.access(ws).monthlyAmount, 1500);
});
