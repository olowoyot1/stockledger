/* StockLedger — main application.
 * Offline-first: everything is stored in localStorage and synced to /api/cloud. */
(() => {
  'use strict';
  const t = (k, v) => window.I18N.t(k, v);
  const $ = id => document.getElementById(id);
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const th = (k, v) => esc(t(k, v)); // translated text for use inside HTML templates

  // Storage keys keep their legacy names so existing installs keep their data.
  const KEYS = { products: 'dc_products_v3', days: 'dc_days_v3', deleted: 'dc_deleted_products_v1', deletedDays: 'dc_deleted_days_v1', epoch: 'dc_reset_epoch_v1',
    debtors: 'dc_debtors_v1', credit: 'dc_credit_sales_v1', payments: 'dc_debtor_payments_v1', account: 'dc_account' };
  const UI_KEY = 'dc_ui_state_v1';
  const CATS = ['Drinks', 'Snacks', 'Bread', 'Akara'];
  const MAX_IMPORT_BYTES = 5 * 1024 * 1024, MAX_IMPORT_ROWS = 5000, MAX_RANGE_DAYS = 1830;

  /* ---------------- helpers ---------------- */
  const num = x => Math.min(1e9, Math.max(0, Number(x) || 0));
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => ymd(new Date());
  const isYmd = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
  const fd = d => isYmd(d) ? d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4) : String(d || '');
  const money = x => '₦' + Number(x || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 });
  const uid = p => p + '-' + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  const prevDay = d => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() - 1); return ymd(x); };
  const dayTime = d => Date.parse(d?.updatedAt || d?.savedAt || '') || 0;
  const normalize = x => {
    x = String(x || '').trim().toLowerCase();
    if (x === 'drink' || x === 'drinks') return 'Drinks';
    if (x === 'snack' || x === 'snacks') return 'Snacks';
    if (x === 'bread') return 'Bread';
    if (x === 'akara' || x === 'akaras' || x === "akara's") return 'Akara';
    return x ? x.replace(/\b\w/g, c => c.toUpperCase()).slice(0, 40) : 'Other';
  };

  let pulling = false;
  const read = (k, f) => { try { const x = localStorage.getItem(k); return x === null ? f : JSON.parse(x); } catch { return f; } };
  const write = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); if (!pulling) queueSync(); return true; }
    catch (e) { console.error('Save failed', e); return false; }
  };

  /* ---------------- state ---------------- */
  let products = read(KEYS.products, null);
  if (!Array.isArray(products)) products = read('dc_products_v2', null);
  if (!Array.isArray(products)) products = [];
  let deletedProductIds = read(KEYS.deleted, []); if (!Array.isArray(deletedProductIds)) deletedProductIds = [];
  let days = read(KEYS.days, {}); if (!days || typeof days !== 'object' || Array.isArray(days)) days = {};
  let deletedDays = read(KEYS.deletedDays, {}); if (!deletedDays || typeof deletedDays !== 'object' || Array.isArray(deletedDays)) deletedDays = {};
  let rows = [];
  let ui = (() => { try { return JSON.parse(sessionStorage.getItem(UI_KEY)) || {}; } catch { return {}; } })();
  const saveUI = () => { try { sessionStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch { /* ignore */ } };
  const dirty = { d: false, p: false };
  let saveTimer = null, statusState = { key: 'status.saved', state: 'saved' };

  const account = () => read(KEYS.account, {}) || {};
  const canEdit = () => account().canWrite !== false;
  const guard = () => { if (canEdit()) return true; toast(t('acct.readOnlyToast')); return false; };
  const curDate = () => $('businessDate').value || today();

  function ensureSkus() { // SKUs are stable identifiers: assigned once, never renumbered
    let max = 0;
    products.forEach(p => { const m = /(\d+)$/.exec(p.sku || ''); if (m) max = Math.max(max, +m[1]); });
    products.forEach(p => { if (!p.sku) p.sku = 'SL-' + String(++max).padStart(3, '0'); });
  }
  ensureSkus();

  /* ---------------- stock maths ---------------- */
  const calc = r => { const available = num(r.opening) + num(r.added), closing = Math.min(num(r.closing), available), sold = available - closing; return { available, closing, sold, sales: sold * num(r.price) }; };
  const latestDay = () => Object.keys(days).filter(k => days[k]?.rows?.length).sort().pop() || '';
  const isCurrent = d => d >= today() || d >= latestDay();
  function openStock(p, d) {
    const own = days[d]?.rows?.find(x => x.id === p.id);
    if (own) return num(own.opening);
    const prior = Object.keys(days).filter(k => k < d && Array.isArray(days[k]?.rows) && days[k].rows.some(x => x.id === p.id)).sort().pop();
    const pr = prior ? days[prior].rows.find(x => x.id === p.id) : null;
    return pr ? calc(pr).closing : num(p.opening);
  }
  function setPrice(p, price, src, d) {
    price = num(price);
    if (!p || num(p.price) === price) return false;
    (p.priceLog || (p.priceLog = [])).push({ at: new Date().toISOString(), date: d || '', from: num(p.price), to: price, src });
    p.price = price; dirty.p = true; return true;
  }
  function totals(rs) {
    const out = { sales: 0, units: 0, added: 0, closing: 0, p: {}, c: {} };
    rs.forEach(r => { const z = calc(r); out.sales += z.sales; out.units += z.sold; out.added += num(r.added); out.closing += z.closing; out.p[r.name] = (out.p[r.name] || 0) + z.sales; out.c[r.category] = (out.c[r.category] || 0) + z.sales; });
    return out;
  }
  function dateList(a, b) {
    const out = [];
    if (!isYmd(a) || !isYmd(b) || a > b) return out;
    const d = new Date(a + 'T12:00:00'), e = new Date(b + 'T12:00:00');
    while (d <= e && out.length <= MAX_RANGE_DAYS) { out.push(ymd(d)); d.setDate(d.getDate() + 1); }
    return out;
  }

  /* ---------------- status, toast, account ---------------- */
  function status(key, state) { statusState = { key, state }; const s = $('saveStatus'); if (s) { s.textContent = t(key); s.dataset.state = state; } }
  let toastTimer;
  function toast(m) { const x = $('toast'); x.textContent = m; x.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => x.classList.remove('show'), 2600); }

  function showAccount() {
    const c = account(), name = c.businessName || SLAuth.username();
    $('userDisplay').textContent = name + (c.role === 'superadmin' ? ' · ' + t('acct.superadmin') : c.plan === 'trial' && c.canWrite ? ' · ' + t('acct.trialLeft', { n: c.daysLeft }) : c.canWrite === false ? ' · ' + t('acct.ended') : '');
    $('brandName').textContent = c.businessName || t('app.brand');
    $('companiesNavBtn').classList.toggle('hidden', c.role !== 'superadmin');
    $('readOnlyBanner').classList.toggle('hidden', c.canWrite !== false);
    document.body.classList.toggle('is-readonly', c.canWrite === false);
    const isStaff = c.role === 'staff';
    $('resetDataBtn').closest('.danger-panel').classList.toggle('hidden', isStaff);
    if (c.canWrite === false) status('status.readOnly', 'error');
  }
  function storeAccount(a) { if (!a) return; try { localStorage.setItem(KEYS.account, JSON.stringify(a)); } catch { /* ignore */ } showAccount(); document.dispatchEvent(new CustomEvent('sl:account')); }

  /* ---------------- persistence ---------------- */
  function flush() {
    clearTimeout(saveTimer); saveTimer = null;
    if (!dirty.d && !dirty.p) return true;
    let ok = true;
    if (dirty.d) { if (write(KEYS.days, days)) dirty.d = false; else ok = false; }
    if (dirty.p) { if (write(KEYS.products, products)) dirty.p = false; else ok = false; }
    status(ok ? 'status.saved' : 'status.storageFull', ok ? 'saved' : 'error');
    if (!ok) toast(t('toast.storageFull'));
    return ok;
  }
  function schedule() { status('status.saving', 'saving'); clearTimeout(saveTimer); saveTimer = setTimeout(flush, 300); }
  function persistDay() { const d = curDate(); days[d] = { ...(days[d] || {}), date: d, updatedAt: new Date().toISOString(), rows: rows.map(r => ({ ...r })) }; dirty.d = true; schedule(); }
  function persistProducts() { dirty.p = true; schedule(); }
  function tombstone(d) { deletedDays[d] = new Date().toISOString(); write(KEYS.deletedDays, deletedDays); }

  /* ---------------- cloud sync ---------------- */
  const cloud = { busy: false, queued: false, pulling: false, promise: null, timer: null, lastPull: 0 };

  async function api(action, extra = {}) {
    let res;
    try {
      res = await fetch('/api/cloud', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + SLAuth.token() }, body: JSON.stringify({ action, ...extra }), cache: 'no-store' });
    } catch { const e = new Error('network'); e.network = true; throw e; }
    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      const e = new Error(out.error || 'Request failed'); e.status = res.status; e.code = out.code; e.data = out;
      if (res.status === 401 && out.code === 'AUTH_REQUIRED') SLAuth.expire();
      throw e;
    }
    return out;
  }

  function queueSync() { if (pulling || !SLAuth.loggedIn()) return; clearTimeout(cloud.timer); cloud.timer = setTimeout(cloudPush, 800); }

  async function cloudPush() {
    clearTimeout(cloud.timer);
    if (!SLAuth.loggedIn() || !canEdit()) return false;
    if (cloud.pulling) { cloud.queued = true; return false; }
    if (cloud.busy) { cloud.queued = true; return cloud.promise || false; }
    cloud.busy = true;
    cloud.promise = (async () => {
      let ok = true, passes = 0;
      do {
        cloud.queued = false; passes++;
        try {
          await api('push', { products, days, deletedProductIds, deletedDays, resetAt: read(KEYS.epoch, ''),
            debtors: read(KEYS.debtors, []), creditSales: read(KEYS.credit, []), payments: read(KEYS.payments, []) });
          status('status.cloudSaved', 'saved');
        } catch (e) {
          ok = false;
          if (e.code === 'SUBSCRIPTION_ENDED') { storeAccount(e.data?.account); }
          else if (e.code === 'RESET') { toast(t('err.RESET')); cloud.busy = false; await cloudPull(); }
          else { console.warn('Cloud sync unavailable:', e); status('status.cloudFailed', 'error'); }
          break;
        }
      } while (cloud.queued && passes < 5);
      return ok;
    })();
    try { return await cloud.promise; } finally { cloud.busy = false; cloud.promise = null; }
  }

  const mergeRecords = (preferred, other) => { // records in `preferred` win for matching IDs
    const byId = new Map();
    (Array.isArray(other) ? other : []).forEach(x => { if (x && x.id != null) byId.set(String(x.id), x); });
    (Array.isArray(preferred) ? preferred : []).forEach(x => { if (x && x.id != null) byId.set(String(x.id), x); });
    return [...byId.values()];
  };
  function mergeDays(local, remote) {
    const merged = { ...remote };
    Object.entries(local || {}).forEach(([date, ld]) => {
      const cd = remote?.[date];
      if (!cd) { merged[date] = ld; return; }
      const active = d => (d?.rows || []).some(r => num(r.opening) || num(r.added) || num(r.closing) || num(r.price));
      if ((active(ld) && !active(cd)) || dayTime(ld) > dayTime(cd)) merged[date] = ld;
    });
    return merged;
  }
  function applyTombstones(d, tombs) { Object.entries(tombs).forEach(([date, at]) => { if (d[date] && Date.parse(at) >= dayTime(d[date])) delete d[date]; }); return d; }

  function wipeLocal() {
    products = []; days = {}; deletedProductIds = []; deletedDays = {}; dirty.d = dirty.p = false; ui.edit = null; saveUI();
    [KEYS.products, KEYS.days, KEYS.deleted, KEYS.deletedDays, KEYS.debtors, KEYS.credit, KEYS.payments].forEach(k => localStorage.setItem(k, k === KEYS.days || k === KEYS.deletedDays ? '{}' : '[]'));
  }

  async function cloudPull() {
    if (cloud.pulling || !SLAuth.loggedIn()) return;
    cloud.pulling = true; pulling = true;
    let needsPush = false;
    try {
      const out = await api('pull');
      cloud.lastPull = Date.now();
      storeAccount(out.account);
      if (out.exists && out.data) {
        const remote = out.data;
        if (remote.resetAt && remote.resetAt !== read(KEYS.epoch, '')) { wipeLocal(); localStorage.setItem(KEYS.epoch, JSON.stringify(remote.resetAt)); }
        const localDebtors = read(KEYS.debtors, []), localSales = read(KEYS.credit, []), localPayments = read(KEYS.payments, []);
        deletedProductIds = [...new Set([...deletedProductIds, ...(remote.deletedProductIds || [])].map(String))];
        const gone = new Set(deletedProductIds);
        products = (dirty.p ? mergeRecords(products, remote.products) : mergeRecords(remote.products, products)).filter(p => !gone.has(String(p.id)));
        ensureSkus();
        Object.entries(remote.deletedDays || {}).forEach(([d, at]) => { if (!deletedDays[d] || at > deletedDays[d]) deletedDays[d] = at; });
        days = applyTombstones(mergeDays(days, remote.days || {}), deletedDays);
        const debtors = mergeRecords(localDebtors, remote.debtors), creditSales = mergeRecords(localSales, remote.creditSales), payments = mergeRecords(localPayments, remote.payments);
        const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        needsPush = !same(products, remote.products) || !same(deletedProductIds, remote.deletedProductIds || []) || !same(days, remote.days || {}) || !same(deletedDays, remote.deletedDays || {})
          || !same(debtors, remote.debtors || []) || !same(creditSales, remote.creditSales || []) || !same(payments, remote.payments || []);
        write(KEYS.debtors, debtors); write(KEYS.credit, creditSales); write(KEYS.payments, payments);
        write(KEYS.products, products); write(KEYS.deleted, deletedProductIds); write(KEYS.days, days); write(KEYS.deletedDays, deletedDays);
        renderAll();
        document.dispatchEvent(new CustomEvent('sl:data'));
        status('status.cloudLoaded', 'saved');
      } else {
        needsPush = true; // first device initialises the cloud from its local records
      }
    } catch (e) {
      console.warn('Cloud load unavailable:', e);
      status('status.cloudOffline', 'error');
    } finally { cloud.pulling = false; pulling = false; }
    if (needsPush || cloud.queued) await cloudPush();
  }

  /* ---------------- rendering: sales ---------------- */
  function locked() { const d = curDate(); return !canEdit() || (!!days[d]?.savedAt && ui.edit !== d); }

  function sales() {
    const d = curDate(), saved = days[d]?.rows || [];
    rows = products.map(p => {
      const o = saved.find(x => x.id === p.id), opening = o ? num(o.opening) : openStock(p, d);
      return { id: p.id, category: p.category, name: p.name, price: num(o?.price ?? p.price), opening, added: num(o?.added), closing: o ? num(o.closing) : opening };
    });
    const skuOf = new Map(products.map(p => [p.id, p.sku])), barcodeOf = new Map(products.map(p => [p.id, p.barcode]));
    const q = ($('salesSearch').value || '').toLowerCase();
    const visible = rows.filter(r => (r.name + ' ' + r.category + ' ' + (skuOf.get(r.id) || '') + ' ' + (barcodeOf.get(r.id) || '')).toLowerCase().includes(q));
    $('salesBody').innerHTML = visible.map(r => {
      const z = calc(r), nm = esc(r.name);
      const cell = (f, v, label, extra = '') => '<td><input data-f="' + f + '" type="number" min="0" inputmode="numeric" value="' + v + '" ' + extra + ' aria-label="' + th(label) + ': ' + nm + '"></td>';
      return '<tr data-id="' + esc(r.id) + '"><td>' + esc(r.category) + '</td><td><b>' + nm + '</b><small class="muted"> ' + esc(skuOf.get(r.id) || '') + '</small></td>'
        + cell('opening', r.opening, 'col.opening') + cell('added', r.added, 'col.additions') + '<td class="av">' + z.available + '</td>'
        + cell('closing', z.closing, 'col.closing', 'max="' + z.available + '"')
        + '<td class="sold"><input data-f="sold" type="number" min="0" step="any" inputmode="decimal" max="' + z.available + '" value="' + z.sold + '" aria-label="' + th('sales.ariaSold', { name: r.name }) + '"></td>'
        + '<td><div class="add-sale"><input class="add-qty" type="number" min="0.01" step="any" inputmode="decimal" placeholder="' + th('sales.qty') + '" aria-label="' + th('sales.ariaAdd', { name: r.name }) + '"><button class="btn add-sale-btn" type="button">' + th('sales.add') + '</button></div></td>'
        + '<td><input data-f="price" type="number" min="0" step="any" inputmode="decimal" value="' + r.price + '" aria-label="' + th('col.unitPrice') + ': ' + nm + '"></td><td class="rev"><b>' + money(z.sales) + '</b></td></tr>';
    }).join('') || '<tr><td colspan="10" class="muted">' + th(products.length ? 'sales.empty' : 'products.empty') + '</td></tr>';
    summary(); saveLabel();
  }
  function saveLabel() {
    const d = curDate(), saved = !!days[d]?.savedAt, lk = locked(), has = !!days[d], ro = !canEdit();
    $('saveDayBtn').textContent = t(saved ? 'sales.updateDay' : 'sales.saveDay');
    $('saveDayBtn').classList.toggle('hidden', lk && !ro); $('saveDayBtn').disabled = ro;
    $('editDayBtn').classList.toggle('hidden', !lk || ro); $('lockNotice').classList.toggle('hidden', !lk || ro);
    $('cloneDayBtn').disabled = !has || ro; $('changeDateBtn').disabled = !has || ro; $('clearDayBtn').disabled = !has || ro;
    $('salesBody').querySelectorAll('input,button').forEach(x => { x.disabled = lk; });
  }
  function summary() {
    const tt = totals(rows);
    $('mSales').textContent = money(tt.sales); $('mUnits').textContent = tt.units; $('mAdded').textContent = tt.added; $('mClosing').textContent = tt.closing;
    $('categorySummary').innerHTML = Object.entries(tt.c).map(([k, v]) => '<div class="category-card"><span class="muted">' + esc(k) + '</span><strong>' + money(v) + '</strong><small>' + th('sales.unitsSold', { n: rows.filter(r => r.category === k).reduce((n, r) => n + calc(r).sold, 0) }) + '</small></div>').join('');
  }
  function refreshRow(tr, r, active) {
    const z = calc(r); r.closing = z.closing;
    tr.querySelector('.av').textContent = z.available; tr.querySelector('.rev b').textContent = money(z.sales);
    const c = tr.querySelector('[data-f="closing"]'), s = tr.querySelector('[data-f="sold"]');
    c.max = z.available; s.max = z.available;
    if (c !== active || num(c.value) > z.available) c.value = z.closing;
    if (s !== active || num(s.value) > z.available) s.value = z.sold;
  }

  function editDay() { if (!guard()) return; ui.edit = curDate(); saveUI(); sales(); $('salesBody').querySelector('input')?.focus(); toast(t('sales.editing', { date: fd(ui.edit) })); }
  function save() {
    if (!guard()) return;
    const d = curDate(); rows = rows.map(r => ({ ...r, closing: calc(r).closing }));
    const was = !!days[d]?.savedAt, now = new Date().toISOString();
    days[d] = { date: d, savedAt: days[d]?.savedAt || now, updatedAt: now, rows: rows.map(r => ({ ...r })) };
    if (isCurrent(d)) rows.forEach(r => setPrice(products.find(p => p.id === r.id), r.price, 'Daily Sales', d));
    dirty.d = true; if (!flush()) return;
    ui.edit = null; saveUI(); toast(t(was ? 'sales.updated' : 'sales.saved')); sales(); reports(); analytics();
  }
  function addSale(tr) {
    if (locked()) { toast(t(canEdit() ? 'sales.clickEdit' : 'acct.readOnlyToast')); return; }
    const q = tr.querySelector('.add-qty'), n = num(q.value), r = rows.find(x => x.id === tr.dataset.id);
    if (!r || !n) { q.focus(); return; }
    const z = calc(r);
    if (n > z.closing) { toast(t('sales.onlyLeft', { n: z.closing, name: r.name })); return; }
    r.closing = z.closing - n; q.value = '';
    refreshRow(tr, r); summary(); persistDay(); toast(t('sales.addedSold', { n, name: r.name }));
  }
  function cloneDay(from, to) {
    if (!guard() || !from || !to) return false;
    if (from === to) { toast(t('sales.pickDifferent')); return false; }
    flush(); const src = days[from];
    if (!src) { toast(t('sales.nothing', { date: fd(from) })); return false; }
    if (days[to] && !confirm(t('sales.replaceClone', { to: fd(to), from: fd(from) }))) return false;
    const now = new Date().toISOString();
    days[to] = { date: to, savedAt: now, updatedAt: now, clonedFrom: from, rows: (src.rows || []).map(r => ({ ...r })) };
    dirty.d = true; if (!flush()) return false;
    $('businessDate').value = to; ui.date = to; ui.edit = null; saveUI(); tab('sales'); reports(); analytics(); toast(t('sales.cloned', { date: fd(to) })); return true;
  }
  function moveDay(from, to) {
    if (!guard() || !from || !to || from === to) return false;
    flush(); const src = days[from];
    if (!src) { toast(t('sales.nothing', { date: fd(from) })); return false; }
    if (days[to] && !confirm(t('sales.replaceMove', { to: fd(to) }))) return false;
    days[to] = { ...src, date: to, updatedAt: new Date().toISOString() }; delete days[from]; tombstone(from);
    dirty.d = true; if (!flush()) return false;
    $('businessDate').value = to; if (ui.edit === from) ui.edit = to; ui.date = to; saveUI(); sales(); reports(); analytics(); toast(t('sales.moved', { date: fd(to) })); return true;
  }
  function clearDay() {
    if (!guard()) return;
    const d = curDate();
    if (!days[d]) { toast(t('sales.nothingClear', { date: fd(d) })); return; }
    if (!confirm(t('sales.clearConfirm', { date: fd(d) }))) return;
    flush(); delete days[d]; tombstone(d); if (ui.edit === d) ui.edit = null; saveUI();
    dirty.d = true; if (!flush()) return;
    sales(); reports(); analytics(); toast(t('sales.cleared', { date: fd(d) }));
  }
  function openMove(from, mode = 'move') {
    if (!days[from]) { toast(t('sales.nothing', { date: fd(from) })); return; }
    const clone = mode === 'clone', dlg = $('moveDialog');
    dlg.dataset.from = from; dlg.dataset.mode = mode;
    $('moveTitle').textContent = t(clone ? 'dlg.cloneTitle' : 'dlg.moveTitle'); $('moveSubmit').textContent = t(clone ? 'dlg.clone' : 'dlg.move');
    $('moveFrom').textContent = clone ? t('dlg.cloneHelp', { date: fd(from) }) : t('dlg.current', { date: fd(from) });
    $('moveTo').value = clone ? '' : from; dlg.showModal(); $('moveTo').focus();
  }

  /* ---------------- rendering: products ---------------- */
  function prod() {
    const ro = !canEdit();
    const cats = allCategories();
    $('productsBody').innerHTML = products.map(x => '<tr data-pid="' + esc(x.id) + '"><td><select data-f="category" aria-label="' + th('products.ariaCategory', { name: x.name }) + '"' + (ro ? ' disabled' : '') + '>'
      + categoryOptionsHtml(cats, x.category) + '</select></td>'
      + '<td><input data-f="name" maxlength="120" value="' + esc(x.name) + '"' + (ro ? ' disabled' : '') + '></td><td>' + esc(x.sku || '') + '</td>'
      + '<td><div class="input-with-btn"><input data-f="barcode" maxlength="64" autocomplete="off" autocapitalize="none" spellcheck="false" value="' + esc(x.barcode || '') + '" aria-label="' + th('products.ariaBarcode', { name: x.name }) + '"' + (ro ? ' disabled' : '') + '>'
      + '<button class="btn btn-light scan-row" type="button" aria-label="' + th('products.ariaScan', { name: x.name }) + '"' + (ro ? ' disabled' : '') + '>' + th('scan.button') + '</button></div></td>'
      + '<td><input data-f="price" type="number" min="0" step="any" value="' + num(x.price) + '"' + (ro ? ' disabled' : '') + '></td>'
      + '<td><input data-f="opening" type="number" min="0" value="' + num(x.opening) + '"' + (ro ? ' disabled' : '') + '></td>'
      + '<td><button class="btn btn-danger rm" type="button"' + (ro ? ' disabled' : '') + '>' + th('common.remove') + '</button></td></tr>').join('')
      || '<tr><td colspan="7" class="muted">' + th('products.empty') + '</td></tr>';
    $('addProductBtn').disabled = ro;
  }
  const nameTaken = (name, exceptId) => products.some(p => p.id !== exceptId && String(p.name).trim().toLowerCase() === name.trim().toLowerCase());

  /* ---------------- categories & barcodes ---------------- */
  const NEW_CAT = '__new__';
  const allCategories = () => [...new Set([...CATS, ...products.map(p => p.category).filter(Boolean)])];
  const categoryOptionsHtml = (cats, selected) => cats.map(c => '<option value="' + esc(c) + '"' + (c === selected ? ' selected' : '') + '>' + esc(c) + '</option>').join('')
    + '<option value="' + NEW_CAT + '">' + th('products.newCategory') + '</option>';
  const cleanCode = x => String(x ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 64);
  const findByCode = code => {
    code = cleanCode(code).toLowerCase();
    if (!code) return null;
    return products.find(p => p.barcode && p.barcode.toLowerCase() === code) || products.find(p => p.sku && p.sku.toLowerCase() === code) || null;
  };
  const barcodeOwner = (code, exceptId) => { code = cleanCode(code).toLowerCase(); return code ? products.find(p => p.id !== exceptId && p.barcode && p.barcode.toLowerCase() === code) : null; };
  const scanCode = () => window.SLScanner ? window.SLScanner.scan() : Promise.resolve(null);

  function toggleNewCategory() {
    const isNew = $('pCategory').value === NEW_CAT;
    $('pNewCategoryRow').classList.toggle('hidden', !isNew);
    if (isNew) $('pNewCategory').focus();
  }
  function openProductDialog(barcode = '') {
    if (!guard()) return;
    $('productForm').reset();
    $('pCategory').innerHTML = categoryOptionsHtml(allCategories(), CATS[0]);
    $('pNewCategory').value = ''; $('pNewCategoryRow').classList.add('hidden');
    $('pBarcode').value = cleanCode(barcode);
    $('productDialog').showModal(); $('pName').focus();
  }
  function submitProduct(e) {
    e.preventDefault();
    const name = $('pName').value.trim();
    if (!name) { toast(t('products.nameRequired')); return; }
    if (nameTaken(name)) { toast(t('products.duplicate', { name })); return; }
    let category = $('pCategory').value;
    if (category === NEW_CAT) {
      if (!$('pNewCategory').value.trim()) { toast(t('products.newCategoryRequired')); $('pNewCategory').focus(); return; }
      category = normalize($('pNewCategory').value);
    }
    const barcode = cleanCode($('pBarcode').value), owner = barcodeOwner(barcode);
    if (owner) { toast(t('products.barcodeTaken', { code: barcode, name: owner.name })); $('pBarcode').focus(); return; }
    const p = { id: uid('P'), sku: '', category: normalize(category), name, price: num($('pPrice').value), opening: Math.floor(num($('pOpening').value)) };
    if (barcode) p.barcode = barcode;
    products.push(p);
    ensureSkus(); if (!write(KEYS.products, products)) { toast(t('toast.storageFull')); return; }
    $('productDialog').close(); prod(); sales(); toast(t('products.added'));
  }

  function flashRow(tr) { tr.classList.remove('flash'); void tr.offsetWidth; tr.classList.add('flash'); tr.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  function goToSale(p) {
    if ($('salesSearch').value) { $('salesSearch').value = ''; ui.search = ''; saveUI(); }
    sales();
    const tr = $('salesBody').querySelector('tr[data-id="' + CSS.escape(p.id) + '"]'); if (!tr) return;
    flashRow(tr);
    if (locked()) { toast(t(canEdit() ? 'sales.clickEdit' : 'acct.readOnlyToast')); return; }
    const q = tr.querySelector('.add-qty'); q.value = '1'; q.focus({ preventScroll: true }); q.select();
    toast(t('scan.found', { name: p.name }));
  }
  function unknownCode(code) {
    if (canEdit() && confirm(t('scan.addNew', { code }))) openProductDialog(code);
    else toast(t('scan.notFound', { code }));
  }
  async function scanForSale() {
    const code = await scanCode(); if (!code) return;
    const p = findByCode(code);
    if (p) goToSale(p); else unknownCode(code);
  }
  async function scanForProducts() {
    const code = await scanCode(); if (!code) return;
    const p = findByCode(code);
    if (!p) { if (guard()) openProductDialog(code); return; }
    const tr = $('productsBody').querySelector('tr[data-pid="' + CSS.escape(p.id) + '"]');
    if (tr) { flashRow(tr); tr.querySelector('input[data-f="name"]')?.focus({ preventScroll: true }); }
    toast(t('scan.located', { name: p.name }));
  }
  function setBarcode(p, input) {
    const v = cleanCode(input.value), owner = barcodeOwner(v, p.id);
    if (owner) { input.value = p.barcode || ''; toast(t('products.barcodeTaken', { code: v, name: owner.name })); return false; }
    input.value = v;
    if ((p.barcode || '') === v) return false;
    if (v) p.barcode = v; else delete p.barcode;
    return true;
  }

  /* ---------------- rendering: reports & analytics ---------------- */
  const SRC = { 'Daily Sales': 'src.daily', 'Products page': 'src.products', 'Excel import': 'src.import' };
  const rowCells = (...c) => '<tr>' + c.map(x => '<td>' + x + '</td>').join('') + '</tr>';

  function reports() {
    const ds = Object.values(days).filter(d => d && isYmd(d.date)).sort((a, b) => b.date.localeCompare(a.date));
    $('reportsBody').innerHTML = ds.map(d => {
      const tt = totals(d.rows || []), dt = esc(d.date);
      return '<tr><td>' + fd(d.date) + (d.savedAt ? '' : ' <span class="badge">' + th('reports.draft') + '</span>') + '</td><td>' + money(tt.sales) + '</td><td>' + tt.units + '</td><td>' + tt.added + '</td><td>' + tt.closing + '</td>'
        + '<td><div class="reports-actions"><button class="btn open" data-date="' + dt + '" type="button">' + th('common.edit') + '</button><button class="btn move" data-date="' + dt + '" type="button">' + th('sales.changeDate') + '</button><button class="btn clone" data-date="' + dt + '" type="button">' + th('sales.clone') + '</button></div></td></tr>';
    }).join('') || '<tr><td colspan="6" class="muted">' + th('reports.none') + '</td></tr>';
    custom(); history();
  }
  function historyRows(id) {
    const out = []; let last = null;
    Object.keys(days).sort().forEach(d => {
      const r = days[d]?.rows?.find(x => x.id === id); if (!r) return;
      const z = calc(r), changed = last !== null && num(r.price) !== last;
      if (num(r.opening) || num(r.added) || z.sold || changed || last === null) out.push({ d, r, z, was: changed ? last : null });
      last = num(r.price);
    });
    return out;
  }
  function history() {
    const sel = $('historyProduct'); if (!sel) return;
    const cur = ui.hp && products.some(p => p.id === ui.hp) ? ui.hp : products[0]?.id;
    sel.innerHTML = [...new Set([...CATS, ...products.map(p => p.category)])].map(c => {
      const ps = products.filter(p => p.category === c);
      return ps.length ? '<optgroup label="' + esc(c) + '">' + ps.map(p => '<option value="' + esc(p.id) + '"' + (p.id === cur ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</optgroup>' : '';
    }).join('');
    const p = products.find(x => x.id === cur);
    if (!p) { $('productHistory').innerHTML = '<p class="muted pad">' + th('reports.noProducts') + '</p>'; return; }
    const h = historyRows(p.id), units = h.reduce((s, x) => s + x.z.sold, 0), sl = h.reduce((s, x) => s + x.z.sales, 0), added = h.reduce((s, x) => s + num(x.r.added), 0), log = (p.priceLog || []).slice().reverse();
    const box = (k, v) => '<div class="summary-box"><span>' + th(k) + '</span><strong>' + v + '</strong></div>';
    $('productHistory').innerHTML = '<div class="report-summary pad">' + box('reports.currentPrice', money(p.price)) + box('reports.totalUnits', units) + box('reports.totalSales', money(sl)) + box('m.added', added) + '</div>'
      + '<div class="table-wrap"><table><thead><tr>' + ['col.date', 'col.opening', 'col.additions', 'col.available', 'col.closing', 'col.sold', 'col.unitPrice', 'col.sales'].map(k => '<th scope="col">' + th(k) + '</th>').join('') + '</tr></thead><tbody>'
      + (h.slice().reverse().map(x => rowCells(fd(x.d), num(x.r.opening), num(x.r.added), x.z.available, x.z.closing, '<b>' + x.z.sold + '</b>',
        money(x.r.price) + (x.was !== null ? '<small class="price-change">' + th('reports.was', { price: money(x.was) }) + '</small>' : ''), '<b>' + money(x.z.sales) + '</b>')).join('')
        || '<tr><td colspan="8" class="muted">' + th('reports.noActivity') + '</td></tr>') + '</tbody></table></div>'
      + '<div class="pad"><h3>' + th('reports.priceChanges') + '</h3>' + (log.map(l => '<div class="list-row"><span>' + fd(ymd(new Date(l.at))) + ' ' + pad(new Date(l.at).getHours()) + ':' + pad(new Date(l.at).getMinutes())
        + ' <small class="muted">' + th('reports.via', { src: t(SRC[l.src] || '') === (SRC[l.src] || '') ? l.src : t(SRC[l.src]) }) + '</small></span><b>' + money(l.from) + ' → ' + money(l.to) + '</b></div>').join('') || '<p class="muted">' + th('reports.noPriceChanges') + '</p>') + '</div>';
  }
  function custom() {
    const a = $('reportFrom').value, b = $('reportTo').value;
    if (!a || !b) { $('customReport').innerHTML = ''; return; }
    const list = dateList(a, b);
    if (list.length > MAX_RANGE_DAYS) { $('customReport').innerHTML = '<p class="muted">' + th('reports.rangeTooLong') + '</p>'; return; }
    const rs = []; list.forEach(d => (days[d]?.rows || []).forEach(r => rs.push(r)));
    const tt = totals(rs), saved = list.filter(d => days[d]).length, top = Object.entries(tt.p).sort((x, y) => y[1] - x[1]).slice(0, 8);
    const box = (k, v) => '<div class="summary-box"><span>' + th(k) + '</span><strong>' + v + '</strong></div>';
    $('customReport').innerHTML = '<div class="report-summary">' + box('reports.totalSales', money(tt.sales)) + box('m.units', tt.units) + box('m.added', tt.added) + box('reports.savedDays', saved + '/' + list.length) + '</div>'
      + '<div class="two-col"><div class="panel"><h3>' + th('reports.topProducts') + '</h3>' + (top.map(x => '<div class="list-row"><span>' + esc(x[0]) + '</span><b>' + money(x[1]) + '</b></div>').join('') || '<p class="muted">' + th('reports.noData') + '</p>')
      + '</div><div class="panel"><h3>' + th('reports.categorySales') + '</h3>' + Object.entries(tt.c).sort((x, y) => y[1] - x[1]).map(x => '<div class="list-row"><span>' + esc(x[0]) + '</span><b>' + money(x[1]) + '</b></div>').join('') + '</div></div>';
  }
  function analytics() {
    const n = Number($('analyticsRange').value || 7), ds = [];
    for (let i = n - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); ds.push(ymd(d)); }
    const v = ds.map(d => ({ d, t: totals(days[d]?.rows || []) })), total = v.reduce((s, x) => s + x.t.sales, 0), units = v.reduce((s, x) => s + x.t.units, 0);
    const best = [...v].sort((a, b) => b.t.sales - a.t.sales)[0], max = Math.max(1, ...v.map(x => x.t.sales)), active = v.filter(x => x.t.sales || x.t.units || x.t.added || x.t.closing).length;
    $('aSales').textContent = money(total); $('aAvg').textContent = money(active ? total / active : 0); $('aUnits').textContent = units;
    $('aBest').textContent = best?.t.sales ? fd(best.d) + ' ' + money(best.t.sales) : '—';
    $('chart').innerHTML = v.map(x => '<div class="bar-wrap" title="' + fd(x.d) + ' — ' + money(x.t.sales) + '"><div class="bar" data-h="' + Math.max(2, x.t.sales / max * 210) + '"></div><div class="bar-label">' + fd(x.d).slice(0, 5) + '</div></div>').join('');
    $('chart').querySelectorAll('.bar').forEach(b => { b.style.height = b.dataset.h + 'px'; }); // CSSOM, so no inline-style CSP exception is needed
    const p = {}, c = {};
    v.forEach(x => (days[x.d]?.rows || []).forEach(r => { const z = calc(r); (p[r.name] = p[r.name] || { sales: 0, units: 0 }); p[r.name].sales += z.sales; p[r.name].units += z.sold; c[r.category] = (c[r.category] || 0) + z.sales; }));
    $('topProducts').innerHTML = Object.entries(p).sort((a, b) => b[1].sales - a[1].sales).slice(0, 10).map(x => '<div class="list-row"><span>' + esc(x[0]) + '<small class="muted"> ' + th('an.qty', { n: x[1].units }) + '</small></span><b>' + money(x[1].sales) + '</b></div>').join('') || '<p class="muted">' + th('an.none') + '</p>';
    $('catAnalytics').innerHTML = Object.entries(c).sort((a, b) => b[1] - a[1]).map(x => '<div class="list-row"><span>' + esc(x[0]) + '</span><b>' + money(x[1]) + '</b></div>').join('') || '<p class="muted">' + th('an.none') + '</p>';
  }
  function rangeLabels() { [...$('analyticsRange').options].forEach(o => { o.textContent = t('an.lastN', { n: o.value }); }); }

  async function loadCompanies() {
    const msg = $('companiesMessage'), body = $('companiesBody'), btn = $('refreshCompaniesBtn');
    btn.disabled = true; msg.textContent = t('co.loading');
    try {
      const out = await api('listCompanies'), list = out.companies || [];
      body.innerHTML = list.map(c => '<tr><td><b>' + esc(c.business_name) + '</b><small class="muted"> ' + th('plan.' + (['trial', 'active', 'suspended'].includes(c.plan) ? c.plan : 'suspended')) + '</small></td><td>' + esc(c.username) + '</td><td>' + esc(c.plan) + '</td><td>' + Number(c.staffCount || 0) + '</td><td>' + esc(fd(String(c.created_at || '').slice(0, 10))) + '</td></tr>').join('')
        || '<tr><td colspan="5" class="muted">' + th('co.none') + '</td></tr>';
      msg.textContent = list.length === 1 ? t('co.one') : t('co.many', { n: list.length });
    } catch (e) { body.innerHTML = ''; msg.textContent = SLAuth.errorText(e); } finally { btn.disabled = false; }
  }

  function renderAll() { showAccount(); sales(); prod(); reports(); analytics(); }

  function tab(n) {
    if (!$(n)) n = 'sales';
    flush(); ui.tab = n; saveUI();
    document.querySelectorAll('.nav-btn').forEach(x => { const on = x.dataset.tab === n; x.classList.toggle('active', on); if (on) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
    document.querySelectorAll('.tab-section').forEach(x => x.classList.toggle('active', x.id === n));
    if (n === 'sales') sales(); if (n === 'products') prod(); if (n === 'reports') reports(); if (n === 'analytics') analytics(); if (n === 'companies') loadCompanies();
    document.dispatchEvent(new CustomEvent('sl:tab', { detail: n }));
  }

  /* ---------------- CSV & import ---------------- */
  const csvCell = x => { let s = String(x ?? ''); if (typeof x === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }; // neutralise spreadsheet formulas
  const csv = rs => rs.map(r => r.map(csvCell).join(',')).join('\r\n');
  function download(name, text) {
    const a = document.createElement('a'), u = URL.createObjectURL(new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' }));
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 500);
  }
  function parseCsv(text) {
    text = text.replace(/^\ufeff/, '');
    const first = text.split(/\r?\n/, 1)[0] || '', delim = [',', ';', '\t'].map(d => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
    const out = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === delim) { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); out.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur || row.length) { row.push(cur); out.push(row); }
    return out.filter(r => r.some(x => String(x).trim()));
  }
  let xlsxPromise = null;
  const loadXlsx = () => window.XLSX ? Promise.resolve(window.XLSX) : (xlsxPromise = xlsxPromise || new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = '/vendor/xlsx.full.min.js'; s.onload = () => res(window.XLSX); s.onerror = () => { xlsxPromise = null; rej(new Error(t('imp.reader'))); }; document.head.appendChild(s);
  }));
  const looseNum = x => num(String(x ?? '').replace(/[₦,\s]/g, ''));

  async function importFile() {
    const msg = $('importMessage'), f = $('excelFile').files[0];
    if (!guard()) return;
    if (!f) { toast(t('imp.select')); return; }
    if (f.size > MAX_IMPORT_BYTES) { msg.textContent = t('imp.tooBig'); return; }
    try {
      const buf = await f.arrayBuffer(); let data;
      if (/\.csv$/i.test(f.name)) data = parseCsv(new TextDecoder('utf-8').decode(buf));
      else { const X = await loadXlsx(); const wb = X.read(buf, { type: 'array' }); data = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' }); }
      if (data.length < 2) throw new Error(t('imp.noRows'));
      if (data.length > MAX_IMPORT_ROWS + 1) throw new Error(t('imp.tooMany'));
      const h = data[0].map(x => String(x).trim().toLowerCase().replace(/[_-]+/g, ' ')), ix = (...ks) => { for (const k of ks) { const i = h.indexOf(k); if (i >= 0) return i; } return -1; };
      const ci = ix('category'), pi = ix('product', 'product name', 'item'), si = ix('sku', 'code', 'product code'), bi = ix('barcode', 'bar code', 'ean', 'upc', 'gtin'), pr = ix('unit price', 'price', 'selling price'), oi = ix('opening stock', 'opening', 'stock');
      if ([ci, pi, pr, oi].some(x => x < 0)) throw new Error(t('imp.cols'));
      let count = 0;
      data.slice(1).forEach(r => {
        const name = String(r[pi] ?? '').trim().slice(0, 120); if (!name) return;
        const sku = String(si >= 0 ? r[si] : '').trim().slice(0, 32), barcode = bi >= 0 ? cleanCode(r[bi]) : '';
        let p = (barcode && products.find(x => x.barcode === barcode)) || (sku && products.find(x => x.sku === sku)) || products.find(x => x.name.toLowerCase() === name.toLowerCase());
        if (p) { p.category = normalize(r[ci]); p.name = name; setPrice(p, looseNum(r[pr]), 'Excel import', today()); p.opening = Math.floor(looseNum(r[oi])); }
        else { p = { id: uid('P'), sku, category: normalize(r[ci]), name, price: looseNum(r[pr]), opening: Math.floor(looseNum(r[oi])) }; products.push(p); } // fresh ID: never collides with a removed product's tombstone
        if (barcode && !barcodeOwner(barcode, p.id)) p.barcode = barcode;
        count++;
      });
      ensureSkus(); write(KEYS.products, products); prod(); sales();
      msg.textContent = t('imp.done', { n: count }); $('excelFile').value = ''; toast(t('imp.complete'));
    } catch (err) { msg.textContent = t('imp.failed', { msg: err.message }); }
  }

  /* ---------------- date inputs: always show dd/mm/yyyy ---------------- */
  function enhanceDates(root = document) {
    const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    root.querySelectorAll('input[type="date"]').forEach(i => {
      if (i.dataset.dmy) return; i.dataset.dmy = '1';
      const w = document.createElement('span'), tx = document.createElement('span'); w.className = 'dmy'; tx.className = 'dmy-text'; tx.setAttribute('aria-hidden', 'true');
      i.before(w); w.append(i, tx);
      const up = () => { const v = desc.get.call(i); tx.textContent = v ? fd(v) : 'dd/mm/yyyy'; tx.classList.toggle('empty', !v); };
      Object.defineProperty(i, 'value', { configurable: true, get() { return desc.get.call(this); }, set(v) { desc.set.call(this, v); up(); } });
      i.addEventListener('input', up); i.addEventListener('change', up); up();
    });
  }

  /* ---------------- events ---------------- */
  async function logout() {
    const btn = $('logoutBtn'); btn.disabled = true; btn.textContent = t('common.wait');
    try {
      flush();
      if (canEdit() && !(await cloudPush())) { if (!confirm(t('set.logoutFail'))) throw new Error('cancelled'); }
      SLAuth.purgeLocal(); location.reload();
    } catch { btn.disabled = false; btn.textContent = t('common.logout'); }
  }
  async function saveSettings() {
    const u = $('newUser').value.trim(), cur = $('currentPin').value, p = $('newPin').value, confirmPin = $('confirmPin').value, msg = $('settingsMessage'), btn = $('saveSettingsBtn');
    if (!u || !cur) { msg.textContent = t('set.required'); return; }
    if (p.length < 8 || p.length > 128) { msg.textContent = t('set.pwLength'); return; }
    if (p !== confirmPin) { msg.textContent = t('set.mismatch'); return; }
    btn.disabled = true; msg.textContent = t('set.updating');
    try {
      const out = await api('changeAuth', { newUsername: u, newPassword: p, currentPassword: cur });
      SLAuth.save({ token: out.token, username: out.username });
      const a = account(); a.username = out.username; localStorage.setItem(KEYS.account, JSON.stringify(a));
      ['currentPin', 'newPin', 'confirmPin'].forEach(id => { $(id).value = ''; }); $('newUser').value = out.username; showAccount();
      msg.textContent = t('set.updated'); toast(t('set.updated'));
    } catch (e) { msg.textContent = SLAuth.errorText(e); } finally { btn.disabled = false; }
  }
  async function resetData() {
    if (!guard() || !confirm(t('set.resetConfirm'))) return;
    try {
      clearTimeout(saveTimer); clearTimeout(cloud.timer);
      const out = await api('resetData');
      pulling = true; wipeLocal(); localStorage.setItem(KEYS.epoch, JSON.stringify(out.resetAt)); pulling = false;
      status('status.saved', 'saved'); renderAll(); document.dispatchEvent(new CustomEvent('sl:data')); toast(t('set.resetDone'));
    } catch (e) { toast(SLAuth.errorText(e)); }
  }

  function bind() {
    $('businessDate').value = ui.date || today(); $('reportFrom').value = ui.from || today(); $('reportTo').value = ui.to || today(); $('salesSearch').value = ui.search || '';
    navigator.storage?.persist?.().catch(() => {});
    const leave = () => flush();
    window.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
      else if (Date.now() - cloud.lastPull > 60000 && !dirty.d && !dirty.p) cloudPull(); // pick up other devices' changes
    });
    window.addEventListener('storage', e => {
      if (e.key !== KEYS.days && e.key !== KEYS.products) return;
      if (e.key === KEYS.days) { const v = read(KEYS.days, {}); if (v && typeof v === 'object' && !Array.isArray(v)) days = v; } else { const v = read(KEYS.products, null); if (Array.isArray(v)) products = v; }
      if (document.activeElement?.matches?.('input,select')) return;
      renderAll();
    });
    document.addEventListener('click', e => {
      const b = e.target.closest?.('.nav-btn'); if (b) { e.preventDefault(); tab(b.dataset.tab); return; }
      const o = e.target.closest?.('.open'); if (o) { e.preventDefault(); flush(); $('businessDate').value = o.dataset.date; ui.date = o.dataset.date; ui.edit = o.dataset.date; saveUI(); tab('sales'); return; }
      const m = e.target.closest?.('.move'); if (m) { e.preventDefault(); openMove(m.dataset.date); return; }
      const c = e.target.closest?.('.clone'); if (c) { e.preventDefault(); openMove(c.dataset.date, 'clone'); }
    });
    $('salesBody').addEventListener('input', e => {
      if (locked()) return;
      const i = e.target.closest('input[data-f]'), tr = i?.closest('tr'); if (!i || !tr) return;
      const r = rows.find(x => x.id === tr.dataset.id); if (!r) return;
      const f = i.dataset.f, v = (f === 'price' || f === 'sold') ? num(i.value) : Math.floor(num(i.value));
      if (f === 'sold') { const av = calc(r).available; r.closing = av - Math.min(v, av); } else r[f] = v;
      refreshRow(tr, r, i); summary(); persistDay();
    });
    $('salesBody').addEventListener('change', e => {
      const i = e.target.closest('input[data-f="price"]'), tr = i?.closest('tr'); if (!i || !tr || locked()) return;
      const d = curDate(); if (!isCurrent(d)) return;
      const r = rows.find(x => x.id === tr.dataset.id);
      if (setPrice(products.find(p => p.id === tr.dataset.id), r?.price, 'Daily Sales', d)) { flush(); prod(); toast(t('products.priceSynced')); }
    });
    $('salesBody').addEventListener('click', e => { const b = e.target.closest('.add-sale-btn'); if (b) addSale(b.closest('tr')); });
    $('salesBody').addEventListener('keydown', e => { if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229 || !e.target.classList.contains('add-qty')) return; e.preventDefault(); addSale(e.target.closest('tr')); });
    $('changeDateBtn').addEventListener('click', () => openMove(curDate()));
    $('cloneDayBtn').addEventListener('click', () => openMove(curDate(), 'clone'));
    $('clearDayBtn').addEventListener('click', clearDay);
    $('editDayBtn').addEventListener('click', editDay);
    $('saveDayBtn').addEventListener('click', save);
    $('moveCancel').addEventListener('click', () => $('moveDialog').close());
    $('moveForm').addEventListener('submit', e => { e.preventDefault(); const dlg = $('moveDialog'); if ((dlg.dataset.mode === 'clone' ? cloneDay : moveDay)(dlg.dataset.from, $('moveTo').value)) dlg.close(); });
    $('salesSearch').addEventListener('input', () => { ui.search = $('salesSearch').value; saveUI(); sales(); });
    $('salesSearch').addEventListener('keydown', e => { // handheld scanners type the code and press Enter
      if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return;
      const p = findByCode($('salesSearch').value); if (!p) return;
      e.preventDefault(); goToSale(p);
    });
    $('salesScanBtn').addEventListener('click', scanForSale);
    $('businessDate').addEventListener('change', () => { flush(); ui.date = $('businessDate').value; ui.edit = null; saveUI(); sales(); });
    $('reportFrom').addEventListener('change', () => { ui.from = $('reportFrom').value; saveUI(); custom(); });
    $('reportTo').addEventListener('change', () => { ui.to = $('reportTo').value; saveUI(); custom(); });

    $('productsBody').addEventListener('input', e => {
      const tr = e.target.closest('tr[data-pid]'), p = tr && products.find(x => x.id === tr.dataset.pid), f = e.target.dataset.f;
      if (!p || f !== 'opening' || !canEdit()) return;
      p.opening = num(e.target.value); persistProducts();
    });
    $('productsBody').addEventListener('change', e => {
      const tr = e.target.closest('tr[data-pid]'), p = tr && products.find(x => String(x.id) === String(tr.dataset.pid)), f = e.target.dataset.f;
      if (!p || !f || !guard()) return;
      if (f === 'category' && e.target.value === NEW_CAT) {
        const name = prompt(t('products.newCategoryName'));
        if (!name || !name.trim()) { e.target.value = p.category; return; }
        p.category = normalize(name); dirty.p = true; flush(); prod(); sales(); reports(); analytics(); toast(t('products.updated')); return;
      }
      if (f === 'barcode') { if (setBarcode(p, e.target)) { dirty.p = true; flush(); toast(t('products.updated')); } return; }
      if (f === 'name') {
        const v = e.target.value.trim();
        if (!v) { e.target.value = p.name; toast(t('products.nameRequired')); return; }
        if (nameTaken(v, p.id)) { e.target.value = p.name; toast(t('products.duplicate', { name: v })); return; }
        p.name = v;
      } else if (f === 'price') {
        const v = num(e.target.value); if (!setPrice(p, v, 'Products page', today())) return;
        const d = curDate(), r = days[d]?.rows?.find(x => x.id === p.id);
        if (r && !locked() && isCurrent(d)) { r.price = v; dirty.d = true; }
        flush(); sales(); reports(); toast(t('products.priceUpdated')); return;
      } else p[f] = f === 'category' ? e.target.value : num(e.target.value);
      dirty.p = true; flush(); sales(); reports(); analytics(); toast(t('products.updated'));
    });
    $('productsBody').addEventListener('click', async e => {
      const sb = e.target.closest('.scan-row');
      if (sb) {
        if (!guard()) return;
        const tr = sb.closest('tr'), code = await scanCode(); if (!code) return;
        const p = products.find(x => String(x.id) === String(tr.dataset.pid)), input = tr.querySelector('input[data-f="barcode"]');
        if (!p || !input) return;
        input.value = code;
        if (setBarcode(p, input)) { dirty.p = true; flush(); toast(t('products.updated')); }
        return;
      }
      if (!e.target.closest('.rm') || !guard()) return;
      const id = e.target.closest('tr').dataset.pid;
      if (!confirm(t('products.confirmRemove'))) return;
      deletedProductIds = [...new Set([...deletedProductIds, String(id)])]; products = products.filter(x => String(x.id) !== String(id));
      write(KEYS.deleted, deletedProductIds); write(KEYS.products, products); prod(); sales(); reports(); analytics(); toast(t('products.removed'));
    });
    $('addProductBtn').addEventListener('click', () => openProductDialog());
    $('productsScanBtn').addEventListener('click', scanForProducts);
    $('pCategory').addEventListener('change', toggleNewCategory);
    $('pScanBtn').addEventListener('click', async () => { const code = await scanCode(); if (code) $('pBarcode').value = code; });
    $('pBarcode').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) e.preventDefault(); }); // a handheld scanner's Enter must not submit the form early
    $('productForm').addEventListener('submit', submitProduct);
    $('productCancel').addEventListener('click', () => $('productDialog').close());
    $('historyProduct').addEventListener('change', () => { ui.hp = $('historyProduct').value; saveUI(); history(); });
    $('generateReportBtn').addEventListener('click', custom);
    $('analyticsRange').addEventListener('change', analytics);
    $('refreshCompaniesBtn').addEventListener('click', loadCompanies);

    const header = ['Date', 'Category', 'Product', 'Opening', 'Additions', 'Available', 'Closing', 'Sold', 'Unit Price', 'Sales']; // exports stay in English so they open the same everywhere
    const line = (d, r) => { const z = calc(r); return [fd(d), r.category, r.name, r.opening, r.added, z.available, z.closing, z.sold, r.price, z.sales]; };
    $('exportHistoryBtn').addEventListener('click', () => {
      const p = products.find(x => x.id === $('historyProduct').value); if (!p) return;
      const out = [['Date', 'Product', 'Opening', 'Additions', 'Available', 'Closing', 'Sold', 'Unit Price', 'Sales']];
      historyRows(p.id).forEach(x => out.push([fd(x.d), p.name, x.r.opening, x.r.added, x.z.available, x.z.closing, x.z.sold, x.r.price, x.z.sales]));
      download('stockledger-history-' + p.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.csv', csv(out));
    });
    $('exportCustomBtn').addEventListener('click', () => { const out = [header]; dateList($('reportFrom').value, $('reportTo').value).forEach(d => (days[d]?.rows || []).forEach(r => out.push(line(d, r)))); download('stockledger-report.csv', csv(out)); });
    $('exportAllBtn').addEventListener('click', () => { const out = [header]; Object.values(days).filter(d => d && isYmd(d.date)).sort((a, b) => a.date.localeCompare(b.date)).forEach(d => (d.rows || []).forEach(r => out.push(line(d.date, r)))); download('stockledger-all-reports.csv', csv(out)); });
    $('importBtn').addEventListener('click', importFile);
    $('downloadTemplateBtn').addEventListener('click', () => download('stockledger-stock-template.csv', csv([['Category', 'Product', 'SKU', 'Barcode', 'Unit Price', 'Opening Stock'], ['Drinks', 'Coke 50cl', 'DR-001', '5449000000996', 500, 20], ['Snacks', 'Meat Pie', 'SN-001', '', 700, 20], ['Bread', 'Medium Bread', 'BR-001', '', 1000, 15]])));
    $('logoutBtn').addEventListener('click', logout);
    $('saveSettingsBtn').addEventListener('click', saveSettings);
    $('resetDataBtn').addEventListener('click', resetData);

    document.addEventListener('sl:lang', () => { rangeLabels(); renderAll(); status(statusState.key, statusState.state); });
    $('newUser').value = SLAuth.username();
    rangeLabels(); showAccount(); renderAll(); status('status.saved', 'saved');
    if (ui.tab && ui.tab !== 'sales') tab(ui.tab);
    setTimeout(cloudPull, 250);
  }

  /* ---------------- public API for the other modules ---------------- */
  window.StockLedger = { KEYS, read, write, api, toast, guard, canEdit, money, esc, th, today, uid, num, fd, enhanceDates, queueSync, sync: cloudPush, account, findByCode, scan: scanCode };

  function boot() {
    enhanceDates();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    if (!SLAuth.loggedIn()) return;
    $('loginScreen').classList.add('hidden'); $('app').classList.remove('hidden');
    bind();
    document.dispatchEvent(new CustomEvent('sl:ready'));
  }
  const start = () => SLAuth.ready.then(boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
