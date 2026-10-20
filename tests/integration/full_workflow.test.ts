import { describe, expect, it } from 'vitest';
import { Color } from '../../src/core/entities/Color';
import { extractPaletteFromPixels, type RgbPixel } from '../../src/core/extraction/image_palette_extractor';
import { generateHarmonyPalette } from '../../src/core/harmonies/harmony_calculator';
import { convertRgbHueToRybHue, convertRybHueToRgbHue } from '../../src/core/math/ryb_hue_mapping';
import { calculateDomeClusterPoints } from '../../src/core/math/spherical_point_follower';
import { ARTIST_PIGMENTS, mixPhysicalPaint } from '../../src/core/mixing/paint_mixer';
import { deserializeHashToPalette, serializePaletteToHash } from '../../src/core/url/palette_url_serializer';

describe('Fase 6.1: Pruebas de Integración y Flujos Completos End-to-End', () => {
  it('Flujo 1: Debe generar una paleta tetrad completa, calcular variantes tonales y contrastes relativos', () => {
    // 1. Matiz primario en espacio RYB a 0° (Rojo tradicional) con distancia de 45°
    const palette = generateHarmonyPalette({
      primaryHue: 0.0,
      isInputInRgb: false,
      mode: 'tetrad',
      distanceAngleInDegrees: 45.0,
      baseSaturationPercent: 80.0,
      baseLightnessPercent: 50.0,
      tuning: {
        saturationDelta: 0,
        brightnessDelta: 0,
        contrastScale: 1.0
      }
    });

    expect(palette.mode).toBe('tetrad');
    expect(palette.clusters.length).toBe(4);

    // Cada cluster debe tener sus 5 variantes bien formadas (Tint, Bright, Base, Shade, Tone)
    palette.clusters.forEach((cluster) => {
      expect(cluster.base).toBeDefined();
      expect(cluster.tint).toBeDefined();
      expect(cluster.bright).toBeDefined();
      expect(cluster.shade).toBeDefined();
      expect(cluster.tone).toBeDefined();

      const variants = cluster.toArray();
      expect(variants.length).toBe(5);

      // El tinte debe ser más luminoso que la sombra
      expect(cluster.tint.toHsl().lightness).toBeGreaterThan(cluster.shade.toHsl().lightness);
    });

    // Total de colores generados = 20 muestras
    const totalColors = palette.clusters.flatMap((c) => c.toArray());
    expect(totalColors.length).toBe(20);
  });

  it('Flujo 2: Debe serializar una paleta a hash URL permalink y reconstruirla idénticamente (Roundtrip)', () => {
    const originalState = {
      primaryRybHue: 120.0, // Amarillo artístico en RYB
      distanceAngle: 55.0,
      harmonyMode: 'adjacent' as const,
      addComplementary: true,
      baseSaturation: 75.0,
      baseLightness: 45.0,
      contrastScale: 1.25
    };

    const hash = serializePaletteToHash(originalState);
    expect(hash.startsWith('#')).toBe(true);

    const restoredState = deserializeHashToPalette(hash);
    expect(restoredState).not.toBeNull();
    expect(restoredState?.primaryRybHue).toBe(originalState.primaryRybHue);
    expect(restoredState?.distanceAngle).toBe(originalState.distanceAngle);
    expect(restoredState?.harmonyMode).toBe(originalState.harmonyMode);
    expect(restoredState?.addComplementary).toBe(originalState.addComplementary);
    expect(restoredState?.baseSaturation).toBe(originalState.baseSaturation);
    expect(restoredState?.baseLightness).toBe(originalState.baseLightness);
    expect(restoredState?.contrastScale).toBe(originalState.contrastScale);
  });

  it('Flujo 3: Debe mezclar físicamente colores de la paleta con tubos de bellas artes y transferir el resultado a la rueda', () => {
    // Generar paleta
    const palette = generateHarmonyPalette({
      primaryHue: 60.0, // Naranja en RYB
      isInputInRgb: false,
      mode: 'monochromatic'
    });

    const paletteBaseColor = palette.clusters[0]!.base;

    // Mezclar 2 partes del color base con 1 parte de Azul Ultramar y 1 parte de Blanco de Titanio
    const mixResult = mixPhysicalPaint([
      { name: 'Palette Base', color: paletteBaseColor, parts: 2 },
      { name: 'Ultramarine Blue', color: ARTIST_PIGMENTS.ULTRAMARINE_BLUE.color, parts: 1 },
      { name: 'Titanium White', color: ARTIST_PIGMENTS.TITANIUM_WHITE.color, parts: 1 }
    ]);

    expect(mixResult.totalParts).toBe(4);
    expect(mixResult.recipe.length).toBe(3);
    expect(mixResult.color).toBeInstanceOf(Color);

    // Obtener HSL y convertir a matiz RYB para inyectar en la rueda
    const mixedHsl = mixResult.color.toHsl();
    const targetRybHue = convertRgbHueToRybHue(mixedHsl.hue);

    expect(targetRybHue).toBeGreaterThanOrEqual(0);
    expect(targetRybHue).toBeLessThan(360);

    // Generar nueva paleta con el color mezclado
    const newPalette = generateHarmonyPalette({
      primaryHue: targetRybHue,
      isInputInRgb: false,
      mode: 'adjacent',
      baseSaturationPercent: mixedHsl.saturation,
      baseLightnessPercent: mixedHsl.lightness
    });

    expect(newPalette.clusters.length).toBe(3);
  });

  it('Flujo 4: Debe extraer paleta desde imagen sintética, clasificar armonía y proyectar a la cinemática del domo', () => {
    // Muestra sintética de imagen con predominio de amarillos y azules (~180° complementarios en RYB)
    const mockImagePixels: RgbPixel[] = [
      ...Array.from({ length: 100 }, () => ({ r: 255, g: 230, b: 0 })), // Amarillo
      ...Array.from({ length: 80 }, () => ({ r: 0, g: 50, b: 200 })),   // Azul
      ...Array.from({ length: 20 }, () => ({ r: 255, g: 50, b: 50 }))   // Toque rojo
    ];

    const extraction = extractPaletteFromPixels(mockImagePixels, 4);
    expect(extraction.dominantColors.length).toBeGreaterThanOrEqual(3);
    expect(extraction.suggestedPrimaryRybHue).toBeDefined();

    // El primer color debe ser el dominante
    const primary = extraction.dominantColors[0]!;
    expect(primary.percentage).toBeGreaterThanOrEqual(25);

    // Calcular cinemática de domo 3D con el tono extraído
    const normX = (primary.color.toHsl().saturation / 50.0) - 1.0;
    const normY = -((primary.color.toHsl().lightness / 50.0) - 1.0);

    const domePoints = calculateDomeClusterPoints(normX, normY, 1.0);
    expect(domePoints.length).toBe(5);

    // Todos los puntos deben permanecer dentro del disco unitario
    domePoints.forEach((pt) => {
      const dist = Math.hypot(pt.x, pt.y);
      expect(dist).toBeLessThanOrEqual(1.0001);
    });
  });

  it('Flujo 5: Debe verificar la biyección de mapeo angular RYB <-> RGB', () => {
    // Probar ángulos cardinales y diagonales
    const testRybAngles = [0, 30, 60, 120, 180, 240, 300];

    testRybAngles.forEach((ryb) => {
      const rgb = convertRybHueToRgbHue(ryb);
      const backRyb = convertRgbHueToRybHue(rgb);
      // Debe cerrar el ciclo con tolerancia de interpolación
      expect(Math.abs(backRyb - ryb)).toBeLessThanOrEqual(1.5);
    });
  });
});
