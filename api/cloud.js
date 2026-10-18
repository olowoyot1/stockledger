'use strict';
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);

// Table names keep their original (legacy) names so existing deployments keep working.
const TABLE = 'delite_cravings_state';
const WS = 'dc_workspaces';
const MEM = 'dc_members';

const PRICE_PER_USER = 1500; // NGN per user per month
const SESSION_TTL_MS = 30 * 86400000;
const MAX_BODY_BYTES = 3_500_000;
const MAX_STAFF = 50;
const LOCK_WINDOW = 15 * 60000;

/* ------------------------------------------------------------------ */
/* Passwords                                                            */
/* ------------------------------------------------------------------ */
const LEGACY_SHA256 = /^[a-f0-9]{64}$/i;
const DUMMY_HASH = 'scrypt:' + '0'.repeat(32) + ':' + '0'.repeat(64);

async function hashPin(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = (await scrypt(String(password || ''), salt, 32)).toString('hex');
  return ['scrypt', salt, derived].join(':');
}

async function verifyPin(password, stored) {
  if (typeof stored !== 'string' || !stored) return false;
  try {
    if (LEGACY_SHA256.test(stored)) {
      const legacy = crypto.createHash('sha256').update(String(password || '')).digest();
      return crypto.timingSafeEqual(legacy, Buffer.from(stored, 'hex'));
    }
    const [alg, salt, hash, ...extra] = stored.split(':');
    if (alg !== 'scrypt' || extra.length || !/^[a-f0-9]{32}$/i.test(salt || '') || !/^[a-f0-9]{64}$/i.test(hash || '')) return false;
    const expected = Buffer.from(hash, 'hex');
    const actual = await scrypt(String(password || ''), salt, expected.length);
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Session tokens (stateless, HMAC-signed; password never stored client-side) */
/* ------------------------------------------------------------------ */
function sessionSecret() {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 32) return explicit;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Server is not configured (missing SESSION_SECRET / Supabase key).');
  return crypto.createHash('sha256').update('stockledger-session-v1:' + key).digest('hex');
}

const b64u = value => Buffer.from(value).toString('base64url');
const fingerprint = hash => crypto.createHash('sha256').update(String(hash || '')).digest('hex').slice(0, 16);
const sign = body => crypto.createHmac('sha256', sessionSecret()).update('v1.' + body).digest();

function signToken(claims) {
  const body = b64u(JSON.stringify(claims));
  return 'v1.' + body + '.' + sign(body).toString('base64url');
}

function readToken(token, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 2000) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;
  const given = Buffer.from(parts[2], 'base64url');
  const expected = sign(parts[1]);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (!claims || typeof claims.w !== 'string' || !(claims.e > now)) return null;
    return claims;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Supabase REST                                                        */
/* ------------------------------------------------------------------ */
async function sb(path, options = {}) {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  // Supabase may expose the newer secret-key name; keep the legacy name as fallback.
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error('Supabase environment variables are not configured.');
  const res = await fetch(base + '/rest/v1/' + path, {
    ...options,
    signal: AbortSignal.timeout(10000),
    headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const body = await res.text();
  let data;
  try { data = body ? JSON.parse(body) : null; } catch { data = body; }
  if (!res.ok) {
    const err = new Error(typeof data === 'string' ? data : (data?.message || 'Supabase request failed'));
    err.code = data?.code;
    throw err;
  }
  return data;
}
const enc = encodeURIComponent;
const isDuplicate = e => e?.code === '23505' || /duplicate key|unique constraint/i.test(String(e?.message || ''));

/* ------------------------------------------------------------------ */
/* Input sanitising (a staff login can push data that the owner renders) */
/* ------------------------------------------------------------------ */
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HAS_CONTROL = /[\u0000-\u001F\u007F]/; // non-global: safe to .test() repeatedly
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const isDate = s => typeof s === 'string' && DATE_KEY.test(s) && !Number.isNaN(Date.parse(s));
const text = (v, max) => (typeof v === 'string' || typeof v === 'number') ? String(v).replace(CONTROL, '').slice(0, max) : '';
const amount = v => { const n = Number(v); return Number.isFinite(n) && n > 0 ? Math.min(n, 1e12) : 0; };
const stamp = v => { const t = typeof v === 'string' ? Date.parse(v) : NaN; return Number.isFinite(t) ? new Date(t).toISOString() : ''; };
const list = (v, fn, max) => (Array.isArray(v) ? v : []).slice(0, max).map(fn).filter(Boolean);
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);

const cleanProduct = p => {
  if (!isObj(p) || !text(p.id, 64)) return null;
  const out = { id: text(p.id, 64), category: text(p.category, 40) || 'Other', name: text(p.name, 120), price: amount(p.price), opening: amount(p.opening) };
  if (p.sku) out.sku = text(p.sku, 32);
  if (Array.isArray(p.priceLog)) out.priceLog = list(p.priceLog, l => isObj(l) ? { at: stamp(l.at), date: text(l.date, 10), from: amount(l.from), to: amount(l.to), src: text(l.src, 40) } : null, 200);
  return out;
};
const cleanRow = r => isObj(r) && text(r.id, 64)
  ? { id: text(r.id, 64), category: text(r.category, 40) || 'Other', name: text(r.name, 120), price: amount(r.price), opening: amount(r.opening), added: amount(r.added), closing: amount(r.closing) }
  : null;
const cleanDay = (date, d) => {
  if (!isObj(d)) return null;
  const out = { date, savedAt: stamp(d.savedAt), updatedAt: stamp(d.updatedAt), rows: list(d.rows, cleanRow, 5000) };
  if (!out.savedAt) delete out.savedAt;
  if (isDate(d.clonedFrom)) out.clonedFrom = d.clonedFrom;
  return out;
};
const cleanDebtor = d => isObj(d) && text(d.id, 80)
  ? { id: text(d.id, 80), name: text(d.name, 120), phone: text(d.phone, 40), address: text(d.address, 200), creditLimit: amount(d.creditLimit),
      openingBalance: Number.isFinite(Number(d.openingBalance)) ? Math.max(-1e12, Math.min(1e12, Number(d.openingBalance))) : 0, notes: text(d.notes, 500), createdAt: stamp(d.createdAt) }
  : null;
const cleanCreditSale = s => isObj(s) && text(s.id, 80) && text(s.debtorId, 80)
  ? { id: text(s.id, 80), date: isDate(s.date) ? s.date : '', debtorId: text(s.debtorId, 80),
      items: list(s.items, i => isObj(i) ? { productId: text(i.productId, 64), name: text(i.name, 120), qty: amount(i.qty), unitPrice: amount(i.unitPrice), total: amount(i.total) } : null, 50),
      total: amount(s.total), paid: amount(s.paid), dueDate: isDate(s.dueDate) ? s.dueDate : '', notes: text(s.notes, 500), createdAt: stamp(s.createdAt) }
  : null;
const cleanPayment = p => isObj(p) && text(p.id, 80) && text(p.debtorId, 80)
  ? { id: text(p.id, 80), date: isDate(p.date) ? p.date : '', debtorId: text(p.debtorId, 80), amount: amount(p.amount), method: text(p.method, 30), reference: text(p.reference, 120), notes: text(p.notes, 500), createdAt: stamp(p.createdAt) }
  : null;

function cleanState(data) {
  const days = {};
  if (isObj(data?.days)) {
    for (const [date, day] of Object.entries(data.days).slice(0, 4000)) {
      if (!isDate(date)) continue;
      const clean = cleanDay(date, day);
      if (clean) days[date] = clean;
    }
  }
  const deletedDays = {};
  if (isObj(data?.deletedDays)) {
    for (const [date, at] of Object.entries(data.deletedDays).slice(0, 4000)) {
      if (isDate(date) && stamp(at)) deletedDays[date] = stamp(at);
    }
  }
  return {
    products: list(data?.products, cleanProduct, 5000),
    deletedProductIds: [...new Set(list(data?.deletedProductIds, id => text(id, 64) || null, 5000))],
    days,
    deletedDays,
    debtors: list(data?.debtors, cleanDebtor, 5000),
    creditSales: list(data?.creditSales, cleanCreditSale, 100000),
    payments: list(data?.payments, cleanPayment, 100000),
    resetAt: stamp(data?.resetAt)
  };
}

/* ------------------------------------------------------------------ */
/* Merging                                                              */
/* ------------------------------------------------------------------ */
// Incoming records win for matching IDs; remote-only records survive.
function mergeById(remote, incoming) {
  const records = new Map();
  for (const item of Array.isArray(remote) ? remote : []) if (item && item.id != null) records.set(String(item.id), item);
  for (const item of Array.isArray(incoming) ? incoming : []) if (item && item.id != null) records.set(String(item.id), item);
  return [...records.values()];
}

const dayTime = d => Date.parse(d?.updatedAt || d?.savedAt || '') || 0;

function mergeState(remoteData, incomingData) {
  const remote = cleanState(remoteData);
  const incoming = cleanState(incomingData);

  // Deleted days are tombstones: a day is dropped when its deletion is newer than its last edit.
  const deletedDays = { ...remote.deletedDays };
  for (const [date, at] of Object.entries(incoming.deletedDays)) {
    if (!deletedDays[date] || at > deletedDays[date]) deletedDays[date] = at;
  }
  const days = { ...remote.days };
  for (const [date, next] of Object.entries(incoming.days)) {
    if (!days[date] || dayTime(next) >= dayTime(days[date])) days[date] = next;
  }
  for (const [date, at] of Object.entries(deletedDays)) {
    if (days[date] && Date.parse(at) >= dayTime(days[date])) delete days[date];
    else if (days[date]) delete deletedDays[date]; // superseded by a newer re-creation
  }

  const deleted = new Set([...remote.deletedProductIds, ...incoming.deletedProductIds]);
  return {
    products: mergeById(remote.products, incoming.products).filter(p => !deleted.has(String(p.id))),
    deletedProductIds: [...deleted],
    days,
    deletedDays,
    debtors: mergeById(remote.debtors, incoming.debtors),
    creditSales: mergeById(remote.creditSales, incoming.creditSales),
    payments: mergeById(remote.payments, incoming.payments),
    resetAt: remote.resetAt || incoming.resetAt
  };
}

/* ------------------------------------------------------------------ */
/* Access / billing                                                     */
/* ------------------------------------------------------------------ */
const norm = s => String(s || '').trim().toLowerCase();
const validUsername = u => /^\S{3,100}$/.test(u) && !HAS_CONTROL.test(u);
const validPassword = p => typeof p === 'string' && p.length >= 8 && p.length <= 128;

function access(ws, now = Date.now(), extra = {}) {
  const trialEnds = Date.parse(ws.trial_ends_at) || 0;
  const paidUntil = ws.paid_until ? Date.parse(ws.paid_until) : 0;
  const role = extra.role || 'owner';
  let canWrite = false;
  if (role === 'superadmin') canWrite = true;
  else if (ws.plan === 'active') canWrite = !paidUntil || paidUntil > now;
  else if (ws.plan === 'trial') canWrite = trialEnds > now;
  const end = ws.plan === 'active' ? paidUntil : trialEnds;
  const users = extra.users || 1;
  return {
    businessName: ws.business_name, username: extra.username || ws.username || '', plan: ws.plan, canWrite, role, users,
    pricePerUser: PRICE_PER_USER, monthlyAmount: users * PRICE_PER_USER,
    endsAt: end ? new Date(end).toISOString() : null,
    daysLeft: end ? Math.max(0, Math.ceil((end - now) / 86400000)) : null
  };
}

/* ------------------------------------------------------------------ */
/* Rate limiting (best effort: per serverless instance)                  */
/* ------------------------------------------------------------------ */
const buckets = new Map();
const MAX_BUCKETS = 5000;
function prune(now) {
  for (const [k, b] of buckets) if (now - b.t >= 3600000) buckets.delete(k);
  if (buckets.size > MAX_BUCKETS) [...buckets.keys()].slice(0, buckets.size - MAX_BUCKETS / 2).forEach(k => buckets.delete(k));
}
function hit(key, windowMs) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.t >= windowMs) b = { n: 0, t: now };
  b.n++;
  buckets.set(key, b);
  if (buckets.size > MAX_BUCKETS) prune(now);
  return b.n;
}
const peek = (key, windowMs) => { const b = buckets.get(key); return b && Date.now() - b.t < windowMs ? b.n : 0; };
const lockedOut = (username, ip) => peek('u:' + username, LOCK_WINDOW) >= 5 || peek('ip:' + ip, LOCK_WINDOW) >= 40;
const noteFailure = (username, ip) => { hit('u:' + username, LOCK_WINDOW); hit('ip:' + ip, LOCK_WINDOW); };
const clientIp = req => String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                         */
/* ------------------------------------------------------------------ */
const send = (res, status, body) => res.status(status).json(body);
const fail = (res, status, code, error, extra = {}) => send(res, status, { error, code, ...extra });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emptyState = () => ({ products: [], deletedProductIds: [], days: {}, deletedDays: {}, debtors: [], creditSales: [], payments: [], resetAt: '' });

