/**
 * Motor Perceptual de Color de Chroma (Ajuste Espectral con Atenuación Fotópica CIE).
 *
 * Implementa el modelo cromático espectral calibrado para armonías artísticas en espacio RYB:
 * 1. Atenuación espectral de luminancia fotópica en 6 anclas clave (Rojo, Amarillo, Verde, Cian, Azul, Magenta).
 * 2. Curvas de transición no lineales tangenciales (Math.tan) que simulan la mezcla orgánica de pigmentos.
 * 3. Conversión de coordenadas de domo 2D a multiplicadores kS y kV con función bilineal relativa fn(base, k).
 */

export interface HsvColor {
  readonly h: number;
  readonly s: number;
  readonly v: number;
}

export interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly hex: string;
}

interface Anchor {
  readonly rgb: readonly [number, number, number];
  readonly hsv: readonly [number, number, number];
}

interface SectorDefinition {
  readonly a: Anchor;
  readonly b: Anchor;
  readonly f: (h: number) => number;
  readonly fi: (factor: number) => number;
  readonly g: (v1: number, v2: number, factor: number) => number;
  readonly orderRgb: (maxC: number, midC: number, minC: number) => [number, number, number];
}

// 1. Las 6 anclas espectrales calibradas por sensibilidad fotópica CIE:
const ANCHORS = {
  r: { rgb: [255, 0, 0] as const, hsv: [0, 1.0, 1.0] as const }, // Rojo (V=1.0)
  rg: { rgb: [255, 255, 0] as const, hsv: [120, 1.0, 1.0] as const }, // Amarillo (V=1.0)
  g: { rgb: [0, 255, 0] as const, hsv: [180, 1.0, 0.8] as const }, // Verde (V atenuado a 0.80)
  gb: { rgb: [0, 255, 255] as const, hsv: [210, 1.0, 0.6] as const }, // Cian (V atenuado a 0.60)
  b: { rgb: [0, 0, 255] as const, hsv: [255, 0.85, 0.7] as const }, // Azul (S atenuado a 0.85, V a 0.70)
  br: { rgb: [255, 0, 255] as const, hsv: [315, 1.0, 0.65] as const } // Magenta (V atenuado a 0.65)
};

const lerpS = (v1: number, v2: number, n: number): number =>
  n === -1 ? v1 : v1 + (v2 - v1) / (1 + n);

const lerpI = (v1: number, v2: number, n: number): number =>
  n === -1 ? v2 : v2 + (v1 - v2) / (1 + n);

/**
 * Obtiene la definición del sector para un matiz en grados [0, 360).
 */
function getSector(h: number): SectorDefinition {
  if (h < 120) {
    return {
      a: ANCHORS.r,
      b: ANCHORS.rg,
      f: (angle: number) =>
        angle === 0 ? -1 : Math.tan(((120 - angle) / 120) * (Math.PI / 2)) * 0.5,
      fi: (f: number) =>
        f === -1 ? 0 : 120 - ((Math.atan(f / 0.5) * 120) / Math.PI) * 2,
      g: lerpS,
      orderRgb: (r, i, s) => [Math.round(r), Math.round(i), Math.round(s)]
    };
  } else if (h < 180) {
    return {
      a: ANCHORS.rg,
      b: ANCHORS.g,
      f: (angle: number) =>
        angle === 180 ? -1 : Math.tan(((angle - 120) / 60) * (Math.PI / 2)) * 0.5,
      fi: (f: number) =>
        f === -1 ? 180 : 120 + ((Math.atan(f / 0.5) * 60) / Math.PI) * 2,
      g: lerpI,
      orderRgb: (r, i, s) => [Math.round(i), Math.round(r), Math.round(s)]
    };
  } else if (h < 210) {
    return {
      a: ANCHORS.g,
      b: ANCHORS.gb,
      f: (angle: number) =>
        angle === 180 ? -1 : Math.tan(((210 - angle) / 30) * (Math.PI / 2)) * 0.75,
      fi: (f: number) =>
        f === -1 ? 180 : 210 - ((Math.atan(f / 0.75) * 30) / Math.PI) * 2,
      g: lerpS,
      orderRgb: (r, i, s) => [Math.round(s), Math.round(r), Math.round(i)]
    };
  } else if (h < 255) {
    return {
      a: ANCHORS.gb,
      b: ANCHORS.b,
      f: (angle: number) =>
        angle === 255 ? -1 : Math.tan(((angle - 210) / 45) * (Math.PI / 2)) * 1.33,
      fi: (f: number) =>
        f === -1 ? 255 : 210 + ((Math.atan(f / 1.33) * 45) / Math.PI) * 2,
      g: lerpI,
      orderRgb: (r, i, s) => [Math.round(s), Math.round(i), Math.round(r)]
    };
  } else if (h < 315) {
    return {
      a: ANCHORS.b,
      b: ANCHORS.br,
      f: (angle: number) =>
        angle === 255 ? -1 : Math.tan(((315 - angle) / 60) * (Math.PI / 2)) * 1.33,
      fi: (f: number) =>
        f === -1 ? 255 : 315 - ((Math.atan(f / 1.33) * 60) / Math.PI) * 2,
      g: lerpS,
      orderRgb: (r, i, s) => [Math.round(i), Math.round(s), Math.round(r)]
    };
  } else {
    return {
      a: ANCHORS.br,
      b: ANCHORS.r,
      f: (angle: number) =>
        angle === 0 ? -1 : Math.tan(((angle - 315) / 45) * (Math.PI / 2)) * 1.33,
      fi: (f: number) =>
        f === -1 ? 0 : 315 + ((Math.atan(f / 1.33) * 45) / Math.PI) * 2,
      g: lerpI,
      orderRgb: (r, i, s) => [Math.round(r), Math.round(s), Math.round(i)]
    };
  }
}

