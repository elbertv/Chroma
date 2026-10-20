import { describe, expect, it } from 'vitest';
import { ColorCluster } from '../../../src/core/entities/ColorCluster';

describe('ColorCluster Entity', () => {
  it('debe generar las 5 variantes a partir de un tono y coordenadas base', () => {
    const cluster = ColorCluster.fromHueAndTone(0.0, 80.0, 50.0);

    expect(cluster.base).toBeDefined();
    expect(cluster.tint).toBeDefined();
    expect(cluster.bright).toBeDefined();
    expect(cluster.shade).toBeDefined();
    expect(cluster.tone).toBeDefined();

    // El tinte debe tener mayor luminosidad que la base
    expect(cluster.tint.toHsl().lightness).toBeGreaterThan(cluster.base.toHsl().lightness);

    // La sombra debe tener menor luminosidad que la base
    expect(cluster.shade.toHsl().lightness).toBeLessThan(cluster.base.toHsl().lightness);

    // El tono debe tener menor saturación que la base
    expect(cluster.tone.toHsl().saturation).toBeLessThan(cluster.base.toHsl().saturation);
  });

  it('debe retornar las 5 variantes en el método toArray()', () => {
    const cluster = ColorCluster.fromHueAndTone(120.0, 70.0, 50.0);
    const variants = cluster.toArray();

    expect(variants.length).toBe(5);
    expect(variants[2]).toEqual(cluster.base);
  });

  it('debe respetar los parámetros de tuning (saturación, brillo, contraste)', () => {
    const normalCluster = ColorCluster.fromHueAndTone(200.0, 50.0, 50.0);
    const brightCluster = ColorCluster.fromHueAndTone(200.0, 50.0, 50.0, {
      saturationDelta: 20.0,
      brightnessDelta: 20.0,
      contrastScale: 1.5
    });

    expect(brightCluster.base.toHsl().lightness).toBeGreaterThan(
      normalCluster.base.toHsl().lightness
    );
    expect(brightCluster.base.toHsl().saturation).toBeGreaterThan(
      normalCluster.base.toHsl().saturation
    );
  });
});
