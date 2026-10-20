/**
 * Conversiones matemáticas puras entre espacios de color digitales estándar
 * (sRGB, HSL, HEX y RGB normalizado).
 *
 * Cada función cumple estrictamente el Principio de Responsabilidad Única (SRP),
 * incluye tipado estricto e implementa docstrings exhaustivos con ejemplos de uso.
 */

import type {
  ByteRgbColor,
  HslColor,
  NormalizedRgbColor
} from '../types/color.types';

/**
 * Convierte un código hexadecimal de color a su representación entera RGB [0, 255].
 *
 * Soporta formatos con o sin almohadilla '#', tanto de 6 dígitos ('#RRGGBB')
 * como de 3 dígitos taquigráficos ('#RGB').
 *
 * Parameters
 * ----------
 * hexColorString : string
 *     Cadena hexadecimal (ejemplo: '#FF8000', '00FF00', '#F00').
 *
 * Returns
 * -------
 * ByteRgbColor
 *     Objeto inmutable con los componentes enteros red, green y blue en [0, 255].
 *
 * Examples
 * --------
 * >>> hexToByteRgb('#FF0000')
 * { red: 255, green: 0, blue: 0 }
 * >>> hexToByteRgb('00FF80')
 * { red: 0, green: 255, blue: 128 }
 * >>> hexToByteRgb('#FFF')
 * { red: 255, green: 255, blue: 255 }
 */
export function hexToByteRgb(hexColorString: string): ByteRgbColor {
  const sanitizedHex: string = hexColorString.trim().replace(/^#/, '');

  if (sanitizedHex.length === 3) {
    const expandedR: number = parseInt(
      sanitizedHex[0]! + sanitizedHex[0]!,
      16
    );
    const expandedG: number = parseInt(
      sanitizedHex[1]! + sanitizedHex[1]!,
      16
    );
    const expandedB: number = parseInt(
      sanitizedHex[2]! + sanitizedHex[2]!,
      16
    );

    return {
      red: Number.isNaN(expandedR) ? 0 : expandedR,
      green: Number.isNaN(expandedG) ? 0 : expandedG,
      blue: Number.isNaN(expandedB) ? 0 : expandedB
    };
  }

  if (sanitizedHex.length === 6) {
    const parsedR: number = parseInt(sanitizedHex.slice(0, 2), 16);
    const parsedG: number = parseInt(sanitizedHex.slice(2, 4), 16);
    const parsedB: number = parseInt(sanitizedHex.slice(4, 6), 16);

    return {
      red: Number.isNaN(parsedR) ? 0 : parsedR,
      green: Number.isNaN(parsedG) ? 0 : parsedG,
      blue: Number.isNaN(parsedB) ? 0 : parsedB
    };
  }

  // Si el formato es inválido, retorna negro por defecto de forma segura
  return { red: 0, green: 0, blue: 0 };
}

/**
 * Convierte un color entero RGB [0, 255] a su código hexadecimal en mayúsculas con '#'.
 *
 * Parameters
 * ----------
 * byteRgb : ByteRgbColor
 *     Color en componentes enteros [0, 255].
 *
 * Returns
 * -------
 * string
 *     Cadena hexadecimal en formato '#RRGGBB' (ejemplo: '#FFAAAA').
 *
 * Examples
 * --------
 * >>> byteRgbToHex({ red: 255, green: 0, blue: 0 })
 * '#FF0000'
 * >>> byteRgbToHex({ red: 0, green: 255, blue: 128 })
 * '#00FF80'
 */
export function byteRgbToHex(byteRgb: ByteRgbColor): string {
  const clampedR: number = Math.min(255, Math.max(0, Math.round(byteRgb.red)));
  const clampedG: number = Math.min(
    255,
    Math.max(0, Math.round(byteRgb.green))
  );
  const clampedB: number = Math.min(255, Math.max(0, Math.round(byteRgb.blue)));

  const hexR: string = clampedR.toString(16).padStart(2, '0').toUpperCase();
  const hexG: string = clampedG.toString(16).padStart(2, '0').toUpperCase();
  const hexB: string = clampedB.toString(16).padStart(2, '0').toUpperCase();

  return `#${hexR}${hexG}${hexB}`;
}

/**
 * Normaliza un color de enteros [0, 255] al espacio escalar [0.0, 1.0].
 *
 * Parameters
 * ----------
 * byteRgb : ByteRgbColor
 *     Color con valores enteros en el rango [0, 255].
 *
 * Returns
 * -------
 * NormalizedRgbColor
 *     Color con componentes escalares en el rango [0.0, 1.0].
 *
 * Examples
 * --------
 * >>> byteRgbToNormalizedRgb({ red: 255, green: 128, blue: 0 })
 * { red: 1.0, green: 0.50196, blue: 0.0 }
 */
export function byteRgbToNormalizedRgb(
  byteRgb: ByteRgbColor
): NormalizedRgbColor {
  return {
    red: Math.min(1.0, Math.max(0.0, byteRgb.red / 255.0)),
    green: Math.min(1.0, Math.max(0.0, byteRgb.green / 255.0)),
    blue: Math.min(1.0, Math.max(0.0, byteRgb.blue / 255.0))
  };
}

/**
 * Desnormaliza un vector de color escalar [0.0, 1.0] a valores enteros de 8 bits [0, 255].
 *
 * Parameters
 * ----------
 * normalizedRgb : NormalizedRgbColor
 *     Color con componentes escalares en el rango [0.0, 1.0].
 *
 * Returns
 * -------
 * ByteRgbColor
 *     Color entero acotado y redondeado al rango [0, 255].
 *
 * Examples
 * --------
 * >>> normalizedRgbToByteRgb({ red: 1.0, green: 0.5, blue: 0.0 })
 * { red: 255, green: 128, blue: 0 }
 */
export function normalizedRgbToByteRgb(
  normalizedRgb: NormalizedRgbColor
): ByteRgbColor {
  return {
    red: Math.min(255, Math.max(0, Math.round(normalizedRgb.red * 255.0))),
    green: Math.min(255, Math.max(0, Math.round(normalizedRgb.green * 255.0))),
    blue: Math.min(255, Math.max(0, Math.round(normalizedRgb.blue * 255.0)))
  };
}

/**
 * Convierte un color entero sRGB [0, 255] al espacio cilíndrico HSL.
 *
 * Parameters
 * ----------
 * byteRgb : ByteRgbColor
 *     Color con valores enteros en el rango [0, 255].
 *
 * Returns
 * -------
 * HslColor
 *     Objeto con matiz [0, 360) grados, saturación [0, 100]% y luminosidad [0, 100]%.
 *
 * Examples
 * --------
 * >>> byteRgbToHsl({ red: 255, green: 0, blue: 0 })
 * { hue: 0.0, saturation: 100.0, lightness: 50.0 }
 * >>> byteRgbToHsl({ red: 255, green: 255, blue: 255 })
 * { hue: 0.0, saturation: 0.0, lightness: 100.0 }
 */
export function byteRgbToHsl(byteRgb: ByteRgbColor): HslColor {
  const normR: number = byteRgb.red / 255.0;
  const normG: number = byteRgb.green / 255.0;
  const normB: number = byteRgb.blue / 255.0;

  const maxComponent: number = Math.max(normR, normG, normB);
  const minComponent: number = Math.min(normR, normG, normB);
  const chromaDelta: number = maxComponent - minComponent;

  const lightness: number = (maxComponent + minComponent) / 2.0;

  if (chromaDelta === 0.0) {
    // Escala de grises acromática (sin saturación ni matiz definido)
    return {
      hue: 0.0,
      saturation: 0.0,
      lightness: lightness * 100.0
    };
  }

  const saturation: number =
    lightness > 0.5
      ? chromaDelta / (2.0 - maxComponent - minComponent)
      : chromaDelta / (maxComponent + minComponent);

  let rawHue: number = 0.0;
  if (maxComponent === normR) {
    rawHue = (normG - normB) / chromaDelta + (normG < normB ? 6.0 : 0.0);
  } else if (maxComponent === normG) {
    rawHue = (normB - normR) / chromaDelta + 2.0;
  } else {
    rawHue = (normR - normG) / chromaDelta + 4.0;
  }

  const hueInDegrees: number = rawHue * 60.0;

  return {
    hue: hueInDegrees,
    saturation: saturation * 100.0,
    lightness: lightness * 100.0
  };
}

/**
 * Convierte un color HSL al espacio de componentes enteros sRGB [0, 255].
 *
 * Parameters
 * ----------
 * hslColor : HslColor
 *     Color en espacio HSL con hue en [0, 360), saturation en [0, 100] y lightness en [0, 100].
 *
 * Returns
 * -------
 * ByteRgbColor
 *     Componentes enteros de 8 bits en [0, 255].
 *
 * Examples
 * --------
 * >>> hslToByteRgb({ hue: 0.0, saturation: 100.0, lightness: 50.0 })
 * { red: 255, green: 0, blue: 0 }
 * >>> hslToByteRgb({ hue: 120.0, saturation: 100.0, lightness: 50.0 })
 * { red: 0, green: 255, blue: 0 }
 */
export function hslToByteRgb(hslColor: HslColor): ByteRgbColor {
  const normalizedHue: number = ((hslColor.hue % 360.0) + 360.0) % 360.0;
  const saturationFraction: number =
    Math.min(100.0, Math.max(0.0, hslColor.saturation)) / 100.0;
  const lightnessFraction: number =
    Math.min(100.0, Math.max(0.0, hslColor.lightness)) / 100.0;

  if (saturationFraction === 0.0) {
    const greyIntensity: number = Math.round(lightnessFraction * 255.0);
    return {
      red: greyIntensity,
      green: greyIntensity,
      blue: greyIntensity
    };
  }

  const chroma: number =
    (1.0 - Math.abs(2.0 * lightnessFraction - 1.0)) * saturationFraction;
  const hueSegment: number = normalizedHue / 60.0;
  const secondaryComponent: number =
    chroma * (1.0 - Math.abs((hueSegment % 2.0) - 1.0));
  const lightnessBaseline: number = lightnessFraction - chroma / 2.0;

  let intermediateR: number = 0.0;
  let intermediateG: number = 0.0;
  let intermediateB: number = 0.0;

  if (hueSegment >= 0.0 && hueSegment < 1.0) {
    intermediateR = chroma;
    intermediateG = secondaryComponent;
  } else if (hueSegment >= 1.0 && hueSegment < 2.0) {
    intermediateR = secondaryComponent;
    intermediateG = chroma;
  } else if (hueSegment >= 2.0 && hueSegment < 3.0) {
    intermediateG = chroma;
    intermediateB = secondaryComponent;
  } else if (hueSegment >= 3.0 && hueSegment < 4.0) {
    intermediateG = secondaryComponent;
    intermediateB = chroma;
  } else if (hueSegment >= 4.0 && hueSegment < 5.0) {
    intermediateR = secondaryComponent;
    intermediateB = chroma;
  } else {
    intermediateR = chroma;
    intermediateB = secondaryComponent;
  }

  return {
    red: Math.min(
      255,
      Math.max(0, Math.round((intermediateR + lightnessBaseline) * 255.0))
    ),
    green: Math.min(
      255,
      Math.max(0, Math.round((intermediateG + lightnessBaseline) * 255.0))
    ),
    blue: Math.min(
      255,
      Math.max(0, Math.round((intermediateB + lightnessBaseline) * 255.0))
    )
  };
}
