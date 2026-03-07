import { Vector3 } from 'three';

import type { BridgeConfig } from './config';

export interface DeckShoulderProfile {
  innerZ: number;
  outerZ: number;
  width: number;
  railZ: number;
}

export const getDeckShoulderProfile = (config: BridgeConfig): DeckShoulderProfile => {
  const innerZ = config.deckWidth * 0.5;
  const outerZ = config.mainCableOffset + 0.6;

  return {
    innerZ,
    outerZ,
    width: outerZ - innerZ,
    railZ: outerZ - 0.16
  };
};

export const getHangerSocketPoint = (
  config: BridgeConfig,
  x: number,
  side: -1 | 1
): Vector3 => new Vector3(x, config.deckHeight + 0.34, side * config.mainCableOffset);
