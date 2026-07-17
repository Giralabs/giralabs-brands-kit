const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PNG } = require('pngjs');
const potrace = require('potrace');

const baseKitDir = 'c:/txData/FiveMBasicServerCFXDefault_08AE07.base/resources/giralabs-brand-kit';
const tempDir = path.join(baseKitDir, 'temp_processing');

// Create temp dir if not exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Brand specs (dominant colors for fallback, background matching, etc.)
const brandSpecs = {
  'Giralabs': {
    lightBg: '#F0EFEA',
    darkBg: '#000000',
    logoPill: '#DEDFD9',
    symbols: ['apricot_symbol_nobackground.png', 'black_symbol_nobackground.png']
  },
  'Bipsy': {
    carbon: '#30353A',
    mint: '#93DEAE',
    darkCharcoal: '#2F343A',
    symbols: ['carbon_symbol_nobackground.png', 'mint_symbol_nobackground.png']
  },
  'Mealty': {
    green: '#4B9782',
    cream: '#FFFAE5',
    sandy: '#D9CA9B',
    white: '#FFFFFF',
    symbols: ['green_symbol_nobackground.png', 'white_symbol_nobackground.png']
  }
};

// Euclidean distance in RGB space
function getColorDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// Helper to convert hex to RGB object
function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

// Parse PNG to find dominant foreground color and background color
function analyzePngColors(pngBuffer) {
  const png = PNG.sync.read(pngBuffer);
  const colorCounts = {};
  const bgColor = {
    r: png.data[0],
    g: png.data[1],
    b: png.data[2],
    a: png.data[3]
  };

  let maxCount = 0;
  let dominantColor = { r: 0, g: 0, b: 0 };

  for (let i = 0; i < png.data.length; i += 4) {
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const a = png.data[i + 3];

    // If pixel is semi-transparent, skip for dominant color
    if (a < 127) continue;

    // Check if it's the background color (if non-transparent)
    if (bgColor.a > 127 && getColorDistance({ r, g, b }, bgColor) < 15) {
      continue;
    }

    const key = `${r},${g},${b}`;
    colorCounts[key] = (colorCounts[key] || 0) + 1;

    if (colorCounts[key] > maxCount) {
      maxCount = colorCounts[key];
      dominantColor = { r, g, b };
    }
  }

  // If no dominant color found (e.g. completely transparent or solid color only)
  if (maxCount === 0) {
    if (bgColor.a > 127) {
      dominantColor = bgColor;
    } else {
      dominantColor = { r: 0, g: 0, b: 0 }; // fallback to black
    }
  }

  return {
    bgColor: bgColor.a > 127 ? bgColor : null,
    fgColor: dominantColor
  };
}

// Create a binary mask PNG (Black foreground, White background) for potrace
function createBinaryMask(pngBuffer, colors) {
  const png = PNG.sync.read(pngBuffer);
  const outPng = new PNG({ width: png.width, height: png.height });

  const bg = colors.bgColor;

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];

      let isForeground = false;
      if (bg) {
        // Solid background: foreground is significantly different from bg
        if (a > 127 && getColorDistance({ r, g, b }, bg) > 35) {
          isForeground = true;
        }
      } else {
        // Transparent background: foreground is opaque
        if (a > 127) {
          isForeground = true;
        }
      }

      const outIdx = (outPng.width * y + x) << 2;
      if (isForeground) {
        outPng.data[outIdx] = 0;       // Black
        outPng.data[outIdx + 1] = 0;
        outPng.data[outIdx + 2] = 0;
        outPng.data[outIdx + 3] = 255;
      } else {
        outPng.data[outIdx] = 255;     // White
        outPng.data[outIdx + 1] = 255;
        outPng.data[outIdx + 2] = 255;
        outPng.data[outIdx + 3] = 255;
      }
    }
  }

  return PNG.sync.write(outPng);
}

// Convert a binary mask to SVG using Potrace, then recolor it
function vectorize(maskBuffer, fgColorHex, bgColorHex) {
  return new Promise((resolve, reject) => {
    potrace.trace(maskBuffer, {
      color: fgColorHex,
      background: bgColorHex || 'transparent',
      threshold: 128
    }, (err, svg) => {
      if (err) return reject(err);
      resolve(svg);
    });
  });
}

// Run ImageMagick command helper
function runMagick(args) {
  try {
    execSync(`magick ${args}`, { stdio: 'ignore' });
  } catch (e) {
    console.error(`Failed executing: magick ${args}`);
    throw e;
  }
}

// Helper to ensure target folder exists and write file
function safeWriteFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

