/**
 * Entidad inmutable ColorCluster bajo Clean Architecture.
 *
 * Modela el cluster tonal de 5 variantes cromáticas que Paletton genera para cada
 * tono activo de la rueda: Base, Tinte (Pastel), Brillante (Vivid), Sombra (Dark)
 * y Tono (Muted).
 */

import { Color } from './Color';
import {
  applyChromaK,
  chromaHsvToRgb,
  discCoordToK,
  getChromaSpectralBaseColor
} from '../math/chroma_wheel_engine';
import { calculateDomeClusterPoints, DiscPoint } from '../math/spherical_point_follower';

/**
 * Parámetros de modulación de saturación y luminosidad para derivar las 5 variantes.
 */
export interface ClusterTuningParameters {
  /** Offset o ajuste de saturación en porcentaje [-100.0, 100.0]. */
  readonly saturationDelta: number;
  /** Offset o ajuste de brillo/luminosidad en porcentaje [-100.0, 100.0]. */
  readonly brightnessDelta: number;
  /** Factor de escala de contraste/dispersión [0.1, 2.0]. */
  readonly contrastScale: number;
}

/**
 * Preset predeterminado neutral para el cluster tonal.
 */
export const DEFAULT_CLUSTER_TUNING: ClusterTuningParameters = {
  saturationDelta: 0.0,
  brightnessDelta: 0.0,
  contrastScale: 1.0
};

/**
 * Value Object inmutable que encapsula las 5 variantes de color de un tono primario.
 */
export class ColorCluster {
  /** Variante 1: Color Base principal. */
  public readonly base: Color;
  /** Variante 2: Tinte claro o pastel (mayor luminosidad, saturación moderada). */
  public readonly tint: Color;
  /** Variante 3: Color brillante y vívido (alta saturación y luminosidad alta). */
  public readonly bright: Color;
  /** Variante 4: Sombra profunda (luminosidad reducida hacia negros). */
  public readonly shade: Color;
  /** Variante 5: Tono apagado/desaturado (menor saturación, luminosidad media-baja). */
  public readonly tone: Color;

  /**
   * Constructor privado para garantizar inmutabilidad.
   */
  private constructor(
    baseColor: Color,
    tintColor: Color,
    brightColor: Color,
    shadeColor: Color,
    toneColor: Color
  ) {
    this.base = baseColor;
    this.tint = tintColor;
    this.bright = brightColor;
    this.shade = shadeColor;
    this.tone = toneColor;
  }

  /**
   * Genera un ColorCluster utilizando el Motor Perceptual de Chroma con atenuación espectral fotópica,
   * cinemática de domo esférico 3D y modulación bilineal de variantes [kS, kV].
   *
   * Parameters
   * ----------
   * rybHueInDegrees : number
   *     Matiz en el círculo cromático artístico [0.0, 360.0).
   * baseSaturationPercent : number
   *     Saturación base en porcentaje [0.0, 100.0] (50% = centro del domo).
   * baseLightnessPercent : number
   *     Luminosidad base en porcentaje [0.0, 100.0] (50% = centro del domo).
   * tuning : ClusterTuningParameters, optional
   *     Parámetros opcionales de fine-tune y contraste.
   *
   * Returns
   * -------
   * ColorCluster
   *     Instancia inmutable con las 5 variantes calibradas perceptualmente sin tonos chillantes.
   */
  public static fromSpectralCalibration(
    rybHueInDegrees: number,
    baseSaturationPercent: number,
    baseLightnessPercent: number,
    tuning: ClusterTuningParameters = DEFAULT_CLUSTER_TUNING
  ): ColorCluster {
    const scale: number = Math.max(0.1, tuning.contrastScale);
    const baseHsv = getChromaSpectralBaseColor(rybHueInDegrees);

    const effectiveSat = Math.min(
      100.0,
      Math.max(0.0, baseSaturationPercent + tuning.saturationDelta)
    );
    const effectiveLight = Math.min(
      100.0,
      Math.max(0.0, baseLightnessPercent + tuning.brightnessDelta)
    );

    // Coordenadas normalizadas [-1.0, 1.0] en el domo
    const normX = effectiveSat / 50.0 - 1.0;
    const normY = -(effectiveLight / 50.0 - 1.0);

    // Calcular las 5 posiciones cinemáticas en el domo
    const clusterPoints: readonly DiscPoint[] = calculateDomeClusterPoints(
      normX,
      normY,
      scale
    );

    // Mapear cada punto del domo a [kS, kV] -> HSV atenuado -> Color sRGB
    const createVariantColor = (pt: DiscPoint): Color => {
      const kS = discCoordToK(pt.x);
      const kV = discCoordToK(-pt.y);
      const finalS = applyChromaK(baseHsv.s, kS);
      const finalV = applyChromaK(baseHsv.v, kV);
      const rgb = chromaHsvToRgb(rybHueInDegrees, finalS, finalV);
      return Color.fromRgb(rgb.r, rgb.g, rgb.b);
    };

    // En calculateDomeClusterPoints:
    // [0]: Tinte claro (Tint)
    // [1]: Tinte suave (Bright)
    // [2]: Base principal (Base)
    // [3]: Sombra (Shade)
    // [4]: Sombra profunda (Tone)
    const tintColor = createVariantColor(clusterPoints[0] ?? new DiscPoint(-0.5, -0.5));
    const brightColor = createVariantColor(clusterPoints[1] ?? new DiscPoint(-0.25, -0.25));
    const baseColor = createVariantColor(clusterPoints[2] ?? new DiscPoint(0, 0));
    const shadeColor = createVariantColor(clusterPoints[3] ?? new DiscPoint(0.25, 0.25));
    const toneColor = createVariantColor(clusterPoints[4] ?? new DiscPoint(0.5, 0.5));

    return new ColorCluster(
      baseColor,
      tintColor,
      brightColor,
      shadeColor,
      toneColor
    );
  }

