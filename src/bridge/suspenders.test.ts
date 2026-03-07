import { BRIDGE_CONFIG } from './config';
import { getSuspenderLayout } from './suspenders';

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
});
