// node render-reel.js <1|2|3> stills 1,3,5   → ig/stills/<name>/t*.jpg
// node render-reel.js <1|2|3> video          → ig/reels/<name>.mp4 (1080x1920, 30 fps, with sound)
//
// Audio: the Mixkit songs and effects of ../promo_v6/audio (see its CREDITOS_AUDIO.txt).
const puppeteer = require('puppeteer-core');
const { spawn, spawnSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FPS = 30;
const AUDIO = path.resolve(__dirname, '../promo_v6/audio');
const FX = {
  tap: ['sfx_1109.mp3', .4], chime: ['sfx_2867.mp3', .55], pop: ['sfx_2357.mp3', .45],
  confirm: ['sfx_951.mp3', .5], swoosh: ['sfx_1489.mp3', .3],
};
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp' };

(async () => {
  const [reel, mode, arg] = process.argv.slice(2);
  const server = http.createServer((req, res) => {
    const file = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/reels.html?r=${reel}`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.evaluate(() => window.READY);
  const { dur, meta } = await page.evaluate(() => ({ dur: window.DURATION, meta: window.META }));
  const shot = async (t) => {
    await page.evaluate((v) => window.render(v), t);
    return page.screenshot({ type: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  };

  if (mode === 'stills') {
    const dir = path.join(__dirname, 'ig', 'stills', meta.name);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    for (const t of arg.split(',').map(Number)) fs.writeFileSync(path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.jpg`), await shot(t));
  } else {
    const dir = path.join(__dirname, 'ig', 'reels');
    fs.mkdirSync(dir, { recursive: true });
    const silent = path.join(dir, `${meta.name}.silent.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-vf', 'scale=in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-profile:v', 'high', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(dur * FPS);
    for (let i = 0; i < n; i++) {
      const buf = await shot(i / FPS);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 90 === 0) console.log(`${meta.name} frame ${i}/${n}`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));

    // Song entering on its drop at the first cut, effects on their times.
    const inputs = ['-i', silent, '-i', path.join(AUDIO, meta.music)];
    const parts = [`[1:a]atrim=start=${(meta.drop - meta.dropAt).toFixed(2)},asetpts=PTS-STARTPTS,volume=0.62,afade=t=out:st=${(dur - 1.1).toFixed(2)}:d=1.1,atrim=end=${dur}[mus]`];
    const labels = ['[mus]'];
    meta.sfx.forEach(([t, kind], i) => {
      const [file, gain] = FX[kind];
      inputs.push('-i', path.join(AUDIO, file));
      const ms = Math.round(t * 1000);
      parts.push(`[${i + 2}:a]volume=${gain},adelay=${ms}|${ms}[f${i}]`);
      labels.push(`[f${i}]`);
    });
    parts.push(`${labels.join('')}amix=inputs=${labels.length}:duration=first:normalize=0,alimiter=limit=0.94[a]`);
    const out = path.join(dir, `${meta.name}.mp4`);
    const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', parts.join(';'), '-map', '0:v', '-map', '[a]',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-t', String(dur), '-movflags', '+faststart', out], { stdio: 'inherit' });
    if (r.status) throw new Error('audio mix failed');
    fs.unlinkSync(silent);
    console.log('ok', out, `${Math.round(fs.statSync(out).size / 1048576)} MB`);
  }
  await browser.close();
  server.close();
})();
