import { PerspectiveCamera, Spherical, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import type { FrameState } from '../types/frame';
import { clamp } from '../utils/math';
import { createInputState, readKeyboardAxes, type KeyboardAxes } from './inputState';

export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export interface KeyboardControllerState {
  target: Vector3Like;
  radius: number;
  theta: number;
  phi: number;
  moveVelocity: Vector3Like;
  rotationVelocity: {
    theta: number;
    phi: number;
  };
  zoomVelocity: number;
}

export interface KeyboardControllerConfig {
  moveAcceleration: number;
  moveDamping: number;
  rotateAcceleration: number;
  rotateDamping: number;
  zoomAcceleration: number;
  zoomDamping: number;
  minPhi: number;
  maxPhi: number;
  minRadius: number;
  maxRadius: number;
}

export const KEYBOARD_CONTROLLER_DEFAULTS: KeyboardControllerConfig = {
  moveAcceleration: 110,
  moveDamping: 7.5,
  rotateAcceleration: 1.8,
  rotateDamping: 9.5,
  zoomAcceleration: 95,
  zoomDamping: 10,
  minPhi: 0.55,
  maxPhi: 1.32,
  minRadius: 60,
  maxRadius: 520
};

export const createKeyboardControllerState = (initial: {
  target: Vector3Like;
  radius: number;
  theta: number;
  phi: number;
}): KeyboardControllerState => ({
  target: { ...initial.target },
  radius: initial.radius,
  theta: initial.theta,
  phi: initial.phi,
  moveVelocity: { x: 0, y: 0, z: 0 },
  rotationVelocity: { theta: 0, phi: 0 },
  zoomVelocity: 0
});

const decay = (value: number, damping: number, delta: number): number => value * Math.exp(-damping * delta);

export const stepKeyboardController = (
  currentState: KeyboardControllerState,
  axes: KeyboardAxes,
  delta: number,
  config: KeyboardControllerConfig = KEYBOARD_CONTROLLER_DEFAULTS
): KeyboardControllerState => {
  const forwardX = -Math.sin(currentState.theta);
  const forwardZ = -Math.cos(currentState.theta);
  const rightX = Math.cos(currentState.theta);
  const rightZ = -Math.sin(currentState.theta);

  const moveVelocity = {
    x:
      currentState.moveVelocity.x +
      (forwardX * axes.moveForward + rightX * axes.moveRight) * config.moveAcceleration * delta,
    y: currentState.moveVelocity.y + axes.moveUp * config.moveAcceleration * 0.65 * delta,
    z:
      currentState.moveVelocity.z +
      (forwardZ * axes.moveForward + rightZ * axes.moveRight) * config.moveAcceleration * delta
  };

  const rotationVelocity = {
    theta: currentState.rotationVelocity.theta + axes.rotateYaw * config.rotateAcceleration * delta,
    phi: currentState.rotationVelocity.phi + axes.rotatePitch * config.rotateAcceleration * delta
  };
  const zoomVelocity = currentState.zoomVelocity + axes.zoom * config.zoomAcceleration * delta;

  const nextState: KeyboardControllerState = {
    target: {
      x: currentState.target.x + moveVelocity.x * delta,
      y: currentState.target.y + moveVelocity.y * delta,
      z: currentState.target.z + moveVelocity.z * delta
    },
    radius: clamp(currentState.radius + zoomVelocity * delta, config.minRadius, config.maxRadius),
    theta: currentState.theta + rotationVelocity.theta * delta,
    phi: clamp(currentState.phi + rotationVelocity.phi * delta, config.minPhi, config.maxPhi),
    moveVelocity: {
      x: decay(moveVelocity.x, config.moveDamping, delta),
      y: decay(moveVelocity.y, config.moveDamping, delta),
      z: decay(moveVelocity.z, config.moveDamping, delta)
    },
    rotationVelocity: {
      theta: decay(rotationVelocity.theta, config.rotateDamping, delta),
      phi: decay(rotationVelocity.phi, config.rotateDamping, delta)
    },
    zoomVelocity: decay(zoomVelocity, config.zoomDamping, delta)
  };

  return nextState;
};

export interface OrbitKeyboardController {
  controls: OrbitControls;
  update: (frame: FrameState) => void;
  dispose: () => void;
}

export const createOrbitKeyboardController = (
  camera: PerspectiveCamera,
  domElement: HTMLElement
): OrbitKeyboardController => {
  const controls = new OrbitControls(camera, domElement);
  const inputState = createInputState(window);
  const offset = new Vector3().copy(camera.position).sub(controls.target);
  const spherical = new Spherical().setFromVector3(offset);
  let keyboardState = createKeyboardControllerState({
    target: { x: 0, y: 28, z: 0 },
    radius: spherical.radius,
    theta: spherical.theta,
    phi: spherical.phi
  });

  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.screenSpacePanning = true;
  controls.minDistance = KEYBOARD_CONTROLLER_DEFAULTS.minRadius;
  controls.maxDistance = KEYBOARD_CONTROLLER_DEFAULTS.maxRadius;
  controls.minPolarAngle = KEYBOARD_CONTROLLER_DEFAULTS.minPhi;
  controls.maxPolarAngle = KEYBOARD_CONTROLLER_DEFAULTS.maxPhi;
  controls.target.set(0, 28, 0);
  controls.update();

  const computedOffset = new Vector3();

  return {
    controls,
    update: (frame: FrameState) => {
      // Let OrbitControls resolve pointer damping first, then blend keyboard motion on top of that state.
      controls.update();

      const currentOffset = computedOffset.copy(camera.position).sub(controls.target);
      const currentSpherical = new Spherical().setFromVector3(currentOffset);

      keyboardState = {
        ...keyboardState,
        target: {
          x: controls.target.x,
          y: controls.target.y,
          z: controls.target.z
        },
        radius: currentSpherical.radius,
        theta: currentSpherical.theta,
        phi: currentSpherical.phi
      };

      keyboardState = stepKeyboardController(
        keyboardState,
        readKeyboardAxes(inputState),
        frame.delta,
        {
          ...KEYBOARD_CONTROLLER_DEFAULTS,
          minPhi: controls.minPolarAngle,
          maxPhi: controls.maxPolarAngle,
          minRadius: controls.minDistance,
          maxRadius: controls.maxDistance
        }
      );

      controls.target.set(
        keyboardState.target.x,
        clamp(keyboardState.target.y, 4, 120),
        keyboardState.target.z
      );

      camera.position
        .copy(new Vector3().setFromSpherical(new Spherical(keyboardState.radius, keyboardState.phi, keyboardState.theta)))
        .add(controls.target);
      camera.lookAt(controls.target);
    },
    dispose: () => {
      inputState.dispose();
      controls.dispose();
    }
  };
};
