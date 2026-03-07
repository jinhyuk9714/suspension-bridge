import { DirectionalLight, Group, HemisphereLight, Scene, Vector3 } from 'three';

export const setupLighting = (scene: Scene, sunDirection: Vector3): Group => {
  const group = new Group();
  group.name = 'lighting';

  const hemisphere = new HemisphereLight(0xbfd6ff, 0x31404d, 1.45);
  group.add(hemisphere);

  const sun = new DirectionalLight(0xffc387, 3.8);
  sun.position.copy(sunDirection).multiplyScalar(720);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(2048);
  sun.shadow.bias = -0.00012;
  sun.shadow.normalBias = 0.018;
  sun.shadow.camera.near = 80;
  sun.shadow.camera.far = 1600;
  sun.shadow.camera.left = -360;
  sun.shadow.camera.right = 360;
  sun.shadow.camera.top = 280;
  sun.shadow.camera.bottom = -220;
  group.add(sun);

  const fill = new DirectionalLight(0x9dbbf8, 0.45);
  fill.position.copy(sunDirection).multiplyScalar(-360).setY(180);
  group.add(fill);

  scene.add(group);

  return group;
};
