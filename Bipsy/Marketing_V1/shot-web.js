// node shot-web.js <route> <out.png> [light|dark] [width] — full page, scrolling so the lazy art and reveals fire.
const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async () => {
  const [route, out, scheme = 'dark', width = '1440'] = process.argv.slice(2);
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: +width, height: 1000, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  await page.goto('http://localhost:4311' + route, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(async () => {
    const h = () => document.documentElement.scrollHeight;
    for (let y = 0; y < h(); y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 220)); }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 900));
  });
  await page.screenshot({ path: out, fullPage: true });
  const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => i.getAttribute('src')));
  const slots = await page.evaluate(() => [...document.querySelectorAll('.slot__code')].map((s) => s.textContent.trim()));
  console.log(route, 'broken:', JSON.stringify(broken), 'placeholders:', JSON.stringify(slots));
  await browser.close();
})();
