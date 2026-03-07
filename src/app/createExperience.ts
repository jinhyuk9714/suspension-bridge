import { Vector3 } from 'three';

import { createBridge } from '../bridge';
import { BRIDGE_CONFIG } from '../bridge/config';
import { createCamera, START_CAMERA_VIEW } from '../core/camera';
import { createAnimationLoop } from '../core/animationLoop';
import { createRenderer } from '../core/renderer';
import { attachResize } from '../core/resize';
import { createScene } from '../core/scene';
import { createOrbitKeyboardController } from '../controls/orbitKeyboardController';
import { createClouds } from '../environment/clouds';
import { createDistantMountains } from '../environment/distantMountains';
import { createSkyEnvironment } from '../environment/sky';
import { createTerrain } from '../environment/terrain';
import { createVegetation } from '../environment/vegetation';
import { createWater } from '../environment/water';
import { setupLighting } from '../lighting/setupLighting';
import { createComposer } from '../postprocessing/composer';
import { createTraffic } from '../traffic';
import { disposeObject3D } from '../utils/dispose';

export const createExperience = (container: HTMLElement): (() => void) => {
  container.replaceChildren();

  const renderer = createRenderer();
  renderer.domElement.setAttribute('aria-label', '3D suspension bridge scene');
  container.append(renderer.domElement);

  const scene = createScene();
  const camera = createCamera(1);

  const sky = createSkyEnvironment(renderer, scene);
  const lighting = setupLighting(scene, sky.sunDirection);

  const bridge = createBridge(BRIDGE_CONFIG);
  const traffic = createTraffic(BRIDGE_CONFIG);
  const terrain = createTerrain();
  const water = createWater();
  const clouds = createClouds();
  const vegetation = createVegetation();
  const distantMountains = createDistantMountains();

  scene.add(distantMountains.object3d);
  scene.add(terrain.object3d);
  scene.add(water.object3d);
  scene.add(bridge.object3d);
  scene.add(traffic.object3d);
  scene.add(vegetation.object3d);
  scene.add(clouds.object3d);

  const cameraController = createOrbitKeyboardController(camera, renderer.domElement);
  cameraController.controls.target.copy(START_CAMERA_VIEW.target);
  cameraController.controls.update();

  const composer = createComposer(renderer, scene, camera, {
    width: Math.max(container.clientWidth, window.innerWidth, 1),
    height: Math.max(container.clientHeight, window.innerHeight, 1)
  });

  const stopResize = attachResize(container, camera, renderer, composer);
  const animationLoop = createAnimationLoop({
    renderer,
    scene,
    camera,
    composer,
    updatables: [
      cameraController,
      ...(traffic.update ? [{ update: traffic.update }] : []),
      ...(water.update ? [{ update: water.update }] : []),
      ...(clouds.update ? [{ update: clouds.update }] : [])
    ]
  });

  animationLoop.start();

  return () => {
    animationLoop.stop();
    stopResize();
    cameraController.dispose();
    sky.dispose?.();
    disposeObject3D(scene);
    renderer.dispose();
    composer.passes.forEach((pass) => {
      if ('dispose' in pass && typeof pass.dispose === 'function') {
        pass.dispose();
      }
    });
    lighting.removeFromParent();
    renderer.domElement.remove();
  };
};
