/* Authentication: login / signup screen and session storage.
 * The browser keeps only a signed session token — never the password. */
(function () {
  'use strict';
  const SESSION_KEY = 'dc_session_v3';
  const LEGACY_KEY = 'delite_cravings_auth_v2'; // old versions stored the plaintext password here
  const $ = id => document.getElementById(id);
  const t = (k, v) => window.I18N.t(k, v);

  const readSession = () => { try { const s = JSON.parse(localStorage.getItem(SESSION_KEY)); return s && s.token ? s : null; } catch { return null; } };
  const tokenExpired = token => { // payload is the middle segment; the server is the real authority, this just avoids pointless calls
    try { const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); return !(p.e > Date.now()); } catch { return true; }
  };

  const SLAuth = {
    session: readSession,
    token() { const s = readSession(); return s ? s.token : ''; },
    username() { const s = readSession(); return s ? s.username : ''; },
    loggedIn() { const s = readSession(); return !!s && !tokenExpired(s.token); },
    save(session) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); },
    purgeLocal() { Object.keys(localStorage).filter(k => /^(dc_|delite_)/.test(k)).forEach(k => localStorage.removeItem(k)); },
    expire() { // keep local data (so nothing is lost) but require a fresh sign-in
      localStorage.removeItem(SESSION_KEY);
      try { sessionStorage.setItem('sl_notice', 'AUTH_REQUIRED'); } catch { /* ignore */ }
      location.reload();
    },
    errorText(e) { return e && e.code && t('err.' + e.code) !== 'err.' + e.code ? t('err.' + e.code) : (e && e.network ? t('err.NETWORK') : (e && e.message) || t('err.SERVER_ERROR')); }
  };

  async function post(body) {
    let res;
    try {
      res = await fetch('/api/cloud', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
    } catch { const e = new Error('network'); e.network = true; throw e; }
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(out.error || 'Request failed'); e.code = out.code; throw e; }
    return out;
  }

  function adopt(out, username) {
    const prev = localStorage.getItem('dc_ws');
    if (prev && prev !== out.workspaceId) SLAuth.purgeLocal(); // shared device: never mix two businesses' data
    localStorage.setItem('dc_ws', out.workspaceId);
    localStorage.setItem('dc_account', JSON.stringify(out.account));
    SLAuth.save({ token: out.token, username });
  }

  // One-time upgrade: exchange a stored legacy password for a token, then delete the password.
  async function migrateLegacy() {
    let legacy = null;
    try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY)); } catch { /* ignore */ }
    if (localStorage.getItem(LEGACY_KEY) === null) return;
    try {
      if (!readSession() && legacy && legacy.username && legacy.pin) {
        const out = await post({ action: 'login', username: String(legacy.username).toLowerCase(), password: legacy.pin });
        adopt(out, String(legacy.username).toLowerCase());
      }
    } catch { /* fall through to the login screen */ }
    localStorage.removeItem(LEGACY_KEY);
  }

  let signUp = false;
  function setMode(up) {
    signUp = up;
    $('bizRow').classList.toggle('hidden', !up);
    $('tabIn').classList.toggle('active', !up); $('tabUp').classList.toggle('active', up);
    $('tabIn').setAttribute('aria-selected', String(!up)); $('tabUp').setAttribute('aria-selected', String(up));
    $('loginBtn').dataset.i18n = up ? 'login.submitUp' : 'login.submitIn';
    $('loginBtn').textContent = t(up ? 'login.submitUp' : 'login.submitIn');
    $('loginPin').autocomplete = up ? 'new-password' : 'current-password';
    $('loginError').textContent = '';
  }

  function wire() {
    $('tabIn').onclick = () => setMode(false);
    $('tabUp').onclick = () => setMode(true);
    try { const n = sessionStorage.getItem('sl_notice'); if (n) { $('loginError').textContent = t('err.' + n); sessionStorage.removeItem('sl_notice'); } } catch { /* ignore */ }
    $('loginForm').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = $('loginBtn'), err = $('loginError');
      const username = $('loginUser').value.trim().toLowerCase(), password = $('loginPin').value, businessName = $('loginBiz').value.trim();
      err.textContent = '';
      if (!username || !password) { err.textContent = t('err.LOGIN_INVALID'); return; }
      if (signUp && businessName.length < 2) { err.textContent = t('err.BUSINESS_NAME'); return; }
      if (signUp && password.length < 8) { err.textContent = t('err.PASSWORD_INVALID'); return; }
      btn.disabled = true; btn.textContent = t('common.wait');
      try {
        const out = await post({ action: signUp ? 'signup' : 'login', username, password, businessName });
        adopt(out, username);
        location.reload();
      } catch (ex) {
        err.textContent = SLAuth.errorText(ex);
        btn.disabled = false; btn.textContent = t(signUp ? 'login.submitUp' : 'login.submitIn');
      }
    });
  }

  window.SLAuth = SLAuth;
  SLAuth.ready = migrateLegacy().then(() => {
    const go = () => { wire(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  });
  document.addEventListener('sl:lang', () => { if ($('loginBtn') && !$('loginBtn').disabled) $('loginBtn').textContent = t(signUp ? 'login.submitUp' : 'login.submitIn'); });
})();
