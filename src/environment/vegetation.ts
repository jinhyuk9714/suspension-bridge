import {
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  Vector3
} from 'three';

import type { WorldModule } from '../types/world';
import { fbm2D } from '../utils/noise';
import { TERRAIN_CONFIG, sampleTerrainHeight, type TerrainConfig } from './terrain';

const yAxis = new Vector3(0, 1, 0);

const createTreeTexture = (): CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to create vegetation texture context.');
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  const trunkGradient = context.createLinearGradient(64, 180, 64, 255);
  trunkGradient.addColorStop(0, 'rgba(82,58,40,0.9)');
  trunkGradient.addColorStop(1, 'rgba(44,28,18,0)');
  context.fillStyle = trunkGradient;
  context.fillRect(56, 176, 16, 80);

  const foliageGradient = context.createLinearGradient(64, 12, 64, 220);
  foliageGradient.addColorStop(0, 'rgba(210,235,190,0.95)');
  foliageGradient.addColorStop(0.25, 'rgba(98,130,78,0.92)');
  foliageGradient.addColorStop(1, 'rgba(24,48,28,0)');
  context.fillStyle = foliageGradient;

  context.beginPath();
  context.moveTo(64, 4);
  context.lineTo(24, 170);
  context.lineTo(104, 170);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(64, 56);
  context.lineTo(12, 204);
  context.lineTo(116, 204);
  context.closePath();
  context.fill();

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

export const createVegetation = (config: TerrainConfig = TERRAIN_CONFIG): WorldModule<Group> => {
  const group = new Group();
  group.name = 'vegetation';

  const texture = createTreeTexture();
  const geometry = new PlaneGeometry(1, 1, 1, 1);
  geometry.translate(0, 0.5, 0);

  const material = new MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.45,
    side: DoubleSide,
    depthWrite: true,
    roughness: 1,
    metalness: 0
  });

  const treeCount = 800;
  const firstLayer = new InstancedMesh(geometry, material, treeCount);
  const secondLayer = new InstancedMesh(geometry, material, treeCount);
  firstLayer.castShadow = true;
  secondLayer.castShadow = true;

  const matrix = new Matrix4();
  const quaternion = new Quaternion();
  const scale = new Vector3();
  const color = new Color();
  let index = 0;

  for (let attempt = 0; attempt < 2200 && index < treeCount; attempt += 1) {
    const seed = attempt * 1.37;
    const side = seed % 2 < 1 ? -1 : 1;
    const radial = 320 + fbm2D(seed * 0.17, 1.3, 3, 2.1, 0.55, 17) * 380;
    const x = side * radial;
    const z = -config.depth * 0.45 + fbm2D(seed * 0.13, 7.1, 4, 2.0, 0.55, 23) * config.depth * 0.9;
    const y = sampleTerrainHeight(x, z, config);
    const slope =
      Math.abs(sampleTerrainHeight(x + 8, z, config) - y) +
      Math.abs(sampleTerrainHeight(x, z + 8, config) - y);

    if (y < config.vegetationMinHeight || y > config.vegetationMaxHeight || slope > 10) {
      continue;
    }

    const height = 12 + fbm2D(seed * 0.21, 9.3, 3, 2.1, 0.55, 31) * 16;
    const yaw = fbm2D(seed * 0.19, 11.1, 2, 2.0, 0.5, 43) * Math.PI;
    const tint = 0.75 + fbm2D(seed * 0.23, 15.7, 2, 2.0, 0.5, 59) * 0.25;
    color.setRGB(0.22 * tint, 0.34 * tint, 0.24 * tint);
    scale.set(height * 0.48, height, height * 0.48);

    quaternion.setFromAxisAngle(yAxis, yaw);
    matrix.compose(new Vector3(x, y - 0.2, z), quaternion, scale);
    firstLayer.setMatrixAt(index, matrix);
    firstLayer.setColorAt(index, color);

    quaternion.setFromAxisAngle(yAxis, yaw + Math.PI * 0.5);
    matrix.compose(new Vector3(x, y - 0.2, z), quaternion, scale);
    secondLayer.setMatrixAt(index, matrix);
    secondLayer.setColorAt(index, color);

    index += 1;
  }

  firstLayer.count = index;
  secondLayer.count = index;
  firstLayer.instanceMatrix.needsUpdate = true;
  secondLayer.instanceMatrix.needsUpdate = true;
  if (firstLayer.instanceColor) firstLayer.instanceColor.needsUpdate = true;
  if (secondLayer.instanceColor) secondLayer.instanceColor.needsUpdate = true;

  group.add(firstLayer, secondLayer);

  return {
    object3d: group
  };
};
