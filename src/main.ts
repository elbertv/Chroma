/**
 * Controlador Principal y Punto de Entrada de la Aplicación Chroma.
 *
 * Conecta los adaptadores de interfaz (Canvas WheelRenderer, barra lateral,
 * Fine Tune en vivo, catálogo de presets, cuadrantes y descargas directas)
 * con el motor de teoría del color.
 */

import { WheelRenderer, type WheelInteractionState } from './adapters/canvas/WheelRenderer';
import { Color } from './core/entities/Color';
import type { ColorCluster } from './core/entities/ColorCluster';
import {
  generateHarmonyPalette,
  type HarmonyPalette
} from './core/harmonies/harmony_calculator';
import {
  convertRgbHueToRybHue,
  convertRybHueToRgbHue,
  normalizeHueAngle
} from './core/math/ryb_hue_mapping';
import {
  TONE_PRESETS,
  type TonePresetDefinition
} from './core/presets/preset_catalog';
import type { HarmonyMode } from './core/types/color.types';
import {
  deserializeHashToPalette,
  serializePaletteToHash
} from './core/url/palette_url_serializer';
import {
  ARTIST_PIGMENTS,
  mixPhysicalPaint,
  type PigmentPortion
} from './core/mixing/paint_mixer';
import {
  extractPaletteFromPixels,
  samplePixelsFromImageData,
  type ImageExtractionResult
} from './core/extraction/image_palette_extractor';
import { i18n, t } from './core/i18n/i18n_manager';

// ============================================================================
// Referencias a Elementos del DOM
// ============================================================================
const canvasWheel = document.getElementById('chromaWheelCanvas') as HTMLCanvasElement;
const fineTuneBox = document.getElementById('fineTuneBox') as HTMLDivElement;
const btnToggleFineTune = document.getElementById('btnToggleFineTune') as HTMLButtonElement | null;
const btnCloseFineTune = document.getElementById('btnCloseFineTune') as HTMLButtonElement | null;
const presetsGridContainer = document.getElementById('presetsGridContainer') as HTMLDivElement;

const btnLangEs = document.getElementById('btnLangEs') as HTMLButtonElement | null;
const btnLangEn = document.getElementById('btnLangEn') as HTMLButtonElement | null;

const modeTitleDisplay = document.getElementById('modeTitleDisplay') as HTMLDivElement;
const toggleCompContainer = document.getElementById('toggleCompContainer') as HTMLLabelElement;
const toggleComplementary = document.getElementById('toggleComplementary') as HTMLInputElement;

const labelHueDegrees = document.getElementById('labelHueDegrees') as HTMLSpanElement;
const inputHueSlider = document.getElementById('inputHueSlider') as HTMLInputElement;
const distControlGroup = document.getElementById('distControlGroup') as HTMLDivElement;
const labelDistDegrees = document.getElementById('labelDistDegrees') as HTMLSpanElement;
const inputDistSlider = document.getElementById('inputDistSlider') as HTMLInputElement;
const inputBaseHex = document.getElementById('inputBaseHex') as HTMLInputElement;

const btnModeMono = document.getElementById('btnModeMono') as HTMLButtonElement;
const btnModeAdjacent = document.getElementById('btnModeAdjacent') as HTMLButtonElement;
const btnModeTriad = document.getElementById('btnModeTriad') as HTMLButtonElement;
const btnModeTetrad = document.getElementById('btnModeTetrad') as HTMLButtonElement;
const btnModeFreeform = document.getElementById('btnModeFreeform') as HTMLButtonElement;
const harmonyButtons: HTMLButtonElement[] = [
  btnModeMono,
  btnModeAdjacent,
  btnModeTriad,
  btnModeTetrad,
  btnModeFreeform
];

const monoDotGroup = document.getElementById('monoDotGroup') as unknown as SVGGElement | null;
const adjacentDotGroup = document.getElementById('adjacentDotGroup') as unknown as SVGGElement | null;
const triadDotGroup = document.getElementById('triadDotGroup') as unknown as SVGGElement | null;

const tabColors = document.getElementById('tabColors') as HTMLButtonElement;
const tabPresets = document.getElementById('tabPresets') as HTMLButtonElement;
const btnToggleSpectral = document.getElementById('btnToggleSpectral') as HTMLButtonElement | null;
const spectralStatusBadge = document.getElementById('spectralStatusBadge') as HTMLSpanElement | null;

const myPaletteStrip = document.getElementById('myPaletteStrip') as HTMLDivElement;
const quadrantGrid = document.getElementById('quadrantGrid') as HTMLDivElement;
const visionSimulationSelect = document.getElementById('visionSimulationSelect') as HTMLSelectElement;

// Modales
const modalExport = document.getElementById('modalExport') as HTMLDivElement;
const btnTablesExport = document.getElementById('btnTablesExport') as HTMLButtonElement;
const btnCloseExport = document.getElementById('btnCloseExport') as HTMLButtonElement;
const exportTablesList = document.getElementById('exportTablesList') as HTMLDivElement;

const btnPreview = document.getElementById('btnPreview') as HTMLButtonElement;
const modalPreview = document.getElementById('modalPreview') as HTMLDivElement;
const btnClosePreview = document.getElementById('btnClosePreview') as HTMLButtonElement;
const previewClustersContainer = document.getElementById('previewClustersContainer') as HTMLDivElement;
const previewCombinationsGrid = document.getElementById('previewCombinationsGrid') as HTMLDivElement;

const modalExamples = document.getElementById('modalExamples') as HTMLDivElement;
const btnExamples = document.getElementById('btnExamples') as HTMLButtonElement;
const btnCloseExamples = document.getElementById('btnCloseExamples') as HTMLButtonElement;
const exampleDemoContainer = document.getElementById('exampleDemoContainer') as HTMLDivElement;

const btnShareLink = document.getElementById('btnShareLink') as HTMLButtonElement | null;
const btnPaintMixer = document.getElementById('btnPaintMixer') as HTMLButtonElement | null;
const btnImageExtractor = document.getElementById('btnImageExtractor') as HTMLButtonElement | null;
const btnResetDome = document.getElementById('btnResetDome') as HTMLButtonElement | null;
const toastNotification = document.getElementById('toastNotification') as HTMLDivElement | null;

const modalMixer = document.getElementById('modalMixer') as HTMLDivElement | null;
const btnCloseMixer = document.getElementById('btnCloseMixer') as HTMLButtonElement | null;
const btnResetMixer = document.getElementById('btnResetMixer') as HTMLButtonElement | null;
const btnApplyMixToWheel = document.getElementById('btnApplyMixToWheel') as HTMLButtonElement | null;

const mixerPaletteTubesList = document.getElementById('mixerPaletteTubesList') as HTMLDivElement | null;
const mixerArtistTubesList = document.getElementById('mixerArtistTubesList') as HTMLDivElement | null;
const mixerWellDisplay = document.getElementById('mixerWellDisplay') as HTMLDivElement | null;
const mixerResultHex = document.getElementById('mixerResultHex') as HTMLDivElement | null;
const mixerResultRgb = document.getElementById('mixerResultRgb') as HTMLDivElement | null;
const mixerResultHsl = document.getElementById('mixerResultHsl') as HTMLDivElement | null;
const mixerTotalDrops = document.getElementById('mixerTotalDrops') as HTMLSpanElement | null;
const mixerRecipeBreakdown = document.getElementById('mixerRecipeBreakdown') as HTMLDivElement | null;

