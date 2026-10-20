import { describe, expect, it } from 'vitest';
import {
  getTonePresetById,
  TONE_PRESETS
} from '../../../src/core/presets/preset_catalog';

describe('Catálogo de Presets Tonales', () => {
  it('debe contener los 24 presets organizados en 4 familias', () => {
    expect(TONE_PRESETS.length).toBe(24);

    const palePastels = TONE_PRESETS.filter((p) => p.category === 'pale_pastel');
    const pastels = TONE_PRESETS.filter((p) => p.category === 'pastel');
    const vivids = TONE_PRESETS.filter((p) => p.category === 'vivid');
    const greyish = TONE_PRESETS.filter((p) => p.category === 'greyish');

    expect(palePastels.length).toBe(6);
    expect(pastels.length).toBe(6);
    expect(vivids.length).toBe(6);
    expect(greyish.length).toBe(6);
  });

  it('debe encontrar presets específicos por ID', () => {
    const shiny = getTonePresetById('shiny');
    expect(shiny).toBeDefined();
    expect(shiny?.name).toBe('Shiny');
    expect(shiny?.tuning.saturationDelta).toBeGreaterThan(0);

    const darkNeon = getTonePresetById('dark_neon');
    expect(darkNeon).toBeDefined();
    expect(darkNeon?.name).toBe('Dark Neon');

    const nonExistent = getTonePresetById('inexistente');
    expect(nonExistent).toBeUndefined();
  });
});
