import { Color, DoubleSide, Group, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

import type { FrameState } from '../types/frame';
import type { WorldModule } from '../types/world';

const waterVertexShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float waveA = sin(position.x * 0.012 + uTime * 0.68);
    float waveB = sin(position.y * 0.024 - uTime * 0.44);
    transformed.z += waveA * 0.55 + waveB * 0.28;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const waterFragmentShader = `
  uniform float uTime;
  uniform vec3 uDeepColor;
  uniform vec3 uHighlightColor;
  varying vec2 vUv;

  void main() {
    float ripple = 0.5 + 0.5 * sin(vUv.x * 95.0 + uTime * 1.5 + sin(vUv.y * 36.0 - uTime * 0.7));
    float secondary = 0.5 + 0.5 * sin(vUv.y * 128.0 - uTime * 1.1);
    float shimmer = smoothstep(0.72, 1.0, ripple * secondary);
    float edgeFade = smoothstep(0.02, 0.18, vUv.x) * smoothstep(0.02, 0.18, 1.0 - vUv.x);
    edgeFade *= smoothstep(0.02, 0.18, vUv.y) * smoothstep(0.02, 0.18, 1.0 - vUv.y);
    vec3 color = mix(uDeepColor, uHighlightColor, shimmer * 0.72 + ripple * 0.16);
    float alpha = (0.16 + shimmer * 0.2) * edgeFade;
    gl_FragColor = vec4(color, alpha);
  }
`;

export const createWater = (): WorldModule<Group> => {
  const group = new Group();
  group.name = 'water';

  // Reflector handles the large-scale mirror response; the shader layer adds small ripples and warm shimmer.
  const reflector = new Reflector(new PlaneGeometry(1900, 1200), {
    color: new Color(0x273847),
    textureWidth: 1024,
    textureHeight: 1024,
    clipBias: 0.002
  });
  reflector.rotation.x = -Math.PI * 0.5;
  reflector.position.y = -0.12;
  group.add(reflector);

  const overlayMaterial = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeepColor: { value: new Color(0x264a61) },
      uHighlightColor: { value: new Color(0xf5bf89) }
    },
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    transparent: true,
    depthWrite: false,
    side: DoubleSide
  });

  const overlay = new Mesh(new PlaneGeometry(1800, 1020, 180, 90), overlayMaterial);
  overlay.rotation.x = -Math.PI * 0.5;
  overlay.position.y = 0.18;
  overlay.renderOrder = 2;
  group.add(overlay);

  return {
    object3d: group,
    update: ({ elapsed }: FrameState) => {
      overlayMaterial.uniforms.uTime.value = elapsed;
    }
  };
};
