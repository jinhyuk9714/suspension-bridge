import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

import type { FrameState } from '../types/frame';

export interface LoopUpdatable {
  update: (frame: FrameState) => void;
}

export const createAnimationLoop = (options: {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  composer?: EffectComposer;
  updatables: LoopUpdatable[];
}) => {
  const clock = new Clock();
  let rafId = 0;

  const frame = (): void => {
    const delta = Math.min(clock.getDelta(), 1 / 24);
    const frameState: FrameState = {
      elapsed: clock.elapsedTime,
      delta
    };

    options.updatables.forEach((updatable) => updatable.update(frameState));

    if (options.composer) {
      options.composer.render();
    } else {
      options.renderer.render(options.scene, options.camera);
    }

    rafId = window.requestAnimationFrame(frame);
  };

  return {
    start: (): void => {
      clock.start();
      frame();
    },
    stop: (): void => {
      window.cancelAnimationFrame(rafId);
    }
  };
};