const modalExtractor = document.getElementById('modalExtractor') as HTMLDivElement | null;
const btnCloseExtractor = document.getElementById('btnCloseExtractor') as HTMLButtonElement | null;
const extractorDropZone = document.getElementById('extractorDropZone') as HTMLDivElement | null;
const inputExtractorFile = document.getElementById('inputExtractorFile') as HTMLInputElement | null;
const extractorPreviewImg = document.getElementById('extractorPreviewImg') as HTMLImageElement | null;
const extractorSwatchesContainer = document.getElementById('extractorSwatchesContainer') as HTMLDivElement | null;
const extractorHarmonyCard = document.getElementById('extractorHarmonyCard') as HTMLDivElement | null;
const extractorHarmonyModeName = document.getElementById('extractorHarmonyModeName') as HTMLSpanElement | null;
const extractorHarmonyExplanation = document.getElementById('extractorHarmonyExplanation') as HTMLParagraphElement | null;
const btnApplyExtractedToWheel = document.getElementById('btnApplyExtractedToWheel') as HTMLButtonElement | null;
const extractorCountButtons = document.querySelectorAll<HTMLButtonElement>('.extractor-count-btn');

let toastTimer: number | null = null;
/**
 * Muestra una notificación emergente toast sutil y auto-desvaneciente.
 */
function showToast(message: string, durationMs: number = 3000): void {
  if (!toastNotification) return;
  toastNotification.textContent = message;
  toastNotification.classList.add('show');
  if (toastTimer !== null) {
    window.clearTimeout(toastTimer);
  }
  toastTimer = window.setTimeout(() => {
    toastNotification.classList.remove('show');
    toastTimer = null;
  }, durationMs);
}

// ============================================================================
// Estado Reactivo de la Aplicación y Restauración desde URL Hash Permalink
// ============================================================================
let currentPalette: HarmonyPalette;

const parsedHashState = deserializeHashToPalette(window.location.hash);

const initialWheelState: WheelInteractionState = {
  primaryRybHue: 0.0,
  distanceAngle: 30.0,
  harmonyMode: 'tetrad',
  addComplementary: false,
  baseSaturation: 80.0,
  baseLightness: 50.0,
  contrastScale: 1.0,
  spectralCalibration: true,
  ...parsedHashState
};

// Sincronizar botón de modo de armonía activo inicial
harmonyButtons.forEach((b: HTMLButtonElement) => {
  if (b.dataset['mode'] === initialWheelState.harmonyMode) {
    b.classList.add('active');
  } else {
    b.classList.remove('active');
  }
});

// ============================================================================
// Inicialización del Adaptador Canvas WheelRenderer
// ============================================================================
const wheelRenderer = new WheelRenderer(
  canvasWheel,
  initialWheelState,
  (newState: WheelInteractionState) => {
    handleWheelStateChange(newState);
  }
);

/**
 * Maneja las actualizaciones reactivas emitidas a 60 FPS.
 *
 * Parameters
 * ----------
 * state : WheelInteractionState
 *     Nuevo estado emitido por la interacción del usuario.
 */
function handleWheelStateChange(state: WheelInteractionState): void {
  // 1. Recalcular la paleta cromática completa
  currentPalette = generateHarmonyPalette({
    primaryHue: state.primaryRybHue,
    isInputInRgb: false,
    mode: state.harmonyMode,
    addComplementary: state.addComplementary,
    distanceAngleInDegrees: state.distanceAngle,
    baseSaturationPercent: state.baseSaturation,
    baseLightnessPercent: state.baseLightness,
    spectralCalibration: state.spectralCalibration !== false,
    freeformRybAngles: state.freeformAngles,
    tuning: {
      saturationDelta: 0,
      brightnessDelta: 0,
      contrastScale: state.contrastScale
    }
  });

  // 2. Sincronizar título y toggle complementary
  updateModeHeaderAndToggle(state);

  // 3. Sincronizar inputs numéricos y sliders
  const digitalHue: number = convertRybHueToRgbHue(state.primaryRybHue);
  labelHueDegrees.textContent = `${Math.round(digitalHue)}° (RYB ${Math.round(state.primaryRybHue)}°)`;
  inputHueSlider.value = String(Math.round(digitalHue));

  labelDistDegrees.textContent = `${Math.round(state.distanceAngle)}°`;
  inputDistSlider.value = String(Math.round(state.distanceAngle));

  const primaryBaseColor: Color | undefined = currentPalette.clusters[0]?.base;
  if (primaryBaseColor && document.activeElement !== inputBaseHex) {
    inputBaseHex.value = primaryBaseColor.toHex();
  }

  // 4. Actualizar vistas de previsualización
  renderMyPaletteStrip(currentPalette);
  renderQuadrantGrid(currentPalette);

  // Si la pestaña de presets está visible, refrescarla en vivo
  if (presetsGridContainer.style.display !== 'none') {
    renderPresetsGrid();
  }

  // 5. Actualizar URL Hash Permalink sin recargar página
  const newHash: string = serializePaletteToHash(state);
  if (window.location.hash !== newHash) {
    window.history.replaceState(null, '', newHash);
  }
}

/**
 * Actualiza el encabezado del modo y la visibilidad del toggle 'add complementary'.
 */
function updateModeHeaderAndToggle(state: WheelInteractionState): void {
  const isComp: boolean = state.addComplementary;
  distControlGroup.style.display =
    state.harmonyMode === 'adjacent' || state.harmonyMode === 'tetrad'
      ? 'flex'
      : 'none';

  switch (state.harmonyMode) {
    case 'monochromatic':
      toggleCompContainer.style.display = 'flex';
      modeTitleDisplay.textContent = isComp
        ? t('mode_display.mono_comp')
        : t('mode_display.mono');
      break;

    case 'adjacent':
      toggleCompContainer.style.display = 'flex';
      modeTitleDisplay.textContent = isComp
        ? t('mode_display.adjacent_comp')
        : t('mode_display.adjacent');
      break;

    case 'triad':
      toggleCompContainer.style.display = 'flex';
      modeTitleDisplay.textContent = isComp
        ? t('mode_display.triad_comp')
        : t('mode_display.triad');
      break;

    case 'tetrad':
      toggleCompContainer.style.display = 'none';
      modeTitleDisplay.textContent = t('mode_display.tetrad');
      break;

    case 'freeform':
      toggleCompContainer.style.display = 'none';
      distControlGroup.style.display = 'none';
      modeTitleDisplay.textContent = t('mode_display.freeform');
      break;
  }

  toggleComplementary.checked = isComp;
  updateHarmonyIconsSvg(state.addComplementary);
}

/**
 * Actualiza dinámicamente los gráficos SVG de los botones según el toggle 'add complementary'
 * (referencias ref_img/015.png a ref_img/018.png).
 */
function updateHarmonyIconsSvg(addComp: boolean): void {
  if (!monoDotGroup || !adjacentDotGroup || !triadDotGroup) {
    return;
  }
  // 1. Icono Monocromático: 1 punto vs 2 puntos opuestos
  if (addComp) {
    monoDotGroup.innerHTML = `
      <polygon points="19.2,10.5 20.8,10.5 20,16.5" fill="currentColor"/>
      <circle cx="20" cy="8.5" r="2.4" fill="currentColor"/>
      <g transform="rotate(180 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16.5" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.4" fill="currentColor"/>
      </g>
    `;
  } else {
    monoDotGroup.innerHTML = `
      <polygon points="19.2,10.5 20.8,10.5 20,16.5" fill="currentColor"/>
      <circle cx="20" cy="8.5" r="2.4" fill="currentColor"/>
    `;
  }

  // 2. Icono Adyacente: 3 puntos superiores vs 4 puntos (+1 inferior como en 015.png)
  if (addComp) {
    adjacentDotGroup.innerHTML = `
      <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
      <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      <g transform="rotate(-32 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
      <g transform="rotate(32 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
      <g transform="rotate(180 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
    `;
  } else {
    adjacentDotGroup.innerHTML = `
      <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
      <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      <g transform="rotate(-32 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
      <g transform="rotate(32 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
    `;
  }

  // 3. Icono Tríada: 3 puntos simétricos vs 4 puntos (+1 inferior como en 018.png)
  if (addComp) {
    triadDotGroup.innerHTML = `
      <g transform="rotate(0 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
      <g transform="rotate(120 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
      <g transform="rotate(240 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
      <g transform="rotate(180 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
    `;
  } else {
    triadDotGroup.innerHTML = `
      <g transform="rotate(0 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
      <g transform="rotate(120 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
      <g transform="rotate(240 20 20)">
        <polygon points="19.2,10.5 20.8,10.5 20,16" fill="currentColor"/>
        <circle cx="20" cy="8.5" r="2.2" fill="currentColor"/>
      </g>
    `;
  }
}

