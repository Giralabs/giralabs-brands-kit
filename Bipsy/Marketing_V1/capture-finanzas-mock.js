// Takes the drawn Finanzas screen of the site, in light, for MB-12 and the store art,
// until there is a real screenshot of it. Needs the dev server running and open.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.resolve(__dirname, '../../bipsy-business-web-app/design/shots/finanzas-mock.png');

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 3.35 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await page.goto('http://localhost:4311/funcionalidades/finanzas', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.ph__screen', { timeout: 30000 });
  await page.addStyleTag({ content: '.ph__island{display:none!important} .ph__screen{border-radius:0!important}' });
  await new Promise((r) => setTimeout(r, 3500));
  const el = await page.$('.ph__screen');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await el.screenshot({ path: OUT });
  await browser.close();
  console.log('ok', OUT);
})();
