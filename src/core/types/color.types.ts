/**
 * Tipos y estructuras de datos fundamentales para la teoría del color en Chroma.
 *
 * Todos los tipos son inmutables y definen rangos numéricos estrictos para
 * garantizar la integridad de las conversiones cromáticas.
 */

/**
 * Representa un vector de color en el espacio sRGB normalizado [0.0, 1.0].
 */
export interface NormalizedRgbColor {
  /** Componente rojo normalizado en el rango [0.0, 1.0]. */
  readonly red: number;
  /** Componente verde normalizado en el rango [0.0, 1.0]. */
  readonly green: number;
  /** Componente azul normalizado en el rango [0.0, 1.0]. */
  readonly blue: number;
}

/**
 * Representa un color sRGB en formato de enteros estándar [0, 255].
 */
export interface ByteRgbColor {
  /** Intensidad de rojo entero en el rango [0, 255]. */
  readonly red: number;
  /** Intensidad de verde entero en el rango [0, 255]. */
  readonly green: number;
  /** Intensidad de azul entero en el rango [0, 255]. */
  readonly blue: number;
}

/**
 * Representa un color en el espacio HSL (Hue, Saturation, Lightness).
 */
export interface HslColor {
  /** Matiz o tono en grados en el rango circular [0.0, 360.0). */
  readonly hue: number;
  /** Saturación porcentual en el rango [0.0, 100.0]. */
  readonly saturation: number;
  /** Luminosidad porcentual en el rango [0.0, 100.0]. */
  readonly lightness: number;
}

/**
 * Representa un vector de color en el espacio sustractivo de pigmento RYB (Red, Yellow, Blue).
 * Cada componente está normalizado en el rango [0.0, 1.0].
 */
export interface NormalizedRybColor {
  /** Cantidad de pigmento rojo normalizado en el rango [0.0, 1.0]. */
  readonly red: number;
  /** Cantidad de pigmento amarillo normalizado en el rango [0.0, 1.0]. */
  readonly yellow: number;
  /** Cantidad de pigmento azul normalizado en el rango [0.0, 1.0]. */
  readonly blue: number;
}

/**
 * Estructura de un cluster cromático que agrupa un color base
 * y sus cuatro variantes tonales calculadas en el domo 2D.
 */
export interface ColorClusterVariants {
  /** Color principal base seleccionado por el usuario. */
  readonly base: ByteRgbColor;
  /** Variante clara con saturación atenuada (Tinte / Pastel). */
  readonly tint: ByteRgbColor;
  /** Variante luminosa y saturada (Brillante / Vivid). */
  readonly bright: ByteRgbColor;
  /** Variante con luminosidad reducida hacia sombra (Sombra / Dark). */
  readonly shade: ByteRgbColor;
  /** Variante con saturación reducida y luminosidad media (Tono / Muted). */
  readonly tone: ByteRgbColor;
}

/**
 * Modos de armonía cromática soportados por el sistema de rueda exterior.
 */
export type HarmonyMode =
  | 'monochromatic'
  | 'adjacent'
  | 'triad'
  | 'tetrad'
  | 'freeform';
