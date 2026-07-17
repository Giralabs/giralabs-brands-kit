# 🎨 Brand Kits & Resource Repository

Welcome to the multi-brand asset repository. This workspace serves as the central hub for our official brand assets, including logo marks, wordmarks, combination marks, and screenshots across multiple projects. 

Currently, this repository hosts the brand kits for:
1. **Giralabs** - The core brand kit with clean, modern assets.
2. **Mealty** - Provisional brand resources, application screenshots, and marketing assets.
3. **Bipsy** - The Bipsy brand kit with carbon and mint green elements.

All assets are structured by project, type, and format to ensure seamless integration across web, mobile, print, and social media platforms.

---

## 📁 Repository Structure

All brands follow a consistent file structure categorized by export formats:

```
giralabs-brand-kit/
├── 📁 Giralabs/
│   ├── 📁 PNG/                      # Original high-res PNG files (with transparency)
│   ├── 📁 WEBP/                     # Modern web-optimized WebP files
│   ├── 📁 JPG/                      # Compatibility-focused JPG files (with white background fallback)
│   └── 📁 AVIF/                     # Next-gen high compression AVIF files
│
├── 📁 Mealty - Provisional/
│   ├── 📁 WEBP/                     # Original WebP and screenshots
│   ├── 📁 PNG/                      # High-res PNG exports
│   ├── 📁 JPG/                      # JPG exports (ideal for compatibility / email clients)
│   └── 📁 AVIF/                     # Next-gen high compression AVIF exports
│
└── 📁 Bipsy/
    ├── 📁 PNG/                      # Original high-res PNG files (with transparency)
    ├── 📁 WEBP/                     # Modern web-optimized WebP files
    ├── 📁 JPG/                      # Compatibility-focused JPG files (with white background fallback)
    └── 📁 AVIF/                     # Next-gen high compression AVIF files
```

---

## 🎨 Giralabs Brand Specifications

### Color Palette

To ensure consistent brand representation across all media, use the following specifications extracted from our official assets:

| Color | HEX | RGB | Sample | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Apricot** | `#F0EFEA` | `rgb(240, 239, 234)` | `██████` | Light theme background / brand color |
| **Black** | `#000000` | `rgb(0, 0, 0)` | `██████` | Dark theme background / brand color |
| **Logo Pill Color** | `#DEDFD9` | `rgb(222, 223, 217)` | `██████` | Signature color of the logo pill/symbol |

### Typography

Our official brand typeface is **Gilroy**.
* **Main Font Family:** Gilroy
* **Headings & Accents:** Gilroy Bold
* **Body & Descriptions:** Gilroy Regular / Medium

### Giralabs Asset Catalog (by Format Directories)
Each format directory (`Giralabs/PNG/`, `Giralabs/WEBP/`, `Giralabs/JPG/`, `Giralabs/AVIF/`) contains:
* **`Brand Marks/`**: Standalone brand symbols (icon only) — e.g., `apricot_symbol`, `black_symbol` (with and without backgrounds).
* **`Combination Marks/`**: Combined symbol + wordmark logos in `horizontal` and `vertical` layouts.
* **`Social Media - Less Zoom/`**: Framed symbols optimized for avatars (extra padding to prevent clipping in circular crops).
* **`Wordmarks/`**: Standalone Giralabs typographic wordmarks.

---

## 🥗 Mealty Brand Specifications

### Color Palette

Extracted from Mealty's brand marks:

| Color | HEX | RGB | Sample | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Mealty Green** | `#4B9782` | `rgb(75, 151, 130)` | `██████` | Primary brand green color |
| **Warm Cream** | `#FFFAE5` | `rgb(255, 250, 229)` | `██████` | Secondary light background color |
| **Sandy Accent** | `#D9CA9B` | `rgb(217, 202, 155)` | `██████` | Accent highlight color |

