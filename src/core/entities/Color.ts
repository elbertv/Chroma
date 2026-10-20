/**
 * Entidad inmutable Color (Value Object) bajo los principios de Clean Architecture.
 *
 * Encapsula la representación canónica de un color digital con métodos de fábrica,
 * conversiones a múltiples formatos estándar y cálculo de variantes cromáticas.
 */

import {
  byteRgbToHex,
  byteRgbToHsl,
  hexToByteRgb,
  hslToByteRgb
} from '../converters/color_converters';
import type { ByteRgbColor, HslColor } from '../types/color.types';

/**
 * Value Object inmutable que representa un color digital en el sistema Chroma.
 */
export class Color {
  /** Intensidad de rojo entera en el rango [0, 255]. */
  public readonly red: number;
  /** Intensidad de verde entera en el rango [0, 255]. */
  public readonly green: number;
  /** Intensidad de azul entera en el rango [0, 255]. */
  public readonly blue: number;

  /**
   * Constructor privado para forzar el uso de métodos de fábrica estáticos y garantizar
   * la validación e inmutabilidad de los datos.
   *
   * Parameters
   * ----------
   * redComponent : number
   *     Valor entero de rojo en [0, 255].
   * greenComponent : number
   *     Valor entero de verde en [0, 255].
   * blueComponent : number
   *     Valor entero de azul en [0, 255].
   */
  private constructor(
    redComponent: number,
    greenComponent: number,
    blueComponent: number
  ) {
    this.red = Math.min(255, Math.max(0, Math.round(redComponent)));
    this.green = Math.min(255, Math.max(0, Math.round(greenComponent)));
    this.blue = Math.min(255, Math.max(0, Math.round(blueComponent)));
  }

  /**
   * Crea una instancia de Color a partir de valores enteros RGB [0, 255].
   *
   * Parameters
   * ----------
   * red : number
   *     Intensidad de rojo [0, 255].
   * green : number
   *     Intensidad de verde [0, 255].
   * blue : number
   *     Intensidad de azul [0, 255].
   *
   * Returns
   * -------
   * Color
   *     Nueva instancia inmutable de Color.
   *
   * Examples
   * --------
   * >>> const redColor = Color.fromRgb(255, 0, 0);
   * >>> redColor.toHex();
   * '#FF0000'
   */
  public static fromRgb(red: number, green: number, blue: number): Color {
    return new Color(red, green, blue);
  }

  /**
   * Crea una instancia de Color a partir de un objeto ByteRgbColor.
   *
   * Parameters
   * ----------
   * byteRgb : ByteRgbColor
   *     Objeto con componentes red, green y blue.
   *
   * Returns
   * -------
   * Color
   *     Nueva instancia inmutable de Color.
   */
  public static fromByteRgb(byteRgb: ByteRgbColor): Color {
    return new Color(byteRgb.red, byteRgb.green, byteRgb.blue);
  }

  /**
   * Crea una instancia de Color a partir de una cadena hexadecimal.
   *
   * Parameters
   * ----------
   * hexString : string
   *     Cadena hexadecimal (ejemplo: '#AA3939' o 'AA3939').
   *
   * Returns
   * -------
   * Color
   *     Nueva instancia inmutable de Color.
   *
   * Examples
   * --------
   * >>> const color = Color.fromHex('#AA3939');
   * >>> color.red;
   * 170
   */
  public static fromHex(hexString: string): Color {
    const byteRgb: ByteRgbColor = hexToByteRgb(hexString);
    return new Color(byteRgb.red, byteRgb.green, byteRgb.blue);
  }

  /**
   * Crea una instancia de Color a partir de coordenadas espaciales HSL.
   *
   * Parameters
   * ----------
   * hueInDegrees : number
   *     Matiz en grados [0.0, 360.0).
   * saturationPercent : number
   *     Saturación en porcentaje [0.0, 100.0].
   * lightnessPercent : number
   *     Luminosidad en porcentaje [0.0, 100.0].
   *
   * Returns
   * -------
   * Color
   *     Nueva instancia inmutable de Color.
   *
   * Examples
   * --------
   * >>> const color = Color.fromHsl(120.0, 100.0, 50.0);
   * >>> color.toHex();
   * '#00FF00'
   */
  public static fromHsl(
    hueInDegrees: number,
    saturationPercent: number,
    lightnessPercent: number
  ): Color {
    const byteRgb: ByteRgbColor = hslToByteRgb({
      hue: hueInDegrees,
      saturation: saturationPercent,
      lightness: lightnessPercent
    });
    return new Color(byteRgb.red, byteRgb.green, byteRgb.blue);
  }

