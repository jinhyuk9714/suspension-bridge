import { PerspectiveCamera } from 'three';

export const createCamera = (aspect: number): PerspectiveCamera => {
  const camera = new PerspectiveCamera(42, aspect, 0.1, 4000);
  camera.position.set(220, 115, 185);
  camera.lookAt(0, 28, 0);

  return camera;
};
