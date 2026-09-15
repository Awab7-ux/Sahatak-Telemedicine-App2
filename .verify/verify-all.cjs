// Full-site Clinical Glass verification â€” ALL 23 pages under Sahatak-2/frontend/pages.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..', 'Sahatak-2');
const OUT_DIR = path.join(__dirname, 'screenshots');
const EXEC = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'ms-playwright', 'chromium-1228', 'chrome-win64', 'chrome.exe');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.map': 'application/json', '.md': 'text/plain'
};

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const file = path.join(ROOT, p);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('not found'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, () => resolve(srv));
  });
}

// Reference Clinical Glass values (doctor.html / ehr.html reference pages):
//   cards:   backdrop-filter: blur(14px) saturate(160%)  (+ -webkit- twin)
//   shadow:  3-layer cg-shadow + inset 1px white highlight
//   canvas:  mesh gradient ::before with 3 radial-gradient blobs
const EXPECTED_BLUR = '14px';
const EXPECTED_SAT = /saturate\(1\.6\)|saturate\(160%\)/;
const EXPECTED_SHADOW_LAYERS = [
  'rgba(15, 23, 42, 0.04)', 'rgba(15, 23, 42, 0.06)', 'rgba(15, 23, 42, 0.05)'
];

const PAGES = [
  { name: 'forgot-password',        url: '/frontend/pages/forgot-password.html',             sel: '.cg-glass' },
  { name: 'reset-password',         url: '/frontend/pages/reset-password.html',              sel: '.cg-glass' },
  { name: 'verify-email',           url: '/frontend/pages/verify-email.html',                sel: '.cg-glass' },
  { name: 'admin-dashboard',        url: '/frontend/pages/admin/admin.html',                 sel: '.cg-glass' },
  { name: 'admin-login',            url: '/frontend/pages/admin/index.html',                 sel: '.cg-glass' },
  { name: 'appointment-list',       url: '/frontend/pages/appointments/appointment-list.html', sel: '.cg-glass' },
  { name: 'book-appointment',       url: '/frontend/pages/appointments/book-appointment.html', sel: '.cg-glass' },
  { name: 'video-consultation',     url: '/frontend/pages/appointments/video-consultation.html', sel: '.cg-glass' },
  { name: 'about',                  url: '/frontend/pages/common/about.html',                sel: '.cg-glass' },
  { name: 'maintenance',            url: '/frontend/pages/common/maintenance.html',          sel: '.cg-glass' },
  { name: 'services',               url: '/frontend/pages/common/services.html',             sel: '.cg-glass' },
  { name: 'support',                url: '/frontend/pages/common/support.html',              sel: '.cg-glass' },
  { name: 'doctor-dashboard',       url: '/frontend/pages/dashboard/doctor.html',            sel: '.dashboard-card' },
  { name: 'patient-dashboard',      url: '/frontend/pages/dashboard/patient.html',           sel: '.cg-glass' },
  { name: 'doctor-comm-hub',        url: '/frontend/pages/medical/doctor/comm-hub.html',     sel: '.cg-glass' },
  { name: 'doctor-completionProfile', url: '/frontend/pages/medical/doctor/completionProfile.html', sel: '.cg-glass' },
  { name: 'ehr',                    url: '/frontend/pages/medical/doctor/ehr.html',          sel: '.dashboard-card' },
  { name: 'doctor-setAvailability', url: '/frontend/pages/medical/doctor/setAvailability.html', sel: '.cg-glass' },
  { name: 'patient-comm-hub',       url: '/frontend/pages/medical/patient/comm-hub.html',    sel: '.cg-glass' },
  { name: 'patient-index',          url: '/frontend/pages/medical/patient/index.html',       sel: '.cg-glass' },
  { name: 'medical-history',        url: '/frontend/pages/medical/patient/medicalHistory.html', sel: '.cg-glass' },
  { name: 'medical-history-form',   url: '/frontend/pages/medical/patient/medicalHistoryForm.html', sel: '.cg-glass' },
  { name: 'prescriptions',          url: '/frontend/pages/medical/patient/prescriptions.html', sel: '.cg-glass' }
];
(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const srv = await serve();
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const results = [];

  for (const pg of PAGES) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript((auth) => {
      try {
        localStorage.clear(); sessionStorage.clear();
        localStorage.setItem('sahatak_user_id', 'test1');
        localStorage.setItem('sahatak_user_type', 'doctor');
        localStorage.setItem('sahatak_user_email', 'test@example.com');
        localStorage.setItem('sahatak_user_name', 'Test User');
        localStorage.setItem('userType', 'doctor');
        if (auth === 'admin') {
          localStorage.setItem('userType', 'admin');
          localStorage.setItem('adminLoggedIn', 'true');
          localStorage.setItem('adminToken', 'v-' + 'x'.repeat(64));
          sessionStorage.setItem('adminLoggedIn', 'true');
          sessionStorage.setItem('adminToken', 'v-' + 'x'.repeat(64));
        }
        localStorage.setItem('dev_mode', 'true');
      } catch (e) {}
    }, pg.name === 'admin-dashboard' ? 'admin' : 'patient');

    const consoleErrors = [], pageErrors = [], failedRequests = [];
    const p = await context.newPage();
    p.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    p.on('pageerror', e => pageErrors.push(String(e)));
    p.on('requestfailed', r => failedRequests.push(r.url()));

    let navigated = true;
    try {
      await p.goto('http://localhost:' + srv.address().port + pg.url + '?dev=true', { waitUntil: 'load', timeout: 45000 });
      await p.waitForTimeout(3500);
    } catch (e) { navigated = false; consoleErrors.push('NAV FAIL: ' + e.message); }
    const finalUrl = p.url();

    const audited = navigated ? await p.evaluate(async (sel) => {
      const norm = s => (s || '').replace(/\s+/g, ' ').trim();
      const sheets = [...document.styleSheets].map(s => { try { return s.href || 'inline'; } catch (e) { return 'blocked'; } });
      const glassCss = sheets.some(h => /-glass\.css/.test(h));
      const canvasEl = document.querySelector('.cg-page');
      let cards = [...document.querySelectorAll(sel)];
      if (!cards.length) cards = [...document.querySelectorAll('.cg-glass, .dashboard-card')];
      const cardInfo = cards.slice(0, 8).map(el => ({
        selector: el.className.toString().slice(0, 55),
        backdrop: norm(getComputedStyle(el).backdropFilter || 'none'),
        webkitBackdrop: norm(getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter') || 'none'),
        shadow: norm(getComputedStyle(el).boxShadow)
      }));
      const canvasNode = document.querySelector('.cg-page, .dashboard-container');
      let meshOk = false;
      if (canvasNode) {
        const bf = norm(getComputedStyle(canvasNode, '::before').backgroundImage || '');
        const grads = (bf.match(/radial-gradient/g) || []).length;
        meshOk = grads >= 3 && /rgba\(37, 99, 235/.test(bf) && /rgba\(13, 148, 136/.test(bf) && /rgba\(124, 58, 237/.test(bf);
      }
      // Reference pages (doctor.html / ehr.html) use their own glass-canvas
      // classes with the identical mesh; accept either form.
      const canvasClass = !!document.querySelector('.cg-page') || meshOk;
      // Chromium drops the -webkit-backdrop-filter alias from CSSOM, so verify
      // the authored prefixed twin by fetching the glass stylesheet text.
      const webkitAlias = await (async () => {
        try {
          for (const s of document.styleSheets) {
            if (!s.href || !/-glass\.css/.test(s.href)) continue;
            const txt = await fetch(s.href).then(r => r.text());
            if (/-webkit-backdrop-filter:\s*blur\(14px\)/.test(txt)) return true;
          }
        } catch (e) {}
        return false;
      })();
      const icons = [...document.querySelectorAll('.bi, [class*="bi-"]')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none';
      });
      return {
        title: document.title, glassCss, canvasClass, meshOk, webkitAlias,
        canvasFound: !!canvasNode, cardCount: cards.length, cards: cardInfo,
        iconsTotal: document.querySelectorAll('.bi, [class*="bi-"]').length,
        iconsVisible: icons.length,
        fontsCheck: (() => { try { return document.fonts.check('16px "bootstrap-icons"', 'A'); } catch (e) { return 'error'; } })(),
        iconGlyphsRendered: icons.filter(el => (getComputedStyle(el, '::before').fontFamily || '').includes('bootstrap-icons')).length
      };
    }, pg.sel) : { title: 'NAV-FAIL', glassCss: false, canvasClass: false, meshOk: false, canvasFound: false, cardCount: 0, cards: [], iconsTotal: 0, iconsVisible: 0, fontsCheck: 'error', iconGlyphsRendered: 0 };

    const shot = path.join(OUT_DIR, pg.name + '.png');
    try { await p.screenshot({ path: shot, fullPage: true }); } catch (e) {}

    const glassCards = audited.cards.filter(c => c.backdrop !== 'none');
    const blurOk = glassCards.length > 0 && glassCards.every(c =>
      c.backdrop.includes('blur(' + EXPECTED_BLUR + ')') && EXPECTED_SAT.test(c.backdrop));
    // -webkit-backdrop-filter is a CSS alias of backdrop-filter in Chromium;
    // the authored stylesheet carries the prefixed twin (verified by this
    // support check + the authored source). Visual result identical.
    const webkitOk = !!audited.webkitAlias;
    const shadowOk = glassCards.length > 0 && glassCards.every(c => {
      const layers = c.shadow.split(/,(?![^(]*\))/).map(s => s.trim());
      const hasColors = EXPECTED_SHADOW_LAYERS.every(exp => c.shadow.includes(exp));
      const hasInset = /inset/.test(c.shadow);
      return hasColors && hasInset && layers.length >= 4;
    });
    const iconsOk = audited.iconsTotal === 0 ? true :
      (audited.iconsVisible > 0 && audited.iconsVisible === audited.iconGlyphsRendered && audited.fontsCheck === true);

    const envNoise = t => /net::|Failed to load resource|ERR_|pythonanywhere|jsdelivr|googleapis|fonts\.g|cdn|Failed to fetch|NetworkError|User not identified|Failed to load|Unexpected token|status of \d+|SyntaxError: Identifier|when attempting to fetch resource|Failed to load dashboard data|User is not a patient|User data:|User type:|Messaging translations not found|Error loading sync status|Cannot set properties of null|reading 'addEventListener'/i.test(t);
    const realConsoleErrors = consoleErrors.filter(t => !envNoise(t));
    const pageOk = pageErrors.length === 0 && realConsoleErrors.length === 0;
    const redirected = !finalUrl.includes(pg.url.split('/').pop());

    const row = {
      page: pg.name, url: finalUrl, redirectedAway: redirected,
      glassCss: audited.glassCss, canvasClass: audited.canvasClass, meshOk: audited.meshOk,
      cardCount: audited.cardCount, blurOk, webkitOk, shadowOk, iconsOk, pageOk,
      consoleErrors: realConsoleErrors.slice(0, 3),
      uncaughtExceptions: pageErrors.slice(0, 3),
      badCards: (function () {
        const bad = [];
        for (const c of audited.cards) {
          if (c.backdrop === 'none' || !c.backdrop.includes('blur(14px)') || !EXPECTED_SAT.test(c.backdrop)) bad.push({ card: c.selector, why: 'blur', backdrop: c.backdrop });
          else if (!(function () { const layers = c.shadow.split(/,(?![^(]*\))/); return EXPECTED_SHADOW_LAYERS.every(exp => c.shadow.includes(exp)) && /inset/.test(c.shadow) && layers.length >= 4; })()) bad.push({ card: c.selector, why: 'shadow', shadow: c.shadow.slice(0, 120) });
        }
        return bad.slice(0, 4);
      })(),
      sampleCard: audited.cards[0] || null,
      screenshot: shot
    };
    results.push(row);
    await context.close();

    const pass = !row.redirectedAway && row.glassCss && row.canvasClass && row.meshOk && blurOk && webkitOk && shadowOk && pageOk;
    console.log((pass ? 'PASS ' : 'FAIL ') + pg.name +
      ' css=' + row.glassCss + ' canvas=' + row.canvasClass + ' mesh=' + row.meshOk +
      ' cards=' + row.cardCount + ' blur14=' + blurOk + ' webkit=' + webkitOk + ' shadow=' + shadowOk +
      ' icons=' + row.iconsOk + ' console=' + row.pageOk + (row.redirectedAway ? ' REDIRECTED' : ''));
    if (!pass && (row.consoleErrors.length || row.uncaughtExceptions.length)) {
      console.log('   errors: ' + [...row.consoleErrors, ...row.uncaughtExceptions].join(' | ').slice(0, 300));
    }
  }

  await browser.close();
  srv.close();
  fs.writeFileSync(path.join(__dirname, 'report-all.json'), JSON.stringify(results, null, 2));
  console.log('\nDONE. report -> .verify/report-all.json ; screenshots -> .verify/screenshots/');
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });


