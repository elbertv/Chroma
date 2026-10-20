import { describe, expect, it } from 'vitest';
import {
  calculateArtisticComplementaryInRgb,
  convertRgbHueToRybHue,
  convertRybHueToRgbHue,
  normalizeHueAngle
} from '../../../src/core/math/ryb_hue_mapping';

describe('normalizeHueAngle', () => {
  it('debe mantener intactos los ángulos ya normalizados en [0, 360)', () => {
    expect(normalizeHueAngle(0.0)).toBe(0.0);
    expect(normalizeHueAngle(180.5)).toBe(180.5);
    expect(normalizeHueAngle(359.9)).toBe(359.9);
  });

  it('debe normalizar ángulos mayores a 360 grados periódicamente', () => {
    expect(normalizeHueAngle(360.0)).toBe(0.0);
    expect(normalizeHueAngle(370.0)).toBe(10.0);
    expect(normalizeHueAngle(720.0)).toBe(0.0);
  });

  it('debe normalizar ángulos negativos al cuadrante positivo correspondiente', () => {
    expect(normalizeHueAngle(-30.0)).toBe(330.0);
    expect(normalizeHueAngle(-360.0)).toBe(0.0);
    expect(normalizeHueAngle(-390.0)).toBe(330.0);
  });
});

describe('convertRgbHueToRybHue y convertRybHueToRgbHue', () => {
  it('debe mapear con precisión los 6 puntos de anclaje primarios y secundarios', () => {
    // Rojo
    expect(convertRgbHueToRybHue(0.0)).toBeCloseTo(0.0, 5);
    expect(convertRybHueToRgbHue(0.0)).toBeCloseTo(0.0, 5);

    // Naranja: 30° en RGB -> 60° en RYB
    expect(convertRgbHueToRybHue(30.0)).toBeCloseTo(60.0, 5);
    expect(convertRybHueToRgbHue(60.0)).toBeCloseTo(30.0, 5);

    // Amarillo: 60° en RGB -> 120° en RYB
    expect(convertRgbHueToRybHue(60.0)).toBeCloseTo(120.0, 5);
    expect(convertRybHueToRgbHue(120.0)).toBeCloseTo(60.0, 5);

    // Verde: 120° en RGB -> 180° en RYB (opuesto al rojo)
    expect(convertRgbHueToRybHue(120.0)).toBeCloseTo(180.0, 5);
    expect(convertRybHueToRgbHue(180.0)).toBeCloseTo(120.0, 5);

    // Azul: 240° en RGB -> 240° en RYB
    expect(convertRgbHueToRybHue(240.0)).toBeCloseTo(240.0, 5);
    expect(convertRybHueToRgbHue(240.0)).toBeCloseTo(240.0, 5);

    // Violeta: 300° en RGB -> 300° en RYB
    expect(convertRgbHueToRybHue(300.0)).toBeCloseTo(300.0, 5);
    expect(convertRybHueToRgbHue(300.0)).toBeCloseTo(300.0, 5);
  });

  it('debe ser invertible (round-trip idempotente) en cualquier ángulo intermedio', () => {
    const testAnglesInDegrees: number[] = [15.0, 45.0, 90.0, 150.0, 200.0, 270.0, 330.0];

    for (const originalAngle of testAnglesInDegrees) {
      const mappedRyb: number = convertRgbHueToRybHue(originalAngle);
      const restoredRgb: number = convertRybHueToRgbHue(mappedRyb);
      expect(restoredRgb).toBeCloseTo(originalAngle, 5);
    }
  });
});

describe('calculateArtisticComplementaryInRgb', () => {
  it('debe devolver Verde (120° RGB) como complementario del Rojo (0° RGB)', () => {
    const complementaryOfRed: number = calculateArtisticComplementaryInRgb(0.0);
    expect(complementaryOfRed).toBeCloseTo(120.0, 5);
  });

  it('debe devolver Rojo (0° RGB) como complementario del Verde (120° RGB)', () => {
    const complementaryOfGreen: number = calculateArtisticComplementaryInRgb(120.0);
    expect(complementaryOfGreen).toBeCloseTo(0.0, 5);
  });

  it('debe devolver Violeta (300° RGB) como complementario del Amarillo (60° RGB)', () => {
    // En RYB: Amarillo está a 120°. +180° = 300° (Violeta en RYB). En RGB: 300° es Violeta.
    const complementaryOfYellow: number = calculateArtisticComplementaryInRgb(60.0);
    expect(complementaryOfYellow).toBeCloseTo(300.0, 5);
  });
});
