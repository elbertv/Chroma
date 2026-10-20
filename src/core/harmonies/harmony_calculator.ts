/**
 * Calculador de esquemas armónicos en el espacio tradicional de pigmentos RYB (Itten / Goethe)
 * y su proyección al espacio digital sRGB.
 *
 * Implementa las reglas clásicas de armonía cromática:
 * - Monocromático: 1 tono (o 2 si se añade complementario).
 * - Adyacente / Análogo: 3 tonos (o 4 si se añade complementario).
 * - Tríada: 3 tonos equitativos (o 4 si se añade complementario).
 * - Tétrada (4 colores): 4 tonos organizados en dos ejes complementarios (180° en RYB).
 * - Libre (Freeform): 4 tonos con ángulos independientes.
 */

import {
  ColorCluster,
  type ClusterTuningParameters,
  DEFAULT_CLUSTER_TUNING
} from '../entities/ColorCluster';
import {
  convertRgbHueToRybHue,
  convertRybHueToRgbHue,
  normalizeHueAngle
} from '../math/ryb_hue_mapping';
import type { HarmonyMode } from '../types/color.types';

/**
 * Representa una paleta de color armónica completa compuesta por familias (clusters) tonales.
 */
export interface HarmonyPalette {
  /** Modo de armonía seleccionado. */
  readonly mode: HarmonyMode;
  /** Si incluye el complementario artístico adicional. */
  readonly addComplementary: boolean;
  /** Matiz primario en el círculo tradicional RYB [0.0, 360.0). */
  readonly primaryRybHue: number;
  /** Matiz primario en el círculo digital sRGB [0.0, 360.0). */
  readonly primaryRgbHue: number;
  /** Ángulo de distancia / apertura entre tonos secundarios en grados. */
  readonly distanceAngleInDegrees: number;
  /** Si tiene activado el Ajuste Espectral Perceptual con atenuación fotópica de luminancia. */
  readonly spectralCalibration: boolean;
  /** Lista de clusters cromáticos (1 a 4 familias, con 5 variantes cada una). */
  readonly clusters: readonly ColorCluster[];
}

/**
 * Opciones de entrada para la generación de la paleta armónica.
 */
export interface GeneratePaletteOptions {
  /** Matiz primario inicial expresado en sRGB o en RYB. */
  readonly primaryHue: number;
  /** Indica si 'primaryHue' está en espacio digital sRGB (true) o artístico RYB (false). Default: true. */
  readonly isInputInRgb?: boolean;
  /** Modo de armonía (monochromatic, adjacent, triad, tetrad, freeform). */
  readonly mode: HarmonyMode;
  /** Añadir el complementario artístico (+180° en RYB). Default: false. */
  readonly addComplementary?: boolean;
  /** Ángulo de distancia / apertura para adyacentes y tétrada en grados (default: 30.0). */
  readonly distanceAngleInDegrees?: number;
  /** Saturación base para los clusters [0.0, 100.0] (default: 80.0). */
  readonly baseSaturationPercent?: number;
  /** Luminosidad base para los clusters [0.0, 100.0] (default: 50.0). */
  readonly baseLightnessPercent?: number;
  /** Parámetros de fine-tune (ajuste fino y contraste). */
  readonly tuning?: ClusterTuningParameters;
  /** Activa la calibración espectral perceptual con atenuación fotópica de luminancia (default: true). */
  readonly spectralCalibration?: boolean;
  /** Ángulos adicionales para el modo libre en espacio RYB (opcional). */
  readonly freeformRybAngles?: readonly number[] | undefined;
}

/**
 * Calcula los ángulos angulares en el espacio de pigmentos RYB para un modo dado.
 *
 * Parameters
 * ----------
 * primaryRybHue : number
 *     Ángulo primario en el espacio RYB [0.0, 360.0).
 * mode : HarmonyMode
 *     Modo de armonía seleccionado.
 * distanceAngle : number
 *     Distancia angular en grados para modos adyacente y tétrada.
 * addComplementary : boolean
 *     Si es true, agrega el tono complementario (+180° en RYB).
 * freeformAngles : readonly number[], optional
 *     Ángulos específicos para el modo libre.
 *
 * Returns
 * -------
 * readonly number[]
 *     Array con los ángulos calculados en el círculo RYB (de 1 a 4 elementos).
 */
