import type { TranslationDictionary } from '../types';

export const en: TranslationDictionary = {
  // Header
  'header.badge': 'RYB / RGB',
  'header.lang_es': 'ES',
  'header.lang_en': 'EN',

  // Harmony Modes (Tooltips)
  'mode.mono': 'Monochromatic',
  'mode.adjacent': 'Adjacent / Analogous',
  'mode.triad': 'Triad',
  'mode.tetrad': 'Tetrad (4-colors)',
  'mode.freeform': 'Free-style',

  // Dynamic Mode Display
  'mode_display.mono': 'Monochromatic (1-color)',
  'mode_display.mono_comp': 'Monochromatic (2-colors)',
  'mode_display.adjacent': 'Adjacent colors (3-colors)',
  'mode_display.adjacent_comp': 'Adjacent colors (4-colors)',
  'mode_display.triad': 'Triad (3-colors)',
  'mode_display.triad_comp': 'Triad (4-colors)',
  'mode_display.tetrad': 'Tetrad (4-colors)',
  'mode_display.freeform': 'Free-style (4-colors custom)',

  // Sidebar Controls
  'control.add_complementary': 'add complementary',
  'control.add_comp_title': 'Add artistic complementary color (+180° on RYB wheel)',
  'control.primary_hue': 'Primary Hue',
  'control.angular_distance': 'Angular Distance (Dist)',
  'control.base_color': 'Base Color (HEX / RGB)',
  'control.fine_tune_btn': 'Fine tune...',
  'control.fine_tune_title': 'Show or hide Fine Tune micro-adjustment panel',
  'control.tab_colors': 'COLORS',
  'control.tab_presets': 'PRESETS',
  'control.spectral_btn': 'Spectral Adjustment',
  'control.spectral_title': 'Spectral Adjustment: Photopic perceptual luminance calibration (no glaring tones) vs standard digital sRGB',

  // Embedded Fine Tune Panel
  'fine_tune.title': 'Palette Fine Tune (Live)',
  'fine_tune.close_title': 'Close Fine Tune panel',
  'fine_tune.hue': 'Hue',
  'fine_tune.saturation': 'Saturation',
  'fine_tune.brightness': 'Brightness',
  'fine_tune.contrast': 'Contrast',

  // Bottom Workspace Bar
  'footer_bar.my_palette': 'My Palette:',
  'footer_bar.reset_dome': 'Reset Dome',
  'footer_bar.reset_dome_title': 'Reset selector to dome center',
  'footer_bar.vision_label': '👁 Vision:',

  // Color Blindness Simulator
  'vision.normal': 'Normal',
  'vision.protanopia': 'Protanopia (Red-blind)',
  'vision.deuteranopia': 'Deuteranopia (Green-blind)',
  'vision.tritanopia': 'Tritanopia (Blue-blind)',
  'vision.achromatopsia': 'Achromatopsia (Monochrome)',

  // Action Buttons
  'action.share': '🔗 Share',
  'action.share_title': 'Copy permalink for this palette',
  'action.mixer': '🎨 Mixer',
  'action.mixer_title': 'Open physical subtractive paint mixer',
  'action.extractor': '🖼 Extractor',
  'action.extractor_title': 'Extract palette and harmonies from an image',
  'action.preview': 'Preview',
  'action.preview_title': 'View color combinations and WCAG accessibility',
  'action.examples': 'Examples...',
  'action.examples_title': 'View live UI design mockup',
  'action.export': 'Tables / Export...',
  'action.export_title': 'Download palette in HTML, CSS, LESS, SASS, XML, TXT, ASE or GPL',

  // Export Modal
  'export.title': 'Color tables & export',
  'export.close_title': 'Close export modal',
  'export.download_files': 'Download Files',
  'export.btn_text': 'Text (.txt)',
  'export.swatches': 'Swatch Palettes',

  // Preview & Contrast Modal
  'preview.title': 'Palette Preview & Color Combinations',
  'preview.close_title': 'Close preview modal',
  'preview.clusters_heading': 'Active Color Clusters & Swatches',
  'preview.contrast_heading': 'Color Combinations & Contrast Matrix (WCAG AA/AAA)',
  'preview.wcag_info_toggle': 'What is WCAG AA / AAA contrast?',
  'preview.wcag_intro': 'WCAG 2.1 (Web Content Accessibility Guidelines) measures the relative luminance ratio between text and its background color:',
  'preview.wcag_aaa_desc': 'Optimal accessibility. Readable for anyone, including people with low vision or under heavy screen reflections.',
  'preview.wcag_aa_desc': 'Minimum recommended web standard for regular text in applications and user interfaces.',
  'preview.wcag_fail_desc': 'Insufficient contrast. Text does not clearly stand out from the background, hindering readability.',
  'preview.filter_title': 'Filter combinations:',
  'preview.filter_all': 'All',
  'preview.filter_aaa': 'Pass AAA',
  'preview.filter_aa': 'Pass AA',
  'preview.filter_fail': 'Fail',
  'preview.sample_headline': 'Aa Bb 123',

  // Examples Modal
  'examples.title': 'Live Interface Preview',
  'examples.close_title': 'Close live preview',
  'examples.heading': 'Chroma Design System',
  'examples.btn_cta': 'Action CTA',
  'examples.card_title': 'Harmonious Component Card',
  'examples.card_desc': 'This is an interactive demonstration where colors computed in subtractive RYB color space are applied to real UI elements.',
  'examples.accent_box': 'Accent Box',

  // Paint Mixer Modal
  'mixer.title': '🎨 Subtractive Paint Mixer (Physical Paint Simulation)',
  'mixer.close_title': 'Close paint mixer',
  'mixer.tubes_header': 'Paint Tubes & Pigment Drops',
  'mixer.clear_well': '↺ Clear',
  'mixer.clear_well_title': 'Clear mixing well',
  'mixer.active_palette': 'Active Palette Pigments',
  'mixer.classic_paints': 'Fine Arts Tubes (RYB + B/W)',
  'mixer.well_title': 'Live Mixing Well',
  'mixer.total_drops': 'drops',
  'mixer.total_drop_single': 'drop',
  'mixer.recipe': 'Mix Composition',
  'mixer.empty_well': 'Add pigment drops using the (+) buttons to mix.',
  'mixer.apply_wheel': '✨ Apply as Base Color on Wheel',

  // Image Extractor Modal
  'extractor.title': '🖼 Image Palette & Harmony Extractor',
  'extractor.close_title': 'Close image extractor',
  'extractor.drag_drop_title': 'Drag an image here or',
  'extractor.click_select': 'click to browse',
  'extractor.drag_drop_sub': 'Supports PNG, JPG, WebP or SVG',
  'extractor.color_resolution': 'Number of colors:',
  'extractor.dominant_title': 'Quantized Dominant Colors',
  'extractor.empty_hint': 'Upload an image to extract its color palette.',
  'extractor.detected_badge': 'Detected RYB Harmony',
  'extractor.apply_harmony': '✨ Apply Harmony to Wheel',
  'extractor.mode_mono_name': 'Monochromatic',
  'extractor.mode_mono_desc': 'The dominant colors are concentrated in a closed tonal range within the same RYB quadrant.',
  'extractor.mode_adjacent_name': 'Adjacent / Analogous',
  'extractor.mode_adjacent_desc': 'The dominant colors form a smooth transition across an arc of up to 90° on the RYB wheel.',
  'extractor.mode_triad_name': 'Balanced Triad',
  'extractor.mode_triad_desc': 'The main tones are distributed across three equidistant poles (~120° on the traditional RYB circle).',
  'extractor.mode_tetrad_name': 'Tetrad / Double Complementary',
  'extractor.mode_tetrad_desc': 'The image exhibits high chromatic dynamism with opposing tones on complementary 180° axes.',
  'extractor.mode_freeform_name': 'Free-style',
  'extractor.mode_freeform_desc': 'Custom distribution without geometric axis constraints.',
  'extractor.suggested_hue': 'Suggested primary hue:',

  // Cluster Roles
  'cluster.primary': 'Primary',
  'cluster.secondary1': 'Secondary #1',
  'cluster.secondary2': 'Secondary #2',
  'cluster.complementary': 'Complementary',
  'cluster.tone': 'Tone #{index}',

  // Toast Notifications & Alerts
  'toast.link_copied': '🔗 Palette permalink copied to clipboard!',
  'toast.dome_reset': '↺ Dome selector reset to center',
  'toast.spectral_on': '✨ Spectral Adjustment Enabled: Photopic perceptual luminance calibration',
  'toast.spectral_off': '⚙️ Spectral Adjustment Disabled: Standard digital sRGB mode',
  'toast.mixed_applied': '✨ Mixed color applied as new base hue!',
  'toast.image_harmony_applied': '✨ {mode} harmony extracted from image applied to the wheel!',
  'toast.preset_applied': '✨ Preset applied: {name}',
  'toast.file_downloaded': '📥 Downloaded {filename}',
  'toast.well_cleared': 'Mixing well cleared',
  'toast.copied': 'Copied: {text}!',
  'toast.valid_image': 'Please upload a valid image file',

  // Footer
  'footer.created_by': 'Crafted with passion by',
  'footer.author_name': 'Elbert'
};
