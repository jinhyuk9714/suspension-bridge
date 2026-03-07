import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';

import type { WorldModule } from '../types/world';
import type { BridgeConfig } from './config';
import { getDeckShoulderProfile } from './hangerConnections';
import { BRIDGE_MATERIAL_SETTINGS } from './materials';

export const createDeck = (config: BridgeConfig): WorldModule<Group> => {
  const group = new Group();
  group.name = 'deck';
  const shoulderProfile = getDeckShoulderProfile(config);
  const shoulderCenterZ = (shoulderProfile.innerZ + shoulderProfile.outerZ) * 0.5;

  const deckBodyMaterial = new MeshStandardMaterial({
    color: BRIDGE_MATERIAL_SETTINGS.deckBody.color,
    metalness: BRIDGE_MATERIAL_SETTINGS.deckBody.metalness,
    roughness: BRIDGE_MATERIAL_SETTINGS.deckBody.roughness,
    envMapIntensity: BRIDGE_MATERIAL_SETTINGS.deckBody.envMapIntensity
  });
  const roadMaterial = new MeshStandardMaterial({
    color: BRIDGE_MATERIAL_SETTINGS.roadSurface.color,
    roughness: BRIDGE_MATERIAL_SETTINGS.roadSurface.roughness,
    metalness: BRIDGE_MATERIAL_SETTINGS.roadSurface.metalness,
    envMapIntensity: BRIDGE_MATERIAL_SETTINGS.roadSurface.envMapIntensity
  });
  const railMaterial = new MeshStandardMaterial({
    color: BRIDGE_MATERIAL_SETTINGS.rails.color,
    roughness: BRIDGE_MATERIAL_SETTINGS.rails.roughness,
    metalness: BRIDGE_MATERIAL_SETTINGS.rails.metalness,
    envMapIntensity: BRIDGE_MATERIAL_SETTINGS.rails.envMapIntensity
  });
  const postMaterial = new MeshStandardMaterial({
    color: BRIDGE_MATERIAL_SETTINGS.posts.color,
    roughness: BRIDGE_MATERIAL_SETTINGS.posts.roughness,
    metalness: BRIDGE_MATERIAL_SETTINGS.posts.metalness,
    envMapIntensity: BRIDGE_MATERIAL_SETTINGS.posts.envMapIntensity
  });
  const laneMarkMaterial = new MeshStandardMaterial({
    color: BRIDGE_MATERIAL_SETTINGS.laneMarks.color,
    roughness: BRIDGE_MATERIAL_SETTINGS.laneMarks.roughness,
    metalness: BRIDGE_MATERIAL_SETTINGS.laneMarks.metalness,
    envMapIntensity: BRIDGE_MATERIAL_SETTINGS.laneMarks.envMapIntensity
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

  const shoulderGeometry = new BoxGeometry(config.totalSpan, 0.32, shoulderProfile.width);
  const outerStringerGeometry = new BoxGeometry(config.totalSpan, 0.52, 0.48);
  const cantileverRibGeometry = new BoxGeometry(1.05, 0.9, shoulderProfile.width + 0.12);

  for (const side of [-1, 1] as const) {
    const shoulder = new Mesh(shoulderGeometry, deckBodyMaterial);
    shoulder.position.set(0, config.deckHeight - 0.16, side * shoulderCenterZ);
    shoulder.castShadow = true;
    shoulder.receiveShadow = true;
    group.add(shoulder);

    const outerStringer = new Mesh(outerStringerGeometry, deckBodyMaterial);
    outerStringer.position.set(0, config.deckHeight + 0.2, side * (shoulderProfile.outerZ - 0.28));
    outerStringer.castShadow = true;
    outerStringer.receiveShadow = true;
    group.add(outerStringer);
  }

  const sideGirderGeometry = new BoxGeometry(config.totalSpan, 1.6, 1);
  for (const side of [-1, 1] as const) {
    const girder = new Mesh(sideGirderGeometry, deckBodyMaterial);
    girder.position.set(0, deckCenterY + 0.2, side * (config.deckWidth * 0.5 - 0.65));
    girder.castShadow = true;
    girder.receiveShadow = true;
      group.add(girder);

    const rail = new Mesh(new BoxGeometry(config.totalSpan, 0.18, 0.18), railMaterial);
    rail.position.set(0, config.deckHeight + 1.45, side * shoulderProfile.railZ);
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
      const post = new Mesh(postGeometry, postMaterial);
      post.position.set(x, config.deckHeight + 0.72, side * shoulderProfile.railZ);
      post.castShadow = true;
      post.receiveShadow = true;
      group.add(post);
    }
  }

  for (const side of [-1, 1] as const) {
    for (let x = -config.totalSpan * 0.5 + 16; x <= config.totalSpan * 0.5 - 16; x += 18) {
      const rib = new Mesh(cantileverRibGeometry, deckBodyMaterial);
      rib.position.set(x, deckCenterY + 1.15, side * shoulderCenterZ);
      rib.castShadow = true;
      rib.receiveShadow = true;
      group.add(rib);
    }
  }

  for (let x = -config.totalSpan * 0.5 + 12; x <= config.totalSpan * 0.5 - 12; x += 16) {
    const laneMark = new Mesh(new BoxGeometry(7.5, 0.03, 0.18), laneMarkMaterial);
    laneMark.position.set(x, config.deckHeight + 0.06, 0);
    laneMark.receiveShadow = true;
    group.add(laneMark);
  }

  return {
    object3d: group
  };
};
