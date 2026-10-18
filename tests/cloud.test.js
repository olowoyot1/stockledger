'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

process.env.SUPABASE_URL = 'http://fake.supabase.local';
process.env.SUPABASE_SECRET_KEY = 'test-secret-key-test-secret-key-0001';

const handler = require('../api/cloud');
const I = handler._internals;

const { makeFakeDb } = require('./helpers/fakeSupabase');

let db, realFetch = globalThis.fetch;
test.beforeEach(() => { db = makeFakeDb(); globalThis.fetch = db.fakeFetch; });
test.after(() => { globalThis.fetch = realFetch; });

let ipCounter = 0;
async function call(body, token) {
  const req = { method: 'POST', body, headers: { 'x-forwarded-for': '10.0.0.' + (++ipCounter), ...(token ? { authorization: 'Bearer ' + token } : {}) } };
  const out = { status: 200, body: null, headers: {} };
  const res = { setHeader: (k, v) => { out.headers[k] = v; }, status(s) { out.status = s; return this; }, json(b) { out.body = b; return this; } };
  await handler(req, res);
  return out;
}
const signup = (u = 'owner@shop.ng', p = 'correct-horse', b = 'Mama Put') => call({ action: 'signup', username: u, password: p, businessName: b });
const day = (date, rows = [], updatedAt = '2026-10-01T10:00:00Z') => ({ date, savedAt: updatedAt, updatedAt, rows });

/* ---------------- passwords ---------------- */
test('salted password hashes verify and differ per call', async () => {
  const a = await I.hashPin('4821-secret'), b = await I.hashPin('4821-secret');
  assert.notEqual(a, b);
  assert.equal(await I.verifyPin('4821-secret', a), true);
  assert.equal(await I.verifyPin('wrong', a), false);
  assert.equal(await I.verifyPin('x', 'garbage'), false);
});

test('legacy sha256 hashes still verify', async () => {
  const legacy = crypto.createHash('sha256').update('1234').digest('hex');
  assert.equal(await I.verifyPin('1234', legacy), true);
  assert.equal(await I.verifyPin('wrong', legacy), false);
});

/* ---------------- tokens ---------------- */
test('tokens verify, reject tampering and expire', () => {
  const t = I.signToken({ w: 'abc', m: null, f: 'x', e: Date.now() + 1000 });
  assert.equal(I.readToken(t).w, 'abc');
  const [v, body, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ w: 'evil', e: Date.now() + 1e9 })).toString('base64url');
  assert.equal(I.readToken([v, forged, sig].join('.')), null);
  assert.equal(I.readToken(t.slice(0, -2) + 'AA'), null);
  assert.equal(I.readToken(I.signToken({ w: 'abc', e: Date.now() - 1 })), null);
  assert.equal(I.readToken('nonsense'), null);
  assert.equal(I.readToken(undefined), null);
});

/* ---------------- validation ---------------- */
test('username and password validation', () => {
  assert.equal(I.validUsername('a@b.co'), true);
  assert.equal(I.validUsername('has space'), false);
  assert.equal(I.validUsername('ab'), false);
  assert.equal(I.validUsername('bad\u0001name'), false);
  assert.equal(I.validUsername('ok_name'), true); // repeated calls must stay stable (no stateful regex)
  assert.equal(I.validUsername('ok_name'), true);
  assert.equal(I.validPassword('1234567'), false);
  assert.equal(I.validPassword('12345678'), true);
});

/* ---------------- sanitising & merging ---------------- */
test('cleanState drops malformed data and hostile keys', () => {
  const s = I.cleanState({
    days: { '<img src=x onerror=alert(1)>': day('x'), '__proto__': day('x'), '2026-10-01': { date: '"><script>', rows: [{ id: 'p1', name: 'A\u0000B', price: '-5', opening: 'abc', added: 3 }] } },
    products: [{ id: 'p1', name: 'Pie', price: '500' }, { name: 'no id' }, null, 'str'],
    payments: [{ id: 'x', debtorId: 'd', amount: 'NaN' }]
  });
  assert.deepEqual(Object.keys(s.days), ['2026-10-01']);
  assert.equal(s.days['2026-10-01'].date, '2026-10-01');
  assert.equal(s.days['2026-10-01'].rows[0].name, 'AB');
  assert.equal(s.days['2026-10-01'].rows[0].price, 0);
  assert.equal(s.products.length, 1);
  assert.equal(s.products[0].price, 500);
  assert.equal(s.payments[0].amount, 0);
});

