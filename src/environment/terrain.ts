import {
  BufferAttribute,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Vector3
} from 'three';

import type { WorldModule } from '../types/world';
import { fbm2D } from '../utils/noise';
import { clamp, smoothstep } from '../utils/math';

export interface TerrainConfig {
  width: number;
  depth: number;
  widthSegments: number;
  depthSegments: number;
  channelHalfWidth: number;
  shoreFalloff: number;
  mountainHeight: number;
  ridgeStrength: number;
  vegetationMinHeight: number;
  vegetationMaxHeight: number;
}

export const TERRAIN_CONFIG: TerrainConfig = {
  width: 1600,
  depth: 1100,
  widthSegments: 260,
  depthSegments: 180,
  channelHalfWidth: 240,
  shoreFalloff: 130,
  mountainHeight: 88,
  ridgeStrength: 46,
  vegetationMinHeight: 12,
  vegetationMaxHeight: 96
};

export const sampleTerrainHeight = (
  x: number,
  z: number,
  config: TerrainConfig = TERRAIN_CONFIG
): number => {
  const absX = Math.abs(x);
  const absZ = Math.abs(z);
  const shoreMask = smoothstep(
    config.channelHalfWidth - 20,
    config.channelHalfWidth + config.shoreFalloff,
    absX
  );
  const valleyMask = 1 - 0.25 * smoothstep(160, config.depth * 0.48, absZ);
  const majorNoise = fbm2D(x * 0.0038, z * 0.0036, 5, 2.15, 0.5, 11);
  const ridgeNoise = fbm2D(x * 0.0072, z * 0.0068, 4, 2.05, 0.55, 29);
  const detailNoise = fbm2D(x * 0.015, z * 0.014, 3, 2.2, 0.5, 51);
  // The shoreline stays low near the bridge axis and ramps outward into heavier mountain mass.
  const baseMountain = shoreMask * config.mountainHeight * valleyMask;
  const ridgeLift = shoreMask * config.ridgeStrength * smoothstep(220, 680, absZ + absX * 0.4);
  const outerBankLift = shoreMask * 26 * smoothstep(300, config.width * 0.42, absX);
  const shorelineShelf = shoreMask * 18;
  const basinDepth = -4.5 * (1 - shoreMask) - 1.8 * smoothstep(0, config.channelHalfWidth, absX);

  return (
    basinDepth +
    shorelineShelf +
    baseMountain * (0.42 + majorNoise * 0.9) +
    ridgeLift * ridgeNoise +
    outerBankLift +
    shoreMask * detailNoise * 9
  );
};

const terrainColor = (height: number): Color => {
  const sand = new Color(0x7d7665);
  const scrub = new Color(0x5c7155);
  const rock = new Color(0x615b55);
  const peak = new Color(0x8a918f);

  if (height < 6) {
    return sand;
  }

  if (height < 44) {
    return scrub.clone().lerp(rock, clamp((height - 12) / 40, 0, 1));
  }

  return rock.clone().lerp(peak, clamp((height - 48) / 70, 0, 1));
};

export const createTerrain = (config: TerrainConfig = TERRAIN_CONFIG): WorldModule<Group> => {
  const group = new Group();
  group.name = 'terrain';

  const geometry = new PlaneGeometry(
    config.width,
    config.depth,
    config.widthSegments,
    config.depthSegments
  );
  geometry.rotateX(-Math.PI * 0.5);

  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  const samplePosition = new Vector3();
  const vertexColor = new Color();

  for (let index = 0; index < positions.count; index += 1) {
    samplePosition.fromBufferAttribute(positions, index);
    const height = sampleTerrainHeight(samplePosition.x, samplePosition.z, config);

    positions.setY(index, height);

    vertexColor.copy(terrainColor(height));
    colors[index * 3] = vertexColor.r;
    colors[index * 3 + 1] = vertexColor.g;
    colors[index * 3 + 2] = vertexColor.b;
  }

  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0.05
  });

  const mesh = new Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  group.add(mesh);

  return {
    object3d: group
  };
};
