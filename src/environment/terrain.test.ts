import { TERRAIN_CONFIG, sampleTerrainHeight } from './terrain';

describe('terrain sampling', () => {
  it('keeps the navigation channel low and raises the shoreline into landmass', () => {
    const channelHeight = sampleTerrainHeight(0, 0, TERRAIN_CONFIG);
    const shorelineHeight = sampleTerrainHeight(
      TERRAIN_CONFIG.channelHalfWidth + TERRAIN_CONFIG.shoreFalloff * 0.8,
      0,
      TERRAIN_CONFIG
    );
    const ridgeHeight = sampleTerrainHeight(520, 180, TERRAIN_CONFIG);

    expect(channelHeight).toBeLessThan(0.5);
    expect(shorelineHeight).toBeGreaterThan(18);
    expect(ridgeHeight).toBeGreaterThan(shorelineHeight);
  });

  it('maintains substantial land height on both outer banks', () => {
    const northBank = sampleTerrainHeight(470, -140, TERRAIN_CONFIG);
    const southBank = sampleTerrainHeight(-470, 140, TERRAIN_CONFIG);

    expect(northBank).toBeGreaterThan(25);
    expect(southBank).toBeGreaterThan(25);
  });
});
