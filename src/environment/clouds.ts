import { CanvasTexture, Color, Group, Sprite, SpriteMaterial } from 'three';

import type { FrameState } from '../types/frame';
import type { WorldModule } from '../types/world';

interface CloudEntry {
  sprite: Sprite;
  originX: number;
  originZ: number;
  speed: number;
  wobble: number;
}

const createCloudTexture = (): CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to create cloud texture context.');
  }

  const gradient = context.createRadialGradient(128, 64, 10, 128, 64, 118);
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.45, 'rgba(250,242,233,0.6)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const wrap = (value: number, min: number, max: number): number => {
  const range = max - min;
  let wrapped = value;
  while (wrapped < min) wrapped += range;
  while (wrapped > max) wrapped -= range;
  return wrapped;
};

export const createClouds = (): WorldModule<Group> => {
  const group = new Group();
  group.name = 'clouds';

  const material = new SpriteMaterial({
    map: createCloudTexture(),
    color: new Color(0xfff2df),
    transparent: true,
    depthWrite: false,
    opacity: 0.48
  });

  const clouds: CloudEntry[] = [];

  for (let index = 0; index < 15; index += 1) {
    const sprite = new Sprite(material);
    const originX = -540 + index * 78;
    const originZ = -180 + (index % 5) * 78;
    const y = 168 + (index % 4) * 16 + Math.sin(index * 0.8) * 8;
    const scale = 120 + (index % 3) * 28;

    sprite.position.set(originX, y, originZ);
    sprite.scale.set(scale, scale * 0.55, 1);
    group.add(sprite);

    clouds.push({
      sprite,
      originX,
      originZ,
      speed: 6 + (index % 4) * 1.5,
      wobble: 16 + (index % 3) * 7
    });
  }

  return {
    object3d: group,
    update: ({ elapsed }: FrameState) => {
      clouds.forEach((cloud, index) => {
        cloud.sprite.position.x = wrap(cloud.originX + elapsed * cloud.speed, -620, 620);
        cloud.sprite.position.z = cloud.originZ + Math.sin(elapsed * 0.07 + index) * cloud.wobble;
      });
    }
  };
};
