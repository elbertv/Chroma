/**
 * Mapeo de ángulos por tramos entre el círculo de luz digital (sRGB) y el círculo
 * tradicional de pigmentos artísticos (RYB de Itten / Goethe).
 *
 * En la teoría clásica del arte (Itten, Goethe):
 * - Rojo: 0°
 * - Naranja: 60° (en sRGB está a 30°)
 * - Amarillo: 120° (en sRGB está a 60°)
 * - Verde: 180° (en sRGB está a 120°; opuesto y complementario directo del Rojo)
 * - Azul: 240° (en sRGB está a 240°)
 * - Violeta: 300° (en sRGB está a 300°)
 * - Rojo Cierre: 360°
 */

/**
 * Par de anclaje angular (Ángulo Origen, Ángulo Destino).
 */
interface HueAnchorPair {
  readonly sourceHue: number;
  readonly destinationHue: number;
}

/**
 * Puntos de anclaje de referencia para la transformación de RGB a RYB.
 * Cada tupla define: [Ángulo en rueda digital RGB, Ángulo en rueda artística RYB].
 */
const RGB_TO_RYB_ANCHORS: readonly HueAnchorPair[] = [
  { sourceHue: 0.0, destinationHue: 0.0 }, // Rojo
  { sourceHue: 30.0, destinationHue: 60.0 }, // Naranja
  { sourceHue: 60.0, destinationHue: 120.0 }, // Amarillo
  { sourceHue: 120.0, destinationHue: 180.0 }, // Verde
  { sourceHue: 240.0, destinationHue: 240.0 }, // Azul
  { sourceHue: 300.0, destinationHue: 300.0 }, // Violeta
  { sourceHue: 360.0, destinationHue: 360.0 } // Cierre en Rojo
];

/**
 * Puntos de anclaje de referencia para la transformación inversa de RYB a RGB.
 * Cada tupla define: [Ángulo en rueda artística RYB, Ángulo en rueda digital RGB].
 */
const RYB_TO_RGB_ANCHORS: readonly HueAnchorPair[] = [
  { sourceHue: 0.0, destinationHue: 0.0 }, // Rojo
  { sourceHue: 60.0, destinationHue: 30.0 }, // Naranja
  { sourceHue: 120.0, destinationHue: 60.0 }, // Amarillo
  { sourceHue: 180.0, destinationHue: 120.0 }, // Verde
  { sourceHue: 240.0, destinationHue: 240.0 }, // Azul
  { sourceHue: 300.0, destinationHue: 300.0 }, // Violeta
  { sourceHue: 360.0, destinationHue: 360.0 } // Cierre en Rojo
];

/**
 * Normaliza cualquier valor angular al rango periódico semiabierto [0.0, 360.0).
 *
 * Parameters
 * ----------
 * rawAngleInDegrees : number
 *     Ángulo en grados sexagesimales a normalizar (puede ser negativo o mayor a 360).
 *
 * Returns
 * -------
 * number
 *     Ángulo normalizado equivalente en el rango [0.0, 360.0).
 *
 * Examples
 * --------
 * >>> normalizeHueAngle(370.0)
 * 10.0
 * >>> normalizeHueAngle(-30.0)
 * 330.0
 * >>> normalizeHueAngle(0.0)
 * 0.0
 */
export function normalizeHueAngle(rawAngleInDegrees: number): number {
  // Manejo de módulo para garantizar valor estrictamente positivo
  const normalizedValue: number =
    ((rawAngleInDegrees % 360.0) + 360.0) % 360.0;
  return normalizedValue;
}

/**
 * Realiza una interpolación lineal por segmentos dados un conjunto de puntos de anclaje.
 *
 * Aplica la fórmula matemática:
 * Y_dest = Y_0 + (X_orig - X_0) * (Y_1 - Y_0) / (X_1 - X_0)
 *
 * Parameters
 * ----------
 * normalizedHueAngle : number
 *     Ángulo origen normalizado en el rango [0.0, 360.0).
 * anchors : readonly HueAnchorPair[]
 *     Lista ordenada de puntos de control de origen y destino.
 *
 * Returns
 * -------
 * number
 *     Ángulo resultante en el espacio destino normalizado en [0.0, 360.0).
 */