// Helper to ensure directory for path exists
function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function processFile(srcPath, brandName, category, filename) {
  console.log(`Processing [${brandName}] -> ${category}/${filename}...`);
  const pngBuffer = fs.readFileSync(srcPath);

  const isScreenshot = category === 'Screenshots';
  const nameWithoutExt = path.parse(filename).name;

  const brandDestDir = path.join(baseKitDir, brandName === 'Mealty - Provisional' ? 'Mealty' : brandName);

  // Format destination paths
  const pngPath = path.join(brandDestDir, 'PNG', category, `${nameWithoutExt}.png`);
  const webpPath = path.join(brandDestDir, 'WEBP', category, `${nameWithoutExt}.webp`);
  const jpgPath = path.join(brandDestDir, 'JPG', category, `${nameWithoutExt}.jpg`);
  const avifPath = path.join(brandDestDir, 'AVIF', category, `${nameWithoutExt}.avif`);
  const tiffPath = path.join(brandDestDir, 'TIFF', category, `${nameWithoutExt}.tiff`);

  // Write master PNG
  safeWriteFile(pngPath, pngBuffer);

  // Raster conversions
  ensureDirFor(webpPath);
  runMagick(`"${pngPath}" "${webpPath}"`);

  ensureDirFor(jpgPath);
  runMagick(`"${pngPath}" -background white -alpha remove -alpha off "${jpgPath}"`);

  ensureDirFor(avifPath);
  runMagick(`"${pngPath}" "${avifPath}"`);

  ensureDirFor(tiffPath);
  runMagick(`"${pngPath}" "${tiffPath}"`);

  // Vector formats (only if not a screenshot)
  if (!isScreenshot) {
    const colors = analyzePngColors(pngBuffer);
    const fgHex = '#' + ((1 << 24) + (colors.fgColor.r << 16) + (colors.fgColor.g << 8) + colors.fgColor.b).toString(16).slice(1);
    let bgHex = null;
    if (colors.bgColor) {
      bgHex = '#' + ((1 << 24) + (colors.bgColor.r << 16) + (colors.bgColor.g << 8) + colors.bgColor.b).toString(16).slice(1);
    }

    const maskBuffer = createBinaryMask(pngBuffer, colors);
    const tempMaskPath = path.join(tempDir, `mask_${nameWithoutExt}.png`);
    fs.writeFileSync(tempMaskPath, maskBuffer);

    const svgContent = await vectorize(maskBuffer, fgHex, bgHex);
    const svgPath = path.join(brandDestDir, 'SVG', category, `${nameWithoutExt}.svg`);
    safeWriteFile(svgPath, svgContent);

    const pdfPath = path.join(brandDestDir, 'PDF', category, `${nameWithoutExt}.pdf`);
    const epsPath = path.join(brandDestDir, 'EPS', category, `${nameWithoutExt}.eps`);
    const aiPath = path.join(brandDestDir, 'AI', category, `${nameWithoutExt}.ai`);

    // Convert SVG to PDF and EPS using ImageMagick
    ensureDirFor(pdfPath);
    runMagick(`"${svgPath}" "${pdfPath}"`);
    ensureDirFor(epsPath);
    runMagick(`"${svgPath}" "${epsPath}"`);
    
    // Copy to AI
    ensureDirFor(aiPath);
    fs.copyFileSync(pdfPath, aiPath);

    fs.unlinkSync(tempMaskPath);
  }

  // Resized Rasters (256, 512, 1024, 2048, 4096)
  const sizes = [256, 512, 1024, 2048, 4096];
  for (const size of sizes) {
    const rPng = path.join(brandDestDir, 'PNG', 'Resized', `${size}px`, category, `${nameWithoutExt}.png`);
    const rWebp = path.join(brandDestDir, 'WEBP', 'Resized', `${size}px`, category, `${nameWithoutExt}.webp`);
    const rJpg = path.join(brandDestDir, 'JPG', 'Resized', `${size}px`, category, `${nameWithoutExt}.jpg`);
    const rAvif = path.join(brandDestDir, 'AVIF', 'Resized', `${size}px`, category, `${nameWithoutExt}.avif`);
    const rTiff = path.join(brandDestDir, 'TIFF', 'Resized', `${size}px`, category, `${nameWithoutExt}.tiff`);

    // Resize PNG
    ensureDirFor(rPng);
    runMagick(`"${pngPath}" -resize ${size}x${size} "${rPng}"`);

    // Convert resized PNG to other formats
    ensureDirFor(rWebp);
    runMagick(`"${rPng}" "${rWebp}"`);

    ensureDirFor(rJpg);
    runMagick(`"${rPng}" -background white -alpha remove -alpha off "${rJpg}"`);

    ensureDirFor(rAvif);
    runMagick(`"${rPng}" "${rAvif}"`);

    ensureDirFor(rTiff);
    runMagick(`"${rPng}" "${rTiff}"`);
  }
}

