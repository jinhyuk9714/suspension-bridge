import type { Object3D } from 'three';

import type { FrameState } from './frame';

export interface WorldModule<T extends Object3D = Object3D> {
  object3d: T;
  update?: (frame: FrameState) => void;
  dispose?: () => void;
}
