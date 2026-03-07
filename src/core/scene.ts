import { Color, Scene } from 'three';

export const SCENE_ATMOSPHERE = {
  background: new Color(0x95a1ac),
  backgroundIntensity: 0.54,
  environmentIntensity: 0.3
} as const;

export const createScene = (): Scene => {
  const scene = new Scene();

  scene.background = SCENE_ATMOSPHERE.background.clone();
  scene.backgroundIntensity = SCENE_ATMOSPHERE.backgroundIntensity;
  scene.environmentIntensity = SCENE_ATMOSPHERE.environmentIntensity;

  return scene;
};
