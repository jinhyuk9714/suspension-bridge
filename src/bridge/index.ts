import { Group } from 'three';

import type { WorldModule } from '../types/world';
import { createAnchorages } from './anchorages';
import { createMainCables } from './cables';
import { BRIDGE_CONFIG, type BridgeConfig } from './config';
import { createDeck } from './deck';
import { createSuspenders } from './suspenders';
import { createTowers } from './towers';

export const createBridge = (config: BridgeConfig = BRIDGE_CONFIG): WorldModule<Group> => {
  const group = new Group();
  group.name = 'bridge';

  const modules = [
    createAnchorages(config),
    createDeck(config),
    createTowers(config),
    createMainCables(config),
    createSuspenders(config)
  ];

  modules.forEach((module) => group.add(module.object3d));

  return {
    object3d: group
  };
};
