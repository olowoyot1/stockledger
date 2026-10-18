'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DICT, langs } = require('../i18n.js');

const root = path.join(__dirname, '..');
const src = f => fs.readFileSync(path.join(root, f), 'utf8');
const placeholders = s => (s.match(/\{\w+\}/g) || []).sort().join(',');

test('every language defines exactly the English keys', () => {
  const base = Object.keys(DICT.en);
  for (const code of Object.keys(langs)) {
    assert.deepEqual(Object.keys(DICT[code]).sort(), [...base].sort(), code + ' keys differ from English');
  }
});

test('placeholders match English in every language, and no value is empty', () => {
  for (const [code, dict] of Object.entries(DICT)) {
    for (const [key, value] of Object.entries(dict)) {
      assert.ok(value.trim(), code + ':' + key + ' is empty');
      assert.equal(placeholders(value), placeholders(DICT.en[key]), code + ':' + key + ' placeholders differ');
    }
  }
});

test('Nigerian languages are present', () => {
  assert.deepEqual(Object.keys(langs).sort(), ['en', 'ha', 'ig', 'pcm', 'yo']);
});

test('every key used in the code or markup exists', () => {
  const used = new Set();
  for (const f of ['app.js', 'auth.js', 'team.js', 'debtors.js']) {
    for (const m of src(f).matchAll(/\b(?:t|th)\('([\w.]+)'/g)) used.add(m[1]);
    for (const m of src(f).matchAll(/\bth\('([\w.]+)'/g)) used.add(m[1]);
  }
  for (const m of src('index.html').matchAll(/data-i18n(?:-placeholder|-aria|-title)?="([\w.]+)"/g)) used.add(m[1]);
  for (const m of src('index.html').matchAll(/data-i18n-vars="([\w.]+)\|/g)) used.add(m[1]);
  // keys built dynamically
  ['plan.trial', 'plan.active', 'plan.suspended', 'src.daily', 'src.products', 'src.import'].forEach(k => used.add(k));
  Object.keys(DICT.en).filter(k => k.startsWith('err.')).forEach(k => used.add(k));
  const missing = [...used].filter(k => !k.endsWith('.') && !(k in DICT.en)); // 'plan.' / 'err.' are dynamic prefixes
  assert.deepEqual(missing, []);
});

test('no unused translation keys (keeps dictionaries lean)', () => {
  const engine = src('i18n.js').split('const DICT = ')[1]; // code after the dictionaries
  const all = ['app.js', 'auth.js', 'team.js', 'debtors.js', 'index.html'].map(src).join('\n') + engine;
  const dynamic = /^(err\.|plan\.|src\.)/;
  const unused = Object.keys(DICT.en).filter(k => !dynamic.test(k) && !all.includes("'" + k + "'") && !all.includes('"' + k + '"') && !all.includes('"' + k + '|'));
  assert.deepEqual(unused, []);
});

test('every server error code has a translation', () => {
  const codes = [...src('api/cloud.js').matchAll(/fail\(res, \d+, '([A-Z_]+)'/g)].map(m => m[1]);
  const missing = [...new Set(codes)].filter(c => !('err.' + c in DICT.en));
  assert.deepEqual(missing, []);
});

test('markup: every element id used by scripts exists, and ids are unique', () => {
  const html = src('index.html');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate ids in index.html');
  const wanted = new Set();
  for (const f of ['app.js', 'auth.js', 'team.js']) for (const m of src(f).matchAll(/\$\('([A-Za-z0-9_]+)'\)/g)) wanted.add(m[1]);
  const missing = [...wanted].filter(id => !ids.includes(id));
  assert.deepEqual(missing, []);
});

test('markup: sections are balanced and not nested inside each other', () => {
  const html = src('index.html');
  assert.equal((html.match(/<section\b/g) || []).length, (html.match(/<\/section>/g) || []).length);
  assert.equal((html.match(/<div\b/g) || []).length, (html.match(/<\/div>/g) || []).length);
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  let depth = 0, max = 0;
  for (const m of main.matchAll(/<(\/?)section\b/g)) { depth += m[1] ? -1 : 1; max = Math.max(max, depth); }
  assert.equal(max, 1, 'a section is nested inside another section');
});

test('security: no inline scripts, no plaintext credential storage, no third-party script hosts', () => {
  const html = src('index.html');
  assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html), 'inline <script> found');
  assert.ok(!/https?:\/\/[^"']*\.js/.test(html), 'external script found');
  assert.ok(!/delite_cravings_auth_v2/.test(src('app.js') + src('team.js') + src('debtors.js')));
  assert.ok(!/pin:\s*(?:a|old|auth)\.pin/.test(src('app.js')));
  const csp = JSON.parse(src('vercel.json')).headers[0].headers.find(h => h.key === 'Content-Security-Policy').value;
  assert.ok(/script-src 'self'(;|$)/.test(csp) && !/unsafe-inline/.test(csp) && !/unsafe-eval/.test(csp));
});