async function processSymbolSystem(brandName, symbolFile, srcPath) {
  console.log(`Generating Symbol System for [${brandName}] -> ${symbolFile}...`);
  
  const brandDestDir = path.join(baseKitDir, brandName === 'Mealty - Provisional' ? 'Mealty' : brandName);
  const nameWithoutExt = path.parse(symbolFile).name;
  const masterPngPath = srcPath;

  // 1. Custom Resolutions (16x16 to 1024x1024)
  const resolutions = [16, 24, 32, 48, 64, 96, 128, 180, 192, 256, 512, 1024];

  for (const res of resolutions) {
    const pngPath = path.join(brandDestDir, 'PNG', 'System', 'Custom_Resolutions', nameWithoutExt, `${nameWithoutExt}_${res}x${res}.png`);
    const webpPath = path.join(brandDestDir, 'WEBP', 'System', 'Custom_Resolutions', nameWithoutExt, `${nameWithoutExt}_${res}x${res}.webp`);
    const jpgPath = path.join(brandDestDir, 'JPG', 'System', 'Custom_Resolutions', nameWithoutExt, `${nameWithoutExt}_${res}x${res}.jpg`);
    const avifPath = path.join(brandDestDir, 'AVIF', 'System', 'Custom_Resolutions', nameWithoutExt, `${nameWithoutExt}_${res}x${res}.avif`);
    const tiffPath = path.join(brandDestDir, 'TIFF', 'System', 'Custom_Resolutions', nameWithoutExt, `${nameWithoutExt}_${res}x${res}.tiff`);

    ensureDirFor(pngPath);
    runMagick(`"${masterPngPath}" -resize ${res}x${res}\! "${pngPath}"`);

    ensureDirFor(webpPath);
    runMagick(`"${pngPath}" "${webpPath}"`);

    ensureDirFor(jpgPath);
    runMagick(`"${pngPath}" -background white -alpha remove -alpha off "${jpgPath}"`);

    ensureDirFor(avifPath);
    runMagick(`"${pngPath}" "${avifPath}"`);

    ensureDirFor(tiffPath);
    runMagick(`"${pngPath}" "${tiffPath}"`);
  }

  // 2. Favicons (16x16, 32x32, 48x48)
  const favSizes = [16, 32, 48];
  
  // SVG favicon
  const colors = analyzePngColors(fs.readFileSync(masterPngPath));
  const fgHex = '#' + ((1 << 24) + (colors.fgColor.r << 16) + (colors.fgColor.g << 8) + colors.fgColor.b).toString(16).slice(1);
  let bgHex = null;
  if (colors.bgColor) {
    bgHex = '#' + ((1 << 24) + (colors.bgColor.r << 16) + (colors.bgColor.g << 8) + colors.bgColor.b).toString(16).slice(1);
  }
  const maskBuffer = createBinaryMask(fs.readFileSync(masterPngPath), colors);
  const svgContent = await vectorize(maskBuffer, fgHex, bgHex);
  const svgFavPath = path.join(brandDestDir, 'SVG', 'System', 'Favicons', nameWithoutExt, 'favicon.svg');
  safeWriteFile(svgFavPath, svgContent);

  // Multi-resolution ICO
  const temp16 = path.join(tempDir, 'favicon_16.png');
  const temp32 = path.join(tempDir, 'favicon_32.png');
  const temp48 = path.join(tempDir, 'favicon_48.png');
  runMagick(`"${masterPngPath}" -resize 16x16\! "${temp16}"`);
  runMagick(`"${masterPngPath}" -resize 32x32\! "${temp32}"`);
  runMagick(`"${masterPngPath}" -resize 48x48\! "${temp48}"`);
  
  const icoPath = path.join(brandDestDir, 'ICO', 'System', 'Favicons', nameWithoutExt, 'favicon.ico');
  ensureDirFor(icoPath);
  runMagick(`"${temp16}" "${temp32}" "${temp48}" "${icoPath}"`);

  // PNG favicons
  for (const s of favSizes) {
    const pngFavPath = path.join(brandDestDir, 'PNG', 'System', 'Favicons', nameWithoutExt, `favicon_${s}x${s}.png`);
    ensureDirFor(pngFavPath);
    fs.copyFileSync(path.join(tempDir, `favicon_${s}.png`), pngFavPath);
  }

  // Cleanup temp favicons
  fs.unlinkSync(temp16);
  fs.unlinkSync(temp32);
  fs.unlinkSync(temp48);

  // 3. App Icons (Mealty & Bipsy only, NOT Giralabs)
  const isGiralabs = brandName.toLowerCase().includes('giralabs');
  if (!isGiralabs) {
    const androidSizes = [48, 72, 96, 144, 192, 512];
    for (const size of androidSizes) {
      const iconPath = path.join(brandDestDir, 'PNG', 'System', 'App_Icons', nameWithoutExt, 'Android', `icon_${size}x${size}.png`);
      ensureDirFor(iconPath);
      runMagick(`"${masterPngPath}" -resize ${size}x${size}\! "${iconPath}"`);
    }

    const iosSizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];
    for (const size of iosSizes) {
      const filename = size === 1024 ? 'icon_1024x1024_appstore.png' : `icon_${size}x${size}.png`;
      const iconPath = path.join(brandDestDir, 'PNG', 'System', 'App_Icons', nameWithoutExt, 'iOS', filename);
      ensureDirFor(iconPath);
      runMagick(`"${masterPngPath}" -resize ${size}x${size}\! "${iconPath}"`);
    }
  }

  // 4. Profile Sizes (Giralabs ONLY)
  if (isGiralabs) {
    const profileSizes = [400, 800, 1024];
    for (const size of profileSizes) {
      const pngPath = path.join(brandDestDir, 'PNG', 'System', 'Social_Banners', nameWithoutExt, `profile_${size}x${size}.png`);
      const webpPath = path.join(brandDestDir, 'WEBP', 'System', 'Social_Banners', nameWithoutExt, `profile_${size}x${size}.webp`);
      const jpgPath = path.join(brandDestDir, 'JPG', 'System', 'Social_Banners', nameWithoutExt, `profile_${size}x${size}.jpg`);
      const avifPath = path.join(brandDestDir, 'AVIF', 'System', 'Social_Banners', nameWithoutExt, `profile_${size}x${size}.avif`);

      ensureDirFor(pngPath);
      runMagick(`"${masterPngPath}" -resize ${size}x${size}\! "${pngPath}"`);

      ensureDirFor(webpPath);
      runMagick(`"${pngPath}" "${webpPath}"`);

      ensureDirFor(jpgPath);
      runMagick(`"${pngPath}" -background white -alpha remove -alpha off "${jpgPath}"`);

      ensureDirFor(avifPath);
      runMagick(`"${pngPath}" "${avifPath}"`);
    }
  }

  // 5. Splash Screen App (Mealty & Bipsy only, NOT Giralabs)
  if (!isGiralabs) {
    let bgColors = [];
    if (brandName === 'Bipsy') {
      bgColors = [
        { name: 'dark_carbon', hex: brandSpecs.Bipsy.carbon },
        { name: 'light_mint', hex: brandSpecs.Bipsy.mint }
      ];
    } else {
      bgColors = [
        { name: 'light_cream', hex: brandSpecs.Mealty.cream },
        { name: 'brand_green', hex: brandSpecs.Mealty.green }
      ];
    }

    const splashConfigs = [
      { name: 'android_splash_1080x1920', w: 1080, h: 1920, iconScale: 320 },
      { name: 'iphone_splash_1290x2796', w: 1290, h: 2796, iconScale: 380 }
    ];

    for (const splash of splashConfigs) {
      for (const bg of bgColors) {
        const pngPath = path.join(brandDestDir, 'PNG', 'System', 'Splash_Screens', nameWithoutExt, `${splash.name}_${bg.name}.png`);
        const webpPath = path.join(brandDestDir, 'WEBP', 'System', 'Splash_Screens', nameWithoutExt, `${splash.name}_${bg.name}.webp`);
        const jpgPath = path.join(brandDestDir, 'JPG', 'System', 'Splash_Screens', nameWithoutExt, `${splash.name}_${bg.name}.jpg`);
        const avifPath = path.join(brandDestDir, 'AVIF', 'System', 'Splash_Screens', nameWithoutExt, `${splash.name}_${bg.name}.avif`);

        const tempIcon = path.join(tempDir, `temp_icon_${splash.name}.png`);
        runMagick(`"${masterPngPath}" -resize ${splash.iconScale}x${splash.iconScale} "${tempIcon}"`);

        ensureDirFor(pngPath);
        runMagick(`-size ${splash.w}x${splash.h} xc:${bg.hex} "${tempIcon}" -gravity center -composite "${pngPath}"`);

        ensureDirFor(webpPath);
        runMagick(`"${pngPath}" "${webpPath}"`);

        ensureDirFor(jpgPath);
        runMagick(`"${pngPath}" "${jpgPath}"`);

        ensureDirFor(avifPath);
        runMagick(`"${pngPath}" "${avifPath}"`);

        fs.unlinkSync(tempIcon);
      }
    }
  }
}

