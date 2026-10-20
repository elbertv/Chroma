/**
 * Adaptador de Renderizado e Interacción Canvas 2D para la Rueda Concéntrica Dual de Chroma.
 *
 * Renderiza a 60 FPS:
 * 1. Anillo exterior continuo en espacio artístico RYB con sectores limpios sin franjas negras.
 * 2. Domo interior polar 2D de Saturación y Luminosidad para el tono activo.
 * 3. Nodos arrastrables en el anillo exterior (con soporte para addComplementary).
 * 4. Cluster de 5 nodos en el domo interior (Base + 4 variantes) con cinemática solidaria.
 */

import { convertRybHueToRgbHue, normalizeHueAngle } from '../../core/math/ryb_hue_mapping';
import {
  chromaHsvToRgb,
  getChromaSpectralBaseColor
} from '../../core/math/chroma_wheel_engine';
import { calculateDomeClusterPoints, type DiscPoint } from '../../core/math/spherical_point_follower';
import type { HarmonyMode } from '../../core/types/color.types';

/**
 * Estado geométrico e interactivo de la rueda concéntrica.
 */
export interface WheelInteractionState {
  /** Matiz primario en espacio RYB [0.0, 360.0). */
  primaryRybHue: number;
  /** Distancia angular entre nodos secundarios en grados. */
  distanceAngle: number;
  /** Modo de armonía seleccionado. */
  harmonyMode: HarmonyMode;
  /** Si añade el tono complementario (+180° en RYB). */
  addComplementary: boolean;
  /** Saturación del nodo base en porcentaje [0.0, 100.0]. */
  baseSaturation: number;
  /** Luminosidad del nodo base en porcentaje [0.0, 100.0]. */
  baseLightness: number;
  /** Escala de contraste y dispersión de los nodos satélites del domo. */
  contrastScale: number;
  /** Activa la calibración espectral perceptual (atenuación fotópica de verdes y azules). */
  spectralCalibration?: boolean;
  /** Ángulos arbitrarios independientes en grados para el modo Free-style [0.0, 360.0). */
  freeformAngles?: number[] | undefined;
}

/**
 * Tipo de nodo que está siendo arrastrado por el puntero.
 */
type DragTarget =
  | { type: 'outer_node'; nodeIndex: number }
  | { type: 'inner_base' }
  | null;

/**
 * Renderizador de alto rendimiento sobre HTML5 Canvas para la rueda dual concéntrica.
 */
export class WheelRenderer {
  public static readonly DEFAULT_SECTOR_COUNT: number = 64;
  private sectorCount: number = WheelRenderer.DEFAULT_SECTOR_COUNT;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private state: WheelInteractionState;
  private currentDragTarget: DragTarget = null;
  private readonly onStateChangeCallback: (newState: WheelInteractionState) => void;

  /**
   * Crea una instancia de WheelRenderer vinculada a un elemento HTMLCanvasElement.
   */
  public constructor(
    canvasElement: HTMLCanvasElement,
    initialState: WheelInteractionState,
    onStateChange: (newState: WheelInteractionState) => void
  ) {
    this.canvas = canvasElement;
    const context: CanvasRenderingContext2D | null = canvasElement.getContext('2d');
    if (!context) {
      throw new Error('No se pudo inicializar el contexto 2D de Canvas');
    }
    this.ctx = context;
    this.state = { ...initialState };
    this.onStateChangeCallback = onStateChange;

    this.attachEventListeners();
    this.render();
  }

  /**
   * Actualiza externamente el estado de la rueda.
   */
  public updateState(partialState: Partial<WheelInteractionState>): void {
    if ('freeformAngles' in partialState && partialState.freeformAngles === undefined) {
      delete this.state.freeformAngles;
    }
    this.state = { ...this.state, ...partialState };
    this.render();
  }

  /**
   * Obtiene la cantidad de sectores cromáticos del anillo exterior.
   */
  public getSectorCount(): number {
    return this.sectorCount;
  }

  /**
   * Ajusta dinámicamente la resolución de franjas de la rueda cromática.
   *
   * Parameters
   * ----------
   * count : number
   *     Número de sectores discretos (por defecto 48, el doble de los 24 iniciales).
   */
  public setSectorCount(count: number): void {
    this.sectorCount = Math.max(12, Math.min(360, count));
    this.render();
  }

