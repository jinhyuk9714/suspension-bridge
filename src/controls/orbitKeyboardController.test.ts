import {
  KEYBOARD_CONTROLLER_DEFAULTS,
  createKeyboardControllerState,
  stepKeyboardController
} from './orbitKeyboardController';

describe('keyboard orbit controller state stepper', () => {
  it('accelerates movement and then damps it when input is released', () => {
    let state = createKeyboardControllerState({
      radius: 140,
      theta: 0,
      phi: 1.05,
      target: { x: 0, y: 20, z: 0 }
    });

    state = stepKeyboardController(
      state,
      {
        moveForward: 1,
        moveRight: 0,
        moveUp: 0,
        rotateYaw: 0,
        rotatePitch: 0,
        zoom: 0
      },
      0.016,
      KEYBOARD_CONTROLLER_DEFAULTS
    );

    const forwardVelocity = state.moveVelocity.z;

    expect(state.target.z).toBeLessThan(0);
    expect(forwardVelocity).toBeLessThan(0);

    state = stepKeyboardController(
      state,
      {
        moveForward: 0,
        moveRight: 0,
        moveUp: 0,
        rotateYaw: 0,
        rotatePitch: 0,
        zoom: 0
      },
      0.016,
      KEYBOARD_CONTROLLER_DEFAULTS
    );

    expect(Math.abs(state.moveVelocity.z)).toBeLessThan(Math.abs(forwardVelocity));
  });

  it('clamps polar angle and zoom radius to the configured limits', () => {
    let state = createKeyboardControllerState({
      radius: KEYBOARD_CONTROLLER_DEFAULTS.maxRadius - 1,
      theta: 0.2,
      phi: KEYBOARD_CONTROLLER_DEFAULTS.maxPhi - 0.01,
      target: { x: 0, y: 20, z: 0 }
    });

    state = stepKeyboardController(
      state,
      {
        moveForward: 0,
        moveRight: 0,
        moveUp: 0,
        rotateYaw: 0,
        rotatePitch: 1,
        zoom: 1
      },
      0.5,
      KEYBOARD_CONTROLLER_DEFAULTS
    );

    expect(state.phi).toBeLessThanOrEqual(KEYBOARD_CONTROLLER_DEFAULTS.maxPhi);
    expect(state.radius).toBeLessThanOrEqual(KEYBOARD_CONTROLLER_DEFAULTS.maxRadius);
  });
});
