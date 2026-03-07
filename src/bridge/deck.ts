import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';

import type { WorldModule } from '../types/world';
import type { BridgeConfig } from './config';

export const createDeck = (config: BridgeConfig): WorldModule<Group> => {
  const group = new Group();
  group.name = 'deck';

  const deckBodyMaterial = new MeshStandardMaterial({
    color: 0x555c65,
    metalness: 0.18,
    roughness: 0.72
  });
  const roadMaterial = new MeshStandardMaterial({
    color: 0x2e3137,
    roughness: 0.92,
    metalness: 0.04
  });
  const accentMaterial = new MeshStandardMaterial({
    color: 0xb9b2a7,
    roughness: 0.55,
    metalness: 0.12
  });

  const deckCenterY = config.deckHeight - config.deckThickness * 0.5;

  const deckBody = new Mesh(
    new BoxGeometry(config.totalSpan, config.deckThickness, config.deckWidth),
    deckBodyMaterial
  );
  deckBody.position.y = deckCenterY;
  deckBody.castShadow = true;
  deckBody.receiveShadow = true;
  group.add(deckBody);

  const roadSurface = new Mesh(
    new PlaneGeometry(config.totalSpan, config.deckWidth - 1.2).rotateX(-Math.PI * 0.5),
    roadMaterial
  );
  roadSurface.position.y = config.deckHeight + 0.04;
  roadSurface.receiveShadow = true;
  group.add(roadSurface);

  const sideGirderGeometry = new BoxGeometry(config.totalSpan, 1.6, 1);
  for (const side of [-1, 1] as const) {
    const girder = new Mesh(sideGirderGeometry, deckBodyMaterial);
    girder.position.set(0, deckCenterY + 0.2, side * (config.deckWidth * 0.5 - 0.65));
    girder.castShadow = true;
    girder.receiveShadow = true;
    group.add(girder);

    const rail = new Mesh(new BoxGeometry(config.totalSpan, 0.18, 0.18), accentMaterial);
    rail.position.set(0, config.deckHeight + 1.45, side * (config.deckWidth * 0.5 + 0.48));
    rail.castShadow = true;
    rail.receiveShadow = true;
    group.add(rail);
  }

  const ribGeometry = new BoxGeometry(1.2, 0.95, config.deckWidth + 1.6);
  for (let x = -config.totalSpan * 0.5 + 14; x <= config.totalSpan * 0.5 - 14; x += 18) {
    const rib = new Mesh(ribGeometry, deckBodyMaterial);
    rib.position.set(x, deckCenterY - config.deckThickness * 0.55, 0);
    rib.castShadow = true;
    rib.receiveShadow = true;
    group.add(rib);
  }

  const postGeometry = new BoxGeometry(0.14, 1.1, 0.14);
  for (const side of [-1, 1] as const) {
    for (let x = -config.totalSpan * 0.5 + 10; x <= config.totalSpan * 0.5 - 10; x += 12) {
      const post = new Mesh(postGeometry, accentMaterial);
      post.position.set(x, config.deckHeight + 0.72, side * (config.deckWidth * 0.5 + 0.45));
      post.castShadow = true;
      post.receiveShadow = true;
      group.add(post);
    }
  }

  for (let x = -config.totalSpan * 0.5 + 12; x <= config.totalSpan * 0.5 - 12; x += 16) {
    const laneMark = new Mesh(new BoxGeometry(7.5, 0.03, 0.18), accentMaterial);
    laneMark.position.set(x, config.deckHeight + 0.06, 0);
    laneMark.receiveShadow = true;
    group.add(laneMark);
  }

  return {
    object3d: group
  };
};