/**
 * Renderiza la tira superior compacta "My Palette".
 */
function renderMyPaletteStrip(palette: HarmonyPalette): void {
  myPaletteStrip.innerHTML = '';
  myPaletteStrip.style.gridTemplateColumns = `repeat(${palette.clusters.length}, 1fr)`;

  palette.clusters.forEach((cluster: ColorCluster) => {
    const clusterDiv: HTMLDivElement = document.createElement('div');
    clusterDiv.className = 'my-palette-cluster';

    cluster.toArray().forEach((color: Color) => {
      const miniSwatch: HTMLDivElement = document.createElement('div');
      miniSwatch.className = 'my-palette-mini-swatch';
      miniSwatch.style.backgroundColor = applyVisionFilter(color.toHex());
      miniSwatch.title = `Copiar ${color.toHex()}`;
      miniSwatch.addEventListener('click', () => copyToClipboard(color.toHex()));
      clusterDiv.appendChild(miniSwatch);
    });

    myPaletteStrip.appendChild(clusterDiv);
  });
}

/**
 * Renderiza el tablero interactivo de cuadrantes.
 */
function renderQuadrantGrid(palette: HarmonyPalette): void {
  quadrantGrid.innerHTML = '';
  const rowLabels: string[] = [
    t('cluster.primary'),
    t('cluster.secondary1'),
    t('cluster.secondary2'),
    t('cluster.complementary')
  ];

  // Ajustar grid según la cantidad de clusters
  if (palette.clusters.length === 1) {
    quadrantGrid.style.gridTemplateColumns = '1fr';
    quadrantGrid.style.gridTemplateRows = '1fr';
  } else if (palette.clusters.length === 2) {
    quadrantGrid.style.gridTemplateColumns = '1fr 1fr';
    quadrantGrid.style.gridTemplateRows = '1fr';
  } else {
    quadrantGrid.style.gridTemplateColumns = '1fr 1fr';
    quadrantGrid.style.gridTemplateRows = '1fr 1fr';
  }

  palette.clusters.forEach((cluster: ColorCluster, index: number) => {
    const cell: HTMLDivElement = document.createElement('div');
    cell.className = 'quadrant-cell';
    cell.style.backgroundColor = applyVisionFilter(cluster.base.toHex());

    const variantsStrip: HTMLDivElement = document.createElement('div');
    variantsStrip.className = 'quadrant-variants-strip';

    const otherVariants: Color[] = [cluster.tint, cluster.bright, cluster.shade, cluster.tone];
    otherVariants.forEach((variantColor: Color) => {
      const vBox: HTMLDivElement = document.createElement('div');
      vBox.className = 'quadrant-variant-box';
      vBox.style.backgroundColor = applyVisionFilter(variantColor.toHex());
      vBox.title = `${variantColor.toHex()} (${variantColor.toRgbFormatString()})`;
      vBox.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        copyToClipboard(variantColor.toHex());
      });
      variantsStrip.appendChild(vBox);
    });

    const hexLabel: HTMLDivElement = document.createElement('div');
    hexLabel.className = 'quadrant-hex-label';
    hexLabel.textContent = `${rowLabels[index] ?? t('cluster.tone', { index: index + 1 })}: ${cluster.base.toHex()}`;

    cell.appendChild(variantsStrip);
    cell.appendChild(hexLabel);

    cell.addEventListener('click', () => copyToClipboard(cluster.base.toHex()));
    quadrantGrid.appendChild(cell);
  });
}

function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).then(() => {
    const feedback: HTMLDivElement = document.createElement('div');
    feedback.textContent = t('toast.copied', { text });
    feedback.style.position = 'fixed';
    feedback.style.bottom = '24px';
    feedback.style.right = '24px';
    feedback.style.backgroundColor = 'var(--accent-gold)';
    feedback.style.color = '#000000';
    feedback.style.padding = '8px 16px';
    feedback.style.borderRadius = '4px';
    feedback.style.fontWeight = '700';
    feedback.style.zIndex = '9999';
    feedback.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 1500);
  });
}

function applyVisionFilter(hex: string): string {
  const mode: string = visionSimulationSelect.value;
  if (mode === 'normal') {
    return hex;
  }
  const color = Color.fromHex(hex);
  if (mode === 'achromatopsia') {
    const grey = Math.round(0.299 * color.red + 0.587 * color.green + 0.114 * color.blue);
    return `rgb(${grey}, ${grey}, ${grey})`;
  }
  if (mode === 'protanopia') {
    const simR = Math.round(0.56667 * color.red + 0.43333 * color.green);
    return `rgb(${simR}, ${simR}, ${color.blue})`;
  }
  if (mode === 'deuteranopia') {
    const simG = Math.round(0.625 * color.red + 0.375 * color.green);
    return `rgb(${simG}, ${simG}, ${color.blue})`;
  }
  if (mode === 'tritanopia') {
    const simB = Math.round(0.95 * color.green + 0.05 * color.blue);
    return `rgb(${color.red}, ${simB}, ${simB})`;
  }
  return hex;
}

// ============================================================================
// Event Listeners: Modos de Armonía
// ============================================================================
harmonyButtons.forEach((btn: HTMLButtonElement) => {
  btn.addEventListener('click', () => {
    harmonyButtons.forEach((b: HTMLButtonElement) => b.classList.remove('active'));
    btn.classList.add('active');

    const selectedMode = btn.dataset['mode'] as HarmonyMode;
    const currentState: WheelInteractionState = wheelRenderer.getState();

    if (selectedMode === 'freeform') {
      // 3. Al seleccionar Free-style, siempre queda inicialmente en tetrad
      // y los puntos se pueden mover arbitrariamente en cualquier dirección
      const h: number = currentState.primaryRybHue;
      const d: number = currentState.distanceAngle;
      const initialFreeformAngles: number[] = [
        h,
        normalizeHueAngle(h + d),
        normalizeHueAngle(h + 180.0),
        normalizeHueAngle(h + 180.0 + d)
      ];
      wheelRenderer.updateState({
        harmonyMode: 'freeform',
        freeformAngles: initialFreeformAngles
      });
    } else {
      // 3. Al seleccionar tetrad o cualquier otro modo, se eliminan los ángulos libres
      // y vuelven las restricciones de movimiento propias del modo armónico según el color base
      wheelRenderer.updateState({
        harmonyMode: selectedMode,
        freeformAngles: undefined
      });
    }

    handleWheelStateChange(wheelRenderer.getState());
  });
});

// Event Listener para 'add complementary'
toggleComplementary.addEventListener('change', () => {
  wheelRenderer.updateState({ addComplementary: toggleComplementary.checked });
  handleWheelStateChange(wheelRenderer.getState());
});

// ============================================================================
// Event Listeners: Fine Tune Toggle y Botón Cerrar (X)
// ============================================================================
/**
 * Alterna la visibilidad del panel integrado Fine Tune sin desenfoque de fondo.
 */
function setFineTuneVisible(visible: boolean): void {
  if (visible) {
    fineTuneBox.classList.remove('hidden');
    btnToggleFineTune?.classList.add('active');
  } else {
    fineTuneBox.classList.add('hidden');
    btnToggleFineTune?.classList.remove('active');
  }
}

btnToggleFineTune?.addEventListener('click', () => {
  const isHidden: boolean = fineTuneBox.classList.contains('hidden');
  setFineTuneVisible(isHidden);
});

btnCloseFineTune?.addEventListener('click', () => {
  setFineTuneVisible(false);
});

// Event Listener: Compartir Enlace Permanente (Punto 4.4)
btnShareLink?.addEventListener('click', () => {
  const currentUrl: string = window.location.href;
  copyToClipboard(currentUrl);
  showToast(t('toast.link_copied'));
});

