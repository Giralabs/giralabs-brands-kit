# Giralabs Brand Kit

Welcome to the **Giralabs Brand Kit**. This repository serves as the central hub for Giralabs' official brand assets, including logo marks, wordmarks, and combination marks in high resolution.

---

## 🎨 Color Palette Specifications

To ensure consistent brand representation across all media, use the following hex and RGB values extracted from our official brand assets:

| Color | HEX | RGB | Sample | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Apricot** | `#F0EFEA` | `rgb(240, 239, 234)` | `██████` (Apricot) | Light theme background / brand color |
| **Black** | `#000000` | `rgb(0, 0, 0)` | `██████` (Black) | Dark theme background / brand color |
| **Logo Pill Color** | `#DEDFD9` | `rgb(222, 223, 217)` | `██████` (Logo Pill) | The signature color of the logo pill / symbol |

---

## 🔤 Typography

Our official brand typeface is **Gilroy**.

* **Main Font Family:** Gilroy
* **Headings & Accents:** Gilroy Bold
* **Body & Descriptions:** Gilroy Regular / Medium

---

## 📁 Repository Structure

The assets are divided into four primary folders based on layout and application:

```
giralabs-brand-kit/
├── 📁 Brand Marks/                 # Standalone brand symbols (icon only)
├── 📁 Combination Marks/           # Combined symbol + wordmark logos
├── 📁 Social Media - Less Zoom/    # Avatar-optimized symbols with wider margins
└── 📁 Wordmarks/                   # Standalone typography (wordmark only)
```

---

## 📐 Detailed Asset Catalog

### 1. Brand Marks (`Brand Marks/`)
These are standalone symbols (icon-only logos). Best suited for favicons, app icons, or contexts where the brand name "Giralabs" is already prominently displayed.

* **Format:** PNG
* **Resolution:** 2000 x 2000 px

| Asset / Link | Description | Logo Pill Color | Background / Theme |
| :--- | :--- | :--- | :--- |
| [apricot_symbol.png](Brand%20Marks/apricot_symbol.png) | Giralabs Symbol | Logo Pill Color (`#DEDFD9`) | Apricot (`#F0EFEA`) |
| [apricot_symbol_nobackground.png](Brand%20Marks/apricot_symbol_nobackground.png) | Giralabs Symbol | Logo Pill Color (`#DEDFD9`) | Transparent |
| [black_symbol.png](Brand%20Marks/black_symbol.png) | Giralabs Symbol | Logo Pill Color (`#DEDFD9`) | Black (`#000000`) |
| [black_symbol_nobackground.png](Brand%20Marks/black_symbol_nobackground.png) | Giralabs Symbol | Logo Pill Color (`#DEDFD9`) | Transparent |

---

### 2. Combination Marks (`Combination Marks/`)
These combine the symbol and the wordmark. Use the **Horizontal** layout for banners, headers, and navbars. Use the **Vertical** layout for center-aligned cards, poster designs, and print.

* **Format:** PNG

| Asset / Link | Layout | Resolution | Theme | Background |
| :--- | :--- | :--- | :--- | :--- |
| [combinationmark_apricot_horizontal.png](Combination%20Marks/combinationmark_apricot_horizontal.png) | Horizontal | 2000 x 1673 px | Apricot | Apricot (`#F0EFEA`) |
| [combinationmark_apricot_horizontal_nobackground.png](Combination%20Marks/combinationmark_apricot_horizontal_nobackground.png) | Horizontal | 2000 x 1104 px | Apricot | Transparent |
| [combinationmark_apricot_vertical.png](Combination%20Marks/combinationmark_apricot_vertical.png) | Vertical | 2000 x 2000 px | Apricot | Apricot (`#F0EFEA`) |
| [combinationmark_apricot_vertical_nobackground.png](Combination%20Marks/combinationmark_apricot_vertical_nobackground.png) | Vertical | 2000 x 2000 px | Apricot | Transparent |
| [combinationmark_black_horizontal.png](Combination%20Marks/combinationmark_black_horizontal.png) | Horizontal | 2000 x 2000 px | Black | Black (`#000000`) |
| [combinationmark_black_horizontal_nobackground.png](Combination%20Marks/combinationmark_black_horizontal_nobackground.png) | Horizontal | 2000 x 813 px | Black | Transparent |
| [combinationmark_black_vertical.png](Combination%20Marks/combinationmark_black_vertical.png) | Vertical | 2000 x 2000 px | Black | Black (`#000000`) |
| [combinationmark_black_vertical_nobackground.png](Combination%20Marks/combinationmark_black_vertical_nobackground.png) | Vertical | 2000 x 2000 px | Black | Transparent |

---

### 3. Wordmarks (`Wordmarks/`)
The stylized Giralabs typographic wordmark, set in Gilroy Bold. Ideal for clean, text-driven designs where the symbol isn't necessary.

* **Format:** PNG
* **Resolution:** 2000 x 2000 px

| Asset / Link | Typography Color | Background |
| :--- | :--- | :--- |
| [apricot_wordmark.png](Wordmarks/apricot_wordmark.png) | Logo Pill Color (`#DEDFD9`) | Apricot (`#F0EFEA`) |
| [apricot_wordmark_nobackground.png](Wordmarks/apricot_wordmark_nobackground.png) | Logo Pill Color (`#DEDFD9`) | Transparent |
| [black_wordmark.png](Wordmarks/black_wordmark.png) | Logo Pill Color (`#DEDFD9`) | Black (`#000000`) |
| [black_wordmark_nobackground.png](Wordmarks/black_wordmark_nobackground.png) | Logo Pill Color (`#DEDFD9`) | Transparent |

---

### 4. Social Media Profiles (`Social Media - Less Zoom/`)
Specifically framed symbols designed for profile images (Discord, Twitter, GitHub, Steam). These files include extra padding (less zoom) around the symbol to prevent its edges from being clipped by circular or square cropping masks.

* **Format:** PNG
* **Resolution:** 2000 x 2000 px

| Asset / Link | Theme | Background |
| :--- | :--- | :--- |
| [apricot_symbol.png](Social%20Media%20-%20Less%20Zoom/apricot_symbol.png) | Apricot | Apricot (`#F0EFEA`) |
| [black_symbol.png](Social%20Media%20-%20Less%20Zoom/black_symbol.png) | Black | Black (`#000000`) |

---

## 🛠 Integration Snippets

### HTML
To include the transparent horizontal logo on your website or dashboard:
```html
<a href="https://giralabs.com">
  <img src="path/to/combinationmark_apricot_horizontal_nobackground.png" alt="Giralabs Logo" width="200" height="110">
</a>
```

### Markdown (READMEs)
To center-align a logo in a GitHub README:
```markdown
<p align="center">
  <img src="Combination Marks/combinationmark_apricot_horizontal_nobackground.png" alt="Giralabs Logo" width="300" />
</p>
```

---

## 💡 Best Practices & Guidelines

* **Do** use the `nobackground` versions on colored cards or headers to let the surface background bleed through.
* **Do** use the **Social Media - Less Zoom** folder for profile pictures to ensure the logo is perfectly centered and visible.
* **Don't** stretch or compress the aspect ratio of the logos. Always scale them proportionally.
* **Don't** place the Apricot logos on pure white backgrounds; use the transparent or black variants to ensure sufficient contrast.