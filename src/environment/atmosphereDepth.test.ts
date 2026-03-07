import { Color } from 'three';

import { createScene, SCENE_ATMOSPHERE } from '../core/scene';
import { DISTANT_MOUNTAIN_LAYERS } from './distantMountains';
import { MIST_LAYER_SETTINGS } from './mist';
import { getTerrainAtmosphereBlend } from './terrain';
import { WATER_VISUAL_SETTINGS } from './water';

const getLuminance = (hex: number): number => {
  const color = new Color(hex);
  return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
};

describe('atmosphere depth tuning', () => {
  it('disables scene fog for a clear view of the bridge span', () => {
    const scene = createScene();

    expect(scene.fog).toBeNull();
    expect(SCENE_ATMOSPHERE.background.getHex()).toBe(new Color(0x95a1ac).getHex());
  });

  it('stacks six distant mountain layers with farther layers more transparent', () => {
    expect(DISTANT_MOUNTAIN_LAYERS).toHaveLength(6);
    expect(DISTANT_MOUNTAIN_LAYERS[0].opacity).toBeLessThan(DISTANT_MOUNTAIN_LAYERS[2].opacity);
    expect(DISTANT_MOUNTAIN_LAYERS[1].opacity).toBeLessThan(DISTANT_MOUNTAIN_LAYERS[3].opacity);
  });

  it('disables procedural mist layers', () => {
    expect(MIST_LAYER_SETTINGS).toHaveLength(0);
  });

  it('keeps the distant water tint brighter than the near water base tint', () => {
    expect(WATER_VISUAL_SETTINGS.horizonBlend).toBe(0.32);
    expect(WATER_VISUAL_SETTINGS.glintThreshold).toBe(0.9);
    expect(getLuminance(WATER_VISUAL_SETTINGS.horizonColor.getHex())).toBeGreaterThan(
      getLuminance(WATER_VISUAL_SETTINGS.deepColor.getHex())
    );
  });

  it('increases terrain haze blend as distance from the bridge axis grows', () => {
    expect(getTerrainAtmosphereBlend(0, 0)).toBeLessThan(0.01);
    expect(getTerrainAtmosphereBlend(0, 760)).toBeGreaterThan(getTerrainAtmosphereBlend(0, 0));
  });
});