// Event Listener: Restablecer Selector al Centro del Domo (Saturación y Luminosidad al 50%)
btnResetDome?.addEventListener('click', () => {
  wheelRenderer.updateState({
    baseSaturation: 50.0,
    baseLightness: 50.0,
    contrastScale: 1.0
  });
  handleWheelStateChange(wheelRenderer.getState());
  showToast(t('toast.dome_reset'));
});

// Event Listeners: Sliders e Inputs
inputHueSlider.addEventListener('input', () => {
  const digitalHue: number = parseFloat(inputHueSlider.value);
  const rybHue: number = convertRgbHueToRybHue(digitalHue);
  wheelRenderer.updateState({ primaryRybHue: rybHue });
  handleWheelStateChange(wheelRenderer.getState());
});

inputDistSlider.addEventListener('input', () => {
  const dist: number = parseFloat(inputDistSlider.value);
  wheelRenderer.updateState({ distanceAngle: dist });
  handleWheelStateChange(wheelRenderer.getState());
});

inputBaseHex.addEventListener('change', () => {
  const hexVal: string = inputBaseHex.value.trim();
  const color = Color.fromHex(hexVal);
  const hsl = color.toHsl();
  const rybHue: number = convertRgbHueToRybHue(hsl.hue);

  wheelRenderer.updateState({
    primaryRybHue: rybHue,
    baseSaturation: hsl.saturation,
    baseLightness: hsl.lightness
  });
  handleWheelStateChange(wheelRenderer.getState());
});

// ============================================================================
// Event Listeners: Pestañas COLORS y PRESETS (ref_img/011 a 014)
// ============================================================================
tabColors.addEventListener('click', () => {
  tabColors.classList.add('active');
  tabPresets.classList.remove('active');
  if (btnToggleFineTune?.classList.contains('active')) {
    fineTuneBox.classList.remove('hidden');
  } else {
    fineTuneBox.classList.add('hidden');
  }
  canvasWheel.style.display = 'block';
  presetsGridContainer.style.display = 'none';
});

tabPresets.addEventListener('click', () => {
  tabPresets.classList.add('active');
  tabColors.classList.remove('active');
  fineTuneBox.classList.add('hidden');
  canvasWheel.style.display = 'none';
  presetsGridContainer.style.display = 'grid';
  renderPresetsGrid();
});

// ============================================================================
// Event Listener: Toggle Ajuste Espectral (Atenuación fotópica de luminancia)
// ============================================================================
function updateSpectralButtonUI(isActive: boolean): void {
  if (btnToggleSpectral && spectralStatusBadge) {
    btnToggleSpectral.classList.toggle('active', isActive);
    spectralStatusBadge.classList.toggle('active', isActive);
    spectralStatusBadge.textContent = isActive ? 'ON' : 'OFF';
  }
}

// Sincronización inicial del botón según el estado
updateSpectralButtonUI(wheelRenderer.getState().spectralCalibration !== false);

btnToggleSpectral?.addEventListener('click', () => {
  const currentState: WheelInteractionState = wheelRenderer.getState();
  const nextVal: boolean = !(currentState.spectralCalibration !== false);
  wheelRenderer.updateState({ spectralCalibration: nextVal });
  updateSpectralButtonUI(nextVal);
  handleWheelStateChange(wheelRenderer.getState());

  if (nextVal) {
    showToast(t('toast.spectral_on'));
  } else {
    showToast(t('toast.spectral_off'));
  }
});

/**
 * Renderiza el catálogo completo de presets mostrando todos los colores
 * del esquema armónico activo (ref_img/011.png - ref_img/014.png).
 */
function renderPresetsGrid(): void {
  presetsGridContainer.innerHTML = '';
  const currentState: WheelInteractionState = wheelRenderer.getState();

  TONE_PRESETS.forEach((preset: TonePresetDefinition) => {
    const card: HTMLDivElement = document.createElement('div');
    card.className = 'preset-card';

    const title: HTMLDivElement = document.createElement('div');
    title.className = 'preset-name';
    title.textContent = preset.name;

    const strip: HTMLDivElement = document.createElement('div');
    strip.className = 'preset-swatches-strip';

    // Generar la paleta con la armonía actual y el tuning de este preset
    const samplePalette: HarmonyPalette = generateHarmonyPalette({
      primaryHue: currentState.primaryRybHue,
      isInputInRgb: false,
      mode: currentState.harmonyMode,
      addComplementary: currentState.addComplementary,
      distanceAngleInDegrees: currentState.distanceAngle,
      baseSaturationPercent: currentState.baseSaturation,
      baseLightnessPercent: currentState.baseLightness,
      spectralCalibration: currentState.spectralCalibration !== false,
      freeformRybAngles: currentState.freeformAngles,
      tuning: preset.tuning
    });

    samplePalette.clusters.forEach((cluster: ColorCluster) => {
      const clusterGroup: HTMLDivElement = document.createElement('div');
      clusterGroup.className = 'preset-cluster-group';

      if (samplePalette.clusters.length === 1) {
        // En Monocromático, mostrar las 5 variantes del cluster (como en ref_img/011.png)
        cluster.toArray().forEach((variantColor: Color) => {
          const swatch: HTMLDivElement = document.createElement('div');
          swatch.className = 'preset-swatch-item';
          swatch.style.backgroundColor = variantColor.toHex();
          clusterGroup.appendChild(swatch);
        });
      } else {
        // En esquemas de 2, 3 o 4 colores, mostrar el color base de cada familia (como en 012-014.png)
        const swatch: HTMLDivElement = document.createElement('div');
        swatch.className = 'preset-swatch-item';
        swatch.style.backgroundColor = cluster.base.toHex();
        clusterGroup.appendChild(swatch);
      }

      strip.appendChild(clusterGroup);
    });

    card.appendChild(title);
    card.appendChild(strip);

    card.addEventListener('click', () => {
      wheelRenderer.updateState({
        contrastScale: preset.tuning.contrastScale,
        baseSaturation: Math.min(100, Math.max(0, currentState.baseSaturation + preset.tuning.saturationDelta)),
        baseLightness: Math.min(100, Math.max(0, currentState.baseLightness + preset.tuning.brightnessDelta))
      });
      handleWheelStateChange(wheelRenderer.getState());
      tabColors.click();
    });

    presetsGridContainer.appendChild(card);
  });
}

// ============================================================================
// Fine Tune Integrado (Punto 1: SIN BLUR, AJUSTE EN VIVO)
// ============================================================================
document.querySelectorAll('.fine-tune-step-btn').forEach((buttonElement) => {
  const btn = buttonElement as HTMLButtonElement;
  btn.addEventListener('click', () => {
    const dimension: string | undefined = btn.dataset['dim'];
    const stepValue: number = parseFloat(btn.dataset['val'] ?? '0');
    const currentState: WheelInteractionState = wheelRenderer.getState();

    if (dimension === 'hue') {
      const newHue: number = normalizeHueAngle(currentState.primaryRybHue + stepValue);
      wheelRenderer.updateState({ primaryRybHue: newHue });
    } else if (dimension === 'sat') {
      const newSat: number = Math.min(100, Math.max(0, currentState.baseSaturation + stepValue));
      wheelRenderer.updateState({ baseSaturation: newSat });
    } else if (dimension === 'bright') {
      const newLight: number = Math.min(100, Math.max(0, currentState.baseLightness + stepValue));
      wheelRenderer.updateState({ baseLightness: newLight });
    } else if (dimension === 'contrast') {
      const newScale: number = Math.min(2.0, Math.max(0.2, currentState.contrastScale + stepValue * 0.05));
      wheelRenderer.updateState({ contrastScale: newScale });
    }

    handleWheelStateChange(wheelRenderer.getState());
  });
});

// ============================================================================
// Modal de Exportación (Punto 5: DESCARGAS DIRECTAS SIN TEXTAREA)
// ============================================================================
btnTablesExport.addEventListener('click', () => {
  modalExport.classList.add('open');
  renderExportTables(currentPalette);
});