export function calculateRybHarmonyAngles(
  primaryRybHue: number,
  mode: HarmonyMode,
  distanceAngle: number = 30.0,
  addComplementary: boolean = false,
  freeformAngles?: readonly number[]
): readonly number[] {
  const normPrimary: number = normalizeHueAngle(primaryRybHue);
  // La distancia angular pasa de 5° a 175° sin colapsar en 0° ni 180°
  const dist: number = Math.max(5.0, Math.min(175.0, distanceAngle));
  const compAngle: number = normalizeHueAngle(normPrimary + 180.0);

  switch (mode) {
    case 'monochromatic':
      return addComplementary ? [normPrimary, compAngle] : [normPrimary];

    case 'adjacent':
      // 3 colores base: Secundario izquierdo, Primario, Secundario derecho
      if (addComplementary) {
        // 4 colores: Primario, Secundario 1, Secundario 2 y Complementario
        return [
          normPrimary,
          normalizeHueAngle(normPrimary - dist),
          normalizeHueAngle(normPrimary + dist),
          compAngle
        ];
      }
      return [
        normPrimary,
        normalizeHueAngle(normPrimary - dist),
        normalizeHueAngle(normPrimary + dist)
      ];

    case 'triad':
      // 3 colores a 120° en RYB
      if (addComplementary) {
        // 4 colores: Primario, Tríada 1, Tríada 2 y Complementario
        return [
          normPrimary,
          normalizeHueAngle(normPrimary + 120.0),
          normalizeHueAngle(normPrimary + 240.0),
          compAngle
        ];
      }
      return [
        normPrimary,
        normalizeHueAngle(normPrimary + 120.0),
        normalizeHueAngle(normPrimary + 240.0)
      ];

    case 'tetrad':
      // 4 colores: Primario, Secundario 1 (+dist), Complementario primario (+180), Complementario secundario (+180 + dist)
      return [
        normPrimary,
        normalizeHueAngle(normPrimary + dist),
        normalizeHueAngle(normPrimary + 180.0),
        normalizeHueAngle(normPrimary + 180.0 + dist)
      ];

    case 'freeform':
      if (freeformAngles && freeformAngles.length > 0) {
        return freeformAngles.map(normalizeHueAngle);
      }
      // Cuando se selecciona Free-style sin ángulos específicos, siempre queda en tetrad
      return [
        normPrimary,
        normalizeHueAngle(normPrimary + dist),
        normalizeHueAngle(normPrimary + 180.0),
        normalizeHueAngle(normPrimary + 180.0 + dist)
      ];
  }
}

/**
 * Genera una paleta armónica completa calculada en el espacio de pigmentos RYB
 * y proyectada a sRGB con sus correspondientes clusters tonales de 5 variantes.
 *
 * Parameters
 * ----------
 * options : GeneratePaletteOptions
 *     Parámetros de configuración cromática.
 *
 * Returns
 * -------
 * HarmonyPalette
 *     Objeto inmutable con la paleta calculada, sus ángulos y clusters de color.
 */
export function generateHarmonyPalette(
  options: GeneratePaletteOptions
): HarmonyPalette {
  const isInputRgb: boolean = options.isInputInRgb ?? true;
  const rawPrimaryHue: number = options.primaryHue;
  const addComp: boolean = options.addComplementary ?? false;

  const primaryRgbHue: number = isInputRgb
    ? normalizeHueAngle(rawPrimaryHue)
    : convertRybHueToRgbHue(rawPrimaryHue);

  const primaryRybHue: number = isInputRgb
    ? convertRgbHueToRybHue(rawPrimaryHue)
    : normalizeHueAngle(rawPrimaryHue);

  const distanceAngle: number = options.distanceAngleInDegrees ?? 30.0;
  const baseSaturation: number = options.baseSaturationPercent ?? 80.0;
  const baseLightness: number = options.baseLightnessPercent ?? 50.0;
  const tuning: ClusterTuningParameters =
    options.tuning ?? DEFAULT_CLUSTER_TUNING;
  const spectralCalibration: boolean = options.spectralCalibration ?? true;

  const rybAngles: readonly number[] = calculateRybHarmonyAngles(
    primaryRybHue,
    options.mode,
    distanceAngle,
    addComp,
    options.freeformRybAngles
  );

  const clusters: ColorCluster[] = rybAngles.map(
    (rybAngle: number): ColorCluster => {
      if (spectralCalibration) {
        return ColorCluster.fromSpectralCalibration(
          rybAngle,
          baseSaturation,
          baseLightness,
          tuning
        );
      }
      const digitalRgbHue: number = convertRybHueToRgbHue(rybAngle);
      return ColorCluster.fromHueAndTone(
        digitalRgbHue,
        baseSaturation,
        baseLightness,
        tuning
      );
    }
  );

  return {
    mode: options.mode,
    addComplementary: addComp,
    primaryRybHue,
    primaryRgbHue,
    distanceAngleInDegrees: distanceAngle,
    spectralCalibration,
    clusters
  };
}
