import type { PerspectiveCamera, WebGLRenderer } from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

const getContainerSize = (container: HTMLElement): { width: number; height: number } => ({
  width: Math.max(container.clientWidth, window.innerWidth, 1),
  height: Math.max(container.clientHeight, window.innerHeight, 1)
});

export const attachResize = (
  container: HTMLElement,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  composer?: EffectComposer
): (() => void) => {
  const resize = (): void => {
    const { width, height } = getContainerSize(container);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    composer?.setSize(width, height);
  };

  resize();
  window.addEventListener('resize', resize);

  return () => {
    window.removeEventListener('resize', resize);
  };
};
