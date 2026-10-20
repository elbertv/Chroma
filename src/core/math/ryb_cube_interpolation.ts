/**
 * Simulación de mezcla sustractiva física de pigmentos mediante interpolación
 * trilineal en el cubo unitario RYB, basada en el modelo de Gossett & Chen (2004).
 *
 * A diferencia del modelo aditivo digital RGB (donde Amarillo + Azul = Gris neutro),
 * en el espacio RYB de bellas artes la combinación de pigmentos primarios converge
 * hacia colores secundarios realistas (Amarillo + Azul = Verde pigmento intenso).
 */

import type {
  NormalizedRgbColor,
  NormalizedRybColor
} from '../types/color.types';

/**
 * Estructura interna para almacenar las coordenadas RGB proyectadas de los
 * 8 vértices del cubo unitario RYB.
 */
interface CubeCornerDefinition {
  readonly rBit: number;
  readonly yBit: number;
  readonly bBit: number;
  readonly rgbColor: NormalizedRgbColor;
}

/**
 * Mapeo empírico de los 8 vértices del cubo RYB proyectados en el espacio sRGB
 * calibrado según Gossett & Chen (2004).
 *
 * Cada vértice (r, y, b) con valores en {0, 1} se mapea a un vector (R, G, B):
 * - (0, 0, 0) -> Blanco (ausencia de pigmento sobre papel blanco)
 * - (1, 0, 0) -> Rojo puro
 * - (0, 1, 0) -> Amarillo puro
 * - (0, 0, 1) -> Azul de pigmento (0.163, 0.373, 0.6)
 * - (1, 1, 0) -> Naranja (Rojo + Amarillo)
 * - (1, 0, 1) -> Violeta (Rojo + Azul)
 * - (0, 1, 1) -> Verde realista de pigmento (Amarillo + Azul)
 * - (1, 1, 1) -> Negro (máxima saturación sustractiva)
 */
const RYB_CUBE_CORNERS: readonly CubeCornerDefinition[] = [
  { rBit: 0, yBit: 0, bBit: 0, rgbColor: { red: 1.0, green: 1.0, blue: 1.0 } }, // Blanco
  { rBit: 1, yBit: 0, bBit: 0, rgbColor: { red: 1.0, green: 0.0, blue: 0.0 } }, // Rojo
  { rBit: 0, yBit: 1, bBit: 0, rgbColor: { red: 1.0, green: 1.0, blue: 0.0 } }, // Amarillo
  {
    rBit: 0,
    yBit: 0,
    bBit: 1,
    rgbColor: { red: 0.163, green: 0.373, blue: 0.6 } // Azul
  },
  { rBit: 1, yBit: 1, bBit: 0, rgbColor: { red: 1.0, green: 0.5, blue: 0.0 } }, // Naranja (R + Y)
  { rBit: 1, yBit: 0, bBit: 1, rgbColor: { red: 0.5, green: 0.0, blue: 0.5 } }, // Violeta (R + B)
  { rBit: 0, yBit: 1, bBit: 1, rgbColor: { red: 0.0, green: 0.66, blue: 0.2 } }, // Verde realista (Y + B)
  { rBit: 1, yBit: 1, bBit: 1, rgbColor: { red: 0.0, green: 0.0, blue: 0.0 } } // Negro
];

/**
 * Restringe un valor numérico escalar al rango cerrado [0.0, 1.0].
 *
 * Parameters
 * ----------
 * rawValue : number
 *     Valor flotante a restringir.
 *
 * Returns
 * -------
 * number
 *     Valor asegurado dentro del rango [0.0, 1.0].
 *
 * Examples
 * --------
 * >>> clampNormalizedValue(1.2)
 * 1.0
 * >>> clampNormalizedValue(-0.5)
 * 0.0
 * >>> clampNormalizedValue(0.75)
 * 0.75
 */
