import { InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';

import { BRIDGE_CONFIG } from './config';
import { getDeckShoulderProfile, getHangerSocketPoint } from './hangerConnections';
import { createSuspenders, getSuspenderLayout } from './suspenders';

describe('suspender layout', () => {
  it('keeps a regular mirrored spacing while clearing the tower openings', () => {
    const layout = getSuspenderLayout(BRIDGE_CONFIG);

    expect(layout[0]).toBe(-320);
    expect(layout.at(-1)).toBe(320);
    expect(layout).toContain(0);
    expect(layout).not.toContain(-210);
    expect(layout).not.toContain(210);
    expect(layout).toHaveLength(63);

    for (let index = 0; index < layout.length; index += 1) {
      const left = layout[index];
      const right = layout[layout.length - 1 - index];

      expect(left).toBeCloseTo(-right, 6);

      if (Math.abs(left) < 320) {
        const gap = layout[index + 1] - left;
        if (Number.isFinite(gap)) {
          expect([10, 20]).toContain(gap);
        }
      }

      expect(Math.abs(Math.abs(left) - BRIDGE_CONFIG.towerX)).toBeGreaterThanOrEqual(
        BRIDGE_CONFIG.suspenderTowerClearance
      );
    }
  });

  it('aligns suspender bottoms with the shared socket points and keeps left-right symmetry', () => {
    const suspenders = createSuspenders(BRIDGE_CONFIG).object3d;
    const instancedMesh = suspenders.children[0] as InstancedMesh;
    const layout = getSuspenderLayout(BRIDGE_CONFIG);
    const shoulderProfile = getDeckShoulderProfile(BRIDGE_CONFIG);
    const matrix = new Matrix4();
    const position = new Vector3();
    const scale = new Vector3();
    const quaternion = new Quaternion();

    layout.forEach((x, layoutIndex) => {
      for (const [offset, side] of [
        [0, -1],
        [1, 1]
      ] as const) {
        instancedMesh.getMatrixAt(layoutIndex * 2 + offset, matrix);
        matrix.decompose(position, quaternion, scale);

        const socket = getHangerSocketPoint(BRIDGE_CONFIG, x, side);
        const bottomY = position.y - scale.y * 0.5;

        expect(position.x).toBeCloseTo(socket.x, 6);
        expect(position.z).toBeCloseTo(socket.z, 6);
        expect(bottomY).toBeCloseTo(socket.y, 5);
        expect(Math.abs(socket.z)).toBeGreaterThanOrEqual(shoulderProfile.innerZ);
        expect(Math.abs(socket.z)).toBeLessThanOrEqual(shoulderProfile.outerZ);
      }

      const leftSocket = getHangerSocketPoint(BRIDGE_CONFIG, x, -1);
      const rightSocket = getHangerSocketPoint(BRIDGE_CONFIG, x, 1);

      expect(leftSocket.x).toBeCloseTo(rightSocket.x, 6);
      expect(leftSocket.y).toBeCloseTo(rightSocket.y, 6);
      expect(leftSocket.z).toBeCloseTo(-rightSocket.z, 6);
    });
  });
});
