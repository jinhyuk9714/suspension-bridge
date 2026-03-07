export interface KeyboardAxes {
  moveForward: number;
  moveRight: number;
  moveUp: number;
  rotateYaw: number;
  rotatePitch: number;
  zoom: number;
}

export interface InputState {
  isPressed: (...codes: string[]) => boolean;
  dispose: () => void;
}

const axis = (negative: boolean, positive: boolean): number => Number(positive) - Number(negative);

export const createInputState = (target: Window = window): InputState => {
  const pressed = new Set<string>();

  const handleKeyDown = (event: KeyboardEvent): void => {
    pressed.add(event.code);
  };

  const handleKeyUp = (event: KeyboardEvent): void => {
    pressed.delete(event.code);
  };

  const handleBlur = (): void => {
    pressed.clear();
  };

  target.addEventListener('keydown', handleKeyDown);
  target.addEventListener('keyup', handleKeyUp);
  target.addEventListener('blur', handleBlur);

  return {
    isPressed: (...codes: string[]) => codes.some((code) => pressed.has(code)),
    dispose: () => {
      target.removeEventListener('keydown', handleKeyDown);
      target.removeEventListener('keyup', handleKeyUp);
      target.removeEventListener('blur', handleBlur);
    }
  };
};

export const readKeyboardAxes = (inputState: InputState): KeyboardAxes => ({
  moveForward: axis(inputState.isPressed('KeyS'), inputState.isPressed('KeyW')),
  moveRight: axis(inputState.isPressed('KeyA'), inputState.isPressed('KeyD')),
  moveUp: axis(inputState.isPressed('KeyF'), inputState.isPressed('KeyR')),
  rotateYaw: axis(inputState.isPressed('ArrowRight'), inputState.isPressed('ArrowLeft')),
  rotatePitch: axis(inputState.isPressed('ArrowUp'), inputState.isPressed('ArrowDown')),
  zoom: axis(inputState.isPressed('KeyQ'), inputState.isPressed('KeyE'))
});
