// Prepares the material every piece uses:
//  * shots/<name>.png: the real screenshots, 945 x 2048, with a clean status bar
//    (9:41, full signal and battery). Nothing else in them is touched.
//  * assets/: brand marks and the mounted Bips, copied from the business web.
const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');

const WEB = path.resolve(__dirname, '../../bipsy-business-web-app');
const sharp = createRequire(path.join(WEB, 'package.json'))('sharp');
const SRC = path.resolve(__dirname, '../../recursos_capturas_bips');
const SHOTS = path.join(__dirname, 'shots');
const ASSETS = path.join(__dirname, 'assets');

/** Band of the screenshot that holds the status bar: nothing of the app is there. */
const BAR_H = 118;

const statusBar = (ink) => `<svg width="945" height="${BAR_H}" xmlns="http://www.w3.org/2000/svg">
  <text x="100" y="86" font-family="Segoe UI" font-weight="700" font-size="44" fill="${ink}">9:41</text>
  <g fill="${ink}">
    <rect x="678" y="74" width="10" height="14" rx="3"/><rect x="694" y="66" width="10" height="22" rx="3"/>
    <rect x="710" y="58" width="10" height="30" rx="3"/><rect x="726" y="50" width="10" height="38" rx="3"/>
  </g>
  <g fill="none" stroke="${ink}" stroke-linecap="round">
    <path d="M756 64 a30 30 0 0 1 40 0" stroke-width="7"/><path d="M765 74 a17 17 0 0 1 22 0" stroke-width="7"/>
  </g>
  <circle cx="776" cy="84" r="5" fill="${ink}"/>
  <rect x="812" y="53" width="60" height="33" rx="10" fill="none" stroke="${ink}" stroke-opacity=".45" stroke-width="3"/>
  <rect x="817" y="58" width="50" height="23" rx="6" fill="${ink}"/>
  <rect x="875" y="63" width="4" height="13" rx="2" fill="${ink}" fill-opacity=".5"/>
</svg>`;

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  fs.mkdirSync(ASSETS, { recursive: true });

  for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.jpeg'))) {
    const name = file.replace('.jpeg', '').replace('ñ', 'n').replace('agenta', 'agenda');
    const input = path.join(SRC, file);
    const { data } = await sharp(input).extract({ left: 8, top: 8, width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const background = { r: data[0], g: data[1], b: data[2] };
    const band = await sharp({ create: { width: 945, height: BAR_H, channels: 3, background } }).png().toBuffer();
    await sharp(input)
      .composite([{ input: band, top: 0, left: 0 }, { input: Buffer.from(statusBar('#15171A')), top: 0, left: 0 }])
      .png({ compressionLevel: 8 }).toFile(path.join(SHOTS, `${name}.png`));
    console.log('shot', name);
  }

  const copy = [
    ['public/assets_bipsy/Brand Marks/mint_symbol_nobackground_trim.webp', 'lotus-mint.webp'],
    ['public/assets_bipsy/Brand Marks/carbon_symbol_nobackground_trim.webp', 'lotus-carbon.webp'],
    ['public/assets_bipsy/Combination Marks/combinationmark_mint_horizontal_nobackground.webp', 'bipsy-mint.webp'],
    ['public/assets_bipsy/Combination Marks/combinationmark_carbon_horizontal_nobackground.webp', 'bipsy-carbon.webp'],
    ['public/assets_bipsy_business/Combination Marks/combinationmark_horizontal_dark_nobackground_trim.webp', 'biz-on-dark.webp'],
    ['public/assets_bipsy_business/Combination Marks/combinationmark_horizontal_light_nobackground_trim.webp', 'biz-on-light.webp'],
    ['public/assets_bipsy_business/Brand Marks/apricot_dark_symbol_nobackground_trim.webp', 'lotus-biz-dark.webp'],
    ['public/assets_bipsy_business/Brand Marks/apricot_light_symbol_nobackground_trim.webp', 'lotus-biz-light.webp'],
    ['public/icons/icon-192.webp', 'icon-biz.webp'],
  ];
  for (const [from, to] of copy) fs.copyFileSync(path.join(WEB, from), path.join(ASSETS, to));
  for (const c of ['BIP-01', 'BIP-02', 'MB-00', 'MB-02', 'MB-05', 'MB-06', 'MB-10', 'MB-11', 'MB-12', 'MB-13', 'MB-14']) {
    const png = path.join(WEB, 'design/mr_bip-png', `${c.toLowerCase()}.png`);
    if (fs.existsSync(png)) await sharp(png).resize(1400, 1400, { fit: 'inside' }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(ASSETS, `${c}.webp`));
    else console.log('missing', c);
  }
})();
