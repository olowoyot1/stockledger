'use strict';
const crypto = require('node:crypto');

// In-memory stand-in for Supabase's PostgREST API (unique constraints, filters, upserts).
function makeFakeDb() {
  const tables = { dc_workspaces: [], dc_members: [], delite_cravings_state: [] };
  const unique = { dc_workspaces: ['username'], dc_members: ['username'], delite_cravings_state: ['id'] };
  let hook = null;
  const fakeFetch = async (url, opts = {}) => {
    const u = new URL(url);
    const table = u.pathname.split('/').pop();
    const rows = tables[table];
    const method = opts.method || 'GET';
    const filters = [...u.searchParams.entries()].filter(([k]) => !['select', 'order'].includes(k));
    const match = r => filters.every(([k, v]) => String(r[k]) === v.replace(/^eq\./, ''));
    const respond = (status, body) => ({ ok: status < 300, status, text: async () => (body === undefined ? '' : JSON.stringify(body)) });
    const dup = () => respond(409, { code: '23505', message: 'duplicate key value violates unique constraint' });
    if (hook) { const r = hook(method, table, u); if (r) return r; }
    if (method === 'GET') return respond(200, rows.filter(match).map(r => structuredClone(r)));
    if (method === 'DELETE') { tables[table] = rows.filter(r => !match(r)); return respond(204); }
    const body = JSON.parse(opts.body);
    const prefer = (opts.headers || {}).Prefer || '';
    if (method === 'PATCH') {
      const hit = rows.filter(match);
      for (const r of hit) {
        for (const k of unique[table]) if (k in body && rows.some(o => o !== r && o[k] === body[k])) return dup();
        Object.assign(r, body);
      }
      return prefer.includes('representation') ? respond(200, hit.map(r => structuredClone(r))) : respond(204);
    }
    if (method === 'POST') {
      const existing = rows.find(r => unique[table].every(k => r[k] === body[k]));
      if (existing && prefer.includes('merge-duplicates')) { Object.assign(existing, body); return respond(201, [structuredClone(existing)]); }
      if (unique[table].some(k => rows.some(r => r[k] === body[k]))) return dup();
      const row = { id: crypto.randomUUID(), plan: 'trial', role: 'owner', created_at: new Date().toISOString(),
        trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(), paid_until: null, ...body };
      rows.push(row);
      return prefer.includes('representation') ? respond(201, [structuredClone(row)]) : respond(201);
    }
    return respond(405, {});
  };
  return { tables, fakeFetch, setHook: h => { hook = h; } };
}

module.exports = { makeFakeDb };
