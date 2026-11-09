// node render-slides.js <page.html> <outDir> [id,id...]
// Every `.slide` of the page → an opaque PNG at its exact size, as the stores ask.
const puppeteer = require('puppeteer-core');
const { createRequire } = require('module');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Its own copy first; the web app's is the fallback for machines that installed it there.
let sharp;
try { sharp = require('sharp'); } catch { sharp = createRequire(path.resolve(__dirname, '../../bipsy-business-web-app/package.json'))('sharp'); }
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.css': 'text/css' };

(async () => {
  const [page_, outDir, only] = process.argv.slice(2);
  const server = http.createServer((req, res) => {
    const file = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await page.setViewport({ width: 1400, height: 3000, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/${page_}`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.evaluate(() => window.READY);
  // The window as big as the largest slide (the iPad ones are 2064 wide), so none is clipped.
  const max = await page.evaluate(() => [...document.querySelectorAll('.slide')].reduce(
    (m, s) => ({ w: Math.max(m.w, s.offsetWidth), h: Math.max(m.h, s.offsetHeight) }), { w: 0, h: 0 }));
  await page.setViewport({ width: Math.max(1400, max.w + 40), height: Math.max(3000, max.h + 40), deviceScaleFactor: 1 });
  const ids = only ? only.split(',') : await page.evaluate(() => window.IDS);
  const dir = path.join(__dirname, outDir);
  fs.mkdirSync(dir, { recursive: true });
  for (const id of ids) {
    const el = await page.$('#' + CSS_escape(id));
    const buf = await el.screenshot({ type: 'png' });
    const out = path.join(dir, `${id}.png`);
    await sharp(buf).flatten({ background: '#000' }).removeAlpha().png({ compressionLevel: 9 }).toFile(out);
    const m = await sharp(out).metadata();
    console.log(id, `${m.width}x${m.height}`, `alpha=${m.hasAlpha}`, `${Math.round(fs.statSync(out).size / 1024)} KB`);
  }
  await browser.close();
  server.close();
})();

function CSS_escape(s) { return s.replace(/[^a-zA-Z0-9_-]/g, '\\$&'); }
