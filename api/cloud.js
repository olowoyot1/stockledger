const crypto = require('crypto');

const TABLE = 'delite_cravings_state';
const WS = 'dc_workspaces';
const MEM = 'dc_members';
const PRICE_PER_USER = 1500; // NGN per user per month
const fails = new Map();

function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(pin || ''), salt, 32).toString('hex');
  return ['scrypt', salt, derived].join(':');
}

function verifyPin(pin, storedHash) {
  if (typeof storedHash !== 'string' || !storedHash) return false;
  try {
    if (/^[a-f0-9]{64}$/i.test(storedHash)) {
      const legacy = crypto.createHash('sha256').update(String(pin || '')).digest();
      return crypto.timingSafeEqual(legacy, Buffer.from(storedHash, 'hex'));
    }
    const parts = storedHash.split(':');
    if (parts.length !== 3 || parts[0] !== 'scrypt' || !/^[a-f0-9]{32}$/i.test(parts[1]) || !/^[a-f0-9]{64}$/i.test(parts[2])) return false;
    const expected = Buffer.from(parts[2], 'hex');
    const actual = crypto.scryptSync(String(pin || ''), parts[1], expected.length);
    return crypto.timingSafeEqual(actual, expected);
  } catch { return false; }
}

async function sb(path, options = {}) {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error('Supabase environment variables are not configured.');
  const res = await fetch(base + '/rest/v1/' + path, {
    ...options,
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data?.message || 'Supabase request failed'));
  return data;
}

function cleanState(data) {
  return {
    products: Array.isArray(data?.products) ? data.products : [],
    deletedProductIds: Array.isArray(data?.deletedProductIds) ? [...new Set(data.deletedProductIds.map(String))] : [],
    days: data?.days && typeof data.days === 'object' && !Array.isArray(data.days) ? data.days : {},
    debtors: Array.isArray(data?.debtors) ? data.debtors : [],
    creditSales: Array.isArray(data?.creditSales) ? data.creditSales : [],
    payments: Array.isArray(data?.payments) ? data.payments : []
  };
}

// Preserve records created by other clients between pull and push. Incoming records
// win for matching IDs, while remote-only records survive; day snapshots use timestamps.
function mergeById(remote, incoming) {
  const records = new Map();
  for (const item of Array.isArray(remote) ? remote : []) {
    if (item && item.id != null) records.set(String(item.id), item);
  }
  for (const item of Array.isArray(incoming) ? incoming : []) {
    if (item && item.id != null) records.set(String(item.id), item);
  }
  return [...records.values()];
}

function mergeState(remoteData, incomingData) {
  const remote = cleanState(remoteData);
  const incoming = cleanState(incomingData);
  const days = { ...remote.days };
  for (const [date, next] of Object.entries(incoming.days)) {
    const current = days[date];
    const nextTime = Date.parse(next?.updatedAt || next?.savedAt || '') || 0;
    const currentTime = Date.parse(current?.updatedAt || current?.savedAt || '') || 0;
    if (!current || nextTime >= currentTime) days[date] = next;
  }
  const deletedProductIds = [...new Set([...(remote.deletedProductIds || []), ...(incoming.deletedProductIds || [])].map(String))];
  const products = mergeById(remote.products, incoming.products).filter(p => !deletedProductIds.includes(String(p.id)));
  return {
    products,
    deletedProductIds,
    days,
    debtors: mergeById(remote.debtors, incoming.debtors),
    creditSales: mergeById(remote.creditSales, incoming.creditSales),
    payments: mergeById(remote.payments, incoming.payments)
  };
}

const norm = s => String(s || '').trim().toLowerCase();

// Subscription state for a workspace. Trial and paid periods are enforced server-side.
function access(ws, now = Date.now(), extra = {}) {
  const trialEnds = Date.parse(ws.trial_ends_at) || 0;
  const paidUntil = ws.paid_until ? Date.parse(ws.paid_until) : 0;
  let canWrite = false;
  if (ws.plan === 'active') canWrite = !paidUntil || paidUntil > now;
  else if (ws.plan === 'trial') canWrite = trialEnds > now;
  const end = ws.plan === 'active' ? paidUntil : trialEnds;
  const users = extra.users || 1;
  return { businessName: ws.business_name, plan: ws.plan, canWrite, role: extra.role || 'owner', users, pricePerUser: PRICE_PER_USER, monthlyAmount: users * PRICE_PER_USER, endsAt: end ? new Date(end).toISOString() : null,
    daysLeft: end ? Math.max(0, Math.ceil((end - now) / 86400000)) : null };
}

const isLocked = u => { const f = fails.get(u); return !!f && f.n >= 5 && Date.now() - f.t < 15 * 60000; };
const noteFail = u => { const f = fails.get(u), now = Date.now(); fails.set(u, f && now - f.t < 15 * 60000 ? { n: f.n + 1, t: now } : { n: 1, t: now }); };
const send = (res, status, body) => res.status(status).json(body);

async function authenticate(username, pin) {
  if (!username || username.length > 100 || !pin || pin.length > 128) return { status: 401, error: 'Valid login and password are required' };
  if (isLocked(username)) return { status: 429, error: 'Too many failed attempts. Try again in 15 minutes.' };
  const enc = encodeURIComponent(username);
  let ws = (await sb(WS + '?username=eq.' + enc + '&select=*'))[0], hash = ws?.pin_hash, role = 'owner', member = null;
  if (!ws) {
    member = (await sb(MEM + '?username=eq.' + enc + '&select=*'))[0];
    if (member) { role = 'staff'; hash = member.pin_hash; ws = (await sb(WS + '?id=eq.' + encodeURIComponent(member.workspace_id) + '&select=*'))[0]; }
  }
  if (!ws || !verifyPin(pin, hash)) { noteFail(username); return { status: 401, error: 'Invalid login or password' }; }
  fails.delete(username);
  return { ws, role, member };
}

async function usernameTaken(u) {
  const enc = encodeURIComponent(u);
  return (await sb(WS + '?username=eq.' + enc + '&select=id')).length > 0 || (await sb(MEM + '?username=eq.' + enc + '&select=id')).length > 0;
}

async function accountFor(ws, role) {
  const m = await sb(MEM + '?workspace_id=eq.' + encodeURIComponent(ws.id) + '&select=id');
  return access(ws, Date.now(), { users: 1 + m.length, role });
}

