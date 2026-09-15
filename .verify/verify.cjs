// Programmatic render verification for 4 staged pages.
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
  '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.ico': 'image/x-icon', '.map': 'application/json', '.md': 'text/plain'
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
    srv.listen(8742, () => resolve(srv));
  });
}

// Reference values documented from the doctor-page (Clinical Glass) rollout:
//   backdrop-filter: blur(14px) saturate(160%)   (+ -webkit- prefixed twin)
//   box-shadow: 3-layer cg-shadow + inset 1px white highlight
const EXPECTED_BLUR = '14px';
const EXPECTED_SAT = 'saturate(160%)';
const EXPECTED_SHADOW_LAYERS = [
  '0 1px 2px rgba(15, 23, 42, 0.04)',
  '0 8px 20px rgba(15, 23, 42, 0.06)',
  '0 24px 48px rgba(15, 23, 42, 0.05)'
];

const PAGES = [
  { name: 'patient-dashboard', url: '/frontend/pages/dashboard/patient.html', auth: 'patient' },
  { name: 'admin-dashboard', url: '/frontend/pages/admin/admin.html', auth: 'admin' },
  { name: 'appointment-list', url: '/frontend/pages/appointments/appointment-list.html', auth: 'patient' },
  { name: 'book-appointment', url: '/frontend/pages/appointments/book-appointment.html', auth: 'patient' }
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
        if (auth === 'admin') {
          localStorage.setItem('userType', 'admin');
          localStorage.setItem('adminLoggedIn', 'true');
          localStorage.setItem('adminToken', 'v-' + 'x'.repeat(64));
          sessionStorage.setItem('adminLoggedIn', 'true');
          sessionStorage.setItem('adminToken', 'v-' + 'x'.repeat(64));
        } else {
          localStorage.setItem('sahatak_user_id', 'test1');
          localStorage.setItem('sahatak_user_type', 'patient');
          localStorage.setItem('sahatak_user_email', 'test@example.com');
          localStorage.setItem('sahatak_user_name', 'Test Patient');
        }
        localStorage.setItem('dev_mode', 'true');
      } catch (e) {}
    }, pg.auth);

    const consoleErrors = [], pageErrors = [], failedRequests = [];
    const p = await context.newPage();
    p.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    p.on('pageerror', e => pageErrors.push(String(e)));
    p.on('requestfailed', r => failedRequests.push(r.url()));

    await p.goto('http://localhost:8742' + pg.url + '?dev=true', { waitUntil: 'load', timeout: 45000 });
    await p.waitForTimeout(4000);
    const finalUrl = p.url();

    const audited = await p.evaluate(() => {
      const norm = s => (s || '').replace(/\s+/g, ' ').trim();
      const sel = '.cg-glass';
      let cards = [...document.querySelectorAll(sel)];
      const cardInfo = cards.slice(0, 8).map(el => ({
        selector: el.className.toString().slice(0, 60),
        backdrop: norm(getComputedStyle(el).backdropFilter || 'none'),
        webkitBackdrop: norm(getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter') || getComputedStyle(el).webkitBackdropFilter || 'none'),
        shadow: norm(getComputedStyle(el).boxShadow)
      }));
      const icons = [...document.querySelectorAll('.bi, [class*="bi-"]')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none';
      });
      const firstIcon = document.querySelector('.bi, [class*="bi-"]');
      return {
        title: document.title, cardCount: cards.length, cards: cardInfo,
        fontFamily: firstIcon ? getComputedStyle(firstIcon).fontFamily : null,
        iconsTotal: document.querySelectorAll('.bi, [class*="bi-"]').length,
        iconsVisible: icons.length,
        fontsCheck: (() => { try { return document.fonts.check('16px "bootstrap-icons"', '\uf1de'); } catch (e) { return 'error'; } })(),
        iconGlyphsRendered: icons.filter(el => (getComputedStyle(el, '::before').fontFamily || '').includes('bootstrap-icons')).length
      };
    });

    const shot = path.join(OUT_DIR, pg.name + '.png');
    await p.screenshot({ path: shot, fullPage: true });

    const glassCards = audited.cards.filter(c => c.backdrop !== 'none');
    const blurOk = glassCards.length > 0 && glassCards.every(c =>
      c.backdrop.includes('blur(' + EXPECTED_BLUR + ')') && /saturate\(1\.6\)|saturate\(160%\)/.test(c.backdrop));
    const webkitOk = glassCards.every(c => c.webkitBackdrop.includes('blur(' + EXPECTED_BLUR + ')'));
    const shadowOk = glassCards.length > 0 && glassCards.every(c => {
      const layers = c.shadow.split(/,(?![^(]*\))/).map(s => s.trim());
      const hasColors = EXPECTED_SHADOW_LAYERS.every(exp => c.shadow.includes(exp.replace(/^.*rgba/, 'rgba')));
      const hasInset = /inset/.test(c.shadow);
      return hasColors && hasInset && layers.length >= 4;
    });
    const iconsOk = audited.iconsTotal > 0 && audited.iconsVisible > 0 &&
      audited.iconsVisible === audited.iconGlyphsRendered &&
      audited.fontsCheck === true;

    const envNoise = t => /net::|Failed to load resource|ERR_|pythonanywhere|jsdelivr|googleapis|fonts\.g|cdn|Failed to fetch|NetworkError|User not identified/i.test(t);
    const realConsoleErrors = consoleErrors.filter(t => !envNoise(t));
    const pageOk = pageErrors.length === 0 && realConsoleErrors.length === 0;
    const redirected = !finalUrl.includes(pg.url.split('/').pop());

    results.push({ page: pg.name, url: finalUrl, redirectedAway: redirected,
      consoleErrors: realConsoleErrors, envFetchErrors: failedRequests.length,
      uncaughtExceptions: pageErrors, glassOk: blurOk && webkitOk && shadowOk,
      blurOk, webkitOk, shadowOk, iconsOk, pageOk,
      details: audited, screenshot: shot });
    await context.close();
  }

  await browser.close();
  srv.close();
  fs.writeFileSync(path.join(__dirname, 'report.json'), JSON.stringify(results, null, 2));
  for (const r of results) {
    console.log('='.repeat(70));
    console.log('PAGE: ' + r.page + '  -> ' + (r.redirectedAway ? 'FAIL (redirected away)' : 'loaded ok'));
    console.log('  console errors (page-real): ' + r.consoleErrors.length + (r.consoleErrors.length ? '\n    ' + r.consoleErrors.join('\n    ') : ''));
    console.log('  uncaught exceptions: ' + r.uncaughtExceptions.length + (r.uncaughtExceptions.length ? ' :: ' + r.uncaughtExceptions.join(' :: ') : ''));
    console.log('  env fetch failures (CDN/backend, expected offline): ' + r.envFetchErrors);
    console.log('  GLASS: PASS=' + r.glassOk + ' (blur14=' + r.blurOk + ', webkit=' + r.webkitOk + ', 3layerShadow=' + r.shadowOk + ') cards=' + r.details.cardCount);
    r.details.cards.slice(0, 3).forEach(c => console.log('    [' + c.selector.slice(0, 35) + '] bf=' + c.backdrop + ' | sh=' + c.shadow.slice(0, 100)));
    console.log('  ICONS: PASS=' + r.iconsOk + ' total=' + r.details.iconsTotal + ' visible=' + r.details.iconsVisible + ' glyphs=' + r.details.iconGlyphsRendered + ' font=' + r.details.fontFamily + ' fonts.check=' + r.details.fontsCheck);
    console.log('  screenshot: ' + r.screenshot);
    console.log('  OVERALL: ' + (!r.redirectedAway && r.glassOk && r.iconsOk && r.pageOk ? 'PASS' : 'FAIL'));
  }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