// Generate cropped social banners for Giralabs using the root giralabs_banner.png
function generateGiralabsSocialBanners() {
  const bannerSrc = path.join(baseKitDir, 'giralabs_banner.png');
  if (!fs.existsSync(bannerSrc)) {
    console.warn(`Source giralabs_banner.png not found at ${bannerSrc}`);
    return;
  }

  console.log('Generating cropped Giralabs social banners from giralabs_banner.png...');
  const brandDestDir = path.join(baseKitDir, 'Giralabs');

  const banners = [
    { name: 'banner_x', w: 1500, h: 500 },
    { name: 'banner_linkedin', w: 1128, h: 191 },
    { name: 'banner_facebook', w: 1640, h: 624 },
    { name: 'banner_youtube', w: 2560, h: 1440 },
    { name: 'banner_discord', w: 960, h: 540 },
    { name: 'banner_twitch', w: 1200, h: 480 }
  ];

  for (const banner of banners) {
    const pngPath = path.join(brandDestDir, 'PNG', 'Social Banners', `${banner.name}.png`);
    const webpPath = path.join(brandDestDir, 'WEBP', 'Social Banners', `${banner.name}.webp`);
    const jpgPath = path.join(brandDestDir, 'JPG', 'Social Banners', `${banner.name}.jpg`);
    const avifPath = path.join(brandDestDir, 'AVIF', 'Social Banners', `${banner.name}.avif`);

    // Crop to PNG
    ensureDirFor(pngPath);
    runMagick(`"${bannerSrc}" -resize ${banner.w}x${banner.h}^ -gravity center -crop ${banner.w}x${banner.h}+0+0 +repage "${pngPath}"`);

    // Convert to WEBP
    ensureDirFor(webpPath);
    runMagick(`"${pngPath}" "${webpPath}"`);

    // Convert to JPG
    ensureDirFor(jpgPath);
    runMagick(`"${pngPath}" -background white -alpha remove -alpha off "${jpgPath}"`);

    // Convert to AVIF
    ensureDirFor(avifPath);
    runMagick(`"${pngPath}" "${avifPath}"`);
  }
}

