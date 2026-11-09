// node sheet.js <dir> <out.png> <cols> <tileW> [prefix] — contact sheet of a folder of PNG/JPG.
const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');
const sharp = createRequire(path.resolve(__dirname, '../../bipsy-business-web-app/package.json'))('sharp');
(async () => {
  const [dir, out, cols = '6', tw = '320', prefix = ''] = process.argv.slice(2);
  const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/.test(f) && f.startsWith(prefix)).sort();
  const m = await sharp(path.join(dir, files[0])).metadata();
  const w = +tw, h = Math.round((w * m.height) / m.width), pad = 10, c = +cols;
  const rows = Math.ceil(files.length / c);
  const comps = await Promise.all(files.map(async (f, i) => ({
    input: await sharp(path.join(dir, f)).resize(w, h).png().toBuffer(),
    left: pad + (i % c) * (w + pad), top: pad + Math.floor(i / c) * (h + pad),
  })));
  await sharp({ create: { width: pad + c * (w + pad), height: pad + rows * (h + pad), channels: 3, background: '#555' } }).composite(comps).png().toFile(out);
})();
