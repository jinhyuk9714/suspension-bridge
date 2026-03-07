import { DirectionalLight, Group, HemisphereLight, Scene, Vector3 } from 'three';

export const LIGHTING_SETTINGS = {
  hemisphereSkyColor: 0xc8ddff,
  hemisphereGroundColor: 0x5f6972,
  hemisphereIntensity: 0.86,
  sunIntensity: 1.72,
  fillColor: 0xaec5ff,
  fillIntensity: 0.2,
  bounceColor: 0xc6aa8a,
  bounceIntensity: 0.24
} as const;

export const setupLighting = (scene: Scene, sunDirection: Vector3): Group => {
  const group = new Group();
  group.name = 'lighting';

  const hemisphere = new HemisphereLight(
    LIGHTING_SETTINGS.hemisphereSkyColor,
    LIGHTING_SETTINGS.hemisphereGroundColor,
    LIGHTING_SETTINGS.hemisphereIntensity
  );
  group.add(hemisphere);

  const sun = new DirectionalLight(0xffc387, LIGHTING_SETTINGS.sunIntensity);
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

  const fill = new DirectionalLight(LIGHTING_SETTINGS.fillColor, LIGHTING_SETTINGS.fillIntensity);
  fill.position.copy(sunDirection).multiplyScalar(-320).setY(240);
  group.add(fill);

  const bounce = new DirectionalLight(LIGHTING_SETTINGS.bounceColor, LIGHTING_SETTINGS.bounceIntensity);
  bounce.position.copy(sunDirection).multiplyScalar(-220).setY(90);
  group.add(bounce);

  scene.add(group);

  return group;
};
