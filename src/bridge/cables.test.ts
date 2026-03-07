import { BRIDGE_CONFIG } from './config';
import { createCableProfileSampler, generateMainCablePoints } from './cables';

describe('main cable profile', () => {
  it('stays symmetric around the bridge centerline', () => {
    const points = generateMainCablePoints(BRIDGE_CONFIG, 128);

    expect(points).toHaveLength(129);

    for (let index = 0; index < points.length; index += 1) {
      const left = points[index];
      const right = points[points.length - 1 - index];

      expect(left.x).toBeCloseTo(-right.x, 6);
      expect(left.y).toBeCloseTo(right.y, 6);
      expect(left.z).toBeCloseTo(right.z, 6);
    }
  });

  it('drops by the configured sag between tower saddle and center span', () => {
    const sampleY = createCableProfileSampler(BRIDGE_CONFIG);

    const towerY = sampleY(BRIDGE_CONFIG.towerX);
    const centerY = sampleY(0);

    expect(towerY - centerY).toBeCloseTo(BRIDGE_CONFIG.cableSag, 6);
    expect(centerY).toBeGreaterThan(BRIDGE_CONFIG.deckHeight + 40);
  });
});
