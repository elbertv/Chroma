import { describe, expect, it } from 'vitest';
import {
  calculateRybHarmonyAngles,
  generateHarmonyPalette
} from '../../../src/core/harmonies/harmony_calculator';

describe('calculateRybHarmonyAngles', () => {
  it('debe devolver 1 ángulo para monochromatic sin complementario, y 2 con complementario', () => {
    const singleAngle = calculateRybHarmonyAngles(0.0, 'monochromatic', 30.0, false);
    expect(singleAngle).toEqual([0.0]);

    const withComp = calculateRybHarmonyAngles(0.0, 'monochromatic', 30.0, true);
    expect(withComp).toEqual([0.0, 180.0]);
  });

  it('debe devolver 3 ángulos para adjacent sin complementario, y 4 con complementario', () => {
    const noComp = calculateRybHarmonyAngles(60.0, 'adjacent', 30.0, false);
    expect(noComp).toEqual([60.0, 30.0, 90.0]);

    const withComp = calculateRybHarmonyAngles(60.0, 'adjacent', 30.0, true);
    expect(withComp).toEqual([60.0, 30.0, 90.0, 240.0]);
  });

  it('debe devolver 3 ángulos para tríada sin complementario, y 4 con complementario', () => {
    const noComp = calculateRybHarmonyAngles(0.0, 'triad', 30.0, false);
    expect(noComp).toEqual([0.0, 120.0, 240.0]);

    const withComp = calculateRybHarmonyAngles(0.0, 'triad', 30.0, true);
    expect(withComp).toEqual([0.0, 120.0, 240.0, 180.0]);
  });

  it('debe calcular 4 ángulos para tétrada con dos ejes complementarios a 180°', () => {
    const angles = calculateRybHarmonyAngles(0.0, 'tetrad', 30.0);
    expect(angles).toEqual([0.0, 30.0, 180.0, 210.0]);
  });

  it('debe restringir la distancia angular en el rango [5°, 175°] impidiendo 0° y 180°', () => {
    // Si se pasa 0° o menor, debe clampear a 5° (nunca el mismo color)
    const minClamped = calculateRybHarmonyAngles(0.0, 'tetrad', 0.0);
    expect(minClamped).toEqual([0.0, 5.0, 180.0, 185.0]);

    // Si se pasa 180° o mayor, debe clampear a 175° (nunca el complementario)
    const maxClamped = calculateRybHarmonyAngles(0.0, 'tetrad', 180.0);
    expect(maxClamped).toEqual([0.0, 175.0, 180.0, 355.0]);

    // En 175° legítimo
    const at175 = calculateRybHarmonyAngles(0.0, 'tetrad', 175.0);
    expect(at175).toEqual([0.0, 175.0, 180.0, 355.0]);
  });

  it('debe devolver ángulos de tetrad por defecto en freeform, o los ángulos arbitrarios provistos', () => {
    const defaultFreeform = calculateRybHarmonyAngles(0.0, 'freeform', 30.0);
    expect(defaultFreeform).toEqual([0.0, 30.0, 180.0, 210.0]);

    const customAngles = [10.0, 75.0, 190.0, 280.0];
    const customFreeform = calculateRybHarmonyAngles(0.0, 'freeform', 30.0, false, customAngles);
    expect(customFreeform).toEqual([10.0, 75.0, 190.0, 280.0]);
  });
});

describe('generateHarmonyPalette', () => {
  it('debe generar 4 clusters (20 colores en total) para el modo tetrad', () => {
    const palette = generateHarmonyPalette({
      primaryHue: 0.0, // Rojo en RGB
      mode: 'tetrad',
      distanceAngleInDegrees: 30.0
    });

    expect(palette.mode).toBe('tetrad');
    expect(palette.clusters.length).toBe(4);

    const totalColorsCount = palette.clusters.reduce(
      (acc, cluster) => acc + cluster.toArray().length,
      0
    );
    expect(totalColorsCount).toBe(20);
  });

  it('debe generar 2 clusters para monochromatic con addComplementary true', () => {
    const palette = generateHarmonyPalette({
      primaryHue: 0.0,
      mode: 'monochromatic',
      addComplementary: true
    });

    expect(palette.clusters.length).toBe(2);
    expect(palette.clusters[0]?.base.toHsl().hue).toBeCloseTo(0.0, 1);
  });

  it('debe alternar entre Ajuste Espectral Perceptual y sRGB digital estándar', () => {
    // 1. Con spectralCalibration = true (default)
    const spectralPalette = generateHarmonyPalette({
      primaryHue: 0.0,
      mode: 'tetrad',
      distanceAngleInDegrees: 30.0,
      baseSaturationPercent: 50.0,
      baseLightnessPercent: 50.0,
      spectralCalibration: true
    });

    // Verde complementario (cluster índice 2, 180° RYB)
    const complCluster = spectralPalette.clusters[2];
    expect(complCluster).toBeDefined();
    expect(complCluster?.base.toHex()).toBe('#2D882D');
    expect(complCluster?.bright.toHex()).toBe('#55AA55');
    expect(complCluster?.tint.toHex()).toBe('#88CC88');

    // 2. Con spectralCalibration = false (Modo sRGB tradicional)
    const standardPalette = generateHarmonyPalette({
      primaryHue: 0.0,
      mode: 'tetrad',
      distanceAngleInDegrees: 30.0,
      baseSaturationPercent: 50.0,
      baseLightnessPercent: 50.0,
      spectralCalibration: false
    });

    const standardComplCluster = standardPalette.clusters[2];
    // En sRGB estándar, el verde es mucho más luminoso
    expect(standardComplCluster).toBeDefined();
    expect(standardComplCluster?.base.toHex()).toBe('#40BF40');
    expect(standardComplCluster?.bright.toHex()).toBe('#67E467');
  });
});
