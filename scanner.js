/* Barcode scanning with the device camera, plus manual entry.
 * Uses the browser's native BarcodeDetector when available (Chrome/Edge on Android, ChromeOS, macOS)
 * and otherwise falls back to a self-hosted ZXing build, loaded only the first time a scan starts.
 * Handheld USB/Bluetooth scanners act as keyboards, so they work in any focused input without this module. */
(() => {
  'use strict';
  const t = (k, v) => window.I18N.t(k, v);
  const NATIVE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'itf', 'codabar', 'qr_code'];
  const ZXING_FORMATS = ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_39', 'CODE_93', 'ITF', 'CODABAR', 'QR_CODE'];
  const FRAME_MS = 140, MAX_CODE = 64;

  let zxingPromise = null;
  const loadZxing = () => window.ZXing ? Promise.resolve(window.ZXing) : (zxingPromise = zxingPromise || new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = '/vendor/zxing.min.js';
    s.onload = () => res(window.ZXing); s.onerror = () => { zxingPromise = null; rej(new Error('Barcode reader failed to load')); };
    document.head.appendChild(s);
  }));

  async function createDecoder() {
    if ('BarcodeDetector' in window) {
      try {
        const supported = await window.BarcodeDetector.getSupportedFormats();
        const formats = NATIVE_FORMATS.filter(f => supported.includes(f));
        if (formats.length) {
          const detector = new window.BarcodeDetector({ formats });
          return async video => (await detector.detect(video))[0]?.rawValue || '';
        }
      } catch { /* fall through to ZXing */ }
    }
    const Z = await loadZxing();
    const reader = new Z.MultiFormatReader(), hints = new Map();
    hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, ZXING_FORMATS.map(f => Z.BarcodeFormat[f]));
    reader.setHints(hints);
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
    return async video => {
      const w = video.videoWidth, h = video.videoHeight; if (!w || !h) return '';
      const scale = Math.min(1, 960 / w); // smaller frames decode much faster in JS
      canvas.width = Math.round(w * scale); canvas.height = Math.round(h * scale);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      try { return reader.decodeWithState(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(canvas)))).getText(); }
      catch { return ''; } // NotFoundException on frames without a readable code
    };
  }

  let dlg = null;
  function ensureDialog() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.id = 'scanDialog'; dlg.className = 'dialog scan-dialog'; dlg.setAttribute('aria-labelledby', 'scanTitle');
    dlg.innerHTML = '<form id="scanForm" method="dialog" novalidate>'
      + '<h3 id="scanTitle"></h3>'
      + '<div class="scan-view" id="scanView"><video id="scanVideo" playsinline muted autoplay></video><span class="scan-frame" aria-hidden="true"></span></div>'
      + '<p id="scanStatus" class="muted scan-status" role="status" aria-live="polite"></p>'
      + '<label><span id="scanManualLabel"></span><input id="scanManual" maxlength="' + MAX_CODE + '" autocomplete="off" autocapitalize="none" spellcheck="false"></label>'
      + '<div class="dialog-actions"><button id="scanCancel" class="btn" type="button"></button><button id="scanUse" class="btn btn-primary" type="submit"></button></div>'
      + '</form>';
    document.body.appendChild(dlg);
    return dlg;
  }

  let active = null;

  function scan() {
    if (active) return active.promise;
    const d = ensureDialog(), $ = id => d.querySelector('#' + id);
    const video = $('scanVideo'), statusEl = $('scanStatus'), manual = $('scanManual'), view = $('scanView');
    $('scanTitle').textContent = t('scan.title'); $('scanManualLabel').textContent = t('scan.manual');
    $('scanCancel').textContent = t('common.cancel'); $('scanUse').textContent = t('scan.use');
    manual.value = ''; view.classList.remove('hidden'); statusEl.textContent = t('scan.starting');

    let stream = null, timer = null, stopped = false, resolve;
    const promise = new Promise(r => { resolve = r; });
    active = { promise };

    const stop = () => {
      stopped = true; clearTimeout(timer);
      stream?.getTracks().forEach(tr => tr.stop()); stream = null; video.srcObject = null;
    };
    const finish = code => {
      if (!active) return;
      stop(); active = null;
      d.removeEventListener('close', onClose); form.removeEventListener('submit', onSubmit); $('scanCancel').removeEventListener('click', onCancel);
      if (d.open) d.close();
      const clean = String(code || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, MAX_CODE);
      resolve(clean || null);
    };
    const form = $('scanForm');
    const onSubmit = e => { e.preventDefault(); if (manual.value.trim()) finish(manual.value); else manual.focus(); };
    const onCancel = () => finish(null);
    const onClose = () => finish(null); // Escape key
    form.addEventListener('submit', onSubmit); $('scanCancel').addEventListener('click', onCancel); d.addEventListener('close', onClose);

    d.showModal(); $('scanCancel').focus(); // keep the on-screen keyboard closed so the camera view stays visible

    const noCamera = key => { stop(); view.classList.add('hidden'); statusEl.textContent = t(key); manual.focus(); };
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) { noCamera('scan.noCamera'); return; }
      try {
        const [s, decode] = await Promise.all([
          navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } }),
          createDecoder()
        ]);
        if (stopped) { s.getTracks().forEach(tr => tr.stop()); return; }
        stream = s; video.srcObject = s; await video.play().catch(() => {});
        statusEl.textContent = t('scan.help');
        const tick = async () => {
          if (stopped) return;
          let code = '';
          try { code = video.readyState >= 2 ? await decode(video) : ''; } catch { code = ''; }
          if (stopped) return;
          if (code) { navigator.vibrate?.(60); finish(code); return; }
          timer = setTimeout(tick, FRAME_MS);
        };
        tick();
      } catch (e) {
        if (stopped) return;
        noCamera(e?.name === 'NotAllowedError' || e?.name === 'SecurityError' ? 'scan.denied' : 'scan.noCamera');
      }
    })();

    return promise;
  }

  window.SLScanner = { scan };
})();
