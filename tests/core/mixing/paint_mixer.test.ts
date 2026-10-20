import { describe, expect, it } from 'vitest';
import { Color } from '../../../src/core/entities/Color';
import {
  ARTIST_PIGMENTS,
  mixPhysicalPaint,
  type PigmentPortion
} from '../../../src/core/mixing/paint_mixer';

describe('mixPhysicalPaint (Subtractive Pigment Mixing)', () => {
  it('debe devolver blanco cuando no hay pigmentos activos', () => {
    const result = mixPhysicalPaint([]);
    expect(result.color.toHex()).toBe('#FFFFFF');
    expect(result.totalParts).toBe(0);
  });

  it('debe mezclar Amarillo + Azul para generar un tono Verde', () => {
    const portions: PigmentPortion[] = [
      { name: 'Cadmium Yellow', color: ARTIST_PIGMENTS.CADMIUM_YELLOW.color, parts: 1 },
      { name: 'Ultramarine Blue', color: ARTIST_PIGMENTS.ULTRAMARINE_BLUE.color, parts: 1 }
    ];

    const result = mixPhysicalPaint(portions);
    expect(result.totalParts).toBe(2);

    // En espacio sustractivo, el resultado debe ser un tono verde (Hue entre 80° y 160°)
    const hsl = result.color.toHsl();
    expect(hsl.hue).toBeGreaterThan(80);
    expect(hsl.hue).toBeLessThan(160);
    // El canal verde debe ser dominante sobre el rojo
    expect(result.color.green).toBeGreaterThan(result.color.red);
  });

  it('debe mezclar Rojo + Amarillo para generar un tono Naranja', () => {
    const portions: PigmentPortion[] = [
      { name: 'Cadmium Red', color: ARTIST_PIGMENTS.CADMIUM_RED.color, parts: 1 },
      { name: 'Cadmium Yellow', color: ARTIST_PIGMENTS.CADMIUM_YELLOW.color, parts: 1 }
    ];

    const result = mixPhysicalPaint(portions);
    expect(result.totalParts).toBe(2);

    // En espacio sustractivo, el resultado debe ser un tono naranja (Hue entre 15° y 60°)
    const hsl = result.color.toHsl();
    expect(hsl.hue).toBeGreaterThanOrEqual(15);
    expect(hsl.hue).toBeLessThan(60);
  });

  it('debe mezclar Rojo + Azul para generar un tono Violeta / Púrpura', () => {
    const portions: PigmentPortion[] = [
      { name: 'Cadmium Red', color: ARTIST_PIGMENTS.CADMIUM_RED.color, parts: 1 },
      { name: 'Ultramarine Blue', color: ARTIST_PIGMENTS.ULTRAMARINE_BLUE.color, parts: 1 }
    ];

    const result = mixPhysicalPaint(portions);
    expect(result.totalParts).toBe(2);

    // En espacio sustractivo, el resultado es violeta (Hue >= 250°)
    const hsl = result.color.toHsl();
    expect(hsl.hue).toBeGreaterThanOrEqual(250);
  });

  it('debe mezclar partes iguales de R + Y + B produciendo un tono terciario oscuro / pardo', () => {
    const portions: PigmentPortion[] = [
      { name: 'Red', color: ARTIST_PIGMENTS.CADMIUM_RED.color, parts: 1 },
      { name: 'Yellow', color: ARTIST_PIGMENTS.CADMIUM_YELLOW.color, parts: 1 },
      { name: 'Blue', color: ARTIST_PIGMENTS.ULTRAMARINE_BLUE.color, parts: 1 }
    ];

    const result = mixPhysicalPaint(portions);
    expect(result.totalParts).toBe(3);

    // Mezcla sustractiva terciaria es oscura
    expect(result.color.toHsl().lightness).toBeLessThan(50);
  });

  it('debe aclarar hacia pastel al añadir Blanco de Titanio', () => {
    const pureBlue: PigmentPortion[] = [
      { name: 'Blue', color: Color.fromHex('#0044AA'), parts: 1 }
    ];
    const tintedBlue: PigmentPortion[] = [
      { name: 'Blue', color: Color.fromHex('#0044AA'), parts: 1 },
      { name: 'White', color: ARTIST_PIGMENTS.TITANIUM_WHITE.color, parts: 2 }
    ];

    const resultPure = mixPhysicalPaint(pureBlue);
    const resultTinted = mixPhysicalPaint(tintedBlue);

    expect(resultTinted.color.toHsl().lightness).toBeGreaterThan(resultPure.color.toHsl().lightness);
  });

  it('debe oscurecer la mezcla al añadir Negro de Carbón', () => {
    const pureYellow: PigmentPortion[] = [
      { name: 'Yellow', color: Color.fromHex('#FFCC00'), parts: 2 }
    ];
    const shadedYellow: PigmentPortion[] = [
      { name: 'Yellow', color: Color.fromHex('#FFCC00'), parts: 2 },
      { name: 'Black', color: ARTIST_PIGMENTS.CARBON_BLACK.color, parts: 1 }
    ];

    const resultPure = mixPhysicalPaint(pureYellow);
    const resultShaded = mixPhysicalPaint(shadedYellow);

    expect(resultShaded.color.toHsl().lightness).toBeLessThan(resultPure.color.toHsl().lightness);
  });
});
