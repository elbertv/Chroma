/**
 * Catálogo de presets tonales de Chroma (referencias ref_img/003.png y ref_img/005.png).
 *
 * Cada preset define una matriz de calibración predefinida para la dispersión de
 * saturación, brillo y contraste de los 5 puntos centrales del cluster.
 */

import type { ClusterTuningParameters } from '../entities/ColorCluster';

/**
 * Definición inmutable de un preset tonal.
 */
export interface TonePresetDefinition {
  /** Identificador único del preset. */
  readonly id: string;
  /** Nombre visual legible del preset. */
  readonly name: string;
  /** Categoría o familia del preset. */
  readonly category: 'pale_pastel' | 'pastel' | 'vivid' | 'greyish';
  /** Parámetros de modulación del cluster. */
  readonly tuning: ClusterTuningParameters;
}

/**
 * Catálogo completo de presets cromáticos.
 */
export const TONE_PRESETS: readonly TonePresetDefinition[] = [
  // --- Columna 1: Pasteles Pálidos (Pale Pastels) ---
  {
    id: 'lightest_pale_pastel',
    name: 'Lightest Pale Pastel',
    category: 'pale_pastel',
    tuning: { saturationDelta: -60.0, brightnessDelta: 35.0, contrastScale: 0.6 }
  },
  {
    id: 'very_light_pale_pastel',
    name: 'Very Light Pale Pastel',
    category: 'pale_pastel',
    tuning: { saturationDelta: -50.0, brightnessDelta: 25.0, contrastScale: 0.7 }
  },
  {
    id: 'lighter_pale_pastel',
    name: 'Lighter Pale Pastel',
    category: 'pale_pastel',
    tuning: { saturationDelta: -45.0, brightnessDelta: 15.0, contrastScale: 0.8 }
  },
  {
    id: 'pale_pastel',
    name: 'Pale Pastel',
    category: 'pale_pastel',
    tuning: { saturationDelta: -40.0, brightnessDelta: 5.0, contrastScale: 0.85 }
  },
  {
    id: 'darker_pale_pastel',
    name: 'Darker Pale Pastel',
    category: 'pale_pastel',
    tuning: { saturationDelta: -35.0, brightnessDelta: -10.0, contrastScale: 0.9 }
  },
  {
    id: 'dark_pale_pastel',
    name: 'Dark Pale Pastel',
    category: 'pale_pastel',
    tuning: { saturationDelta: -30.0, brightnessDelta: -20.0, contrastScale: 0.9 }
  },

  // --- Columna 2: Pasteles Vibrantes (Pastels) ---
  {
    id: 'bright_pastel',
    name: 'Bright Pastel',
    category: 'pastel',
    tuning: { saturationDelta: -15.0, brightnessDelta: 25.0, contrastScale: 0.8 }
  },
  {
    id: 'very_light_pastel',
    name: 'Very Light Pastel',
    category: 'pastel',
    tuning: { saturationDelta: -20.0, brightnessDelta: 20.0, contrastScale: 0.85 }
  },
  {
    id: 'lighter_pastel',
    name: 'Lighter Pastel',
    category: 'pastel',
    tuning: { saturationDelta: -15.0, brightnessDelta: 10.0, contrastScale: 0.9 }
  },
  {
    id: 'pastel',
    name: 'Pastel',
    category: 'pastel',
    tuning: { saturationDelta: -10.0, brightnessDelta: 0.0, contrastScale: 1.0 }
  },
  {
    id: 'darker_pastel',
    name: 'Darker Pastel',
    category: 'pastel',
    tuning: { saturationDelta: -5.0, brightnessDelta: -15.0, contrastScale: 1.0 }
  },
  {
    id: 'dark_pastel',
    name: 'Dark Pastel',
    category: 'pastel',
    tuning: { saturationDelta: 0.0, brightnessDelta: -25.0, contrastScale: 1.05 }
  },

  // --- Columna 3: Saturados, Vívidos y Neón (Vivid / Full) ---
  {
    id: 'shiny',
    name: 'Shiny',
    category: 'vivid',
    tuning: { saturationDelta: 20.0, brightnessDelta: 15.0, contrastScale: 1.1 }
  },
  {
    id: 'full_colors',
    name: 'Full Colors',
    category: 'vivid',
    tuning: { saturationDelta: 20.0, brightnessDelta: 0.0, contrastScale: 1.1 }
  },
  {
    id: 'darker_colors',
    name: 'Darker Colors',
    category: 'vivid',
    tuning: { saturationDelta: 15.0, brightnessDelta: -10.0, contrastScale: 1.15 }
  },
  {
    id: 'dark_neon',
    name: 'Dark Neon',
    category: 'vivid',
    tuning: { saturationDelta: 25.0, brightnessDelta: -15.0, contrastScale: 1.3 }
  },
  {
    id: 'dark',
    name: 'Dark',
    category: 'vivid',
    tuning: { saturationDelta: 10.0, brightnessDelta: -25.0, contrastScale: 1.2 }
  },
  {
    id: 'deep_colors',
    name: 'Deep Colors',
    category: 'vivid',
    tuning: { saturationDelta: 20.0, brightnessDelta: -35.0, contrastScale: 1.3 }
  },

  // --- Escalas Grisáceas (Greyish) ---
  {
    id: 'greyish_darkest',
    name: 'Greyish darkest',
    category: 'greyish',
    tuning: { saturationDelta: -75.0, brightnessDelta: -35.0, contrastScale: 0.5 }
  },
  {
    id: 'greyish_dark',
    name: 'Greyish dark',
    category: 'greyish',
    tuning: { saturationDelta: -70.0, brightnessDelta: -20.0, contrastScale: 0.55 }
  },
  {
    id: 'greyish_medium_dark',
    name: 'Greyish medium dark',
    category: 'greyish',
    tuning: { saturationDelta: -65.0, brightnessDelta: -5.0, contrastScale: 0.6 }
  },
  {
    id: 'greyish_medium_light',
    name: 'Greyish medium light',
    category: 'greyish',
    tuning: { saturationDelta: -60.0, brightnessDelta: 10.0, contrastScale: 0.65 }
  },
  {
    id: 'greyish_lighter',
    name: 'Greyish lighter',
    category: 'greyish',
    tuning: { saturationDelta: -55.0, brightnessDelta: 25.0, contrastScale: 0.7 }
  },
  {
    id: 'greyish_lightest',
    name: 'Greyish lightest',
    category: 'greyish',
    tuning: { saturationDelta: -50.0, brightnessDelta: 40.0, contrastScale: 0.75 }
  }
];

/**
 * Obtiene un preset por su identificador único.
 *
 * Parameters
 * ----------
 * presetId : string
 *     Identificador del preset (ejemplo: 'shiny', 'pastel', 'deep_colors').
 *
 * Returns
 * -------
 * TonePresetDefinition | undefined
 *     La definición del preset o undefined si no existe.
 *
 * Examples
 * --------
 * >>> getTonePresetById('shiny')?.name;
 * 'Shiny'
 */
export function getTonePresetById(
  presetId: string
): TonePresetDefinition | undefined {
  return TONE_PRESETS.find(
    (preset: TonePresetDefinition) => preset.id === presetId
  );
}
