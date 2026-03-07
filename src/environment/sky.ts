import { Group, MathUtils, PMREMGenerator, Scene, Vector3, WebGLRenderer } from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

import type { WorldModule } from '../types/world';

interface SkyModule extends WorldModule<Group> {
  sunDirection: Vector3;
}

const applySkyUniforms = (sky: Sky, sunDirection: Vector3): void => {
  const uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 8;
  uniforms.rayleigh.value = 2.5;
  uniforms.mieCoefficient.value = 0.006;
  uniforms.mieDirectionalG.value = 0.9;
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

  const elevation = 11;
  const azimuth = 214;
  const sunDirection = new Vector3().setFromSphericalCoords(
    1,
    MathUtils.degToRad(90 - elevation),
    MathUtils.degToRad(azimuth)
  );

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