  /**
   * Genera un ColorCluster a partir de un matiz digital (Hue en sRGB) y coordenadas
   * base de saturación y luminosidad, aplicando modulaciones de dispersión y contraste.
   *
   * Parameters
   * ----------
   * digitalHueInDegrees : number
   *     Matiz en grados sRGB [0.0, 360.0).
   * baseSaturationPercent : number
   *     Saturación base en porcentaje [0.0, 100.0].
   * baseLightnessPercent : number
   *     Luminosidad base en porcentaje [0.0, 100.0].
   * tuning : ClusterTuningParameters, optional
   *     Parámetros opcionales de micro-ajuste (fine tune) y contraste.
   *
   * Returns
   * -------
   * ColorCluster
   *     Instancia inmutable con las 5 variantes armónicamente calculadas.
   *
   * Examples
   * --------
   * >>> const cluster = ColorCluster.fromHueAndTone(0.0, 75.0, 45.0);
   * >>> cluster.base.toHex();
   * '#C91D1D'
   */
  public static fromHueAndTone(
    digitalHueInDegrees: number,
    baseSaturationPercent: number,
    baseLightnessPercent: number,
    tuning: ClusterTuningParameters = DEFAULT_CLUSTER_TUNING
  ): ColorCluster {
    const scale: number = Math.max(0.1, tuning.contrastScale);

    // 1. Color Base
    const effectiveBaseSat: number = Math.min(
      100.0,
      Math.max(0.0, baseSaturationPercent + tuning.saturationDelta)
    );
    const effectiveBaseLight: number = Math.min(
      100.0,
      Math.max(0.0, baseLightnessPercent + tuning.brightnessDelta)
    );
    const baseColor: Color = Color.fromHsl(
      digitalHueInDegrees,
      effectiveBaseSat,
      effectiveBaseLight
    );

    // 2. Variante Tinte (Pastel): Más luz (+30% * escala), menor saturación (-25% * escala)
    const tintSat: number = Math.min(
      100.0,
      Math.max(0.0, effectiveBaseSat - 25.0 * scale)
    );
    const tintLight: number = Math.min(
      95.0,
      Math.max(10.0, effectiveBaseLight + 30.0 * scale)
    );
    const tintColor: Color = Color.fromHsl(
      digitalHueInDegrees,
      tintSat,
      tintLight
    );

    // 3. Variante Brillante (Bright): Mayor luminosidad (+15% * escala) con saturación alta (+20% * escala)
    const brightSat: number = Math.min(
      100.0,
      Math.max(0.0, effectiveBaseSat + 20.0 * scale)
    );
    const brightLight: number = Math.min(
      88.0,
      Math.max(15.0, effectiveBaseLight + 15.0 * scale)
    );
    const brightColor: Color = Color.fromHsl(
      digitalHueInDegrees,
      brightSat,
      brightLight
    );

    // 4. Variante Sombra (Dark): Luminosidad reducida (-30% * escala)
    const shadeSat: number = Math.min(
      100.0,
      Math.max(0.0, effectiveBaseSat + 5.0 * scale)
    );
    const shadeLight: number = Math.min(
      80.0,
      Math.max(5.0, effectiveBaseLight - 30.0 * scale)
    );
    const shadeColor: Color = Color.fromHsl(
      digitalHueInDegrees,
      shadeSat,
      shadeLight
    );

    // 5. Variante Tono (Muted): Menor saturación (-40% * escala) y luminosidad intermedia (-15% * escala)
    const toneSat: number = Math.min(
      100.0,
      Math.max(0.0, effectiveBaseSat - 40.0 * scale)
    );
    const toneLight: number = Math.min(
      75.0,
      Math.max(10.0, effectiveBaseLight - 15.0 * scale)
    );
    const toneColor: Color = Color.fromHsl(
      digitalHueInDegrees,
      toneSat,
      toneLight
    );

    return new ColorCluster(
      baseColor,
      tintColor,
      brightColor,
      shadeColor,
      toneColor
    );
  }

  /**
   * Retorna una lista con las 5 variantes en orden canónico:
   * [Tint, Bright, Base, Shade, Tone] para visualización en tablas o tarjetas.
   *
   * Returns
   * -------
   * readonly Color[]
   *     Array de 5 elementos Color.
   */
  public toArray(): readonly Color[] {
    return [this.tint, this.bright, this.base, this.shade, this.tone];
  }
}
