import { describe, expect, it } from 'vitest';
import { calculateDomeClusterPoints } from '../../../src/core/math/spherical_point_follower';

describe('spherical_point_follower (Dome Kinematics)', () => {
  it('debe alinear diagonalmente los puntos cuando el centro está en (0, 0)', () => {
    const points = calculateDomeClusterPoints(0.0, 0.0, 1.0);
    expect(points.length).toBe(5);

    // Punto 2 es el centro
    expect(points[2]?.x).toBeCloseTo(0.0, 3);
    expect(points[2]?.y).toBeCloseTo(0.0, 3);

    // Los puntos deben ser colineales a 45 grados (x === y)
    expect(points[0]?.x).toBeCloseTo(points[0]?.y ?? 0, 3);
    expect(points[1]?.x).toBeCloseTo(points[1]?.y ?? 0, 3);
    expect(points[3]?.x).toBeCloseTo(points[3]?.y ?? 0, 3);
    expect(points[4]?.x).toBeCloseTo(points[4]?.y ?? 0, 3);
  });

  it('debe curvar inmediatamente los puntos ante un desplazamiento leve (ref_img/026.png)', () => {
    // Desplazamiento leve a (-0.2, 0.1) como en 026.png
    const points = calculateDomeClusterPoints(-0.2, 0.1, 1.0);
    expect(points.length).toBe(5);

    // Calcular pendientes consecutivas: deben variar continuamente, demostrando curvatura orgánica
    const slope01 = ((points[1]?.y ?? 0) - (points[0]?.y ?? 0)) / ((points[1]?.x ?? 0) - (points[0]?.x ?? 0));
    const slope12 = ((points[2]?.y ?? 0) - (points[1]?.y ?? 0)) / ((points[2]?.x ?? 0) - (points[1]?.x ?? 0));
    const slope23 = ((points[3]?.y ?? 0) - (points[2]?.y ?? 0)) / ((points[3]?.x ?? 0) - (points[2]?.x ?? 0));

    expect(slope01).not.toBeCloseTo(slope12, 1);
    expect(slope12).not.toBeCloseTo(slope23, 1);
  });

  it('debe mantener todos los puntos dentro del disco unitario en desplazamientos extremos (ref_img/021.png)', () => {
    const points = calculateDomeClusterPoints(0.9, -0.2, 1.0);
    points.forEach((pt) => {
      const dist = Math.hypot(pt.x, pt.y);
      expect(dist).toBeLessThanOrEqual(1.0001);
    });
  });
});
