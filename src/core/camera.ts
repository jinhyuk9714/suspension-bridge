import { PerspectiveCamera, Vector3 } from 'three';

export const START_CAMERA_VIEW = {
  fov: 42,
  position: new Vector3(220, 115, 185),
  target: new Vector3(0, 28, 0)
} as const;

export const createCamera = (aspect: number): PerspectiveCamera => {
  const camera = new PerspectiveCamera(START_CAMERA_VIEW.fov, aspect, 0.1, 4000);
  camera.position.copy(START_CAMERA_VIEW.position);
  camera.lookAt(START_CAMERA_VIEW.target);

  return camera;
};