function interpolatePiecewiseHue(
  normalizedHueAngle: number,
  anchors: readonly HueAnchorPair[]
): number {
  const numberOfSegments: number = anchors.length - 1;

  for (
    let segmentIndex: number = 0;
    segmentIndex < numberOfSegments;
    segmentIndex++
  ) {
    const currentAnchor: HueAnchorPair = anchors[segmentIndex]!;
    const nextAnchor: HueAnchorPair = anchors[segmentIndex + 1]!;

    const sourceStartAngle: number = currentAnchor.sourceHue;
    const sourceEndAngle: number = nextAnchor.sourceHue;

    if (
      normalizedHueAngle >= sourceStartAngle &&
      normalizedHueAngle <= sourceEndAngle
    ) {
      const segmentSpan: number = sourceEndAngle - sourceStartAngle;
      if (segmentSpan === 0.0) {
        return currentAnchor.destinationHue;
      }

      const interpolationFactor: number =
        (normalizedHueAngle - sourceStartAngle) / segmentSpan;

      const destinationStartAngle: number = currentAnchor.destinationHue;
      const destinationEndAngle: number = nextAnchor.destinationHue;

      const destinationSpan: number =
        destinationEndAngle - destinationStartAngle;
      const interpolatedAngle: number =
        destinationStartAngle + interpolationFactor * destinationSpan;

      return normalizeHueAngle(interpolatedAngle);
    }
  }

  return normalizeHueAngle(normalizedHueAngle);
}

/**
 * Convierte un ángulo de matiz digital sRGB (0°-360°) al ángulo correspondiente
 * en la rueda tradicional artística de pigmento RYB (Itten/Goethe).
 *
 * Parameters
 * ----------
 * digitalRgbHueInDegrees : number
 *     Matiz en el círculo de luz digital sRGB (0.0° a 360.0°).
 *
 * Returns
 * -------
 * number
 *     Matiz mapeado al círculo tradicional de pigmento RYB (0.0° a 360.0°).
 *
 * Examples
 * --------
 * >>> convertRgbHueToRybHue(0.0) // Rojo
 * 0.0
 * >>> convertRgbHueToRybHue(60.0) // Amarillo digital pasa a 120° en RYB
 * 120.0
 * >>> convertRgbHueToRybHue(120.0) // Verde digital pasa a 180° en RYB (opuesto al rojo)
 * 180.0
 */
export function convertRgbHueToRybHue(
  digitalRgbHueInDegrees: number
): number {
  const normalizedInputHue: number = normalizeHueAngle(
    digitalRgbHueInDegrees
  );
  return interpolatePiecewiseHue(normalizedInputHue, RGB_TO_RYB_ANCHORS);
}

/**
 * Convierte un ángulo de matiz del círculo tradicional artístico RYB (0°-360°)
 * al matiz digital correspondiente en sRGB para renderizar en pantalla.
 *
 * Parameters
 * ----------
 * artisticRybHueInDegrees : number
 *     Matiz en el círculo de pigmento tradicional RYB (0.0° a 360.0°).
 *
 * Returns
 * -------
 * number
 *     Matiz en el círculo de luz digital sRGB (0.0° a 360.0°).
 *
 * Examples
 * --------
 * >>> convertRybHueToRgbHue(0.0) // Rojo
 * 0.0
 * >>> convertRybHueToRgbHue(120.0) // Amarillo artístico pasa a 60° digital
 * 60.0
 * >>> convertRybHueToRgbHue(180.0) // Verde artístico pasa a 120° digital
 * 120.0
 */
export function convertRybHueToRgbHue(
  artisticRybHueInDegrees: number
): number {
  const normalizedInputHue: number = normalizeHueAngle(
    artisticRybHueInDegrees
  );
  return interpolatePiecewiseHue(normalizedInputHue, RYB_TO_RGB_ANCHORS);
}

/**
 * Calcula el matiz complementario artístico tradicional (opuesto a 180° en la rueda RYB)
 * y lo retorna convertido al matiz digital sRGB para su visualización.
 *
 * Parameters
 * ----------
 * baseDigitalRgbHueInDegrees : number
 *     Matiz base en la rueda digital sRGB (0.0° a 360.0°).
 *
 * Returns
 * -------
 * number
 *     Matiz complementario artístico expresado en grados sRGB.
 *
 * Examples
 * --------
 * >>> calculateArtisticComplementaryInRgb(0.0) // El complementario del Rojo (0°) es Verde (120° sRGB)
 * 120.0
 */
export function calculateArtisticComplementaryInRgb(
  baseDigitalRgbHueInDegrees: number
): number {
  const rybHueOfBaseColor: number = convertRgbHueToRybHue(
    baseDigitalRgbHueInDegrees
  );
  const rybComplementaryHue: number = normalizeHueAngle(
    rybHueOfBaseColor + 180.0
  );
  return convertRybHueToRgbHue(rybComplementaryHue);
}