async function usernameTaken(u) {
  return (await sb(WS + '?username=eq.' + enc(u) + '&select=id')).length > 0 || (await sb(MEM + '?username=eq.' + enc(u) + '&select=id')).length > 0;
}
async function accountFor(ws, role, username) {
  const members = await sb(MEM + '?workspace_id=eq.' + enc(ws.id) + '&select=id');
  return access(ws, Date.now(), { users: 1 + members.length, role, username });
}
const issueToken = (ws, member, hash) => signToken({ w: ws.id, m: member?.id || null, f: fingerprint(hash), e: Date.now() + SESSION_TTL_MS });

async function findPrincipal(username) {
  let ws = (await sb(WS + '?username=eq.' + enc(username) + '&select=*'))[0], member = null;
  if (!ws) {
    member = (await sb(MEM + '?username=eq.' + enc(username) + '&select=*'))[0];
    if (member) ws = (await sb(WS + '?id=eq.' + enc(member.workspace_id) + '&select=*'))[0];
  }
  return { ws, member, hash: (member || ws)?.pin_hash, role: member ? 'staff' : (ws?.role || 'owner') };
}

async function fromToken(token) {
  const claims = readToken(token);
  if (!claims || !UUID.test(claims.w) || (claims.m && !UUID.test(claims.m))) return null;
  const ws = (await sb(WS + '?id=eq.' + enc(claims.w) + '&select=*'))[0];
  if (!ws) return null;
  let member = null;
  if (claims.m) {
    member = (await sb(MEM + '?id=eq.' + enc(claims.m) + '&workspace_id=eq.' + enc(ws.id) + '&select=*'))[0];
    if (!member) return null;
  }
  const hash = (member || ws).pin_hash;
  if (fingerprint(hash) !== claims.f) return null; // password changed since the token was issued
  return { ws, member, hash, role: member ? 'staff' : (ws.role || 'owner'), username: (member || ws).username };
}