/**
 * Normaliza un ángulo cromático a [0.0, 360.0).
 */
export function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

/**
 * Obtiene el color base del ancla espectral para un matiz en grados [0.0, 360.0).
 * Calcula el valor atenuado de saturación (s) y brillo (v) correspondiente a ese matiz.
 */
export function getChromaSpectralBaseColor(hue: number): HsvColor {
  const normHue: number = normalizeHue(hue);
  const sec: SectorDefinition = getSector(normHue);
  const factor: number = sec.f(normHue);
  const v: number = sec.g(sec.a.hsv[2], sec.b.hsv[2], factor);
  const s: number = sec.g(sec.a.hsv[1], sec.b.hsv[1], factor);
  return { h: normHue, s, v };
}

/**
 * Convierte un color en el espacio empírico HSV espectral a RGB sRGB.
 */
export function chromaHsvToRgb(h: number, s: number, v: number): RgbColor {
  const normHue: number = normalizeHue(h);
  const sec: SectorDefinition = getSector(normHue);
  const factor: number = sec.f(normHue);
  const anchorRgb = sec.a.rgb;

  const maxC: number = Math.max(anchorRgb[0], Math.max(anchorRgb[1], anchorRgb[2])) * v;
  const minC: number = maxC * (1.0 - s);
  const midC: number =
    factor === -1 ? minC : (maxC + minC * factor) / (1.0 + factor);

  const [rawR, rawG, rawB] = sec.orderRgb(maxC, midC, minC);
  const r: number = Math.min(255, Math.max(0, rawR));
  const g: number = Math.min(255, Math.max(0, rawG));
  const b: number = Math.min(255, Math.max(0, rawB));

  const hex: string =
    '#' +
    r.toString(16).padStart(2, '0').toUpperCase() +
    g.toString(16).padStart(2, '0').toUpperCase() +
    b.toString(16).padStart(2, '0').toUpperCase();

  return { r, g, b, hex };
}

/**
 * Aplica el factor bilineal k (kS o kV) sobre el valor base de ancla:
 * fn(base, k) = (k <= 1) ? base * k : base + (1 - base) * (k - 1)
 */
export function applyChromaK(baseVal: number, k: number): number {
  const clampedK: number = Math.max(0.0, Math.min(2.0, k));
  return clampedK <= 1.0
    ? baseVal * clampedK
    : baseVal + (1.0 - baseVal) * (clampedK - 1.0);
}

/**
 * Transforma una coordenada normalizada de disco del domo [-1.0, 1.0] a un factor k [0.0, 2.0]
 * con threshold = 0.5:
 * - En el centro (coord = 0): retorna 2/3 ≈ 0.66667
 * - En el extremo izquierdo (coord = -1): retorna 0.0
 * - En el extremo derecho (coord = +1): retorna 2.0
 */
export function discCoordToK(coord: number, threshold: number = 0.5): number {
  const clamped: number = Math.max(-1.0, Math.min(1.0, coord));
  return clamped < threshold
    ? (clamped + 1.0) / (threshold + 1.0)
    : (clamped - threshold) / (1.0 - threshold) + 1.0;
}

/**
 * Factores de modulación kS y kV por defecto para las 5 variantes en el centro del domo:
 * - 0: Base [2/3, 2/3]
 * - 1: Tint [1/3, 1]
 * - 2: Bright [0.5, 5/6]
 * - 3: Dark [5/6, 0.5]
 * - 4: Deep [1, 1/3]
 */
export const DEFAULT_CHROMA_VARIANT_FACTORS: readonly [number, number][] = [
  [0.66667, 0.66667], // Base
  [0.33333, 1.00000], // Tint (Pastel)
  [0.50000, 0.83333], // Bright (Soft)
  [0.83333, 0.50000], // Dark (Shade)
  [1.00000, 0.33333]  // Deep (Muted)
];