test('merge retains remote-only records and prefers incoming matching IDs', () => {
  assert.deepEqual(I.mergeById([{ id: 'a', v: 1 }, { id: 'b', v: 1 }], [{ id: 'b', v: 2 }, { id: 'c', v: 3 }]), [{ id: 'a', v: 1 }, { id: 'b', v: 2 }, { id: 'c', v: 3 }]);
});

test('merge keeps remote-only days and chooses the newer snapshot', () => {
  const r = I.mergeState(
    { days: { '2026-10-01': day('2026-10-01', [], '2026-10-01T10:00:00Z'), '2026-10-02': day('2026-10-02', [], '2026-10-02T10:00:00Z') } },
    { days: { '2026-10-01': day('2026-10-01', [{ id: 'p', name: 'x' }], '2026-10-01T11:00:00Z') } });
  assert.equal(r.days['2026-10-01'].rows.length, 1);
  assert.ok(r.days['2026-10-02']);
});

test('a deleted day stays deleted, but a newer re-creation wins', () => {
  const remote = { days: { '2026-10-01': day('2026-10-01', [], '2026-10-01T10:00:00Z') } };
  const gone = I.mergeState(remote, { deletedDays: { '2026-10-01': '2026-10-01T12:00:00Z' } });
  assert.equal(gone.days['2026-10-01'], undefined);
  const back = I.mergeState(gone, { days: { '2026-10-01': day('2026-10-01', [], '2026-10-01T13:00:00Z') } });
  assert.ok(back.days['2026-10-01']);
  assert.equal(back.deletedDays['2026-10-01'], undefined);
});

test('a removed product cannot be resurrected by a stale device', () => {
  const r = I.mergeState({ deletedProductIds: ['P-1'], products: [] }, { products: [{ id: 'P-1', name: 'Old' }, { id: 'P-2', name: 'New' }] });
  assert.deepEqual(r.products.map(p => p.id), ['P-2']);
});

/* ---------------- billing ---------------- */
test('access: trial, active, expired, suspended and superadmin', () => {
  const day = 86400000, now = Date.now(), iso = ms => new Date(now + ms).toISOString();
  assert.equal(I.access({ plan: 'trial', trial_ends_at: iso(5 * day) }, now).canWrite, true);
  assert.equal(I.access({ plan: 'trial', trial_ends_at: iso(-day) }, now).canWrite, false);
  assert.equal(I.access({ plan: 'active', paid_until: iso(day) }, now).canWrite, true);
  assert.equal(I.access({ plan: 'active', paid_until: iso(-day) }, now).canWrite, false);
  assert.equal(I.access({ plan: 'suspended', trial_ends_at: iso(5 * day) }, now).canWrite, false);
  assert.equal(I.access({ plan: 'trial', trial_ends_at: iso(-day) }, now, { role: 'superadmin' }).canWrite, true);
});

test('pricing is 1,500 NGN per user per month', () => {
  const ws = { plan: 'active', paid_until: new Date(Date.now() + 86400000).toISOString() };
  assert.equal(I.PRICE_PER_USER, 1500);
  assert.equal(I.access(ws, Date.now(), { users: 4 }).monthlyAmount, 6000);
  assert.equal(I.access(ws).monthlyAmount, 1500);
});

/* ---------------- HTTP flows ---------------- */
test('method and body validation', async () => {
  const out = { status: 200, body: null };
  await handler({ method: 'GET', headers: {} }, { setHeader() {}, status(s) { out.status = s; return this; }, json(b) { out.body = b; return this; } });
  assert.equal(out.status, 405);
  assert.equal((await call([1, 2])).status, 400);
  assert.equal((await call({ action: 'nope' })).status, 401); // unauthenticated unknown action
});

test('signup returns a token, never stores a plaintext password, rejects bad input', async () => {
  const r = await signup();
  assert.equal(r.status, 200);
  assert.ok(r.body.token && r.body.workspaceId);
  assert.equal(r.body.account.plan, 'trial');
  assert.ok(db.tables.dc_workspaces[0].pin_hash.startsWith('scrypt:'));
  assert.ok(!JSON.stringify(db.tables).includes('correct-horse'));
  assert.equal((await signup('owner@shop.ng', 'another-pass')).body.code, 'USERNAME_TAKEN');
  assert.equal((await signup('x y', 'correct-horse')).body.code, 'USERNAME_INVALID');
  assert.equal((await signup('new@shop.ng', 'short')).body.code, 'PASSWORD_INVALID');
  assert.equal((await signup('new@shop.ng', 'correct-horse', 'A')).body.code, 'BUSINESS_NAME');
});

