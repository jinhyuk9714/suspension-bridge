import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';

import type { WorldModule } from '../types/world';
import type { BridgeConfig } from './config';

export const createAnchorages = (config: BridgeConfig): WorldModule<Group> => {
  const group = new Group();
  group.name = 'anchorages';

  const material = new MeshStandardMaterial({
    color: 0x8f887f,
    roughness: 0.95,
    metalness: 0.04
  });

  const halfSpan = config.totalSpan * 0.5;

  for (const side of [-1, 1] as const) {
    const block = new Mesh(
      new BoxGeometry(config.anchorBlockLength, config.anchorBlockHeight, config.anchorBlockWidth),
      material
    );
    block.position.set(
      side * (halfSpan + config.anchorBlockLength * 0.5 - 4),
      config.anchorBlockHeight * 0.5 - 8,
      0
    );
    block.castShadow = true;
    block.receiveShadow = true;
    group.add(block);

    const transition = new Mesh(
      new BoxGeometry(
        config.anchorBlockLength * 0.7,
        config.anchorBlockHeight * 0.42,
        config.anchorBlockWidth * 0.86
      ),
      material
    );
    transition.position.set(side * (halfSpan + config.anchorBlockLength * 0.08), 0.5, 0);
    transition.rotation.z = side * -0.18;
    transition.castShadow = true;
    transition.receiveShadow = true;
    group.add(transition);
  }

  return {
    object3d: group
  };
};