const isDuplicate = e => /duplicate|unique|23505/i.test(String(e?.message || ''));

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'POST only' }); }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!body || typeof body !== 'object' || Array.isArray(body)) return send(res, 400, { error: 'Invalid request body' });
    if (Buffer.byteLength(JSON.stringify(body), 'utf8') > 3_500_000) return send(res, 413, { error: 'Data payload is too large. Export older reports before retrying.' });
    const username = norm(body.username), pin = String(body.pin || '');

    if (body.action === 'signup') {
      const businessName = String(body.businessName || '').trim();
      if (businessName.length < 2 || businessName.length > 80) return send(res, 400, { error: 'Enter your business name (2–80 characters).' });
      if (username.length < 3 || username.length > 100) return send(res, 400, { error: 'Login must be 3–100 characters.' });
      if (pin.length < 8 || pin.length > 128) return send(res, 400, { error: 'Password must be at least 8 characters.' });
      try {
        const made = await sb(WS, { method: 'POST', headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ username, business_name: businessName, pin_hash: hashPin(pin) }) });
        return send(res, 200, { ok: true, workspaceId: made[0].id, account: access(made[0]) });
      } catch (e) {
        if (isDuplicate(e)) return send(res, 409, { error: 'That login is already registered. Sign in instead.' });
        throw e;
      }
    }

    const a = await authenticate(username, pin);
    if (a.error) return send(res, a.status, { error: a.error });
    const ws = a.ws, role = a.role, canWrite = access(ws).canWrite, account = () => accountFor(ws, role), stateUrl = TABLE + '?id=eq.' + encodeURIComponent(ws.id);

    if (body.action === 'login') return send(res, 200, { ok: true, workspaceId: ws.id, account: await account() });

    if (['listUsers', 'addUser', 'removeUser'].includes(body.action)) {
      if (role !== 'owner') return send(res, 403, { error: 'Only the account owner can manage users.' });
      if (body.action === 'addUser') {
        const nu = norm(body.newUsername), np = String(body.newPin || '');
        if (nu.length < 3 || nu.length > 100 || np.length < 8 || np.length > 128) return send(res, 400, { error: 'A login (3–100 characters) and a password of 8–128 characters are required.' });
        if (!canWrite) return send(res, 402, { error: 'Renew your subscription to add users.' });
        if (await usernameTaken(nu)) return send(res, 409, { error: 'That login is already taken.' });
        await sb(MEM, { method: 'POST', body: JSON.stringify({ workspace_id: ws.id, username: nu, pin_hash: hashPin(np) }) });
      }
      if (body.action === 'removeUser') await sb(MEM + '?id=eq.' + encodeURIComponent(String(body.userId || '')) + '&workspace_id=eq.' + encodeURIComponent(ws.id), { method: 'DELETE' });
      const users = await sb(MEM + '?workspace_id=eq.' + encodeURIComponent(ws.id) + '&select=id,username,created_at&order=created_at');
      return send(res, 200, { ok: true, users, account: await account() });
    }

    const rows = await sb(stateUrl + '&select=id,data,updated_at');
    const row = Array.isArray(rows) && rows[0];

    if (body.action === 'pull') {
      if (!row) return send(res, 200, { exists: false, data: null, account: await account() });
      return send(res, 200, { exists: true, data: cleanState(row.data), updatedAt: row.updated_at, account: await account() });
    }

    if (body.action === 'changeAuth') {
      const newUsername = norm(body.newUsername), newPin = String(body.newPin || '');
      if (newUsername.length < 3 || newUsername.length > 100 || newPin.length < 8 || newPin.length > 128)
        return send(res, 400, { error: 'A login (3–100 characters) and a password of 8–128 characters are required.' });
      if (newUsername !== username && await usernameTaken(newUsername)) return send(res, 409, { error: 'That login is already taken.' });
      try {
        const target = role === 'owner' ? WS + '?id=eq.' + encodeURIComponent(ws.id) : MEM + '?id=eq.' + encodeURIComponent(a.member.id);
        await sb(target, { method: 'PATCH', body: JSON.stringify({ username: newUsername, pin_hash: hashPin(newPin) }) });
      } catch (e) {
        if (isDuplicate(e)) return send(res, 409, { error: 'That login is already taken.' });
        throw e;
      }
      return send(res, 200, { ok: true });
    }

    if (body.action !== 'push') return send(res, 400, { error: 'Unknown action' });
    if (!canWrite) return send(res, 402, { error: 'Your trial or subscription has ended. Renew to keep saving changes.', account: access(ws) });

    const incoming = cleanState(body);
    const count = s => s.products.length + Object.keys(s.days).length + s.debtors.length + s.creditSales.length + s.payments.length;
    if (row && count(cleanState(row.data)) && !count(incoming) && !incoming.deletedProductIds.length)
      return send(res, 409, { error: 'Refusing to overwrite existing cloud records with an empty dataset.' });
    const state = row ? mergeState(row.data, incoming) : incoming;
    const saved = await sb(TABLE, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ id: ws.id, data: state, updated_at: new Date().toISOString() }) });
    return send(res, 200, { ok: true, updatedAt: saved?.[0]?.updated_at || new Date().toISOString() });
  } catch (e) {
    console.error(e);
    return send(res, 500, { error: 'Cloud storage error' });
  }
};

module.exports._internals = { hashPin, verifyPin, cleanState, mergeById, mergeState, access, norm, PRICE_PER_USER };
