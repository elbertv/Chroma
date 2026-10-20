import { describe, expect, it } from 'vitest';
import {
  applyChromaK,
  chromaHsvToRgb,
  DEFAULT_CHROMA_VARIANT_FACTORS,
  discCoordToK,
  getChromaSpectralBaseColor
} from '../src/core/math/chroma_wheel_engine';

describe('ChromaWheelEngine (Ajuste Espectral Perceptual)', () => {
  it('debe reproducir las atenuaciones de brillo y saturación en las anclas clave', () => {
    // Rojo 0°
    const red = getChromaSpectralBaseColor(0);
    expect(red.v).toBeCloseTo(1.0, 3);
    expect(red.s).toBeCloseTo(1.0, 3);

    // Amarillo 120°
    const yellow = getChromaSpectralBaseColor(120);
    expect(yellow.v).toBeCloseTo(1.0, 3);
    expect(yellow.s).toBeCloseTo(1.0, 3);

    // Verde 180° (Atenuación fotópica a 0.80)
    const green = getChromaSpectralBaseColor(180);
    expect(green.v).toBeCloseTo(0.8, 3);
    expect(green.s).toBeCloseTo(1.0, 3);

    // Cian 210° (Atenuación a 0.60)
    const cyan = getChromaSpectralBaseColor(210);
    expect(cyan.v).toBeCloseTo(0.6, 3);
    expect(cyan.s).toBeCloseTo(1.0, 3);

    // Azul 255° (Atenuación a S=0.85, V=0.70)
    const blue = getChromaSpectralBaseColor(255);
    expect(blue.v).toBeCloseTo(0.7, 3);
    expect(blue.s).toBeCloseTo(0.85, 3);

    // Magenta 315° (Atenuación a 0.65)
    const magenta = getChromaSpectralBaseColor(315);
    expect(magenta.v).toBeCloseTo(0.65, 3);
    expect(magenta.s).toBeCloseTo(1.0, 3);
  });

  it('debe transformar la coordenada del disco (normX, normY) a los factores k con threshold 0.5', () => {
    // Centro del domo (0.0) -> k = 2/3 ≈ 0.66667
    expect(discCoordToK(0)).toBeCloseTo(2 / 3, 4);

    // Límite izquierdo (-1.0) -> k = 0.0
    expect(discCoordToK(-1)).toBeCloseTo(0.0, 4);

    // Límite derecho (+1.0) -> k = 2.0
    expect(discCoordToK(1)).toBeCloseTo(2.0, 4);
  });

  it('debe calcular los 20 colores armónicos de referencia con precisión absoluta', () => {
    const expectedColors: Record<number, string[]> = {
      // Primario: Rojo (0°)
      0: ['#AA3939', '#FFAAAA', '#D46A6A', '#801515', '#550000'],
      // Secundario 1: Naranja-Rojo (30°)
      30: ['#AA6C39', '#FFD1AA', '#D49A6A', '#804515', '#552700'],
      // Complementario: Verde (180°)
      180: ['#2D882D', '#88CC88', '#55AA55', '#116611', '#004400'],
      // Secundario 2: Cian (210°)
      210: ['#226666', '#669999', '#407F7F', '#0D4D4D', '#003333']
    };

    for (const [hueStr, expectedHexes] of Object.entries(expectedColors)) {
      const hue = Number(hueStr);
      const baseHsv = getChromaSpectralBaseColor(hue);

      DEFAULT_CHROMA_VARIANT_FACTORS.forEach(([kS, kV], vIdx) => {
        const finalS = applyChromaK(baseHsv.s, kS);
        const finalV = applyChromaK(baseHsv.v, kV);
        const rgb = chromaHsvToRgb(hue, finalS, finalV);

        expect(rgb.hex).toBe(expectedHexes[vIdx]);
      });
    }
  });
});
