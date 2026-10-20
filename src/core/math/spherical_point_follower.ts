/**
 * Motor Cinemático de Proyección Esférica 3D para el Domo de Color de Chroma.
 *
 * Modela el domo bidimensional de saturación y luminosidad como la proyección ortográfica
 * de una semiesfera unitaria 3D rotada en Z por 45° (PI/4).
 * Al desplazar el nodo base, la esfera rota en los ejes X e Y, lo que provoca que los 4 nodos
 * seguidores describan un arco orgánico continuo que se amolda con precisión a la curvatura
 * del círculo perimetral sin atravesar el límite circular.
 */

/**
 * Coordenadas bidimensionales cartesianas acotadas al disco unitario [-1.0, 1.0].
 */
export class DiscPoint {
  public readonly x: number;
  public readonly y: number;

  public constructor(x: number, y: number) {
    this.x = Math.max(-1.0, Math.min(1.0, x));
    this.y = Math.max(-1.0, Math.min(1.0, y));
  }

  /**
   * Rota el punto en el plano Z por un ángulo en radianes.
   */
  public rotZ(angle: number): DiscPoint {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    return new DiscPoint(
      this.x * cosA + this.y * sinA,
      -this.x * sinA + this.y * cosA
    );
  }

  /**
   * Proyecta el punto del disco hacia coordenadas esféricas (latitud psi, longitud phi).
   */
  public toSphericalDef(): SphericalDef {
    const r = this.rotZ(Math.PI / 4.0);
    let phi = 0.0;
    let psi = 0.0;

    if (r.x < 1.0 && r.x > -1.0) {
      const t = Math.max(-1.0, Math.min(1.0, r.y / Math.sqrt(1.0 - r.x * r.x)));
      phi = Math.asin(t);
    }

    if (r.y < 1.0 && r.y > -1.0) {
      const n = Math.max(-1.0, Math.min(1.0, r.x));
      psi = Math.asin(n);
    }

    return new SphericalDef(psi, phi);
  }
}

/**
 * Coordenadas esféricas en radianes (psi: latitud, phi: longitud).
 */
export class SphericalDef {
  public readonly psi: number;
  public readonly phi: number;

  public constructor(psi: number, phi: number) {
    this.psi = psi;
    this.phi = phi;
  }

  /**
   * Rota sobre el eje X esférico.
   */
  public rotX(angle: number): SphericalDef {
    const n = Math.cos(this.psi);
    const r = n !== 0.0 ? (this.phi / n + angle) * n : this.phi;
    return new SphericalDef(this.psi, r);
  }

  /**
   * Rota sobre el eje Y esférico.
   */
  public rotY(angle: number): SphericalDef {
    return new SphericalDef(this.psi + angle, this.phi);
  }

  /**
   * Proyecta de nuevo las coordenadas esféricas al plano del disco unitario con rotación inversa de -45°.
   */
  public toDiscPoint(): DiscPoint {
    const psiClamped = Math.min(Math.max(this.psi, -Math.PI / 2.0), Math.PI / 2.0);
    const phiClamped = Math.min(Math.max(this.phi, -Math.PI / 2.0), Math.PI / 2.0);
    const i = Math.sin(psiClamped);
    const s = Math.sin(phiClamped) * Math.cos(psiClamped);
    const p = new DiscPoint(i, s);
    return p.rotZ(-Math.PI / 4.0);
  }
}

/**
 * Calcula la definición esférica relativa de un punto seguidor respecto a un punto origen.
 */
export function getRelativeDef(originPoint: DiscPoint, followerPoint: DiscPoint): SphericalDef {
  const originDef = originPoint.toSphericalDef();
  return followerPoint.toSphericalDef().rotY(-originDef.psi).rotX(-originDef.phi);
}

/**
 * Calcula la posición actual de un punto seguidor dada la nueva posición del origen y su def relativa.
 */
export function getFollowerPoint(originPoint: DiscPoint, relativeDef: SphericalDef): DiscPoint {
  const originDef = originPoint.toSphericalDef();
  return relativeDef.rotX(originDef.phi).rotY(originDef.psi).toDiscPoint();
}

/**
 * Calcula los 5 puntos del domo central siguiendo la cinemática de proyección esférica 3D.
 *
 * Parameters
 * ----------
 * normX : number
 *     Posición horizontal normalizada del nodo base [-1.0, 1.0].
 * normY : number
 *     Posición vertical normalizada del nodo base [-1.0, 1.0].
 * contrastScale : number
 *     Factor de escala de dispersión / contraste [0.2, 2.0].
 *
 * Returns
 * -------
 * readonly DiscPoint[]
 *     Array de 5 puntos normalizados en el disco unitario (índice 2 es la base).
 */
export function calculateDomeClusterPoints(
  normX: number,
  normY: number,
  contrastScale: number = 1.0
): readonly DiscPoint[] {
  const basePoint = new DiscPoint(normX, normY);
  const centerPoint = new DiscPoint(0.0, 0.0);
  const step = 0.25 * Math.max(0.2, Math.min(2.0, contrastScale));

  // Posiciones neutrales canónicas del cluster en reposo (cuando el controlador está en el centro)
  const neutralPoints = [
    new DiscPoint(-step * 2.0, -step * 2.0), // Punto 0: Tinte claro
    new DiscPoint(-step * 1.0, -step * 1.0), // Punto 1: Tinte suave
    centerPoint,                             // Punto 2: Base principal
    new DiscPoint(step * 1.0, step * 1.0),   // Punto 3: Sombra
    new DiscPoint(step * 2.0, step * 2.0)    // Punto 4: Sombra profunda
  ];

  return neutralPoints.map((neutralPt, idx) => {
    if (idx === 2) {
      const baseDist = Math.hypot(basePoint.x, basePoint.y);
      if (baseDist > 1.0) {
        return new DiscPoint(basePoint.x / baseDist, basePoint.y / baseDist);
      }
      return basePoint;
    }
    const relDef = getRelativeDef(centerPoint, neutralPt);
    const follower = getFollowerPoint(basePoint, relDef);
    const followerDist = Math.hypot(follower.x, follower.y);
    if (followerDist > 1.0) {
      return new DiscPoint(follower.x / followerDist, follower.y / followerDist);
    }
    return follower;
  });
}