test('login: success, failure, lockout, and no user enumeration', async () => {
  await signup();
  const ok = await call({ action: 'login', username: 'OWNER@shop.ng', password: 'correct-horse' });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token);
  const wrong = await call({ action: 'login', username: 'owner@shop.ng', password: 'nope-nope' });
  const ghost = await call({ action: 'login', username: 'ghost@shop.ng', password: 'nope-nope' });
  assert.equal(wrong.status, 401);
  assert.deepEqual(wrong.body, ghost.body);
  for (let i = 0; i < 5; i++) await call({ action: 'login', username: 'lock@shop.ng', password: 'bad-bad-bad' });
  assert.equal((await call({ action: 'login', username: 'lock@shop.ng', password: 'bad-bad-bad' })).status, 429);
});

test('legacy sha256 accounts can sign in and are upgraded to scrypt', async () => {
  const ws = (await signup()).body;
  db.tables.dc_workspaces[0].pin_hash = crypto.createHash('sha256').update('correct-horse').digest('hex');
  const r = await call({ action: 'login', username: 'owner@shop.ng', password: 'correct-horse' });
  assert.equal(r.status, 200);
  assert.ok(db.tables.dc_workspaces[0].pin_hash.startsWith('scrypt:'));
  assert.equal((await call({ action: 'pull' }, r.body.token)).status, 200); // token matches upgraded hash
  assert.ok(ws.workspaceId);
});

test('protected actions need a valid token', async () => {
  await signup();
  assert.equal((await call({ action: 'pull' })).body.code, 'AUTH_REQUIRED');
  assert.equal((await call({ action: 'pull' }, 'v1.fake.fake')).status, 401);
});

test('push/pull round trip with sanitising and tombstones', async () => {
  const { token } = (await signup()).body;
  const push = (extra) => call({ action: 'push', products: [], days: {}, ...extra }, token);
  assert.equal((await push({ products: [{ id: 'P-1', name: 'Pie', category: 'Snacks', price: 500 }], days: { '2026-10-01': day('2026-10-01', [{ id: 'P-1', name: 'Pie', price: 500, opening: 5, added: 0, closing: 2 }]) } })).status, 200);
  const pulled = await call({ action: 'pull' }, token);
  assert.equal(pulled.body.exists, true);
  assert.equal(pulled.body.data.products[0].name, 'Pie');
  assert.ok(pulled.body.data.days['2026-10-01']);
  await push({ deletedDays: { '2026-10-01': new Date(Date.now() + 1000).toISOString() } });
  assert.equal((await call({ action: 'pull' }, token)).body.data.days['2026-10-01'], undefined);
});

test('a concurrent write is detected and re-merged instead of lost', async () => {
  const { token } = (await signup()).body;
  await call({ action: 'push', products: [{ id: 'A', name: 'A' }] }, token);
  let injected = false;
  db.setHook((method, table, url) => {
    // Simulate another device saving between our read and our conditional PATCH.
    if (method === 'PATCH' && table === 'delite_cravings_state' && !injected) {
      injected = true;
      const row = db.tables.delite_cravings_state[0];
      row.data = { ...row.data, products: [...row.data.products, { id: 'FROM-OTHER-DEVICE', name: 'Other', category: 'x', price: 1, opening: 0 }] };
      row.updated_at = new Date(Date.now() + 5).toISOString();
    }
    return null;
  });
  const r = await call({ action: 'push', products: [{ id: 'B', name: 'B' }] }, token);
  assert.equal(r.status, 200);
  const ids = db.tables.delite_cravings_state[0].data.products.map(p => p.id).sort();
  assert.deepEqual(ids, ['A', 'B', 'FROM-OTHER-DEVICE']);
});

test('expired trial: read allowed, writes refused with 402', async () => {
  const { token } = (await signup()).body;
  db.tables.dc_workspaces[0].trial_ends_at = new Date(Date.now() - 86400000).toISOString();
  assert.equal((await call({ action: 'pull' }, token)).status, 200);
  const r = await call({ action: 'push', products: [] }, token);
  assert.equal(r.status, 402);
  assert.equal(r.body.code, 'SUBSCRIPTION_ENDED');
});

