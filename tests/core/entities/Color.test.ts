import { describe, expect, it } from 'vitest';
import { Color } from '../../../src/core/entities/Color';

describe('Color Entity (Value Object)', () => {
  it('debe instanciarse correctamente desde RGB y generar HEX', () => {
    const color = Color.fromRgb(255, 128, 0);
    expect(color.red).toBe(255);
    expect(color.green).toBe(128);
    expect(color.blue).toBe(0);
    expect(color.toHex()).toBe('#FF8000');
  });

  it('debe instanciarse correctamente desde HEX con y sin #', () => {
    const color = Color.fromHex('#AA3939');
    expect(color.toHex()).toBe('#AA3939');
    expect(color.red).toBe(170);
    expect(color.green).toBe(57);
    expect(color.blue).toBe(57);
  });

  it('debe instanciarse correctamente desde HSL', () => {
    const color = Color.fromHsl(120.0, 100.0, 50.0);
    expect(color.toHex()).toBe('#00FF00');
  });

  it('debe producir formatos de texto numérico y porcentual (toRgbFormatString y toRgbPercentFormatString)', () => {
    const color = Color.fromRgb(254, 34, 11);
    expect(color.toRgbFormatString()).toBe('254–34–11');
    expect(color.toRgbPercentFormatString()).toBe('99.6–13.3–4.3%');
  });

  it('debe generar tintes (Tints) aclarando hacia blanco', () => {
    const pureRed = Color.fromRgb(255, 0, 0);
    const lightPink = pureRed.createTint(0.5);

    expect(lightPink.red).toBe(255);
    expect(lightPink.green).toBeGreaterThan(0);
    expect(lightPink.blue).toBeGreaterThan(0);
    expect(lightPink.green).toBe(lightPink.blue);
  });

  it('debe generar sombras (Shades) oscureciendo hacia negro', () => {
    const pureRed = Color.fromRgb(255, 0, 0);
    const darkRed = pureRed.createShade(0.5);

    expect(darkRed.red).toBe(128);
    expect(darkRed.green).toBe(0);
    expect(darkRed.blue).toBe(0);
  });

  it('debe generar tonos (Tones) mezclando hacia gris neutro', () => {
    const pureRed = Color.fromRgb(255, 0, 0);
    const mutedRed = pureRed.createTone(0.5);

    expect(mutedRed.red).toBeLessThan(255);
    expect(mutedRed.green).toBeGreaterThan(0);
    expect(mutedRed.blue).toBeGreaterThan(0);
  });
});
