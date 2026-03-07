import {
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3
} from 'three';

import type { WorldModule } from '../types/world';
import { createCableProfileSampler } from './cables';
import type { BridgeConfig } from './config';
import { getHangerSocketPoint } from './hangerConnections';
import { BRIDGE_MATERIAL_SETTINGS } from './materials';

const upVector = new Vector3(0, 1, 0);

const pushRange = (target: number[], start: number, end: number, spacing: number): void => {
  const epsilon = 0.0001;
  for (let value = start; value <= end + epsilon; value += spacing) {
    target.push(Number(value.toFixed(6)));
  }
};

export const getSuspenderLayout = (config: BridgeConfig): number[] => {
  const halfTotalSpan = config.totalSpan * 0.5;
  const clear = config.suspenderTowerClearance;
  const spacing = config.suspenderSpacing;
  const positions: number[] = [];

  pushRange(positions, -halfTotalSpan + spacing, -config.towerX - clear, spacing);
  pushRange(positions, -config.towerX + clear, config.towerX - clear, spacing);
  pushRange(positions, config.towerX + clear, halfTotalSpan - spacing, spacing);

  return positions;
};

export const createSuspenders = (config: BridgeConfig): WorldModule<Group> => {
  const sampleCableHeight = createCableProfileSampler(config);
  const group = new Group();
  group.name = 'suspenders';

  const geometry = new CylinderGeometry(config.suspenderRadius, config.suspenderRadius, 1, 10);
  const material = new MeshStandardMaterial({
    color: BRIDGE_MATERIAL_SETTINGS.suspenders.color,
    metalness: BRIDGE_MATERIAL_SETTINGS.suspenders.metalness,
    roughness: BRIDGE_MATERIAL_SETTINGS.suspenders.roughness,
    envMapIntensity: BRIDGE_MATERIAL_SETTINGS.suspenders.envMapIntensity
  });

  const layout = getSuspenderLayout(config);
  const instancedMesh = new InstancedMesh(geometry, material, layout.length * 2);
  const matrix = new Matrix4();
  const quaternion = new Quaternion();
  let index = 0;

  for (const x of layout) {
    for (const direction of [-1, 1] as const) {
      const cableY = sampleCableHeight(x);
      const socketPoint = getHangerSocketPoint(config, x, direction);
      const length = cableY - socketPoint.y;
      const position = new Vector3(socketPoint.x, socketPoint.y + length * 0.5, socketPoint.z);

      matrix.compose(position, quaternion.setFromUnitVectors(upVector, upVector), new Vector3(1, length, 1));
      instancedMesh.setMatrixAt(index, matrix);
      index += 1;
    }
  }

  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = true;
  instancedMesh.instanceMatrix.needsUpdate = true;
  group.add(instancedMesh);

  return {
    object3d: group
  };
};