btnCloseExport.addEventListener('click', () => {
  modalExport.classList.remove('open');
});

function renderExportTables(palette: HarmonyPalette): void {
  exportTablesList.innerHTML = '';
  const rowNames: string[] = [
    t('cluster.primary'),
    t('cluster.secondary1'),
    t('cluster.secondary2'),
    t('cluster.complementary')
  ];

  palette.clusters.forEach((cluster: ColorCluster, rowIndex: number) => {
    const rowDiv: HTMLDivElement = document.createElement('div');
    rowDiv.className = 'export-row-item';

    const title: HTMLDivElement = document.createElement('div');
    title.className = 'export-row-title';
    title.textContent = rowNames[rowIndex] ?? t('cluster.tone', { index: rowIndex + 1 });

    const variantsStrip: HTMLDivElement = document.createElement('div');
    variantsStrip.className = 'export-variants-strip';

    cluster.toArray().forEach((c: Color) => {
      const block: HTMLDivElement = document.createElement('div');
      block.className = 'export-variant-block';
      block.style.backgroundColor = c.toHex();
      block.innerHTML = `
        <div>${c.toHex()}</div>
        <div style="font-size:0.65rem; opacity:0.85;">RGB: ${c.toRgbFormatString()}</div>
        <div style="font-size:0.65rem; opacity:0.85;">RGB: ${c.toRgbPercentFormatString()}</div>
      `;
      block.addEventListener('click', () => copyToClipboard(c.toHex()));
      variantsStrip.appendChild(block);
    });

    rowDiv.appendChild(title);
    rowDiv.appendChild(variantsStrip);
    exportTablesList.appendChild(rowDiv);
  });
}

// Botones de Descarga Directa
document.querySelectorAll('.export-download-btn[data-download]').forEach((btnElement) => {
  const btn = btnElement as HTMLButtonElement;
  btn.addEventListener('click', () => {
    const format = btn.dataset['download'] ?? 'css';
    triggerDirectDownload(format);
  });
});

/**
 * Genera el archivo correspondiente y ejecuta la descarga inmediata.
 */
