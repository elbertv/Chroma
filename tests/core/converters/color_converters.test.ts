import { describe, expect, it } from 'vitest';
import {
  byteRgbToHex,
  byteRgbToHsl,
  byteRgbToNormalizedRgb,
  hexToByteRgb,
  hslToByteRgb,
  normalizedRgbToByteRgb
} from '../../../src/core/converters/color_converters';
import type { ByteRgbColor, HslColor } from '../../../src/core/types/color.types';

describe('hexToByteRgb y byteRgbToHex', () => {
  it('debe convertir colores HEX de 6 dígitos con y sin #', () => {
    expect(hexToByteRgb('#FF0000')).toEqual({ red: 255, green: 0, blue: 0 });
    expect(hexToByteRgb('00FF00')).toEqual({ red: 0, green: 255, blue: 0 });
    expect(hexToByteRgb('#0000FF')).toEqual({ red: 0, green: 0, blue: 255 });
    expect(hexToByteRgb('#AA3939')).toEqual({ red: 170, green: 57, blue: 57 });
  });

  it('debe soportar formato HEX taquigráfico de 3 dígitos (#RGB)', () => {
    expect(hexToByteRgb('#F00')).toEqual({ red: 255, green: 0, blue: 0 });
    expect(hexToByteRgb('#0F0')).toEqual({ red: 0, green: 255, blue: 0 });
    expect(hexToByteRgb('#FFF')).toEqual({ red: 255, green: 255, blue: 255 });
  });

  it('debe convertir ByteRgb a HEX en mayúsculas de forma precisa', () => {
    expect(byteRgbToHex({ red: 255, green: 0, blue: 0 })).toBe('#FF0000');
    expect(byteRgbToHex({ red: 170, green: 57, blue: 57 })).toBe('#AA3939');
    expect(byteRgbToHex({ red: 0, green: 0, blue: 0 })).toBe('#000000');
    expect(byteRgbToHex({ red: 255, green: 255, blue: 255 })).toBe('#FFFFFF');
  });

  it('debe manejar valores fuera de rango sujetándolos a [0, 255]', () => {
    expect(byteRgbToHex({ red: -50, green: 300, blue: 128 })).toBe('#00FF80');
  });
});

describe('byteRgbToNormalizedRgb y normalizedRgbToByteRgb', () => {
  it('debe normalizar y desnormalizar de forma bidireccional', () => {
    const input: ByteRgbColor = { red: 255, green: 128, blue: 64 };
    const normalized = byteRgbToNormalizedRgb(input);
    expect(normalized.red).toBe(1.0);
    expect(normalized.green).toBeCloseTo(128 / 255, 4);
    expect(normalized.blue).toBeCloseTo(64 / 255, 4);

    const restored: ByteRgbColor = normalizedRgbToByteRgb(normalized);
    expect(restored).toEqual(input);
  });
});

describe('byteRgbToHsl y hslToByteRgb', () => {
  it('debe convertir primarios y secundarios puros entre RGB y HSL', () => {
    // Rojo
    const redHsl: HslColor = byteRgbToHsl({ red: 255, green: 0, blue: 0 });
    expect(redHsl.hue).toBeCloseTo(0.0, 1);
    expect(redHsl.saturation).toBeCloseTo(100.0, 1);
    expect(redHsl.lightness).toBeCloseTo(50.0, 1);
    expect(hslToByteRgb(redHsl)).toEqual({ red: 255, green: 0, blue: 0 });

    // Verde
    const greenHsl: HslColor = byteRgbToHsl({ red: 0, green: 255, blue: 0 });
    expect(greenHsl.hue).toBeCloseTo(120.0, 1);
    expect(greenHsl.saturation).toBeCloseTo(100.0, 1);
    expect(greenHsl.lightness).toBeCloseTo(50.0, 1);
    expect(hslToByteRgb(greenHsl)).toEqual({ red: 0, green: 255, blue: 0 });

    // Azul
    const blueHsl: HslColor = byteRgbToHsl({ red: 0, green: 0, blue: 255 });
    expect(blueHsl.hue).toBeCloseTo(240.0, 1);
    expect(blueHsl.saturation).toBeCloseTo(100.0, 1);
    expect(blueHsl.lightness).toBeCloseTo(50.0, 1);
    expect(hslToByteRgb(blueHsl)).toEqual({ red: 0, green: 0, blue: 255 });

    // Blanco
    const whiteHsl: HslColor = byteRgbToHsl({ red: 255, green: 255, blue: 255 });
    expect(whiteHsl.lightness).toBeCloseTo(100.0, 1);
    expect(hslToByteRgb(whiteHsl)).toEqual({ red: 255, green: 255, blue: 255 });

    // Negro
    const blackHsl: HslColor = byteRgbToHsl({ red: 0, green: 0, blue: 0 });
    expect(blackHsl.lightness).toBeCloseTo(0.0, 1);
    expect(hslToByteRgb(blackHsl)).toEqual({ red: 0, green: 0, blue: 0 });
  });

  it('debe mantener consistencia para el color de referencia #AA3939', () => {
    const referenceRed: ByteRgbColor = { red: 170, green: 57, blue: 57 };
    const hsl: HslColor = byteRgbToHsl(referenceRed);
    const roundTripRgb: ByteRgbColor = hslToByteRgb(hsl);

    expect(roundTripRgb.red).toBe(referenceRed.red);
    expect(roundTripRgb.green).toBe(referenceRed.green);
    expect(roundTripRgb.blue).toBe(referenceRed.blue);
  });
});
