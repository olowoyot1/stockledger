/* Team & billing panel (Settings). Visible to the account owner only. */
(() => {
  'use strict';
  const SL = () => window.StockLedger, t = (k, v) => window.I18N.t(k, v), $ = id => document.getElementById(id);
  const naira = n => '₦' + Number(n || 0).toLocaleString('en-NG');
  let last = null;

  function render(o) {
    if (o) last = o;
    if (!last) return;
    const c = last.account || SL().account(), users = Number(c.users) || 1;
    const summary = t(users === 1 ? 'team.one' : 'team.many', { n: users, price: naira(c.pricePerUser), total: naira(c.monthlyAmount) });
    $('billSummary').textContent = summary + (c.plan === 'trial' && c.canWrite ? t('team.trialFree') : '');
    $('addUserBtn').textContent = t('team.add', { price: naira(c.pricePerUser) });
    $('teamList').innerHTML = (last.users || []).map(u => '<div class="team-row"><span>' + SL().esc(u.username) + '</span><button class="btn btn-light" data-rm="' + SL().esc(u.id) + '" type="button">' + SL().th('common.remove') + '</button></div>').join('')
      || '<p class="muted">' + SL().th('team.none') + '</p>';
  }

  async function load() {
    const c = SL().account();
    $('teamPanel').classList.toggle('hidden', c.role !== 'owner' && c.role !== 'superadmin');
    if (c.role !== 'owner' && c.role !== 'superadmin') return;
    try { render(await SL().api('listUsers')); } catch (e) { $('teamMsg').textContent = window.SLAuth.errorText(e); }
  }

  $('addUserBtn').addEventListener('click', async () => {
    if (!SL().guard()) return;
    const b = $('addUserBtn'); b.disabled = true; $('teamMsg').textContent = '';
    try {
      render(await SL().api('addUser', { newUsername: $('tuName').value, newPassword: $('tuPin').value }));
      $('tuName').value = ''; $('tuPin').value = ''; $('teamMsg').textContent = t('team.added');
      localStorage.setItem(SL().KEYS.account, JSON.stringify(last.account));
    } catch (e) { $('teamMsg').textContent = window.SLAuth.errorText(e); } finally { b.disabled = false; }
  });

  $('teamList').addEventListener('click', async e => {
    const id = e.target.dataset && e.target.dataset.rm;
    if (!id || !SL().guard() || !confirm(t('team.confirmRemove'))) return;
    try { render(await SL().api('removeUser', { userId: id })); localStorage.setItem(SL().KEYS.account, JSON.stringify(last.account)); }
    catch (err) { $('teamMsg').textContent = window.SLAuth.errorText(err); }
  });

  document.addEventListener('sl:ready', load);
  document.addEventListener('sl:lang', () => render());
})();
