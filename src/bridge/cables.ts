import { CatmullRomCurve3, Group, Mesh, MeshStandardMaterial, TubeGeometry, Vector3 } from 'three';

import type { WorldModule } from '../types/world';
import { lerp, smoothstep } from '../utils/math';
import type { BridgeConfig } from './config';

export const createCableProfileSampler =
  (config: BridgeConfig) =>
  (x: number): number => {
    const absX = Math.abs(x);
    const halfMainSpan = config.mainSpan * 0.5;
    const halfTotalSpan = config.totalSpan * 0.5;
    const saddleHeight = config.deckHeight + config.towerHeight;
    const centerHeight = saddleHeight - config.cableSag;

    // The main span uses a smooth parabolic sag, while side spans ease down into the buried anchor blocks.
    if (absX <= halfMainSpan) {
      const t = absX / halfMainSpan;
      return centerHeight + (saddleHeight - centerHeight) * t * t;
    }

    const t = smoothstep(0, 1, (absX - halfMainSpan) / (halfTotalSpan - halfMainSpan));
    return lerp(saddleHeight, config.cableAnchorHeight, t);
  };

export const generateMainCablePoints = (
  config: BridgeConfig,
  segments = 160,
  zOffset = 0
): Vector3[] => {
  const sampleY = createCableProfileSampler(config);
  const halfSpan = config.totalSpan * 0.5;
  const points: Vector3[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const x = lerp(-halfSpan, halfSpan, t);
    points.push(new Vector3(x, sampleY(x), zOffset));
  }

  return points;
};

export const createMainCableCurve = (config: BridgeConfig, zOffset: number): CatmullRomCurve3 =>
  new CatmullRomCurve3(generateMainCablePoints(config, 180, zOffset), false, 'catmullrom', 0.02);

export const createMainCables = (config: BridgeConfig): WorldModule<Group> => {
  const group = new Group();
  group.name = 'main-cables';

  const cableMaterial = new MeshStandardMaterial({
    color: 0x2d3038,
    metalness: 0.75,
    roughness: 0.35
  });

  for (const direction of [-1, 1] as const) {
    const cableCurve = createMainCableCurve(config, direction * config.mainCableOffset);
    const cableGeometry = new TubeGeometry(cableCurve, 220, config.cableRadius, 14, false);
    const cable = new Mesh(cableGeometry, cableMaterial);
    cable.castShadow = true;
    cable.receiveShadow = true;
    group.add(cable);
  }

  return {
    object3d: group
  };
};
