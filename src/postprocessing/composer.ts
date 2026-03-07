import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export const createComposer = (
  renderer: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  size: { width: number; height: number }
): EffectComposer => {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new Vector2(size.width, size.height), 0.16, 0.7, 0.88);
  composer.addPass(bloom);

  return composer;
};