test('staff: owner adds, staff signs in, staff is restricted, owner removes', async () => {
  const owner = (await signup()).body;
  const added = await call({ action: 'addUser', newUsername: 'Staff1', newPassword: 'staff-pass-1' }, owner.token);
  assert.equal(added.status, 200);
  assert.equal(added.body.account.monthlyAmount, 3000);
  assert.equal((await call({ action: 'addUser', newUsername: 'staff1', newPassword: 'staff-pass-2' }, owner.token)).body.code, 'USERNAME_TAKEN');
  assert.equal((await call({ action: 'addUser', newUsername: 'owner@shop.ng', newPassword: 'staff-pass-2' }, owner.token)).body.code, 'USERNAME_TAKEN');
  const staff = await call({ action: 'login', username: 'staff1', password: 'staff-pass-1' });
  assert.equal(staff.body.account.role, 'staff');
  assert.equal(staff.body.workspaceId, owner.workspaceId);
  assert.equal((await call({ action: 'listUsers' }, staff.body.token)).status, 403);
  assert.equal((await call({ action: 'resetData' }, staff.body.token)).status, 403);
  assert.equal((await call({ action: 'push', products: [{ id: 'S', name: 'S' }] }, staff.body.token)).status, 200);
  assert.equal((await call({ action: 'removeUser', userId: 'not-a-uuid' }, owner.token)).status, 400);
  const id = added.body.users[0].id;
  assert.equal((await call({ action: 'removeUser', userId: id }, owner.token)).body.users.length, 0);
  assert.equal((await call({ action: 'pull' }, staff.body.token)).status, 401); // removed staff token is dead
});

test('changeAuth needs the current password, rotates the token and kills the old one', async () => {
  const { token } = (await signup()).body;
  assert.equal((await call({ action: 'changeAuth', newUsername: 'owner@shop.ng', newPassword: 'brand-new-pass', currentPassword: 'wrong-pass' }, token)).status, 401);
  const r = await call({ action: 'changeAuth', newUsername: 'owner2@shop.ng', newPassword: 'brand-new-pass', currentPassword: 'correct-horse' }, token);
  assert.equal(r.status, 200);
  assert.equal((await call({ action: 'pull' }, token)).status, 401);
  assert.equal((await call({ action: 'pull' }, r.body.token)).status, 200);
  assert.equal((await call({ action: 'login', username: 'owner2@shop.ng', password: 'brand-new-pass' })).status, 200);
});

test('superadmin can change login (previously crashed) and list companies; owners cannot', async () => {
  const owner = (await signup()).body;
  await signup('boss@stockledger.ng', 'super-secret-1', 'HQ');
  db.tables.dc_workspaces[1].role = 'superadmin';
  const boss = await call({ action: 'login', username: 'boss@stockledger.ng', password: 'super-secret-1' });
  assert.equal(boss.body.account.role, 'superadmin');
  const list = await call({ action: 'listCompanies' }, boss.body.token);
  assert.equal(list.body.companies.length, 2);
  assert.equal((await call({ action: 'listCompanies' }, owner.token)).status, 403);
  const ch = await call({ action: 'changeAuth', newUsername: 'boss2@stockledger.ng', newPassword: 'super-secret-2', currentPassword: 'super-secret-1' }, boss.body.token);
  assert.equal(ch.status, 200);
});

test('resetData wipes cloud data and forces stale devices to reload', async () => {
  const { token } = (await signup()).body;
  await call({ action: 'push', products: [{ id: 'P', name: 'P' }] }, token);
  const reset = await call({ action: 'resetData' }, token);
  assert.equal(reset.status, 200);
  assert.equal((await call({ action: 'pull' }, token)).body.data.products.length, 0);
  const stale = await call({ action: 'push', products: [{ id: 'P', name: 'P' }], resetAt: '' }, token);
  assert.equal(stale.status, 409);
  assert.equal(stale.body.code, 'RESET');
  const fresh = await call({ action: 'push', products: [{ id: 'Q', name: 'Q' }], resetAt: reset.body.resetAt }, token);
  assert.equal(fresh.status, 200);
});

test('oversized payloads are rejected', async () => {
  const { token } = (await signup()).body;
  const r = await call({ action: 'push', products: [{ id: 'x', name: 'y'.repeat(3_600_000) }] }, token);
  assert.equal(r.status, 413);
});