  /**
   * Obtiene una copia inmutable del estado actual de la rueda.
   */
  public getState(): WheelInteractionState {
    return { ...this.state };
  }

  /**
   * Ciclo principal de dibujo sobre el canvas.
   */
  public render(): void {
    const width: number = this.canvas.width;
    const height: number = this.canvas.height;
    const centerX: number = width / 2;
    const centerY: number = height / 2;
    const outerRadius: number = Math.min(centerX, centerY) - 16;
    const ringThickness: number = outerRadius * 0.28;
    const innerRadius: number = outerRadius - ringThickness;
    const domeRadius: number = innerRadius - 8;

    this.ctx.clearRect(0, 0, width, height);

    // 1. Dibujar anillo exterior en sectores limpios (sin franjas negras)
    this.renderOuterRybRing(centerX, centerY, outerRadius, innerRadius);

    // 2. Dibujar domo interior 2D de saturación y brillo
    this.renderInnerDome(centerX, centerY, domeRadius);

    // 3. Dibujar nodos sobre el anillo exterior
    this.renderOuterNodes(centerX, centerY, (outerRadius + innerRadius) / 2);

    // 4. Dibujar los 5 nodos colineales en el domo central
    this.renderInnerDomeNodes(centerX, centerY, domeRadius);
  }

  /**
   * Renderiza el anillo exterior mediante sectores cromáticos discretos (64 sectores por defecto, 5.625° cada uno),
   * eliminando por completo las franjas negras causadas por aliasing de micro-arcos mediante solape angular.
   */
  private renderOuterRybRing(
    cx: number,
    cy: number,
    outerR: number,
    innerR: number
  ): void {
    const sectorCount: number = this.sectorCount; // 64 sectores (reducción de un tercio desde 96)
    const stepAngle: number = 360 / sectorCount; // 5.625 grados por sector
    const overlapAngle: number = 0.25; // Solapamiento angular generoso para prevenir aristas y franjas oscuras

    for (let i = 0; i < sectorCount; i++) {
      const angleCenter: number = i * stepAngle;
      const radStart: number = ((angleCenter - stepAngle / 2 - 90 - overlapAngle) * Math.PI) / 180;
      const radEnd: number = ((angleCenter + stepAngle / 2 - 90 + overlapAngle) * Math.PI) / 180;

      let sectorColor: string;
      if (this.state.spectralCalibration !== false) {
        const baseHsv = getChromaSpectralBaseColor(angleCenter);
        sectorColor = chromaHsvToRgb(angleCenter, baseHsv.s, baseHsv.v).hex;
      } else {
        const digitalRgbHue: number = convertRybHueToRgbHue(angleCenter);
        sectorColor = `hsl(${digitalRgbHue}, 100%, 50%)`;
      }

      this.ctx.beginPath();
      this.ctx.arc(cx, cy, outerR, radStart, radEnd);
      this.ctx.arc(cx, cy, innerR, radEnd, radStart, true);
      this.ctx.closePath();
      this.ctx.fillStyle = sectorColor;
      this.ctx.fill();
    }

    // Bordes concéntricos nítidos
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }

  /**
   * Renderiza el domo circular interior polar de saturación y luminosidad.
   */
  private renderInnerDome(cx: number, cy: number, domeR: number): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, domeR, 0, Math.PI * 2);
    this.ctx.clip();

    // Fondo base del matiz puro a la derecha y blanco a la izquierda
    let domeHueColor: string;
    if (this.state.spectralCalibration !== false) {
      const baseHsv = getChromaSpectralBaseColor(this.state.primaryRybHue);
      domeHueColor = chromaHsvToRgb(this.state.primaryRybHue, baseHsv.s, baseHsv.v).hex;
    } else {
      const primaryRgbHue: number = convertRybHueToRgbHue(this.state.primaryRybHue);
      domeHueColor = `hsl(${primaryRgbHue}, 100%, 50%)`;
    }

    const gradHorizontal: CanvasGradient = this.ctx.createLinearGradient(
      cx - domeR,
      cy,
      cx + domeR,
      cy
    );
    gradHorizontal.addColorStop(0, '#FFFFFF');
    gradHorizontal.addColorStop(1, domeHueColor);
    this.ctx.fillStyle = gradHorizontal;
    this.ctx.fillRect(cx - domeR, cy - domeR, domeR * 2, domeR * 2);

    // Gradiente vertical hacia negro en la parte inferior
    const gradVertical: CanvasGradient = this.ctx.createLinearGradient(
      cx,
      cy - domeR,
      cx,
      cy + domeR
    );
    gradVertical.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradVertical.addColorStop(1, '#000000');
    this.ctx.fillStyle = gradVertical;
    this.ctx.fillRect(cx - domeR, cy - domeR, domeR * 2, domeR * 2);

    // Rejilla polar sutil (círculos concéntricos y radios)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;
    for (let r = domeR * 0.2; r < domeR; r += domeR * 0.2) {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const spokeAngle: number = (i * Math.PI) / 4;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(
        cx + Math.cos(spokeAngle) * domeR,
        cy + Math.sin(spokeAngle) * domeR
      );
      this.ctx.stroke();
    }

    this.ctx.restore();

    // Borde circular del domo
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, domeR, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }

  /**
   * Renderiza los nodos de color de 1 a 4 en el anillo exterior.
   */
  private renderOuterNodes(cx: number, cy: number, ringTrackRadius: number): void {
    const rybAngles: readonly number[] = this.calculateActiveRybAngles();

    rybAngles.forEach((angle: number, index: number) => {
      const isPrimary: boolean = index === 0;
      const angleRad: number = ((angle - 90) * Math.PI) / 180;
      const nodeX: number = cx + Math.cos(angleRad) * ringTrackRadius;
      const nodeY: number = cy + Math.sin(angleRad) * ringTrackRadius;

      let nodeColor: string;
      if (this.state.spectralCalibration !== false) {
        const baseHsv = getChromaSpectralBaseColor(angle);
        nodeColor = chromaHsvToRgb(angle, baseHsv.s, baseHsv.v).hex;
      } else {
        const digitalHue: number = convertRybHueToRgbHue(angle);
        nodeColor = `hsl(${digitalHue}, 100%, 50%)`;
      }

      // Círculo exterior blanco/negro del nodo
      this.ctx.beginPath();
      this.ctx.arc(nodeX, nodeY, isPrimary ? 12 : 9, 0, Math.PI * 2);
      this.ctx.fillStyle = nodeColor;
      this.ctx.fill();
      this.ctx.lineWidth = isPrimary ? 3 : 2;
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.stroke();

      // Indicador especial en el nodo primario (aro interior negro)
      if (isPrimary) {
        this.ctx.beginPath();
        this.ctx.arc(nodeX, nodeY, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#000000';
        this.ctx.fill();
      }
    });
  }

  /**
   * Renderiza los 5 puntos del cluster tonal dentro del domo central utilizando la cinemática
   * de proyección esférica 3D rotada en Z.
   * Al desplazar el nodo base, la esfera 3D rota en los ejes X e Y, generando una curvatura
   * inmediata, continua y orgánica que se amolda con precisión matemática a la circunferencia
   * sin atravesar el límite circular (referencias ref_img/020.png a ref_img/026.png).
   */
  private renderInnerDomeNodes(cx: number, cy: number, domeR: number): void {
    const maxRadius: number = domeR - 8;
    const normX: number = (this.state.baseSaturation / 50.0) - 1.0;
    const normY: number = -((this.state.baseLightness / 50.0) - 1.0);

    const clusterPoints: readonly DiscPoint[] = calculateDomeClusterPoints(
      normX,
      normY,
      this.state.contrastScale
    );

    clusterPoints.forEach((discPt: DiscPoint, idx: number) => {
      const isBase: boolean = idx === 2;
      const screenX: number = cx + discPt.x * maxRadius;
      const screenY: number = cy + discPt.y * maxRadius;

      if (isBase) {
        // Nodo Base (Controlador Principal con aro doble e indicador central)
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 11, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 7, 0, Math.PI * 2);
        this.ctx.fillStyle = '#000000';
        this.ctx.fill();
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 2.5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
      } else {
        // Nodos Satélites (Círculos traslúcidos con aro blanco nítido)
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 5.5, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        this.ctx.fill();
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 5.5, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    });
  }

  /**
   * Calcula los ángulos RYB activos considerando addComplementary y Free-style.
   */
  private calculateActiveRybAngles(): readonly number[] {
    const h: number = this.state.primaryRybHue;
    const d: number = this.state.distanceAngle;
    const comp: number = normalizeHueAngle(h + 180.0);

    switch (this.state.harmonyMode) {
      case 'monochromatic':
        return this.state.addComplementary ? [h, comp] : [h];
      case 'adjacent':
        return this.state.addComplementary
          ? [h, normalizeHueAngle(h - d), normalizeHueAngle(h + d), comp]
          : [h, normalizeHueAngle(h - d), normalizeHueAngle(h + d)];
      case 'triad':
        return this.state.addComplementary
          ? [h, normalizeHueAngle(h + 120), normalizeHueAngle(h + 240), comp]
          : [h, normalizeHueAngle(h + 120), normalizeHueAngle(h + 240)];
      case 'tetrad':
        return [h, normalizeHueAngle(h + d), normalizeHueAngle(h + 180), normalizeHueAngle(h + 180 + d)];
      case 'freeform':
        if (this.state.freeformAngles && this.state.freeformAngles.length >= 4) {
          return this.state.freeformAngles.map(normalizeHueAngle);
        }
        // En Free-style inicializa siempre como tetrad
        return [h, normalizeHueAngle(h + d), normalizeHueAngle(h + 180), normalizeHueAngle(h + 180 + d)];
    }
  }

  private attachEventListeners(): void {
    this.canvas.addEventListener('pointerdown', (e: PointerEvent) => this.handlePointerDown(e));
    window.addEventListener('pointermove', (e: PointerEvent) => this.handlePointerMove(e));
    window.addEventListener('pointerup', () => this.handlePointerUp());
  }

  private handlePointerDown(e: PointerEvent): void {
    const rect: DOMRect = this.canvas.getBoundingClientRect();
    const mouseX: number = e.clientX - rect.left;
    const mouseY: number = e.clientY - rect.top;

    const width: number = this.canvas.width;
    const height: number = this.canvas.height;
    const cx: number = width / 2;
    const cy: number = height / 2;
    const dx: number = mouseX - cx;
    const dy: number = mouseY - cy;
    const distFromCenter: number = Math.hypot(dx, dy);

    const outerRadius: number = Math.min(cx, cy) - 16;
    const ringThickness: number = outerRadius * 0.28;
    const innerRadius: number = outerRadius - ringThickness;
    const domeRadius: number = innerRadius - 8;
    const ringTrackRadius: number = (outerRadius + innerRadius) / 2;

    if (distFromCenter <= domeRadius) {
      this.currentDragTarget = { type: 'inner_base' };
      this.updateToneFromPointer(dx, dy, domeRadius);
      return;
    }

    if (distFromCenter >= innerRadius - 15 && distFromCenter <= outerRadius + 15) {
      const activeAngles: readonly number[] = this.calculateActiveRybAngles();
      let closestIdx: number = 0;
      let minNodeDist: number = Infinity;

      activeAngles.forEach((rybAngle, idx) => {
        const rad: number = ((rybAngle - 90) * Math.PI) / 180.0;
        const nodeX: number = cx + Math.cos(rad) * ringTrackRadius;
        const nodeY: number = cy + Math.sin(rad) * ringTrackRadius;
        const dist: number = Math.hypot(mouseX - nodeX, mouseY - nodeY);
        if (dist < minNodeDist) {
          minNodeDist = dist;
          closestIdx = idx;
        }
      });

      // Si se hizo click cerca de un nodo (radio <= 24px) o en el anillo
      const nodeIndex: number = minNodeDist <= 24
        ? closestIdx
        : (this.state.harmonyMode === 'freeform' ? closestIdx : 0);

      this.currentDragTarget = { type: 'outer_node', nodeIndex };
      this.updateOuterNodeFromPointer(dx, dy, nodeIndex);
    }
  }

  private handlePointerMove(e: PointerEvent): void {
    if (!this.currentDragTarget) {
      return;
    }

    const rect: DOMRect = this.canvas.getBoundingClientRect();
    const mouseX: number = e.clientX - rect.left;
    const mouseY: number = e.clientY - rect.top;

    const width: number = this.canvas.width;
    const height: number = this.canvas.height;
    const cx: number = width / 2;
    const cy: number = height / 2;
    const dx: number = mouseX - cx;
    const dy: number = mouseY - cy;

    const outerRadius: number = Math.min(cx, cy) - 16;
    const ringThickness: number = outerRadius * 0.28;
    const innerRadius: number = outerRadius - ringThickness;
    const domeRadius: number = innerRadius - 8;

    if (this.currentDragTarget.type === 'outer_node') {
      this.updateOuterNodeFromPointer(dx, dy, this.currentDragTarget.nodeIndex);
    } else if (this.currentDragTarget.type === 'inner_base') {
      this.updateToneFromPointer(dx, dy, domeRadius);
    }
  }

  private handlePointerUp(): void {
    this.currentDragTarget = null;
  }

  /**
   * Actualiza la posición angular de los nodos en el anillo exterior según el modo de armonía.
   */
  private updateOuterNodeFromPointer(dx: number, dy: number, nodeIndex: number): void {
    const angleInRadians: number = Math.atan2(dy, dx);
    let pointerAngleDeg: number = (angleInRadians * 180) / Math.PI + 90;
    pointerAngleDeg = normalizeHueAngle(pointerAngleDeg);

    if (this.state.harmonyMode === 'freeform') {
      // 3. En Free-style, los 4 puntos se mueven de manera 100% arbitraria e independiente
      if (!this.state.freeformAngles || this.state.freeformAngles.length !== 4) {
        const h: number = this.state.primaryRybHue;
        const d: number = this.state.distanceAngle;
        this.state.freeformAngles = [
          h,
          normalizeHueAngle(h + d),
          normalizeHueAngle(h + 180.0),
          normalizeHueAngle(h + 180.0 + d)
        ];
      }
      this.state.freeformAngles[nodeIndex] = pointerAngleDeg;
      if (nodeIndex === 0) {
        this.state.primaryRybHue = pointerAngleDeg;
      }
    } else {
      // Modos con restricciones armónicas rígidas (monocromático, adyacente, tríada, tétrada)
      if (nodeIndex === 0) {
        // Mover el nodo primario rota solidariamente todo el esquema armónico
        this.state.primaryRybHue = pointerAngleDeg;
      } else {
        // Nodos secundarios en adyacente o tétrada ajustan la distancia angular 'dist' (5° a 175°, nunca 0° ni 180°)
        if (this.state.harmonyMode === 'adjacent') {
          const diff: number = Math.abs(pointerAngleDeg - this.state.primaryRybHue);
          const distDiff: number = diff > 180 ? 360 - diff : diff;
          this.state.distanceAngle = Math.max(5.0, Math.min(175.0, distDiff));
        } else if (this.state.harmonyMode === 'tetrad') {
          if (nodeIndex === 1 || nodeIndex === 3) {
            const refHue: number = nodeIndex === 1
              ? this.state.primaryRybHue
              : normalizeHueAngle(this.state.primaryRybHue + 180);
            let diff: number = pointerAngleDeg - refHue;
            if (diff < 0) diff += 360;
            if (diff > 180) diff = 360 - diff;
            this.state.distanceAngle = Math.max(5.0, Math.min(175.0, diff));
          } else if (nodeIndex === 2) {
            // Nodo complementario a 180°: rota el eje primario
            this.state.primaryRybHue = normalizeHueAngle(pointerAngleDeg - 180);
          }
        }
      }
    }

    this.render();
    this.onStateChangeCallback(this.state);
  }

  private updateToneFromPointer(dx: number, dy: number, domeR: number): void {
    const maxRadius: number = domeR - 8;
    const currentDist: number = Math.hypot(dx, dy);
    let clampedX: number = dx;
    let clampedY: number = dy;

    if (currentDist > maxRadius) {
      clampedX = (dx / currentDist) * maxRadius;
      clampedY = (dy / currentDist) * maxRadius;
    }

    const normX: number = clampedX / maxRadius;
    const normY: number = clampedY / maxRadius;

    this.state.baseSaturation = Math.min(100, Math.max(0, (normX + 1.0) * 50.0));
    this.state.baseLightness = Math.min(100, Math.max(0, (-normY + 1.0) * 50.0));

    this.render();
    this.onStateChangeCallback(this.state);
  }
}
