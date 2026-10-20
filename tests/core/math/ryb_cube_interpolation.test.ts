import { describe, expect, it } from 'vitest';
import {
  clampNormalizedValue,
  interpolateRybToRgb
} from '../../../src/core/math/ryb_cube_interpolation';
import type {
  NormalizedRgbColor,
  NormalizedRybColor
} from '../../../src/core/types/color.types';

describe('clampNormalizedValue', () => {
  it('debe mantener intactos los valores en el intervalo [0.0, 1.0]', () => {
    expect(clampNormalizedValue(0.0)).toBe(0.0);
    expect(clampNormalizedValue(0.5)).toBe(0.5);
    expect(clampNormalizedValue(1.0)).toBe(1.0);
  });

  it('debe acotar valores inferiores a cero a 0.0', () => {
    expect(clampNormalizedValue(-0.01)).toBe(0.0);
    expect(clampNormalizedValue(-100.0)).toBe(0.0);
  });

  it('debe acotar valores superiores a uno a 1.0', () => {
    expect(clampNormalizedValue(1.05)).toBe(1.0);
    expect(clampNormalizedValue(999.0)).toBe(1.0);
  });
});

describe('interpolateRybToRgb - Vértices del Cubo Gossett & Chen', () => {
  it('debe mapear el origen (0, 0, 0) a Blanco puro (1, 1, 1)', () => {
    const input: NormalizedRybColor = { red: 0.0, yellow: 0.0, blue: 0.0 };
    const result: NormalizedRgbColor = interpolateRybToRgb(input);
    expect(result.red).toBeCloseTo(1.0, 4);
    expect(result.green).toBeCloseTo(1.0, 4);
    expect(result.blue).toBeCloseTo(1.0, 4);
  });

  it('debe mapear (1, 0, 0) a Rojo puro (1, 0, 0)', () => {
    const input: NormalizedRybColor = { red: 1.0, yellow: 0.0, blue: 0.0 };
    const result: NormalizedRgbColor = interpolateRybToRgb(input);
    expect(result.red).toBeCloseTo(1.0, 4);
    expect(result.green).toBeCloseTo(0.0, 4);
    expect(result.blue).toBeCloseTo(0.0, 4);
  });

  it('debe mapear (0, 1, 0) a Amarillo puro (1, 1, 0)', () => {
    const input: NormalizedRybColor = { red: 0.0, yellow: 1.0, blue: 0.0 };
    const result: NormalizedRgbColor = interpolateRybToRgb(input);
    expect(result.red).toBeCloseTo(1.0, 4);
    expect(result.green).toBeCloseTo(1.0, 4);
    expect(result.blue).toBeCloseTo(0.0, 4);
  });

  it('debe mapear (0, 0, 1) a Azul de pigmento (0.163, 0.373, 0.6)', () => {
    const input: NormalizedRybColor = { red: 0.0, yellow: 0.0, blue: 1.0 };
    const result: NormalizedRgbColor = interpolateRybToRgb(input);
    expect(result.red).toBeCloseTo(0.163, 3);
    expect(result.green).toBeCloseTo(0.373, 3);
    expect(result.blue).toBeCloseTo(0.6, 3);
  });

  it('debe mapear Amarillo + Azul (0, 1, 1) a Verde de pigmento (0.0, 0.66, 0.2)', () => {
    const input: NormalizedRybColor = { red: 0.0, yellow: 1.0, blue: 1.0 };
    const result: NormalizedRgbColor = interpolateRybToRgb(input);
    expect(result.red).toBeCloseTo(0.0, 4);
    expect(result.green).toBeCloseTo(0.66, 2);
    expect(result.blue).toBeCloseTo(0.2, 2);
  });

  it('debe mapear Rojo + Amarillo (1, 1, 0) a Naranja (1.0, 0.5, 0.0)', () => {
    const input: NormalizedRybColor = { red: 1.0, yellow: 1.0, blue: 0.0 };
    const result: NormalizedRgbColor = interpolateRybToRgb(input);
    expect(result.red).toBeCloseTo(1.0, 4);
    expect(result.green).toBeCloseTo(0.5, 4);
    expect(result.blue).toBeCloseTo(0.0, 4);
  });

  it('debe mapear Rojo + Azul (1, 0, 1) a Violeta (0.5, 0.0, 0.5)', () => {
    const input: NormalizedRybColor = { red: 1.0, yellow: 0.0, blue: 1.0 };
    const result: NormalizedRgbColor = interpolateRybToRgb(input);
    expect(result.red).toBeCloseTo(0.5, 4);
    expect(result.green).toBeCloseTo(0.0, 4);
    expect(result.blue).toBeCloseTo(0.5, 4);
  });

  it('debe mapear (1, 1, 1) a Negro puro (0.0, 0.0, 0.0)', () => {
    const input: NormalizedRybColor = { red: 1.0, yellow: 1.0, blue: 1.0 };
    const result: NormalizedRgbColor = interpolateRybToRgb(input);
    expect(result.red).toBeCloseTo(0.0, 4);
    expect(result.green).toBeCloseTo(0.0, 4);
    expect(result.blue).toBeCloseTo(0.0, 4);
  });

  it('debe generar una mezcla suave y continua para 50% Amarillo y 50% Azul', () => {
    // Mitad de pigmento amarillo y mitad de pigmento azul sobre papel blanco
    const input: NormalizedRybColor = { red: 0.0, yellow: 0.5, blue: 0.5 };
    const result: NormalizedRgbColor = interpolateRybToRgb(input);
    // El verde resultante debe tener un componente verde predominante sobre el rojo
    expect(result.green).toBeGreaterThan(result.red);
    expect(result.green).toBeGreaterThan(result.blue);
  });
});
