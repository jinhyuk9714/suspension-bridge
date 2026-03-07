import {
  BufferAttribute,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry
} from 'three';

import type { WorldModule } from '../types/world';
import { fbm2D } from '../utils/noise';

export const DISTANT_MOUNTAIN_LAYERS = [
  { width: 2200, height: 320, seed: 7, color: 0x8794a3, opacity: 0.24, position: [0, 104, -980], rotationY: 0 },
  {
    width: 2200,
    height: 300,
    seed: 19,
    color: 0x8a97a5,
    opacity: 0.22,
    position: [0, 96, 980],
    rotationY: Math.PI
  },
  { width: 1800, height: 260, seed: 11, color: 0x66717d, opacity: 0.42, position: [0, 72, -760], rotationY: 0 },
  {
    width: 1800,
    height: 220,
    seed: 31,
    color: 0x6f7a86,
    opacity: 0.38,
    position: [0, 62, 780],
    rotationY: Math.PI
  },
  {
    width: 1500,
    height: 210,
    seed: 53,
    color: 0x626c77,
    opacity: 0.34,
    position: [-820, 66, 0],
    rotationY: Math.PI * 0.5
  },
  {
    width: 1500,
    height: 210,
    seed: 71,
    color: 0x5e6873,
    opacity: 0.34,
    position: [820, 66, 0],
    rotationY: -Math.PI * 0.5
  }
] as const;

const createRidge = (
  width: number,
  height: number,
  seed: number,
  color: number,
  opacity: number
): Mesh => {
  const geometry = new PlaneGeometry(width, height, 96, 16);
  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  const baseColor = new Color(color);

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const vertical = (y + height * 0.5) / height;
    const ridgeHeight =
      height *
      (0.26 +
        fbm2D((x + seed) * 0.0046, seed * 0.07, 4, 2.05, 0.55, seed) * 0.74 +
        fbm2D((x + seed) * 0.0108, seed * 0.17, 3, 2.1, 0.5, seed + 13) * 0.12);

    positions.setY(index, vertical * ridgeHeight - height * 0.5);

    const tint = 0.82 + vertical * 0.28;
    colors[index * 3] = baseColor.r * tint;
    colors[index * 3 + 1] = baseColor.g * tint;
    colors[index * 3 + 2] = baseColor.b * tint;
  }

  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  return new Mesh(
    geometry,
    new MeshStandardMaterial({
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      side: DoubleSide,
      roughness: 1,
      metalness: 0
    })
  );
};

export const createDistantMountains = (): WorldModule<Group> => {
  const group = new Group();
  group.name = 'distant-mountains';

  const layers = DISTANT_MOUNTAIN_LAYERS.map((layer) => ({
    mesh: createRidge(layer.width, layer.height, layer.seed, layer.color, layer.opacity),
    position: layer.position,
    rotationY: layer.rotationY
  }));

  layers.forEach(({ mesh, position, rotationY }) => {
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.y = rotationY;
    group.add(mesh);
  });

  return {
    object3d: group
  };
};
