import { describe, expect, it } from 'vitest';
import type { WheelInteractionState } from '../../../src/adapters/canvas/WheelRenderer';
import {
  deserializeHashToPalette,
  serializePaletteToHash
} from '../../../src/core/url/palette_url_serializer';

describe('palette_url_serializer', () => {
  const sampleState: WheelInteractionState = {
    primaryRybHue: 45.0,
    distanceAngle: 35.0,
    harmonyMode: 'tetrad',
    addComplementary: false,
    baseSaturation: 85.0,
    baseLightness: 55.0,
    contrastScale: 1.2
  };

  it('debe serializar el estado en un hash URL válido', () => {
    const hash = serializePaletteToHash(sampleState);
    expect(hash.startsWith('#')).toBe(true);
    expect(hash).toContain('mode=tetrad');
    expect(hash).toContain('h=45');
    expect(hash).toContain('d=35');
    expect(hash).toContain('s=85');
    expect(hash).toContain('l=55');
    expect(hash).toContain('contrast=1.20');
  });

  it('debe serializar y deserializar correctamente un estado completo (roundtrip)', () => {
    const hash = serializePaletteToHash(sampleState);
    const restored = deserializeHashToPalette(hash);

    expect(restored).not.toBeNull();
    expect(restored?.harmonyMode).toBe('tetrad');
    expect(restored?.primaryRybHue).toBe(45);
    expect(restored?.distanceAngle).toBe(35);
    expect(restored?.baseSaturation).toBe(85);
    expect(restored?.baseLightness).toBe(55);
    expect(restored?.contrastScale).toBe(1.2);
  });

  it('debe admitir y deserializar distancia angular amplia de hasta 175°', () => {
    const wideHash = '#mode=tetrad&h=0&d=175&s=50&l=50';
    const restored = deserializeHashToPalette(wideHash);
    expect(restored?.distanceAngle).toBe(175);
  });

  it('debe soportar y restaurar ángulos de modo freeform', () => {
    const freeformState: WheelInteractionState = {
      ...sampleState,
      harmonyMode: 'freeform',
      freeformAngles: [10, 80, 190, 290]
    };

    const hash = serializePaletteToHash(freeformState);
    expect(hash).toContain('free=10%2C80%2C190%2C290');

    const restored = deserializeHashToPalette(hash);
    expect(restored?.harmonyMode).toBe('freeform');
    expect(restored?.freeformAngles).toEqual([10, 80, 190, 290]);
  });

  it('debe devolver null ante un hash vacío o inválido', () => {
    expect(deserializeHashToPalette('')).toBeNull();
    expect(deserializeHashToPalette('#')).toBeNull();
  });
});
