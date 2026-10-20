/**
 * Serializador y deserializador de estado cromático a hash URL permalink.
 *
 * Permite compartir y restaurar de forma exacta cualquier paleta generada
 * a través de un enlace único persistente en el navegador.
 */

import type { WheelInteractionState } from '../../adapters/canvas/WheelRenderer';
import type { HarmonyMode } from '../types/color.types';

/**
 * Serializa el estado de la paleta a una cadena de fragmento de URL (#hash).
 *
 * Parameters
 * ----------
 * state : WheelInteractionState
 *     Estado interactivo y armónico de la rueda cromática.
 *
 * Returns
 * -------
 * string
 *     Cadena formateada para window.location.hash (ej. "#mode=tetrad&h=0&d=30&s=80&l=50").
 */
export function serializePaletteToHash(state: WheelInteractionState): string {
  const params = new URLSearchParams();
  params.set('mode', state.harmonyMode);
  params.set('h', String(Math.round(state.primaryRybHue)));
  params.set('d', String(Math.round(state.distanceAngle)));
  params.set('s', String(Math.round(state.baseSaturation)));
  params.set('l', String(Math.round(state.baseLightness)));
  params.set('c', state.addComplementary ? '1' : '0');
  params.set('contrast', state.contrastScale.toFixed(2));
  if (state.spectralCalibration !== undefined) {
    params.set('spectral', state.spectralCalibration ? '1' : '0');
  }

  if (state.harmonyMode === 'freeform' && state.freeformAngles && state.freeformAngles.length >= 4) {
    params.set('free', state.freeformAngles.map((a) => Math.round(a)).join(','));
  }

  return `#${params.toString()}`;
}

/**
 * Deserializa una cadena hash de URL en un estado parcial de la rueda.
 *
 * Parameters
 * ----------
 * hash : string
 *     Cadena del hash de la URL (ej. "#mode=adjacent&h=120&d=25").
 *
 * Returns
 * -------
 * Partial<WheelInteractionState> | null
 *     Estado deserializado válido o null si el hash no contiene parámetros válidos.
 */
export function deserializeHashToPalette(hash: string): Partial<WheelInteractionState> | null {
  if (!hash || hash.length <= 1) {
    return null;
  }

  const cleanHash: string = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(cleanHash);

  const rawMode = params.get('mode');
  const validModes: readonly HarmonyMode[] = ['monochromatic', 'adjacent', 'triad', 'tetrad', 'freeform'];
  const harmonyMode: HarmonyMode | undefined = validModes.includes(rawMode as HarmonyMode)
    ? (rawMode as HarmonyMode)
    : undefined;

  const rawH = params.get('h');
  const primaryRybHue: number | undefined = rawH !== null && !isNaN(parseFloat(rawH))
    ? ((parseFloat(rawH) % 360) + 360) % 360
    : undefined;

  const rawD = params.get('d');
  const distanceAngle: number | undefined = rawD !== null && !isNaN(parseFloat(rawD))
    ? Math.max(5, Math.min(175, parseFloat(rawD)))
    : undefined;

  const rawS = params.get('s');
  const baseSaturation: number | undefined = rawS !== null && !isNaN(parseFloat(rawS))
    ? Math.max(0, Math.min(100, parseFloat(rawS)))
    : undefined;

  const rawL = params.get('l');
  const baseLightness: number | undefined = rawL !== null && !isNaN(parseFloat(rawL))
    ? Math.max(0, Math.min(100, parseFloat(rawL)))
    : undefined;

  const rawC = params.get('c');
  const addComplementary: boolean | undefined = rawC !== null
    ? rawC === '1' || rawC === 'true'
    : undefined;

  const rawContrast = params.get('contrast');
  const contrastScale: number | undefined = rawContrast !== null && !isNaN(parseFloat(rawContrast))
    ? Math.max(0.2, Math.min(3.0, parseFloat(rawContrast)))
    : undefined;

  const rawSpectral = params.get('spectral') ?? params.get('spec');
  const spectralCalibration: boolean | undefined = rawSpectral !== null
    ? rawSpectral === '1' || rawSpectral === 'true'
    : undefined;

  const rawFree = params.get('free');
  let freeformAngles: number[] | undefined = undefined;
  if (rawFree) {
    const parts = rawFree
      .split(',')
      .map((p) => parseFloat(p.trim()))
      .filter((n) => !isNaN(n));
    if (parts.length >= 4) {
      freeformAngles = parts.slice(0, 4);
    }
  }

  const result: Partial<WheelInteractionState> = {};
  if (harmonyMode !== undefined) result.harmonyMode = harmonyMode;
  if (primaryRybHue !== undefined) result.primaryRybHue = primaryRybHue;
  if (distanceAngle !== undefined) result.distanceAngle = distanceAngle;
  if (baseSaturation !== undefined) result.baseSaturation = baseSaturation;
  if (baseLightness !== undefined) result.baseLightness = baseLightness;
  if (addComplementary !== undefined) result.addComplementary = addComplementary;
  if (contrastScale !== undefined) result.contrastScale = contrastScale;
  if (spectralCalibration !== undefined) result.spectralCalibration = spectralCalibration;
  if (freeformAngles !== undefined) result.freeformAngles = freeformAngles;

  return Object.keys(result).length > 0 ? result : null;
}
