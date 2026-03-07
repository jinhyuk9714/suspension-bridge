import { Group, MathUtils, PMREMGenerator, Scene, Vector3, WebGLRenderer } from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

import type { WorldModule } from '../types/world';

export const SKY_ATMOSPHERE_SETTINGS = {
  turbidity: 9.8,
  rayleigh: 1.5,
  mieCoefficient: 0.004,
  mieDirectionalG: 0.9
} as const;

export const SKY_SUN_SETTINGS = {
  elevation: 11,
  azimuth: 140
} as const;

interface SkyModule extends WorldModule<Group> {
  sunDirection: Vector3;
}

export const getSunDirection = ({
  elevation,
  azimuth
}: {
  elevation: number;
  azimuth: number;
}): Vector3 =>
  new Vector3().setFromSphericalCoords(
    1,
    MathUtils.degToRad(90 - elevation),
    MathUtils.degToRad(azimuth)
  );

const applySkyUniforms = (sky: Sky, sunDirection: Vector3): void => {
  const uniforms = sky.material.uniforms;
  uniforms.turbidity.value = SKY_ATMOSPHERE_SETTINGS.turbidity;
  uniforms.rayleigh.value = SKY_ATMOSPHERE_SETTINGS.rayleigh;
  uniforms.mieCoefficient.value = SKY_ATMOSPHERE_SETTINGS.mieCoefficient;
  uniforms.mieDirectionalG.value = SKY_ATMOSPHERE_SETTINGS.mieDirectionalG;
  uniforms.sunPosition.value.copy(sunDirection);
};

export const createSkyEnvironment = (
  renderer: WebGLRenderer,
  scene: Scene
): SkyModule => {
  const group = new Group();
  group.name = 'sky';

  const sky = new Sky();
  sky.scale.setScalar(10000);

  const sunDirection = getSunDirection(SKY_SUN_SETTINGS);

  applySkyUniforms(sky, sunDirection);
  group.add(sky);
  scene.add(group);

  const pmremGenerator = new PMREMGenerator(renderer);
  const envScene = new Scene();
  const envSky = new Sky();
  envSky.scale.copy(sky.scale);
  applySkyUniforms(envSky, sunDirection);
  envScene.add(envSky);
  const environmentRenderTarget = pmremGenerator.fromScene(envScene);
  scene.environment = environmentRenderTarget.texture;

  return {
    object3d: group,
    sunDirection,
    dispose: () => {
      environmentRenderTarget.dispose();
      pmremGenerator.dispose();
      envSky.geometry.dispose();
      envSky.material.dispose();
    }
  };
};
