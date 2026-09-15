const { chromium } = require('playwright-core');
const path = require('path');
const EXEC = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'ms-playwright', 'chromium-1228', 'chrome-win64', 'chrome.exe');
(async () => {
  const b = await chromium.launch({ executablePath: EXEC });
  const p = await (await b.newContext()).newPage();
  await p.setContent('<div style="-webkit-backdrop-filter: blur(9px); backdrop-filter: blur(9px)"></div>');
  const r = await p.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('div'));
    return { webkitProp: cs.getPropertyValue('-webkit-backdrop-filter'), webkitJs: cs.webkitBackdropFilter, std: cs.backdropFilter };
  });
  console.log(JSON.stringify(r));
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