/* ------------------------------------------------------------------ */
/* Handler                                                              */
/* ------------------------------------------------------------------ */
async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return fail(res, 405, 'BAD_REQUEST', 'POST only'); }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch { return fail(res, 400, 'BAD_REQUEST', 'Invalid JSON'); } }
    body = body || {};
    if (!isObj(body)) return fail(res, 400, 'BAD_REQUEST', 'Invalid request body');
    if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) return fail(res, 413, 'PAYLOAD_TOO_LARGE', 'Data payload is too large. Export older reports before retrying.');

    const ip = clientIp(req);
    const action = String(body.action || '');

    /* ---------- unauthenticated ---------- */
    if (action === 'signup') {
      if (hit('su:' + ip, 3600000) > 10) return fail(res, 429, 'RATE_LIMITED', 'Too many attempts. Try again later.');
      const businessName = text(String(body.businessName || '').trim(), 80);
      const username = norm(body.username), password = String(body.password || '');
      if (businessName.length < 2) return fail(res, 400, 'BUSINESS_NAME', 'Enter your business name (2–80 characters).');
      if (!validUsername(username)) return fail(res, 400, 'USERNAME_INVALID', 'Login must be 3–100 characters with no spaces.');
      if (!validPassword(password)) return fail(res, 400, 'PASSWORD_INVALID', 'Password must be 8–128 characters.');
      if (password.toLowerCase() === username) return fail(res, 400, 'PASSWORD_INVALID', 'Password must differ from your login.');
      try {
        if (await usernameTaken(username)) return fail(res, 409, 'USERNAME_TAKEN', 'That login is already registered. Sign in instead.');
        const pin_hash = await hashPin(password);
        const made = await sb(WS, { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ username, business_name: businessName, pin_hash }) });
        const ws = made[0];
        return send(res, 200, { ok: true, workspaceId: ws.id, token: issueToken(ws, null, pin_hash), account: access(ws, Date.now(), { username }) });
      } catch (e) {
        if (isDuplicate(e)) return fail(res, 409, 'USERNAME_TAKEN', 'That login is already registered. Sign in instead.');
        throw e;
      }
    }

    if (action === 'login') {
      const username = norm(body.username), password = String(body.password || '');
      if (!validUsername(username) || !password || password.length > 128) return fail(res, 401, 'LOGIN_INVALID', 'Invalid login or password');
      if (lockedOut(username, ip)) return fail(res, 429, 'RATE_LIMITED', 'Too many failed attempts. Try again in 15 minutes.');
      const p = await findPrincipal(username);
      const ok = await verifyPin(password, p.hash || DUMMY_HASH); // always do the work: no user-enumeration timing signal
      if (!p.ws || !ok) { noteFailure(username, ip); return fail(res, 401, 'LOGIN_INVALID', 'Invalid login or password'); }
      buckets.delete('u:' + username);
      let hash = p.hash;
      if (LEGACY_SHA256.test(hash)) { // upgrade unsalted legacy hashes on successful login
        try {
          const upgraded = await hashPin(password);
          await sb(p.member ? MEM + '?id=eq.' + enc(p.member.id) : WS + '?id=eq.' + enc(p.ws.id), { method: 'PATCH', body: JSON.stringify({ pin_hash: upgraded }) });
          hash = upgraded;
        } catch { /* keep the legacy hash; the token fingerprint must match what is stored */ }
      }
      return send(res, 200, { ok: true, workspaceId: p.ws.id, token: issueToken(p.ws, p.member, hash), account: await accountFor(p.ws, p.role, username) });
    }

    /* ---------- authenticated ---------- */
    const token = String(req.headers?.authorization || '').replace(/^Bearer\s+/i, '');
    const a = await fromToken(token);
    if (!a) return fail(res, 401, 'AUTH_REQUIRED', 'Session expired. Please sign in again.');
    const { ws, role } = a;
    const account = () => accountFor(ws, role, a.username);
    const canWrite = access(ws, Date.now(), { role }).canWrite;
    const isOwner = role === 'owner' || role === 'superadmin';
    const stateUrl = TABLE + '?id=eq.' + enc(ws.id);

    if (action === 'listCompanies') {
      if (role !== 'superadmin') return fail(res, 403, 'FORBIDDEN', 'Superadmin access is required.');
      const companies = await sb(WS + '?select=id,username,business_name,plan,trial_ends_at,paid_until,role,created_at&order=created_at.desc');
      const members = await sb(MEM + '?select=workspace_id');
      const counts = members.reduce((c, m) => (c[m.workspace_id] = (c[m.workspace_id] || 0) + 1, c), {});
      return send(res, 200, { ok: true, companies: companies.map(c => ({ ...c, staffCount: counts[c.id] || 0 })) });
    }

    if (action === 'listUsers' || action === 'addUser' || action === 'removeUser') {
      if (!isOwner) return fail(res, 403, 'FORBIDDEN', 'Only an account owner can manage users.');
      if (action === 'addUser') {
        const nu = norm(body.newUsername), np = String(body.newPassword || '');
        if (!validUsername(nu)) return fail(res, 400, 'USERNAME_INVALID', 'Login must be 3–100 characters with no spaces.');
        if (!validPassword(np)) return fail(res, 400, 'PASSWORD_INVALID', 'Password must be 8–128 characters.');
        if (!canWrite) return fail(res, 402, 'SUBSCRIPTION_ENDED', 'Renew your subscription to add users.');
        const current = await sb(MEM + '?workspace_id=eq.' + enc(ws.id) + '&select=id');
        if (current.length >= MAX_STAFF) return fail(res, 400, 'STAFF_LIMIT', 'Staff limit reached.');
        if (await usernameTaken(nu)) return fail(res, 409, 'USERNAME_TAKEN', 'That login is already taken.');
        try {
          await sb(MEM, { method: 'POST', body: JSON.stringify({ workspace_id: ws.id, username: nu, pin_hash: await hashPin(np) }) });
        } catch (e) {
          if (isDuplicate(e)) return fail(res, 409, 'USERNAME_TAKEN', 'That login is already taken.');
          throw e;
        }
      }
      if (action === 'removeUser') {
        const userId = String(body.userId || '');
        if (!UUID.test(userId)) return fail(res, 400, 'BAD_REQUEST', 'Invalid user.');
        await sb(MEM + '?id=eq.' + enc(userId) + '&workspace_id=eq.' + enc(ws.id), { method: 'DELETE' });
      }
      const users = await sb(MEM + '?workspace_id=eq.' + enc(ws.id) + '&select=id,username,created_at&order=created_at');
      return send(res, 200, { ok: true, users, account: await account() });
    }

    if (action === 'pull') {
      const row = (await sb(stateUrl + '&select=id,data,updated_at'))[0];
      if (!row) return send(res, 200, { exists: false, data: null, account: await account() });
      return send(res, 200, { exists: true, data: cleanState(row.data), updatedAt: row.updated_at, account: await account() });
    }

    if (action === 'changeAuth') {
      const newUsername = norm(body.newUsername), newPassword = String(body.newPassword || ''), current = String(body.currentPassword || '');
      if (!validUsername(newUsername)) return fail(res, 400, 'USERNAME_INVALID', 'Login must be 3–100 characters with no spaces.');
      if (!validPassword(newPassword)) return fail(res, 400, 'PASSWORD_INVALID', 'Password must be 8–128 characters.');
      if (lockedOut(a.username, ip)) return fail(res, 429, 'RATE_LIMITED', 'Too many failed attempts. Try again in 15 minutes.');
      if (!(await verifyPin(current, a.hash))) { noteFailure(a.username, ip); return fail(res, 401, 'LOGIN_INVALID', 'Current password is incorrect.'); }
      if (newUsername !== a.username && await usernameTaken(newUsername)) return fail(res, 409, 'USERNAME_TAKEN', 'That login is already taken.');
      const pin_hash = await hashPin(newPassword);
      try {
        const target = a.member ? MEM + '?id=eq.' + enc(a.member.id) : WS + '?id=eq.' + enc(ws.id);
        await sb(target, { method: 'PATCH', body: JSON.stringify({ username: newUsername, pin_hash }) });
      } catch (e) {
        if (isDuplicate(e)) return fail(res, 409, 'USERNAME_TAKEN', 'That login is already taken.');
        throw e;
      }
      return send(res, 200, { ok: true, username: newUsername, token: issueToken(ws, a.member, pin_hash) });
    }

    if (action === 'resetData') {
      if (!isOwner) return fail(res, 403, 'FORBIDDEN', 'Only an account owner can reset data.');
      if (!canWrite) return fail(res, 402, 'SUBSCRIPTION_ENDED', 'Your trial or subscription has ended.', { account: access(ws, Date.now(), { role }) });
      const resetAt = new Date().toISOString();
      await sb(TABLE, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ id: ws.id, data: { ...emptyState(), resetAt }, updated_at: resetAt }) });
      return send(res, 200, { ok: true, resetAt });
    }

    if (action !== 'push') return fail(res, 400, 'BAD_REQUEST', 'Unknown action');
    if (!canWrite) return fail(res, 402, 'SUBSCRIPTION_ENDED', 'Your trial or subscription has ended. Renew to keep saving changes.', { account: access(ws, Date.now(), { role }) });

    const incoming = cleanState(body);
    // Optimistic concurrency: only overwrite the row we merged against; otherwise re-read and re-merge.
    for (let attempt = 0; attempt < 4; attempt++) {
      const row = (await sb(stateUrl + '&select=id,data,updated_at'))[0];
      const remote = row ? cleanState(row.data) : null;
      if (remote?.resetAt && incoming.resetAt !== remote.resetAt) return fail(res, 409, 'RESET', 'This business data was reset on another device. Reloading.');
      const state = remote ? mergeState(row.data, incoming) : incoming;
      const now = new Date().toISOString();
      if (row) {
        const saved = await sb(stateUrl + '&updated_at=eq.' + enc(row.updated_at), { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ data: state, updated_at: now }) });
        if (Array.isArray(saved) && saved.length) return send(res, 200, { ok: true, updatedAt: saved[0].updated_at || now });
      } else {
        try {
          const saved = await sb(TABLE, { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ id: ws.id, data: state, updated_at: now }) });
          return send(res, 200, { ok: true, updatedAt: saved?.[0]?.updated_at || now });
        } catch (e) { if (!isDuplicate(e)) throw e; }
      }
    }
    return fail(res, 409, 'CONFLICT', 'Another device saved at the same time. Please try again.');
  } catch (e) {
    console.error('[cloud]', e?.message || e);
    return fail(res, 500, 'SERVER_ERROR', 'Cloud storage error');
  }
}

module.exports = handler;
module.exports._internals = {
  hashPin, verifyPin, signToken, readToken, fingerprint, cleanState, mergeById, mergeState, access, norm,
  validUsername, validPassword, PRICE_PER_USER, SESSION_TTL_MS
};
