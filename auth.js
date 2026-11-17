/* Authentication: login / signup screen and session storage.
 * The browser keeps only a signed session token — never the password. */
(function () {
  'use strict';
  const SESSION_KEY = 'dc_session_v3';
  const LEGACY_KEY = 'delite_cravings_auth_v2'; // old versions stored the plaintext password here
  const $ = id => document.getElementById(id);
  const t = (k, v) => window.I18N.t(k, v);

  const SHORT_SESSION_MS = 12 * 60 * 60 * 1000; // sessions without "Remember me" lapse after 12 hours (shared phones and counters)
  const readSession = () => { try { const s = JSON.parse(localStorage.getItem(SESSION_KEY)); return s && s.token && !(s.until && s.until < Date.now()) ? s : null; } catch { return null; } };
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

  function adopt(out, username, remember) {
    const prev = localStorage.getItem('dc_ws');
    if (prev && prev !== out.workspaceId) SLAuth.purgeLocal(); // shared device: never mix two businesses' data
    localStorage.setItem('dc_ws', out.workspaceId);
    localStorage.setItem('dc_account', JSON.stringify(out.account));
    SLAuth.save({ token: out.token, username, until: remember ? 0 : Date.now() + SHORT_SESSION_MS });
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
    const set = (id, key) => { const el = $(id); el.dataset.i18n = key; el.textContent = t(key); };
    $('bizRow').classList.toggle('hidden', !up);
    set('loginTitle', up ? 'login.createTitle' : 'login.welcome');
    set('loginBtn', up ? 'login.submitUp' : 'login.submitIn');
    set('modeBtn', up ? 'login.haveAccount' : 'login.create');
    $('loginSub').dataset.i18n = up ? 'login.createSub' : 'login.welcomeSub'; $('loginSub').dataset.i18nVars = up ? 'login.createSub|price=1,500' : '';
    $('loginSub').textContent = t(up ? 'login.createSub' : 'login.welcomeSub', { price: '1,500' });
    if (!up) $('loginSub').removeAttribute('data-i18n-vars');
    $('loginPin').dataset.i18nPlaceholder = up ? 'login.newPassword' : 'login.password';
    $('loginPin').placeholder = t(up ? 'login.newPassword' : 'login.password');
    $('loginPin').autocomplete = up ? 'new-password' : 'current-password';
    document.querySelector('.login-meta').classList.toggle('hidden', up);
    $('loginError').textContent = '';
  }

  function wire() {
    $('modeBtn').onclick = () => setMode(!signUp);
    $('togglePw').onclick = () => {
      const show = $('loginPin').type === 'password';
      $('loginPin').type = show ? 'text' : 'password';
      $('togglePw').setAttribute('aria-pressed', String(show));
      $('togglePw').setAttribute('aria-label', t(show ? 'login.hide' : 'login.show')); $('togglePw').dataset.i18nAria = show ? 'login.hide' : 'login.show';
    };
    $('forgotBtn').onclick = () => { $('loginError').textContent = t('login.forgotHelp'); };
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
        adopt(out, username, signUp || $('rememberMe').checked);
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