async function run() {
  const brands = ['Giralabs', 'Bipsy', 'Mealty - Provisional'];

  for (const brand of brands) {
    const brandPath = path.join(baseKitDir, brand);
    const pngPath = path.join(brandPath, 'PNG');
    if (!fs.existsSync(pngPath)) continue;

    const categories = fs.readdirSync(pngPath);
    for (const cat of categories) {
      const catPath = path.join(pngPath, cat);
      if (!fs.statSync(catPath).isDirectory()) continue;

      // Skip directories we generated previously if they are inside the source folder
      if (['Resized', 'System'].includes(cat)) continue;

      const files = fs.readdirSync(catPath).filter(f => f.toLowerCase().endsWith('.png'));
      for (const file of files) {
        const filePath = path.join(catPath, file);
        
        // A. Primary process: Generate format outputs and resized versions
        await processFile(filePath, brand, cat, file);

        // B. Symbol System processing: Favicons, App Icons, Custom resolutions, profiles
        const isSymbol = cat === 'Brand Marks' || cat === 'Social Media - Less Zoom';
        if (isSymbol) {
          await processSymbolSystem(brand, file, filePath);
        }
      }
    }
  }

  // Generate the new Giralabs social banners
  generateGiralabsSocialBanners();

  // Cleanup temp processing directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  // Cleanup legacy/old directories
  const outputBrands = ['Giralabs', 'Bipsy', 'Mealty'];
  for (const brand of outputBrands) {
    const brandPath = path.join(baseKitDir, brand);
    const oldDirs = ['Core_Master_Assets', 'Resized_Rasters', 'Symbol_System'];
    for (const oldDir of oldDirs) {
      const oldDirPath = path.join(brandPath, oldDir);
      if (fs.existsSync(oldDirPath)) {
        console.log(`Removing legacy directory: ${oldDirPath}`);
        fs.rmSync(oldDirPath, { recursive: true, force: true });
      }
    }
  }

  console.log('--- Brand kit generation fully completed! ---');
}

run().catch(console.error);
