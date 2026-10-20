# 🎨 Chroma: Precision Color Wheel & Art-Theory Palette Studio

> **Chroma** is a professional web application for color theory and harmonic palette design, built from the ground up with strict **TypeScript** and modular architecture.
>
> It pairs a dual concentric HTML5 Canvas wheel operating at 60 FPS with the traditional **RYB** artistic color circle (Itten / Goethe), photopic luminance attenuation, 3D spherical projection kinematics for polar shade modulation, **WCAG 2.1 (AA / AAA)** accessibility contrast evaluation, physical subtractive paint mixing simulation, image palette extraction, built-in bilingual internationalization (**i18n**), and multi-format export.

---

## 🌟 Key Features

### 1. Dual Concentric Wheel at 60 FPS (Canvas 2D)
- **Continuous Outer RYB Ring:** 64 calibrated angular sectors rendered with subpixel overlap to eliminate dark seams and moiré artifacts.
- **Spectral Tuning (Photopic Luminance Attenuation):** Perceptual calibration that attenuates green, cyan, and blue anchors to prevent harsh or glaring tones, recreating the organic visual balance of fine art oil pigments.
- **Polar 2D Inner Dome:** Tridimensional gradient modulating saturation and lightness.
- **3D Spherical Kinematics:** The 5-variant cluster (Base, Tint, Bright, Shade, Tone) is projected orthographically from a 3D hemisphere rotated $45^\circ$ around $Z$, yielding organic curvature that hugs the dome's contour without clipping.
- **`↺ Reset Dome` Action:** Instantly resets the selector to the neutral center ($S=50\%$, $L=50\%$, contrast scale $= 1.0$).
- **Continuous Angular Spread ($5^\circ$ to $175^\circ$):** Smoothly transitions from tight adjacent hues to near-opposite angles while preventing geometric collapse at $0^\circ$ and $180^\circ$.

### 2. Classical Harmonic Schemes & Free-style Mode
- **Monochromatic:** 1 color family (or 2 with complementary toggle).
- **Adjacent / Analogous:** 3 color families (or 4 with complementary toggle).
- **Triad:** 3 equidistant color families (or 4 with complementary toggle).
- **Tetrad (4 colors):** 4 color families across two complementary $180^\circ$ axes on the RYB wheel.
- **Free-style Mode (Interlocking Gears):** Decouples rigid geometric constraints, allowing users to drag each color node independently to any degree. Returning to a harmonic mode smoothly restores classical rules.
- **"Add Complementary" Toggle:** Reactive switch that dynamically updates SVG button icons and adds an artistic complementary node (+180°).

### 3. Live Palette & Presets Catalog
- **"My Palette" Strip & 2x2 Quadrant Grid:** Up to 20 simultaneous swatches (Base, Tint, Bright, Shade, Tone for each active family) showing live HEX, RGB, and HSL values.
- **Synchronized Presets Tab:** Visual catalog (Default, Pastel, Shiny, Warm, Fresh, Dark, Pale, etc.) dynamically adapting to the active number of color families without internal scrollbars.
- **Live Fine Tune Panel:** Direct micro-adjustments (`[-10]`, `[-5]`, `[-1]`, `[+1]`, `[+5]`, `[+10]`) for Hue, Saturation, Lightness, and Contrast positioned directly beneath the wheel without background blur.

### 4. Accessibility & Vision Diagnostics
- **Color Combinations & Contrast Matrix:** Background-text combination matrix evaluated according to **WCAG 2.1** standards:
  - **AAA (Optimal, ratio $\ge 7.0:1$):** Highest accessibility standard for all users and lighting environments.
  - **AA (Standard, ratio $\ge 4.5:1$):** Minimum recommended web standard for standard body copy.
  - **Fail (Insufficient, ratio $< 4.5:1$):** Inadequate contrast for reading text.
- **Collapsible WCAG Guide & Multi-Criteria Filtering:** Expandable explanation accordion with interactive filter chips (`AAA`, `AA`, `Fail`, `All`) and real-time count badges.
- **Color Blindness Simulator:** Real-time simulation matrices for Protanopia (red-blind), Deuteranopia (green-blind), Tritanopia (blue-blind), and Achromatopsia (monochrome).

### 5. Advanced Creative Tools
- **🎨 Subtractive Paint Mixer (`paint_mixer.ts`):**
  - Physical mixing simulation using the trilinear Gossett & Chen unit cube.
  - Interactive tubes from the active palette plus classical Fine Arts pigments (*Cadmium Red*, *Cadmium Yellow*, *Ultramarine Blue*, *Titanium White*, *Carbon Black*).
  - Drop dispenser with live circular mixing well, wet surface sheen, and percentage recipe breakdown.
  - *"✨ Apply to Wheel"* button to set mixed paint directly as Chroma's primary hue.
- **🖼 Image Palette Extractor (`image_palette_extractor.ts`):**
  - Drag-and-drop support for PNG, JPG, WebP, and SVG images.
  - Client-side **Median Cut** color quantization executing in under 10 ms.
  - Color resolution selector (4, 6, or 8 dominant colors).
  - Automatic RYB harmony detection with one-click transfer to the color wheel.
- **🌐 Bilingual Internationalization (i18n):**
  - Instant reactive switching between Spanish (**ES**) and English (**EN**).
  - Built-in language persistence (`localStorage`) and browser preference detection.

### 6. Universal Export System & Permalinks
- **Direct File Downloads:**
  - Web Code: **HTML**, **CSS Variables**, **SCSS**, **LESS**, **XML**, **Plain Text (.txt)**.
  - Design Swatches: **Adobe Swatch Exchange (.ASE)** and **GIMP / Krita (.GPL)**.
- **Shareable Permalink (`🔗 Share`):**
  - Bidirectional URL hash encoding active mode, primary hue, spread distance, saturation, lightness, complementary state, contrast scale, and spectral tuning without requiring any server roundtrip.

---

## 🛠️ Tech Stack

- **Language:** TypeScript 5.5+ (Strict Mode)
- **Bundler & Dev Server:** Vite 5.4+
- **Graphics Engine:** HTML5 Canvas 2D API (60 FPS Reactive Render Loop)
- **Test Runner:** Vitest 1.6+
- **Styling:** Modular CSS3 with Native Custom Properties and CSS Grid / Flexbox
- **Zero Runtime Dependencies:** All math, color conversions, kinematics, and canvas rendering are 100% native.

---

## 🚀 Getting Started

```bash
# 1. Clone repository
git clone https://github.com/elbertv/Chroma.git
cd Chroma

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run test suite
npm test

# 5. Build optimized production bundle
npm run build
```

---

## 🧪 Testing & Verification

The project is backed by a comprehensive unit and integration test suite with **82 tests passing (100% pass rate)** across 14 test suites covering:
* Gossett & Chen RYB trilinear cube interpolation
* Angular hue mapping (RYB $\leftrightarrow$ sRGB)
* 3D spherical dome follower kinematics
* Color value objects and WCAG contrast algorithms
* Subtractive paint mixing physics
* Median Cut image quantization
* URL permalink state serialization
* Reactive i18n management and translation integrity

To run the tests:
```bash
npm test
```

---

## 📄 License & Attribution

This project is licensed under the MIT License.

*"Chroma implements photopic luminance attenuation on the RYB color wheel, inspired by the pioneering color harmony research of Petr Staníček (Paletton / Color Scheme Designer) and classical Itten color theory."*
