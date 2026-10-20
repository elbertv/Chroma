/**
 * Motor de Mezcla Sustractiva de Pintura Física (Pigment Mixing Engine).
 *
 * Simula la mezcla sustractiva de pinturas y pigmentos artísticos tradicionales
 * basándose en el espacio RYB (Itten / Goethe) y el cubo trilineal de Gossett & Chen:
 * - Amarillo + Azul = Verde
 * - Rojo + Amarillo = Naranja
 * - Rojo + Azul = Violeta
 * - Rojo + Amarillo + Azul = Pardo oscuro neutro (Dark Brown / Tertiary)
 * - Blanco de Titanio = Aclara la mezcla (desaturación y aumento de luminosidad / Pastel)
 * - Negro de Carbón = Oscurece la mezcla (absorción total de luz / Sombras profundas)
 */

import { Color } from '../entities/Color';
import { interpolateRybToRgb } from '../math/ryb_cube_interpolation';

/**
 * Representa una porción o gota de pigmento en la paleta de mezcla.
 */
export interface PigmentPortion {
  /** Nombre descriptivo del pigmento (ej. 'Cadmium Yellow', 'Primary Base', 'Titanium White'). */
  readonly name: string;
  /** Color del pigmento. */
  readonly color: Color;
  /** Cantidad de partes o gotas añadidas al pocillo (>= 0). */
  readonly parts: number;
}

/**
 * Resultado completo de la mezcla de pintura.
 */
export interface PaintMixResult {
  /** Color final resultante de la mezcla física. */
  readonly color: Color;
  /** Total de partes/gotas añadidas. */
  readonly totalParts: number;
  /** Desglose porcentual de la receta de pintura. */
  readonly recipe: ReadonlyArray<{
    readonly name: string;
    readonly color: Color;
    readonly parts: number;
    readonly percentage: number;
  }>;
}

/**
 * Pigmentos base tradicionales de bellas artes.
 */
export const ARTIST_PIGMENTS = {
  CADMIUM_RED: {
    name: 'Cadmium Red',
    color: Color.fromHex('#E02222')
  },
  CADMIUM_YELLOW: {
    name: 'Cadmium Yellow',
    color: Color.fromHex('#FCE300')
  },
  ULTRAMARINE_BLUE: {
    name: 'Ultramarine Blue',
    color: Color.fromHex('#0038A8')
  },
  TITANIUM_WHITE: {
    name: 'Titanium White',
    color: Color.fromHex('#FFFFFF')
  },
  CARBON_BLACK: {
    name: 'Carbon Black',
    color: Color.fromHex('#111111')
  }
} as const;

/**
 * Descompone un color RGB normalizado [0, 1] en sus componentes sustractivos RYB [0, 1].
 */
export function decomposeRgbToRyb(
  r: number,
  g: number,
  b: number
): { red: number; yellow: number; blue: number } {
  const w = Math.min(r, g, b);
  const r1 = r - w;
  const g1 = g - w;
  const b1 = b - w;

  const maxGreen = Math.max(r1, g1, b1);
  const y = Math.min(r1, g1);
  let rRyb = r1 - y;
  let bRyb = (b1 + g1 - y) / 2;

  if (bRyb > 0 && g1 > 0) {
    bRyb = Math.max(bRyb, b1);
  }

  const maxRyb = Math.max(rRyb, y, bRyb);
  let yRyb = y;

  if (maxRyb > 0 && maxGreen > 0) {
    const factor = maxGreen / maxRyb;
    rRyb *= factor;
    yRyb *= factor;
    bRyb *= factor;
  }

  return {
    red: Math.min(1.0, Math.max(0.0, rRyb)),
    yellow: Math.min(1.0, Math.max(0.0, yRyb)),
    blue: Math.min(1.0, Math.max(0.0, bRyb))
  };
}

/**
 * Simula la mezcla física sustractiva de múltiples pigmentos en un pocillo de pintura.
 *
 * Parameters
 * ----------
 * portions : ReadonlyArray<PigmentPortion>
 *     Lista de pigmentos y sus cantidades respectivas.
 *
 * Returns
 * -------
 * PaintMixResult
 *     Resultado con el color mezclado y el desglose de la receta.
 */