function triggerDirectDownload(format: string): void {
  const clusters = currentPalette.clusters;
  const clusterNames = ['primary', 'secondary-1', 'secondary-2', 'complement'];
  const variantNames = ['tint', 'bright', 'base', 'shade', 'tone'];

  if (format === 'html') {
    let htmlContent = '<!DOCTYPE html><html><head><title>Chroma Palette</title></head><body>\n<h1>Chroma Palette</h1>\n';
    clusters.forEach((cluster, cIdx) => {
      htmlContent += `<h3>${clusterNames[cIdx]}</h3><div style="display:flex; gap:8px;">\n`;
      cluster.toArray().forEach((c) => {
        htmlContent += `<div style="background:${c.toHex()}; color:#fff; padding:10px; border-radius:4px;">${c.toHex()}</div>\n`;
      });
      htmlContent += '</div>\n';
    });
    htmlContent += '</body></html>';
    downloadBlob(htmlContent, 'chroma_palette.html', 'text/html');
  } else if (format === 'css') {
    let cssContent = '/* Chroma Generated CSS Variables */\n:root {\n';
    clusters.forEach((cluster, cIdx) => {
      const cName = clusterNames[cIdx] ?? `color-${cIdx + 1}`;
      cluster.toArray().forEach((c, vIdx) => {
        const vName = variantNames[vIdx] ?? `var-${vIdx + 1}`;
        cssContent += `  --color-${cName}-${vName}: ${c.toHex()};\n`;
      });
    });
    cssContent += '}\n';
    downloadBlob(cssContent, 'chroma_palette.css', 'text/css');
  } else if (format === 'sass') {
    let sassContent = '// Chroma Generated SASS Variables\n';
    clusters.forEach((cluster, cIdx) => {
      const cName = clusterNames[cIdx] ?? `color-${cIdx + 1}`;
      cluster.toArray().forEach((c, vIdx) => {
        const vName = variantNames[vIdx] ?? `var-${vIdx + 1}`;
        sassContent += `$color-${cName}-${vName}: ${c.toHex()};\n`;
      });
    });
    downloadBlob(sassContent, 'chroma_palette.scss', 'text/x-scss');
  } else if (format === 'less') {
    let lessContent = '// Chroma Generated LESS Variables\n';
    clusters.forEach((cluster, cIdx) => {
      const cName = clusterNames[cIdx] ?? `color-${cIdx + 1}`;
      cluster.toArray().forEach((c, vIdx) => {
        const vName = variantNames[vIdx] ?? `var-${vIdx + 1}`;
        lessContent += `@color-${cName}-${vName}: ${c.toHex()};\n`;
      });
    });
    downloadBlob(lessContent, 'chroma_palette.less', 'text/less');
  } else if (format === 'xml') {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<palette mode="' + currentPalette.mode + '">\n';
    clusters.forEach((cluster, cIdx) => {
      const cName = clusterNames[cIdx] ?? `color_${cIdx + 1}`;
      xmlContent += `  <cluster name="${cName}">\n`;
      cluster.toArray().forEach((c, vIdx) => {
        const vName = variantNames[vIdx] ?? `variant_${vIdx + 1}`;
        xmlContent += `    <color name="${vName}" hex="${c.toHex()}" rgb="${c.toRgbFormatString()}" />\n`;
      });
      xmlContent += '  </cluster>\n';
    });
    xmlContent += '</palette>';
    downloadBlob(xmlContent, 'chroma_palette.xml', 'application/xml');
  } else if (format === 'text') {
    let textContent = `CHROMA PALETTE (${currentPalette.mode.toUpperCase()})\n\n`;
    clusters.forEach((cluster, cIdx) => {
      const cName = clusterNames[cIdx] ?? `Color #${cIdx + 1}`;
      textContent += `[${cName.toUpperCase()}]\n`;
      cluster.toArray().forEach((c, vIdx) => {
        const vName = variantNames[vIdx] ?? `Variant ${vIdx + 1}`;
        textContent += `  ${vName.padEnd(8)}: ${c.toHex()} (RGB: ${c.toRgbFormatString()})\n`;
      });
      textContent += '\n';
    });
    downloadBlob(textContent, 'chroma_palette.txt', 'text/plain');
  } else if (format === 'gpl') {
    let gplContent = 'GIMP Palette\nName: Chroma Palette\nColumns: 5\n#\n';
    clusters.forEach((cluster, cIdx) => {
      cluster.toArray().forEach((c, vIdx) => {
        gplContent += `${String(c.red).padStart(3)} ${String(c.green).padStart(3)} ${String(c.blue).padStart(3)} Color_${cIdx + 1}_Var_${vIdx + 1}\n`;
      });
    });
    downloadBlob(gplContent, 'chroma_palette.gpl', 'text/plain');
  } else if (format === 'ase') {
    const jsonAse = JSON.stringify(
      {
        format: 'Adobe Swatch Exchange JSON Specification',
        palette: currentPalette.mode,
        colors: clusters.flatMap((cluster) =>
          cluster.toArray().map((c) => ({ hex: c.toHex(), rgb: c.toByteRgb() }))
        )
      },
      null,
      2
    );
    downloadBlob(jsonAse, 'chroma_palette_ase.json', 'application/json');
  }
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url: string = URL.createObjectURL(blob);
  const a: HTMLAnchorElement = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// Modal Preview (Palette Preview & Color Combinations WCAG)
// ============================================================================
const countWcagAAA = document.getElementById('countWcagAAA') as HTMLSpanElement | null;
const countWcagAA = document.getElementById('countWcagAA') as HTMLSpanElement | null;
const countWcagFail = document.getElementById('countWcagFail') as HTMLSpanElement | null;
const btnWcagFilterAll = document.getElementById('btnWcagFilterAll') as HTMLButtonElement | null;
const wcagFilterButtons = document.querySelectorAll<HTMLButtonElement>('.wcag-filter-btn');

/**
 * Estado activo de los filtros de combinación de color por nivel WCAG.
 */
const contrastLevelFilters = {
  aaa: true,
  aa: true,
  fail: true
};

wcagFilterButtons.forEach((btn: HTMLButtonElement) => {
  btn.addEventListener('click', () => {
    const filterKey = btn.dataset.filter as 'aaa' | 'aa' | 'fail' | undefined;
    if (!filterKey) return;
    contrastLevelFilters[filterKey] = !contrastLevelFilters[filterKey];
    btn.classList.toggle('active', contrastLevelFilters[filterKey]);
    applyContrastFilters();
  });
});

btnWcagFilterAll?.addEventListener('click', () => {
  contrastLevelFilters.aaa = true;
  contrastLevelFilters.aa = true;
  contrastLevelFilters.fail = true;
  wcagFilterButtons.forEach((btn: HTMLButtonElement) => btn.classList.add('active'));
  applyContrastFilters();
});

function applyContrastFilters(): void {
  const cards = previewCombinationsGrid.querySelectorAll<HTMLDivElement>('.combination-card');
  cards.forEach((card: HTMLDivElement) => {
    const level = card.dataset.level as 'aaa' | 'aa' | 'fail' | undefined;
    if (level && contrastLevelFilters[level]) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

btnPreview.addEventListener('click', () => {
  modalPreview.classList.add('open');
  renderPreviewModal();
});

btnClosePreview.addEventListener('click', () => {
  modalPreview.classList.remove('open');
});

/**
 * Calcula la luminancia relativa según la especificación WCAG 2.1.
 */
function getRelativeLuminance(red: number, green: number, blue: number): number {
  const [sR, sG, sB] = [red, green, blue].map((val: number) => {
    const s = val / 255.0;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sR! + 0.7152 * sG! + 0.0722 * sB!;
}

/**
 * Calcula el ratio de contraste entre dos colores (1.0 a 21.0).
 */
function calculateContrastRatio(colorA: Color, colorB: Color): number {
  const lumA: number = getRelativeLuminance(colorA.red, colorA.green, colorA.blue);
  const lumB: number = getRelativeLuminance(colorB.red, colorB.green, colorB.blue);
  const l1: number = Math.max(lumA, lumB);
  const l2: number = Math.min(lumA, lumB);
  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Renderiza el modal de previsualización completa y combinaciones de contraste.
 */
function renderPreviewModal(): void {
  previewClustersContainer.innerHTML = '';
  previewCombinationsGrid.innerHTML = '';

  const clusterLabels: string[] = [
    t('cluster.primary'),
    t('cluster.secondary1'),
    t('cluster.secondary2'),
    t('cluster.complementary')
  ];
  const clusters: readonly ColorCluster[] = currentPalette.clusters;

  // 1. Render de clusters tonales
  clusters.forEach((cluster: ColorCluster, cIdx: number) => {
    const card: HTMLDivElement = document.createElement('div');
    card.className = 'preview-cluster-card';

    const title: HTMLDivElement = document.createElement('div');
    title.className = 'preview-cluster-title';
    title.textContent = clusterLabels[cIdx] ?? t('cluster.tone', { index: cIdx + 1 });

    const swatchesStrip: HTMLDivElement = document.createElement('div');
    swatchesStrip.className = 'preview-cluster-swatches';

    cluster.toArray().forEach((color: Color) => {
      const sBox: HTMLDivElement = document.createElement('div');
      sBox.className = 'preview-swatch-box';
      sBox.style.backgroundColor = applyVisionFilter(color.toHex());
      sBox.title = `${color.toHex()} (${color.toRgbFormatString()}) - Click para copiar`;
      sBox.addEventListener('click', () => copyToClipboard(color.toHex()));
      swatchesStrip.appendChild(sBox);
    });

    card.appendChild(title);
    card.appendChild(swatchesStrip);
    previewClustersContainer.appendChild(card);
  });

  // 2. Render de matriz de combinaciones de contraste
  const baseColors: Color[] = clusters.map((c) => c.base);
  const allVariants: Color[] = clusters.flatMap((c) => [c.tint, c.shade, c.bright]);

  let countAAA: number = 0;
  let countAA: number = 0;
  let countFail: number = 0;

  baseColors.forEach((bgCol: Color) => {
    allVariants.forEach((textCol: Color) => {
      // Filtrar combinaciones de fondo y texto demasiado similares
      if (bgCol.toHex() === textCol.toHex()) {
        return;
      }

      const ratio: number = calculateContrastRatio(bgCol, textCol);
      let badgeClass = 'fail';
      let badgeLabel = 'Fail';
      if (ratio >= 7.0) {
        badgeClass = 'aaa';
        badgeLabel = 'AAA';
        countAAA++;
      } else if (ratio >= 4.5) {
        badgeClass = 'aa';
        badgeLabel = 'AA';
        countAA++;
      } else {
        countFail++;
      }

      const comboCard: HTMLDivElement = document.createElement('div');
      comboCard.className = 'combination-card';
      comboCard.dataset.level = badgeLabel.toLowerCase();
      comboCard.style.backgroundColor = applyVisionFilter(bgCol.toHex());
      comboCard.style.color = applyVisionFilter(textCol.toHex());

      // Aplicar filtro de visibilidad según estado
      const isVisible = contrastLevelFilters[badgeLabel.toLowerCase() as 'aaa' | 'aa' | 'fail'];
      comboCard.style.display = isVisible ? 'flex' : 'none';

      comboCard.innerHTML = `
        <div>
          <div class="combination-text-sample">Aa Bb 123</div>
          <div class="combination-subtext">BG: ${bgCol.toHex()} | Text: ${textCol.toHex()}</div>
        </div>
        <div class="combination-badges">
          <span style="font-family: monospace;">${ratio.toFixed(1)}:1</span>
          <span class="badge-wcag ${badgeClass}">${badgeLabel}</span>
        </div>
      `;

      comboCard.addEventListener('click', () => {
        copyToClipboard(`/* Contrast ${ratio.toFixed(1)}:1 (${badgeLabel}) */\nbackground-color: ${bgCol.toHex()};\ncolor: ${textCol.toHex()};`);
      });

      previewCombinationsGrid.appendChild(comboCard);
    });
  });

  // Actualizar contadores en la barra de filtros
  if (countWcagAAA) countWcagAAA.textContent = String(countAAA);
  if (countWcagAA) countWcagAA.textContent = String(countAA);
  if (countWcagFail) countWcagFail.textContent = String(countFail);
}

// ============================================================================
// Modal Examples...
// ============================================================================
btnExamples.addEventListener('click', () => {
  modalExamples.classList.add('open');
  renderLiveExample();
});

btnCloseExamples.addEventListener('click', () => {
  modalExamples.classList.remove('open');
});

function renderLiveExample(): void {
  const primary = currentPalette.clusters[0]?.base.toHex() ?? '#AA3939';
  const primaryLight = currentPalette.clusters[0]?.tint.toHex() ?? '#FFAAAA';
  const secondary = currentPalette.clusters[1]?.base.toHex() ?? '#3978AA';
  const complement = currentPalette.clusters[2]?.base.toHex() ?? '#39AA54';

  exampleDemoContainer.innerHTML = `
    <div style="background-color: #1f1f1f; padding: 24px; border-radius: 8px; border: 1px solid var(--border-color);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${primary}; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: ${primary}; font-size: 1.3rem;">${t('examples.heading')}</h2>
        <button style="background-color: ${primary}; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 700; cursor: pointer;">${t('examples.btn_cta')}</button>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
        <div style="background-color: #2b2b2b; padding: 18px; border-radius: 6px; border-left: 4px solid ${complement};">
          <h3 style="color: ${primaryLight}; margin-bottom: 8px;">${t('examples.card_title')}</h3>
          <p style="color: #cccccc; font-size: 0.9rem; line-height: 1.5;">
            ${t('examples.card_desc')}
          </p>
        </div>

        <div style="background-color: ${secondary}; color: #ffffff; padding: 18px; border-radius: 6px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
          <h4 style="margin-bottom: 6px;">${t('examples.accent_box')}</h4>
          <span style="font-size: 0.8rem; opacity: 0.9;">${secondary}</span>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// Modal Paint Mixer (Simulador de Mezcla Física Sustractiva de Pintura)
// ============================================================================
interface MixerTubeItem {
  id: string;
  name: string;
  color: Color;
  parts: number;
}

let mixerTubes: MixerTubeItem[] = [];
let currentMixedPaintColor: Color = Color.fromHex('#FFFFFF');

btnPaintMixer?.addEventListener('click', () => {
  modalMixer?.classList.add('open');
  initAndRenderMixer();
});

btnCloseMixer?.addEventListener('click', () => {
  modalMixer?.classList.remove('open');
});

btnResetMixer?.addEventListener('click', () => {
  mixerTubes.forEach((tube) => {
    tube.parts = 0;
  });
  renderMixerTubes();
  updateMixerCalculation();
  showToast(t('toast.well_cleared'));
});

btnApplyMixToWheel?.addEventListener('click', () => {
  if (!currentMixedPaintColor) return;
  const hsl = currentMixedPaintColor.toHsl();
  const rybHue = convertRgbHueToRybHue(hsl.hue);
  wheelRenderer.updateState({
    primaryRybHue: rybHue,
    baseSaturation: hsl.saturation,
    baseLightness: hsl.lightness
  });
  handleWheelStateChange(wheelRenderer.getState());
  modalMixer?.classList.remove('open');
  showToast(t('toast.mixed_applied'));
});

function initAndRenderMixer(): void {
  // Preservar partes si ya existen tubos, o inicializar
  const previousParts = new Map<string, number>();
  mixerTubes.forEach((t) => previousParts.set(t.id, t.parts));

  const newTubes: MixerTubeItem[] = [];

  // 1. Tubos de la paleta activa
  const clusterNames = [
    t('cluster.primary'),
    t('cluster.secondary1'),
    t('cluster.secondary2'),
    t('cluster.complementary')
  ];
  currentPalette.clusters.forEach((cluster, idx) => {
    const id = `palette_${idx}`;
    newTubes.push({
      id,
      name: clusterNames[idx] ?? t('cluster.tone', { index: idx + 1 }),
      color: cluster.base,
      parts: previousParts.get(id) ?? (idx === 0 ? 1 : 0)
    });
  });

  // 2. Tubos de Bellas Artes
  const artistList = [
    { id: 'art_cad_yellow', ...ARTIST_PIGMENTS.CADMIUM_YELLOW },
    { id: 'art_cad_red', ...ARTIST_PIGMENTS.CADMIUM_RED },
    { id: 'art_ult_blue', ...ARTIST_PIGMENTS.ULTRAMARINE_BLUE },
    { id: 'art_tit_white', ...ARTIST_PIGMENTS.TITANIUM_WHITE },
    { id: 'art_carb_black', ...ARTIST_PIGMENTS.CARBON_BLACK }
  ];

  artistList.forEach((item) => {
    newTubes.push({
      id: item.id,
      name: item.name,
      color: item.color,
      parts: previousParts.get(item.id) ?? 0
    });
  });

  mixerTubes = newTubes;
  renderMixerTubes();
  updateMixerCalculation();
}

function renderMixerTubes(): void {
  if (!mixerPaletteTubesList || !mixerArtistTubesList) return;

  mixerPaletteTubesList.innerHTML = '';
  mixerArtistTubesList.innerHTML = '';

  mixerTubes.forEach((tube) => {
    const isPalette = tube.id.startsWith('palette_');
    const targetContainer = isPalette ? mixerPaletteTubesList : mixerArtistTubesList;

    const row = document.createElement('div');
    row.className = 'mixer-tube-row';

    const swatch = document.createElement('div');
    swatch.className = 'mixer-tube-swatch';
    swatch.style.backgroundColor = applyVisionFilter(tube.color.toHex());

    const name = document.createElement('div');
    name.className = 'mixer-tube-name';
    name.textContent = tube.name;

    const stepper = document.createElement('div');
    stepper.className = 'mixer-stepper';

    const btnMinus = document.createElement('button');
    btnMinus.className = 'mixer-step-btn';
    btnMinus.textContent = '−';
    btnMinus.type = 'button';
    btnMinus.title = 'Quitar gota';
    btnMinus.addEventListener('click', () => {
      if (tube.parts > 0) {
        tube.parts--;
        dropsCount.textContent = String(tube.parts);
        updateMixerCalculation();
      }
    });

    const dropsCount = document.createElement('span');
    dropsCount.className = 'mixer-drops-count';
    dropsCount.textContent = String(tube.parts);

    const btnPlus = document.createElement('button');
    btnPlus.className = 'mixer-step-btn';
    btnPlus.textContent = '+';
    btnPlus.type = 'button';
    btnPlus.title = 'Añadir gota';
    btnPlus.addEventListener('click', () => {
      tube.parts++;
      dropsCount.textContent = String(tube.parts);
      updateMixerCalculation();
    });

    stepper.appendChild(btnMinus);
    stepper.appendChild(dropsCount);
    stepper.appendChild(btnPlus);

    row.appendChild(swatch);
    row.appendChild(name);
    row.appendChild(stepper);

    targetContainer.appendChild(row);
  });
}

function updateMixerCalculation(): void {
  const portions: PigmentPortion[] = mixerTubes
    .filter((t) => t.parts > 0)
    .map((t) => ({
      name: t.name,
      color: t.color,
      parts: t.parts
    }));

  const mixResult = mixPhysicalPaint(portions);
  currentMixedPaintColor = mixResult.color;

  const hexColor = mixResult.color.toHex();
  const hsl = mixResult.color.toHsl();

  if (mixerWellDisplay) {
    mixerWellDisplay.style.backgroundColor = applyVisionFilter(hexColor);
  }
  if (mixerResultHex) {
    mixerResultHex.textContent = hexColor;
    mixerResultHex.onclick = () => copyToClipboard(hexColor);
  }
  if (mixerResultRgb) {
    mixerResultRgb.textContent = mixResult.color.toRgbFormatString();
  }
  if (mixerResultHsl) {
    mixerResultHsl.textContent = `hsl(${Math.round(hsl.hue)}°, ${Math.round(hsl.saturation)}%, ${Math.round(hsl.lightness)}%)`;
  }
  if (mixerTotalDrops) {
    const dropWord = mixResult.totalParts === 1 ? t('mixer.total_drop_single') : t('mixer.total_drops');
    mixerTotalDrops.textContent = `${mixResult.totalParts} ${dropWord}`;
  }

  if (mixerRecipeBreakdown) {
    mixerRecipeBreakdown.innerHTML = '';
    if (mixResult.recipe.length === 0) {
      mixerRecipeBreakdown.innerHTML = `<div class="mixer-empty-state">${t('mixer.empty_well')}</div>`;
    } else {
      mixResult.recipe.forEach((item) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'mixer-recipe-item';

        const label = document.createElement('span');
        label.style.width = '120px';
        label.textContent = item.name;

        const bar = document.createElement('div');
        bar.className = 'mixer-recipe-bar';

        const fill = document.createElement('div');
        fill.className = 'mixer-recipe-fill';
        fill.style.width = `${item.percentage}%`;
        fill.style.backgroundColor = item.color.toHex();
        bar.appendChild(fill);

        const pct = document.createElement('span');
        pct.style.minWidth = '40px';
        pct.style.textAlign = 'right';
        pct.style.fontFamily = 'monospace';
        pct.textContent = `${item.percentage}% (${item.parts}g)`;

        itemRow.appendChild(label);
        itemRow.appendChild(bar);
        itemRow.appendChild(pct);

        mixerRecipeBreakdown.appendChild(itemRow);
      });
    }
  }
}

// ============================================================================
// Modal Image Palette Extractor (Cuantización Median Cut & Armonías RYB)
// ============================================================================
let extractorTargetCount: number = 6;
let currentLoadedImage: HTMLImageElement | null = null;
let currentExtractionResult: ImageExtractionResult | null = null;

btnImageExtractor?.addEventListener('click', () => {
  modalExtractor?.classList.add('open');
});

btnCloseExtractor?.addEventListener('click', () => {
  modalExtractor?.classList.remove('open');
});

// Selector de cantidad de colores (4, 6, 8)
extractorCountButtons.forEach((btn: HTMLButtonElement) => {
  btn.addEventListener('click', () => {
    const countVal = parseInt(btn.dataset.count ?? '6', 10);
    extractorTargetCount = countVal;
    extractorCountButtons.forEach((b: HTMLButtonElement) => b.classList.toggle('active', b === btn));
    if (currentLoadedImage) {
      processLoadedImage(currentLoadedImage);
    }
  });
});

// Drop zone y file input
extractorDropZone?.addEventListener('click', () => {
  inputExtractorFile?.click();
});

extractorDropZone?.addEventListener('dragover', (e: DragEvent) => {
  e.preventDefault();
  extractorDropZone?.classList.add('dragover');
});

extractorDropZone?.addEventListener('dragleave', () => {
  extractorDropZone?.classList.remove('dragover');
});

extractorDropZone?.addEventListener('drop', (e: DragEvent) => {
  e.preventDefault();
  extractorDropZone?.classList.remove('dragover');
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleImageFile(files[0]!);
  }
});

inputExtractorFile?.addEventListener('change', () => {
  const files = inputExtractorFile.files;
  if (files && files.length > 0) {
    handleImageFile(files[0]!);
  }
});

function handleImageFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    showToast(t('toast.valid_image'));
    return;
  }

  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const src = e.target?.result as string;
    const img = new Image();
    img.onload = () => {
      currentLoadedImage = img;
      if (extractorPreviewImg) {
        extractorPreviewImg.src = src;
        extractorPreviewImg.style.display = 'block';
      }
      const promptEl = extractorDropZone?.querySelector<HTMLDivElement>('.extractor-drop-prompt');
      if (promptEl) {
        promptEl.style.display = 'none';
      }
      processLoadedImage(img);
    };
    img.src = src;
  };
  reader.readAsDataURL(file);
}

function processLoadedImage(img: HTMLImageElement): void {
  // Crear un canvas fuera de pantalla escalado a máximo 200x200 para muestreo instantáneo
  const canvas = document.createElement('canvas');
  const maxDim = 200;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;

  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  const pixels = samplePixelsFromImageData(imageData.data, w, h, 8000);
  const result = extractPaletteFromPixels(pixels, extractorTargetCount);
  currentExtractionResult = result;

  renderExtractionResults(result);
}

function renderExtractionResults(result: ImageExtractionResult): void {
  if (!extractorSwatchesContainer) return;
  extractorSwatchesContainer.innerHTML = '';

  result.dominantColors.forEach((extracted, idx) => {
    const hex = extracted.color.toHex();
    const hsl = extracted.color.toHsl();

    const row = document.createElement('div');
    row.className = 'extractor-swatch-row';
    row.title = `Tono #${idx + 1}: ${hex} (${extracted.percentage}%) - Clic para copiar`;

    const box = document.createElement('div');
    box.className = 'extractor-swatch-box';
    box.style.backgroundColor = applyVisionFilter(hex);

    const details = document.createElement('div');
    details.className = 'extractor-swatch-details';

    const hexLabel = document.createElement('span');
    hexLabel.className = 'extractor-swatch-hex';
    hexLabel.textContent = hex;

    const subLabel = document.createElement('span');
    subLabel.className = 'extractor-swatch-sub';
    subLabel.textContent = `RYB: ${Math.round(extracted.rybHue)}° | HSL: ${Math.round(hsl.hue)}°, ${Math.round(hsl.saturation)}%, ${Math.round(hsl.lightness)}%`;

    details.appendChild(hexLabel);
    details.appendChild(subLabel);

    const pctBadge = document.createElement('span');
    pctBadge.className = 'extractor-swatch-pct';
    pctBadge.textContent = `${extracted.percentage}%`;

    row.appendChild(box);
    row.appendChild(details);
    row.appendChild(pctBadge);

    row.addEventListener('click', () => {
      copyToClipboard(hex);
    });

    extractorSwatchesContainer.appendChild(row);
  });

  // Mostrar tarjeta de armonía detectada
  if (extractorHarmonyCard && extractorHarmonyModeName && extractorHarmonyExplanation) {
    extractorHarmonyCard.style.display = 'block';

    const modeLabels: Record<HarmonyMode, { name: string; desc: string }> = {
      monochromatic: {
        name: t('extractor.mode_mono_name'),
        desc: t('extractor.mode_mono_desc')
      },
      adjacent: {
        name: t('extractor.mode_adjacent_name'),
        desc: t('extractor.mode_adjacent_desc')
      },
      triad: {
        name: t('extractor.mode_triad_name'),
        desc: t('extractor.mode_triad_desc')
      },
      tetrad: {
        name: t('extractor.mode_tetrad_name'),
        desc: t('extractor.mode_tetrad_desc')
      },
      freeform: {
        name: t('extractor.mode_freeform_name'),
        desc: t('extractor.mode_freeform_desc')
      }
    };

    const info = modeLabels[result.suggestedHarmonyMode] ?? {
      name: result.suggestedHarmonyMode,
      desc: ''
    };

    extractorHarmonyModeName.textContent = info.name;
    extractorHarmonyExplanation.textContent = `${info.desc} ${t('extractor.suggested_hue')} RYB ${Math.round(result.suggestedPrimaryRybHue)}°.`;
  }

  if (btnApplyExtractedToWheel) {
    btnApplyExtractedToWheel.disabled = false;
  }
}

// Botón: Aplicar Armonía a la Rueda
btnApplyExtractedToWheel?.addEventListener('click', () => {
  if (!currentExtractionResult || currentExtractionResult.dominantColors.length === 0) return;

  const primaryExtracted = currentExtractionResult.dominantColors[0]!;
  const hsl = primaryExtracted.color.toHsl();
  const rybHue = currentExtractionResult.suggestedPrimaryRybHue;
  const harmonyMode = currentExtractionResult.suggestedHarmonyMode;

  // Actualizar estado de botones de armonía
  harmonyButtons.forEach((btn: HTMLButtonElement) => {
    btn.classList.toggle('active', btn.dataset.mode === harmonyMode);
  });

  wheelRenderer.updateState({
    primaryRybHue: rybHue,
    harmonyMode: harmonyMode,
    baseSaturation: Math.min(100, Math.max(30, hsl.saturation)),
    baseLightness: Math.min(85, Math.max(25, hsl.lightness))
  });

  handleWheelStateChange(wheelRenderer.getState());
  modalExtractor?.classList.remove('open');
  showToast(t('toast.image_harmony_applied', { mode: harmonyMode }));
});

// Daltonismo selector
visionSimulationSelect.addEventListener('change', () => {
  renderMyPaletteStrip(currentPalette);
  renderQuadrantGrid(currentPalette);
});

// ============================================================================
// Event Listeners: Selector de Idioma y Reactividad i18n
// ============================================================================
btnLangEs?.addEventListener('click', () => {
  i18n.setLanguage('es');
});

btnLangEn?.addEventListener('click', () => {
  i18n.setLanguage('en');
});

i18n.onLanguageChange(() => {
  handleWheelStateChange(wheelRenderer.getState());
  if (modalExport.classList.contains('open')) {
    renderExportTables(currentPalette);
  }
  if (modalPreview.classList.contains('open')) {
    renderPreviewModal();
  }
  if (modalExamples.classList.contains('open')) {
    renderLiveExample();
  }
  if (modalMixer?.classList.contains('open')) {
    initAndRenderMixer();
  }
  if (modalExtractor?.classList.contains('open') && currentExtractionResult) {
    renderExtractionResults(currentExtractionResult);
  }
});

// ============================================================================
// Inicialización
// ============================================================================
i18n.updateDomTranslations();
handleWheelStateChange(initialWheelState);
