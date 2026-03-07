import { Color, DoubleSide, Group, Mesh, PlaneGeometry, ShaderMaterial } from 'three';

import type { FrameState } from '../types/frame';
import type { WorldModule } from '../types/world';

interface MistLayerSetting {
  width: number;
  depth: number;
  opacity: number;
  y: number;
  color: number;
  timeOffset: number;
}

export const MIST_LAYER_SETTINGS: readonly MistLayerSetting[] = [];

const mistVertexShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    transformed.z += sin(position.x * 0.01 + uTime * 0.16) * 0.8;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const mistFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;

  float haze(vec2 uv) {
    float waves = sin((uv.x + uTime * 0.018) * 24.0);
    waves += sin((uv.y - uTime * 0.012) * 18.0);
    waves += sin((uv.x + uv.y + uTime * 0.01) * 14.0);
    return waves / 3.0 * 0.5 + 0.5;
  }

  void main() {
    float density = smoothstep(0.22, 0.88, haze(vUv));
    float edge = smoothstep(0.02, 0.25, vUv.x) * smoothstep(0.02, 0.25, 1.0 - vUv.x);
    edge *= smoothstep(0.02, 0.35, vUv.y) * smoothstep(0.02, 0.35, 1.0 - vUv.y);
    gl_FragColor = vec4(uColor, density * edge * uOpacity);
  }
`;

const createMistLayer = ({
  width,
  depth,
  opacity,
  y,
  color
}: {
  width: number;
  depth: number;
  opacity: number;
  y: number;
  color: number;
}): Mesh => {
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(color) },
      uOpacity: { value: opacity }
    },
    vertexShader: mistVertexShader,
    fragmentShader: mistFragmentShader,
    transparent: true,
    depthWrite: false,
    side: DoubleSide
  });

  const mesh = new Mesh(new PlaneGeometry(width, depth, 24, 24), material);
  mesh.rotation.x = -Math.PI * 0.5;
  mesh.position.y = y;
  mesh.renderOrder = 3;

  return mesh;
};

export const createMist = (): WorldModule<Group> => {
  const group = new Group();
  group.name = 'mist';

  const layers = MIST_LAYER_SETTINGS.map((setting) => ({
    mesh: createMistLayer(setting),
    timeOffset: setting.timeOffset
  }));
  layers.forEach(({ mesh }) => group.add(mesh));

  return {
    object3d: group,
    update: ({ elapsed }: FrameState) => {
      layers.forEach(({ mesh, timeOffset }) => {
        const material = mesh.material as ShaderMaterial;
        material.uniforms.uTime.value = elapsed + timeOffset;
      });
    }
  };
};