### Mealty Asset Catalog (by Format Directories)
Each format directory (`Mealty - Provisional/WEBP/`, `Mealty - Provisional/PNG/`, `Mealty - Provisional/JPG/`, `Mealty - Provisional/AVIF/`) contains:
* **`Brand Marks/`**: Icon-only logos including `green_symbol` and `white_symbol` variants.
* **`Combination Marks/`**: Combined logos featuring `green` and `white` horizontal and vertical combinations.
* **`Wordmarks/`**: Wordmarks with background and transparent variants.
* **`Screenshots/`**: Interactive mockups and application screens (e.g., `allergies_screen`, `budget_screen`, `diets_screen`, `kitchen_screen`, `supermarkets_screen`, `lasts_steps_modal`).
---

## 🦄 Bipsy Brand Specifications

### Color Palette

Extracted from Bipsy's brand marks:

| Color | HEX | RGB | Sample | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Mint Green** | `#93DEAE` | `rgb(147, 222, 174)` | `██████` | Primary light brand color |
| **Carbon Black** | `#30353A` | `rgb(48, 53, 58)` | `██████` | Primary dark brand color / Dark theme |
| **Dark Charcoal** | `#2F343A` | `rgb(47, 52, 58)` | `██████` | Dark background accent color for light assets |

### Bipsy Asset Catalog (by Format Directories)
Each format directory (`Bipsy/PNG/`, `Bipsy/WEBP/`, `Bipsy/JPG/`, `Bipsy/AVIF/`) contains:
* **`Brand Marks/`**: Icon-only logos including `carbon_symbol` and `mint_symbol` variants (with and without backgrounds).
* **`Combination Marks/`**: Combined logos featuring `carbon` and `mint` horizontal and vertical combinations.
* **`Wordmarks/`**: Wordmarks with background and transparent variants.

---

## ⚡ Formats Cheat Sheet

Choose the right format for your use case:

| Format | Extension | Strengths | Ideal Use Case |
| :--- | :--- | :--- | :--- |
| **AVIF** | `.avif` | Best-in-class compression, preserves transparency. | Web and mobile frontend performance. |
| **WebP** | `.webp` | Modern standard, high compression, widely supported, supports transparency. | General web layouts and background graphics. |
| **PNG** | `.png` | Lossless quality, universal transparency support. | Print, design templates, and offline documents. |
| **JPG** | `.jpg` | Universal compatibility, no transparency. | Email templates, legacy browser fallbacks. |

---

## 🛠 Integration Snippets

### HTML (Modern Web Native Responsive Image)
Leverage HTML `<picture>` to automatically serve next-gen formats like **AVIF** and **WebP** with fallback to **PNG**:

```html
<picture>
  <source srcset="Giralabs/AVIF/Combination Marks/combinationmark_apricot_horizontal_nobackground.avif" type="image/avif">
  <source srcset="Giralabs/WEBP/Combination Marks/combinationmark_apricot_horizontal_nobackground.webp" type="image/webp">
  <img src="Giralabs/PNG/Combination Marks/combinationmark_apricot_horizontal_nobackground.png" alt="Giralabs Logo" width="300">
</picture>
```

### Markdown (READMEs)
To add a center-aligned logo in a GitHub README:

```markdown
<p align="center">
  <img src="Giralabs/PNG/Combination%20Marks/combinationmark_apricot_horizontal_nobackground.png" alt="Giralabs Logo" width="300" />
</p>
```

---

## 💡 Usage Guidelines & Best Practices

* **Transparency Check:** Use the `nobackground` files when placing logos on dark, light, or pattern backgrounds to avoid awkward boxes.
* **Social Media Layouts:** Always use the `Social Media - Less Zoom` files for profile photos on Discord, Twitter, and GitHub to ensure the margins aren't cut off by circular masking.
* **No Distortion:** When scaling images, always lock the aspect ratio (`width` and `height` proportional) to prevent stretching.
* **JPG Backgrounds:** Please note that since the JPG format does not support transparency, transparent files converted to JPG have a clean white background applied automatically.