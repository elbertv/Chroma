import { describe, expect, it } from 'vitest';
import {
  detectHarmonyModeFromRybHues,
  extractPaletteFromPixels,
  quantizePixels,
  type RgbPixel,
  samplePixelsFromImageData
} from '../../../src/core/extraction/image_palette_extractor';

describe('image_palette_extractor (Median Cut Quantization & RYB Harmony Suggestion)', () => {
  it('debe devolver resultado por defecto cuando el array de píxeles está vacío', () => {
    const result = extractPaletteFromPixels([]);
    expect(result.dominantColors.length).toBe(1);
    expect(result.suggestedHarmonyMode).toBe('monochromatic');
  });

  it('debe cuantizar y separar píxeles de colores contrastantes (Rojo y Azul)', () => {
    // 50 píxeles rojos y 50 píxeles azules
    const pixels: RgbPixel[] = [
      ...Array.from({ length: 50 }, () => ({ r: 255, g: 0, b: 0 })),
      ...Array.from({ length: 50 }, () => ({ r: 0, g: 0, b: 255 }))
    ];

    const clusters = quantizePixels(pixels, 2);
    expect(clusters.length).toBe(2);

    const hasRed = clusters.some((c) => c.color.red > 200 && c.color.blue < 50);
    const hasBlue = clusters.some((c) => c.color.blue > 200 && c.color.red < 50);

    expect(hasRed).toBe(true);
    expect(hasBlue).toBe(true);
  });

  it('debe ordenar los colores extraídos por porcentaje de prevalencia descendente', () => {
    // 70 píxeles verdes, 20 amarillos y 10 rojos
    const pixels: RgbPixel[] = [
      ...Array.from({ length: 70 }, () => ({ r: 0, g: 255, b: 0 })),
      ...Array.from({ length: 20 }, () => ({ r: 255, g: 255, b: 0 })),
      ...Array.from({ length: 10 }, () => ({ r: 255, g: 0, b: 0 }))
    ];

    const result = extractPaletteFromPixels(pixels, 3);
    expect(result.dominantColors.length).toBeGreaterThanOrEqual(2);

    // El primer color debe ser el más frecuente (verde)
    const primary = result.dominantColors[0]!;
    expect(primary.percentage).toBeGreaterThanOrEqual(50);
    expect(primary.color.green).toBeGreaterThan(primary.color.red);
  });

  it('debe sugerir modo monocromático cuando todos los colores son cercanos en el círculo RYB', () => {
    // Matices entre 10° y 30°
    const mode = detectHarmonyModeFromRybHues([10, 20, 25, 30]);
    expect(mode).toBe('monochromatic');
  });

  it('debe sugerir modo adyacente cuando los matices cubren un arco de hasta 90°', () => {
    const mode = detectHarmonyModeFromRybHues([10, 45, 80]);
    expect(mode).toBe('adjacent');
  });

  it('debe sugerir modo tríada cuando los matices forman distancias de ~120°', () => {
    const mode = detectHarmonyModeFromRybHues([0, 120, 240]);
    expect(mode).toBe('triad');
  });

  it('debe sugerir tétrada cuando los matices cubren ejes opuestos o gran dispersión', () => {
    const mode = detectHarmonyModeFromRybHues([0, 90, 180, 270]);
    expect(mode).toBe('tetrad');
  });

  it('debe muestrear píxeles de ImageData omitiendo los transparentes', () => {
    // 4 píxeles RGBA: 2 opacos y 2 transparentes (alpha < 128)
    const rawData = new Uint8ClampedArray([
      255, 0, 0, 255,     // Rojo opaco
      0, 255, 0, 255,     // Verde opaco
      0, 0, 255, 50,      // Azul transparente (omitir)
      255, 255, 255, 0    // Blanco transparente (omitir)
    ]);

    const sampled = samplePixelsFromImageData(rawData, 2, 2, 10);
    expect(sampled.length).toBe(2);
    expect(sampled[0]?.r).toBe(255);
    expect(sampled[1]?.g).toBe(255);
  });
});
