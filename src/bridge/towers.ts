import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Vector3
} from 'three';

import type { WorldModule } from '../types/world';
import type { BridgeConfig } from './config';

const upAxis = new Vector3(0, 1, 0);

const createStrut = (
  start: Vector3,
  end: Vector3,
  radius: number,
  material: MeshStandardMaterial
): Mesh => {
  const delta = new Vector3().subVectors(end, start);
  const length = delta.length();
  const mesh = new Mesh(new CylinderGeometry(radius, radius, length, 10), material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.copy(new Quaternion().setFromUnitVectors(upAxis, delta.normalize()));
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
};

const createTower = (xPosition: number, config: BridgeConfig, material: MeshStandardMaterial): Group => {
  const tower = new Group();
  tower.position.x = xPosition;

  const baseY = -8;
  const topY = config.deckHeight + config.towerHeight;
  const legHeight = topY - baseY;
  const legCenterY = (topY + baseY) * 0.5;
  const halfDepth = config.towerDepth * 0.5;
  const halfWidth = config.towerWidth * 0.5;

  const legGeometry = new BoxGeometry(4.8, legHeight, 4.8);

  for (const depth of [-halfDepth, halfDepth]) {
    for (const width of [-halfWidth, halfWidth]) {
      const leg = new Mesh(legGeometry, material);
      leg.position.set(depth, legCenterY, width);
      leg.castShadow = true;
      leg.receiveShadow = true;
      tower.add(leg);
    }
  }

  const beamLevels = [config.deckHeight - 5, 46, 92, topY - 10];

  for (const depth of [-halfDepth, halfDepth]) {
    for (const level of beamLevels) {
      const beam = new Mesh(new BoxGeometry(3.8, 4.2, config.towerWidth + 7), material);
      beam.position.set(depth, level, 0);
      beam.castShadow = true;
      beam.receiveShadow = true;
      tower.add(beam);
    }
  }

  for (const width of [-halfWidth, halfWidth]) {
    const topBeam = new Mesh(new BoxGeometry(config.towerDepth + 8, 3.2, 4), material);
    topBeam.position.set(0, topY - 6, width);
    topBeam.castShadow = true;
    topBeam.receiveShadow = true;
    tower.add(topBeam);
  }

  const braceLevels: Array<[number, number]> = [
    [baseY + 10, 42],
    [42, 82],
    [82, 122]
  ];

  for (const depth of [-halfDepth, halfDepth]) {
    for (const [fromY, toY] of braceLevels) {
      tower.add(
        createStrut(new Vector3(depth, fromY, -halfWidth), new Vector3(depth, toY, halfWidth), 0.28, material)
      );
      tower.add(
        createStrut(new Vector3(depth, fromY, halfWidth), new Vector3(depth, toY, -halfWidth), 0.28, material)
      );
    }
  }

  for (const width of [-config.mainCableOffset, config.mainCableOffset]) {
    const saddle = new Mesh(new BoxGeometry(config.towerDepth + 4, 1.8, 2.8), material);
    saddle.position.set(0, topY - 1.2, width);
    saddle.castShadow = true;
    saddle.receiveShadow = true;
    tower.add(saddle);
  }

  return tower;
};

export const createTowers = (config: BridgeConfig): WorldModule<Group> => {
  const group = new Group();
  group.name = 'towers';

  const material = new MeshStandardMaterial({
    color: 0x9d8f7f,
    metalness: 0.48,
    roughness: 0.56
  });

  group.add(createTower(-config.towerX, config, material));
  group.add(createTower(config.towerX, config, material));

  return {
    object3d: group
  };
};
