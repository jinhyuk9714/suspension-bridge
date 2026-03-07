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

const createRidge = (width: number, height: number, seed: number, color: number): Mesh => {
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
      opacity: 0.62,
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

  const layers = [
    { mesh: createRidge(1800, 260, 11, 0x5b6672), position: [0, 62, -760], rotationY: 0 },
    { mesh: createRidge(1800, 220, 31, 0x6b7580), position: [0, 52, 780], rotationY: Math.PI },
    { mesh: createRidge(1500, 210, 53, 0x5f6670), position: [-820, 58, 0], rotationY: Math.PI * 0.5 },
    { mesh: createRidge(1500, 210, 71, 0x5a616c), position: [820, 58, 0], rotationY: -Math.PI * 0.5 }
  ];

  layers.forEach(({ mesh, position, rotationY }) => {
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.y = rotationY;
    group.add(mesh);
  });

  return {
    object3d: group
  };
};