export function clampNormalizedValue(rawValue: number): number {
  if (rawValue < 0.0) {
    return 0.0;
  }
  if (rawValue > 1.0) {
    return 1.0;
  }
  return rawValue;
}

/**
 * Calcula el peso trilineal de interpolación para un vértice específico del cubo.
 *
 * Formula:
 * weight = (r if rBit else (1 - r)) * (y if yBit else (1 - y)) * (b if bBit else (1 - b))
 *
 * Parameters
 * ----------
 * normalizedR : number
 *     Cantidad de rojo [0.0, 1.0].
 * normalizedY : number
 *     Cantidad de amarillo [0.0, 1.0].
 * normalizedB : number
 *     Cantidad de azul [0.0, 1.0].
 * rBit : number
 *     Coordenada binaria del vértice en el eje R (0 o 1).
 * yBit : number
 *     Coordenada binaria del vértice en el eje Y (0 o 1).
 * bBit : number
 *     Coordenada binaria del vértice en el eje B (0 o 1).
 *
 * Returns
 * -------
 * number
 *     Factor de ponderación trilineal [0.0, 1.0].
 */
function calculateCornerWeight(
  normalizedR: number,
  normalizedY: number,
  normalizedB: number,
  rBit: number,
  yBit: number,
  bBit: number
): number {
  const redFactor: number = rBit === 1 ? normalizedR : 1.0 - normalizedR;
  const yellowFactor: number = yBit === 1 ? normalizedY : 1.0 - normalizedY;
  const blueFactor: number = bBit === 1 ? normalizedB : 1.0 - normalizedB;

  return redFactor * yellowFactor * blueFactor;
}

/**
 * Proyecta un vector de pigmentos normalizados RYB al espacio de luz sRGB mediante
 * la deformación trilineal del cubo de Gossett & Chen (2004).
 *
 * Parameters
 * ----------
 * rybColor : NormalizedRybColor
 *     Vector de pigmento con componentes 'red', 'yellow' y 'blue' normalizados en [0.0, 1.0].
 *
 * Returns
 * -------
 * NormalizedRgbColor
 *     Vector de luz digital resultante con componentes 'red', 'green' y 'blue' en [0.0, 1.0].
 *
 * Examples
 * --------
 * >>> interpolateRybToRgb({ red: 0.0, yellow: 0.0, blue: 0.0 }) // Blanco
 * { red: 1.0, green: 1.0, blue: 1.0 }
 * >>> interpolateRybToRgb({ red: 0.0, yellow: 1.0, blue: 1.0 }) // Verde realista de pigmento
 * { red: 0.0, green: 0.66, blue: 0.2 }
 * >>> interpolateRybToRgb({ red: 1.0, yellow: 1.0, blue: 0.0 }) // Naranja
 * { red: 1.0, green: 0.5, blue: 0.0 }
 */
export function interpolateRybToRgb(
  rybColor: NormalizedRybColor
): NormalizedRgbColor {
  const clampedRed: number = clampNormalizedValue(rybColor.red);
  const clampedYellow: number = clampNormalizedValue(rybColor.yellow);
  const clampedBlue: number = clampNormalizedValue(rybColor.blue);

  let accumulatedRed: number = 0.0;
  let accumulatedGreen: number = 0.0;
  let accumulatedBlue: number = 0.0;

  for (const corner of RYB_CUBE_CORNERS) {
    const cornerWeight: number = calculateCornerWeight(
      clampedRed,
      clampedYellow,
      clampedBlue,
      corner.rBit,
      corner.yBit,
      corner.bBit
    );

    accumulatedRed += cornerWeight * corner.rgbColor.red;
    accumulatedGreen += cornerWeight * corner.rgbColor.green;
    accumulatedBlue += cornerWeight * corner.rgbColor.blue;
  }

  return {
    red: clampNormalizedValue(accumulatedRed),
    green: clampNormalizedValue(accumulatedGreen),
    blue: clampNormalizedValue(accumulatedBlue)
  };
}
