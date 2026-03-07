import { Color, FogExp2, Scene } from 'three';

export const createScene = (): Scene => {
  const scene = new Scene();

  scene.background = new Color(0xb4c2d3);
  scene.fog = new FogExp2(0xc4cbd5, 0.00115);

  return scene;
};
