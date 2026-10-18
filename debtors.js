/* Credit sales, debtors and payments. Records are append-only (corrections are made with new
 * entries, like a paper ledger) and sync through the same cloud channel as sales data. */
(() => {
  'use strict';
  const SL = () => window.StockLedger, t = (k, v) => window.I18N.t(k, v), $ = id => document.getElementById(id);
  const th = (k, v) => SL().th(k, v), esc = x => SL().esc(x), money = x => SL().money(x);
  let view = 'debtors', ledgerId = null, debtors = [], sales = [], payments = [];

  const load = () => { const K = SL().KEYS; debtors = SL().read(K.debtors, []); sales = SL().read(K.credit, []); payments = SL().read(K.payments, []); };
  function persist() {
    const K = SL().KEYS;
    const ok = SL().write(K.debtors, debtors) && SL().write(K.credit, sales) && SL().write(K.payments, payments);
    if (!ok) SL().toast(t('toast.storageFull'));
    return ok;
  }
  const totalSales = d => sales.filter(x => x.debtorId === d.id).reduce((s, x) => s + Number(x.total || 0), 0);
  const totalPaid = d => payments.filter(x => x.debtorId === d.id).reduce((s, x) => s + Number(x.amount || 0), 0);
  const balance = d => Number(d.openingBalance || 0) + totalSales(d) - totalPaid(d);
  const field = (id, label, attrs = '') => '<label><span>' + th(label) + '</span><input id="' + id + '" ' + attrs + '></label>';

  function render() {
    const root = $('creditRoot'); if (!root) return;
    load();
    const stat = (k, v) => '<div class="credit-stat"><small>' + th(k) + '</small><h3>' + v + '</h3></div>';
    const outstanding = debtors.reduce((s, d) => s + Math.max(0, balance(d)), 0);
    const tabBtn = (v, k) => '<button class="btn' + (view === v ? ' btn-primary' : '') + '" data-view="' + v + '" type="button">' + th(k) + '</button>';
    root.innerHTML = '<div class="credit-grid">' + stat('cr.totalCredit', money(sales.reduce((s, x) => s + Number(x.total || 0), 0))) + stat('cr.totalPaid', money(payments.reduce((s, x) => s + Number(x.amount || 0), 0)))
      + stat('cr.outstanding', money(outstanding)) + stat('cr.customers', debtors.length) + '</div>'
      + '<div class="credit-actions">' + tabBtn('debtors', 'cr.tabDebtors') + tabBtn('sale', 'cr.tabSale') + tabBtn('pay', 'cr.tabPay') + '</div><div id="creditPanel" class="panel"></div>';
    ({ debtors: showDebtors, sale: showSale, pay: showPay, ledger: showLedger }[view] || showDebtors)();
    SL().enhanceDates(root);
  }

  function showDebtors() {
    const body = debtors.map(d => '<tr><td><b>' + esc(d.name) + '</b><br><small class="muted">' + esc(d.phone || '') + '</small></td><td>' + money(totalSales(d)) + '</td><td>' + money(totalPaid(d)) + '</td><td><b>' + money(balance(d)) + '</b></td><td><button class="btn" data-ledger="' + esc(d.id) + '" type="button">' + th('cr.ledger') + '</button></td></tr>').join('')
      || '<tr><td colspan="5" class="muted">' + th('cr.noDebtors') + '</td></tr>';
    $('creditPanel').innerHTML = '<h3>' + th('cr.register') + '</h3><div class="credit-form">' + field('crName', 'cr.name', 'maxlength="120"') + field('crPhone', 'cr.phone', 'maxlength="40" inputmode="tel"') + field('crAddress', 'cr.address', 'maxlength="200"')
      + field('crLimit', 'cr.limit', 'type="number" min="0" step="any" inputmode="decimal"') + field('crOpening', 'cr.openingBal', 'type="number" min="0" step="any" inputmode="decimal"')
      + '<label class="wide"><span>' + th('cr.notes') + '</span><textarea id="crNotes" maxlength="500"></textarea></label></div><div class="credit-actions"><button class="btn btn-primary" id="crAdd" type="button">' + th('cr.addDebtor') + '</button></div>'
      + '<div class="table-wrap"><table class="credit-table"><thead><tr><th scope="col">' + th('cr.customer') + '</th><th scope="col">' + th('cr.creditSales') + '</th><th scope="col">' + th('cr.payments') + '</th><th scope="col">' + th('cr.balance') + '</th><th></th></tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function showSale() {
    const ps = SL().read(SL().KEYS.products, []);
    $('creditPanel').innerHTML = '<h3>' + th('cr.tabSale') + '</h3><div class="credit-form"><label><span>' + th('cr.customer') + '</span><select id="crSaleDebtor"><option value="">' + th('cr.selectCustomer') + '</option>'
      + debtors.map(d => '<option value="' + esc(d.id) + '">' + esc(d.name) + ' — ' + money(balance(d)) + '</option>').join('') + '</select></label>'
      + '<label><span>' + th('col.product') + '</span><select id="crSaleProduct"><option value="">' + th('cr.selectProduct') + '</option>' + ps.map(p => '<option value="' + esc(p.id) + '">' + esc(p.name) + ' — ' + money(p.price) + '</option>').join('') + '</select></label>'
      + field('crSaleQty', 'cr.qty', 'type="number" min="1" step="1" value="1" inputmode="numeric"') + field('crSalePrice', 'cr.unitPrice', 'type="number" min="0" step="any" inputmode="decimal"')
      + field('crSalePaid', 'cr.amountPaid', 'type="number" min="0" step="any" value="0" inputmode="decimal"') + field('crSaleDue', 'cr.dueDate', 'type="date" value="' + SL().today() + '"')
      + '<label class="wide"><span>' + th('cr.notes') + '</span><textarea id="crSaleNotes" maxlength="500"></textarea></label></div><div class="credit-actions"><button class="btn btn-primary" id="crSaveSale" type="button">' + th('cr.saveSale') + '</button></div>';
    $('crSaleProduct').onchange = () => { const p = ps.find(x => x.id === $('crSaleProduct').value); $('crSalePrice').value = p ? p.price : 0; };
  }

  function showPay() {
    $('creditPanel').innerHTML = '<h3>' + th('cr.tabPay') + '</h3><div class="credit-form"><label><span>' + th('cr.customer') + '</span><select id="crPayDebtor"><option value="">' + th('cr.selectCustomer') + '</option>'
      + debtors.map(d => '<option value="' + esc(d.id) + '">' + esc(d.name) + ' — ' + money(balance(d)) + '</option>').join('') + '</select></label>'
      + field('crPayAmount', 'cr.amount', 'type="number" min="0" step="any" inputmode="decimal"') + field('crPayDate', 'cr.date', 'type="date" value="' + SL().today() + '"')
      + '<label><span>' + th('cr.method') + '</span><select id="crPayMethod"><option value="Cash">' + th('cr.cash') + '</option><option value="Transfer">' + th('cr.transfer') + '</option><option value="POS">' + th('cr.pos') + '</option><option value="Other">' + th('cr.other') + '</option></select></label>'
      + field('crPayRef', 'cr.reference', 'maxlength="120"') + '<label class="wide"><span>' + th('cr.notes') + '</span><textarea id="crPayNotes" maxlength="500"></textarea></label></div><div class="credit-actions"><button class="btn btn-primary" id="crSavePay" type="button">' + th('cr.savePay') + '</button></div>';
  }

  function showLedger() {
    const d = debtors.find(x => x.id === ledgerId); if (!d) { view = 'debtors'; return showDebtors(); }
    const byTime = (a, b) => String(a.date).localeCompare(String(b.date)) || String(a.at).localeCompare(String(b.at));
    const tx = [...sales.filter(x => x.debtorId === d.id).map(x => ({ date: x.date, at: x.createdAt || '', type: t('cr.typeSale'), debit: x.total, credit: 0, ref: x.id })),
      ...payments.filter(x => x.debtorId === d.id).map(x => ({ date: x.date, at: x.createdAt || '', type: t('cr.typePay'), debit: 0, credit: x.amount, ref: x.reference || x.id }))].sort(byTime);
    let bal = Number(d.openingBalance || 0);
    const opening = bal ? '<tr><td></td><td>' + th('cr.typeOpen') + '</td><td>' + money(bal) + '</td><td>' + money(0) + '</td><td>' + money(bal) + '</td><td></td></tr>' : '';
    const body = tx.map(x => { bal += Number(x.debit || 0) - Number(x.credit || 0); return '<tr><td>' + esc(SL().fd(x.date)) + '</td><td>' + esc(x.type) + '</td><td>' + money(x.debit) + '</td><td>' + money(x.credit) + '</td><td>' + money(bal) + '</td><td>' + esc(x.ref) + '</td></tr>'; }).join('');
    $('creditPanel').innerHTML = '<button class="btn" id="crBack" type="button">' + th('cr.back') + '</button><h3>' + th('cr.ledgerTitle', { name: d.name }) + '</h3><p>' + th('cr.phoneAddr', { phone: d.phone || '—', address: d.address || '—' }) + '</p>'
      + '<div class="credit-stat"><b>' + th('cr.balanceLine', { amount: money(balance(d)) }) + '</b></div><div class="table-wrap"><table class="credit-table"><thead><tr><th scope="col">' + th('cr.date') + '</th><th scope="col">' + th('cr.type') + '</th><th scope="col">' + th('cr.debit') + '</th><th scope="col">' + th('cr.creditCol') + '</th><th scope="col">' + th('cr.balance') + '</th><th scope="col">' + th('cr.reference') + '</th></tr></thead><tbody>' + opening + body + '</tbody></table></div>';
  }

  const val = id => $(id).value;
  const amt = id => Math.max(0, Number(val(id)) || 0);
  const mk = p => SL().uid(p);

  function addDebtor() {
    if (!SL().guard()) return;
    const name = val('crName').trim(); if (!name) { SL().toast(t('cr.nameReq')); return; }
    debtors.push({ id: mk('D'), name, phone: val('crPhone').trim(), address: val('crAddress').trim(), creditLimit: amt('crLimit'), openingBalance: amt('crOpening'), notes: val('crNotes').trim(), createdAt: new Date().toISOString() });
    if (persist()) { SL().toast(t('cr.debtorAdded')); render(); }
  }
  function saveSale() {
    if (!SL().guard()) return;
    const ps = SL().read(SL().KEYS.products, []), debtorId = val('crSaleDebtor'), p = ps.find(x => x.id === val('crSaleProduct')), qty = Math.floor(Number(val('crSaleQty')) || 0), price = amt('crSalePrice'), paid = amt('crSalePaid');
    if (!debtorId || !p || qty < 1) { SL().toast(t('cr.saleInvalid')); return; }
    const total = qty * price; if (paid > total) { SL().toast(t('cr.overSale')); return; }
    const d = debtors.find(x => x.id === debtorId), after = balance(d) + total - paid;
    if (d.creditLimit > 0 && after > d.creditLimit && !confirm(t('cr.overLimit', { name: d.name, balance: money(after), limit: money(d.creditLimit) }))) return;
    const now = new Date().toISOString(), saleId = mk('S');
    sales.push({ id: saleId, date: SL().today(), debtorId, items: [{ productId: p.id, name: p.name, qty, unitPrice: price, total }], total, paid, dueDate: val('crSaleDue') || SL().today(), notes: val('crSaleNotes').trim(), createdAt: now });
    if (paid > 0) payments.push({ id: mk('P'), date: SL().today(), debtorId, amount: paid, method: 'At sale', reference: t('cr.atSale'), notes: t('cr.paymentAtSale'), createdAt: now });
    if (persist()) { SL().toast(t('cr.saleDone', { amount: money(total - paid) })); render(); }
  }
  function savePay() {
    if (!SL().guard()) return;
    const debtorId = val('crPayDebtor'), amount = amt('crPayAmount'); if (!debtorId || amount <= 0) { SL().toast(t('cr.payInvalid')); return; }
    const d = debtors.find(x => x.id === debtorId), owed = balance(d);
    if (amount > owed && !confirm(t('cr.overBalance', { balance: money(Math.max(0, owed)) }))) return;
    payments.push({ id: mk('P'), date: val('crPayDate') || SL().today(), debtorId, amount, method: val('crPayMethod'), reference: val('crPayRef').trim(), notes: val('crPayNotes').trim(), createdAt: new Date().toISOString() });
    if (persist()) { SL().toast(t('cr.payDone')); render(); }
  }

  const root = $('creditRoot');
  root.addEventListener('click', e => {
    const v = e.target.closest('[data-view]'); if (v) { view = v.dataset.view; render(); return; }
    const l = e.target.closest('[data-ledger]'); if (l) { ledgerId = l.dataset.ledger; view = 'ledger'; render(); return; }
    const id = e.target.id;
    if (id === 'crAdd') addDebtor(); else if (id === 'crSaveSale') saveSale(); else if (id === 'crSavePay') savePay(); else if (id === 'crBack') { view = 'debtors'; render(); }
  });
  const visible = () => document.getElementById('credit').classList.contains('active');
  document.addEventListener('sl:tab', e => { if (e.detail === 'credit') render(); });
  document.addEventListener('sl:data', () => { if (visible()) render(); });
  document.addEventListener('sl:lang', () => { if (visible()) render(); });
})();