  /**
   * Retorna el código hexadecimal en mayúsculas con '#'.
   *
   * Returns
   * -------
   * string
   *     Código hexadecimal (ejemplo: '#FFAAAA').
   */
  public toHex(): string {
    return byteRgbToHex({
      red: this.red,
      green: this.green,
      blue: this.blue
    });
  }

  /**
   * Retorna los componentes enteros RGB [0, 255].
   *
   * Returns
   * -------
   * ByteRgbColor
   *     Objeto con red, green y blue.
   */
  public toByteRgb(): ByteRgbColor {
    return {
      red: this.red,
      green: this.green,
      blue: this.blue
    };
  }

  /**
   * Retorna las coordenadas correspondientes en espacio HSL.
   *
   * Returns
   * -------
   * HslColor
   *     Objeto con hue, saturation y lightness.
   */
  public toHsl(): HslColor {
    return byteRgbToHsl({
      red: this.red,
      green: this.green,
      blue: this.blue
    });
  }

  /**
   * Retorna la cadena de valores enteros RGB formateada como en Paletton ('R–G–B').
   *
   * Returns
   * -------
   * string
   *     Ejemplo: '254–34–11'
   */
  public toRgbFormatString(): string {
    return `${this.red}–${this.green}–${this.blue}`;
  }

  /**
   * Retorna la cadena de valores porcentuales RGB formateada como en Paletton ('R%–G%–B%').
   *
   * Returns
   * -------
   * string
   *     Ejemplo: '99.6–13.3–4.3%'
   */
  public toRgbPercentFormatString(): string {
    const percentR: string = ((this.red / 255.0) * 100.0).toFixed(1);
    const percentG: string = ((this.green / 255.0) * 100.0).toFixed(1);
    const percentB: string = ((this.blue / 255.0) * 100.0).toFixed(1);
    return `${percentR}–${percentG}–${percentB}%`;
  }

  /**
   * Genera un tinte mezclando el color con blanco puro según un factor de mezcla.
   *
   * Parameters
   * ----------
   * tintFactor : number
   *     Fracción de blanco a incorporar en el rango [0.0, 1.0].
   *
   * Returns
   * -------
   * Color
   *     Nueva instancia de Color aclarada.
   */
  public createTint(tintFactor: number): Color {
    const factor: number = Math.min(1.0, Math.max(0.0, tintFactor));
    const newRed: number = this.red + (255 - this.red) * factor;
    const newGreen: number = this.green + (255 - this.green) * factor;
    const newBlue: number = this.blue + (255 - this.blue) * factor;

    return new Color(newRed, newGreen, newBlue);
  }

  /**
   * Genera una sombra mezclando el color con negro puro según un factor de mezcla.
   *
   * Parameters
   * ----------
   * shadeFactor : number
   *     Fracción de oscurecimiento en el rango [0.0, 1.0].
   *
   * Returns
   * -------
   * Color
   *     Nueva instancia de Color oscurecida.
   */
  public createShade(shadeFactor: number): Color {
    const factor: number = Math.min(1.0, Math.max(0.0, shadeFactor));
    const multiplier: number = 1.0 - factor;
    const newRed: number = this.red * multiplier;
    const newGreen: number = this.green * multiplier;
    const newBlue: number = this.blue * multiplier;

    return new Color(newRed, newGreen, newBlue);
  }

  /**
   * Genera un tono mezclando el color con gris medio (128, 128, 128) según un factor.
   *
   * Parameters
   * ----------
   * toneFactor : number
   *     Fracción de gris neutro en el rango [0.0, 1.0].
   *
   * Returns
   * -------
   * Color
   *     Nueva instancia de Color atenuada.
   */
  public createTone(toneFactor: number): Color {
    const factor: number = Math.min(1.0, Math.max(0.0, toneFactor));
    const neutralGreyIntensity: number = 128.0;
    const newRed: number =
      this.red + (neutralGreyIntensity - this.red) * factor;
    const newGreen: number =
      this.green + (neutralGreyIntensity - this.green) * factor;
    const newBlue: number =
      this.blue + (neutralGreyIntensity - this.blue) * factor;

    return new Color(newRed, newGreen, newBlue);
  }
}