export function mixPhysicalPaint(
  portions: ReadonlyArray<PigmentPortion>
): PaintMixResult {
  const activePortions = portions.filter((p) => p.parts > 0);

  if (activePortions.length === 0) {
    return {
      color: Color.fromHex('#FFFFFF'),
      totalParts: 0,
      recipe: []
    };
  }

  const totalParts: number = activePortions.reduce((sum, p) => sum + p.parts, 0);

  const recipe = activePortions.map((p) => ({
    name: p.name,
    color: p.color,
    parts: p.parts,
    percentage: Math.round((p.parts / totalParts) * 100)
  }));

  let whiteParts = 0;
  let blackParts = 0;
  let chromaticParts = 0;

  let sumRybR = 0;
  let sumRybY = 0;
  let sumRybB = 0;

  activePortions.forEach((p) => {
    const hex = p.color.toHex().toUpperCase();

    if (hex === '#FFFFFF') {
      whiteParts += p.parts;
      return;
    }

    if (hex === '#000000' || hex === '#111111' || hex === '#1A1A1A' || p.color.toHsl().lightness < 5) {
      blackParts += p.parts;
      return;
    }

    const normR = p.color.red / 255.0;
    const normG = p.color.green / 255.0;
    const normB = p.color.blue / 255.0;

    const ryb = decomposeRgbToRyb(normR, normG, normB);
    sumRybR += ryb.red * p.parts;
    sumRybY += ryb.yellow * p.parts;
    sumRybB += ryb.blue * p.parts;
    chromaticParts += p.parts;
  });

  let blendedR: number;
  let blendedG: number;
  let blendedB: number;

  if (chromaticParts > 0) {
    const rawAvgR = sumRybR / chromaticParts;
    const rawAvgY = sumRybY / chromaticParts;
    const rawAvgB = sumRybB / chromaticParts;

    // Escalar al cubo Gossett & Chen para reflejar la densidad de cubrimiento opaco del pigmento
    const maxPrimaryRatio = Math.max(rawAvgR, rawAvgY, rawAvgB);
    const scale = maxPrimaryRatio > 0 ? 1.0 / maxPrimaryRatio : 1.0;

    const cubeR = Math.min(1.0, rawAvgR * scale);
    const cubeY = Math.min(1.0, rawAvgY * scale);
    const cubeB = Math.min(1.0, rawAvgB * scale);

    const rgbResult = interpolateRybToRgb({
      red: cubeR,
      yellow: cubeY,
      blue: cubeB
    });

    blendedR = rgbResult.red;
    blendedG = rgbResult.green;
    blendedB = rgbResult.blue;
  } else {
    // Solo mezcla neutra de blanco y negro
    const shade = 1.0 - (blackParts / totalParts);
    blendedR = shade;
    blendedG = shade;
    blendedB = shade;
  }

  // Modulación por Blanco de Titanio (aclara y pasteliza)
  const whiteRatio = whiteParts / totalParts;
  if (whiteRatio > 0) {
    blendedR = blendedR * (1 - whiteRatio) + 1.0 * whiteRatio;
    blendedG = blendedG * (1 - whiteRatio) + 1.0 * whiteRatio;
    blendedB = blendedB * (1 - whiteRatio) + 1.0 * whiteRatio;
  }

  // Modulación por Negro de Carbón (absorbe luz)
  const blackRatio = blackParts / totalParts;
  if (blackRatio > 0) {
    const darkenFactor = Math.max(0.0, 1.0 - blackRatio * 0.95);
    blendedR *= darkenFactor;
    blendedG *= darkenFactor;
    blendedB *= darkenFactor;
  }

  const finalRed = Math.min(255, Math.max(0, Math.round(blendedR * 255.0)));
  const finalGreen = Math.min(255, Math.max(0, Math.round(blendedG * 255.0)));
  const finalBlue = Math.min(255, Math.max(0, Math.round(blendedB * 255.0)));

  return {
    color: Color.fromRgb(finalRed, finalGreen, finalBlue),
    totalParts,
    recipe
  };
}
