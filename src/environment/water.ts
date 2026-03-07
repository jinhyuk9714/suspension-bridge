import { Color, DoubleSide, Group, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

import type { FrameState } from '../types/frame';
import type { WorldModule } from '../types/world';

export const WATER_VISUAL_SETTINGS = {
  reflectorColor: new Color(0x142028),
  deepColor: new Color(0x1b4154),
  horizonColor: new Color(0x627b91),
  horizonBlend: 0.32,
  sheenColor: new Color(0x8c959b),
  glintColor: new Color(0xa47e5f),
  sheenMix: 0.045,
  rippleMix: 0.015,
  glintMix: 0.09,
  glintThreshold: 0.9,
  glintPower: 2.6,
  baseAlpha: 0.03,
  shimmerAlphaBoost: 0.05
} as const;

export const WATER_REFLECTION_GRADING = {
  warmThresholdLow: 0.055,
  warmThresholdHigh: 0.14,
  lumaLow: 0.22,
  lumaHigh: 0.68,
  desaturateStrength: 0.52,
  coolTint: new Color(0x8794a0),
  coolTintMix: 0.35,
  neutralizeStrength: 0.58
} as const;

const reflectorVertexShader = /* glsl */ `
  uniform mat4 textureMatrix;
  varying vec4 vUv;

  #include <common>
  #include <logdepthbuf_pars_vertex>

  void main() {
    vUv = textureMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    #include <logdepthbuf_vertex>
  }
`;

const reflectorFragmentShader = /* glsl */ `
  uniform vec3 color;
  uniform sampler2D tDiffuse;
  uniform float warmThresholdLow;
  uniform float warmThresholdHigh;
  uniform float lumaLow;
  uniform float lumaHigh;
  uniform float desaturateStrength;
  uniform vec3 coolTint;
  uniform float coolTintMix;
  uniform float neutralizeStrength;
  varying vec4 vUv;

  #include <logdepthbuf_pars_fragment>

  float blendOverlay(float base, float blend) {
    return (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)));
  }

  vec3 blendOverlay(vec3 base, vec3 blend) {
    return vec3(
      blendOverlay(base.r, blend.r),
      blendOverlay(base.g, blend.g),
      blendOverlay(base.b, blend.b)
    );
  }

  void main() {
    #include <logdepthbuf_fragment>

    vec3 base = texture2DProj(tDiffuse, vUv).rgb;
    float luma = dot(base, vec3(0.2126, 0.7152, 0.0722));
    float warmMask =
      smoothstep(warmThresholdLow, warmThresholdHigh, base.r - max(base.g, base.b)) *
      smoothstep(lumaLow, lumaHigh, luma);
    vec3 desaturated = mix(base, vec3(luma), desaturateStrength);
    float tintLuma = max(dot(coolTint, vec3(0.2126, 0.7152, 0.0722)), 0.0001);
    vec3 coolTintNormalized = coolTint / tintLuma;
    vec3 neutralTarget = mix(desaturated, desaturated * coolTintNormalized, coolTintMix);
    vec3 neutralized = mix(base, neutralTarget, warmMask * neutralizeStrength);
    vec3 finalColor = blendOverlay(neutralized, color);

    gl_FragColor = vec4(finalColor, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const buildReflectorShader = () => ({
  name: 'BridgeWaterReflectorShader',
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    warmThresholdLow: { value: WATER_REFLECTION_GRADING.warmThresholdLow },
    warmThresholdHigh: { value: WATER_REFLECTION_GRADING.warmThresholdHigh },
    lumaLow: { value: WATER_REFLECTION_GRADING.lumaLow },
    lumaHigh: { value: WATER_REFLECTION_GRADING.lumaHigh },
    desaturateStrength: { value: WATER_REFLECTION_GRADING.desaturateStrength },
    coolTint: { value: WATER_REFLECTION_GRADING.coolTint },
    coolTintMix: { value: WATER_REFLECTION_GRADING.coolTintMix },
    neutralizeStrength: { value: WATER_REFLECTION_GRADING.neutralizeStrength }
  },
  vertexShader: reflectorVertexShader,
  fragmentShader: reflectorFragmentShader
});

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
  uniform vec3 uHorizonColor;
  uniform vec3 uSheenColor;
  uniform vec3 uGlintColor;
  varying vec2 vUv;

  void main() {
    float ripple = 0.5 + 0.5 * sin(vUv.x * 95.0 + uTime * 1.5 + sin(vUv.y * 36.0 - uTime * 0.7));
    float secondary = 0.5 + 0.5 * sin(vUv.y * 128.0 - uTime * 1.1);
    float surfaceSparkle = ripple * secondary;
    float shimmer = smoothstep(0.72, 1.0, surfaceSparkle);
    float edgeFade = smoothstep(0.02, 0.18, vUv.x) * smoothstep(0.02, 0.18, 1.0 - vUv.x);
    edgeFade *= smoothstep(0.02, 0.18, vUv.y) * smoothstep(0.02, 0.18, 1.0 - vUv.y);
    float horizonTint = pow(vUv.y, 1.85) * ${WATER_VISUAL_SETTINGS.horizonBlend};
    vec3 waterBase = mix(uDeepColor, uHorizonColor, horizonTint);
    float sheenMask = shimmer * ${WATER_VISUAL_SETTINGS.sheenMix} + ripple * ${WATER_VISUAL_SETTINGS.rippleMix};
    float glintMask = pow(
      smoothstep(${WATER_VISUAL_SETTINGS.glintThreshold}, 1.0, surfaceSparkle),
      ${WATER_VISUAL_SETTINGS.glintPower}
    );
    vec3 color = mix(waterBase, uSheenColor, sheenMask);
    color = mix(color, uGlintColor, glintMask * ${WATER_VISUAL_SETTINGS.glintMix});
    float alpha = (${WATER_VISUAL_SETTINGS.baseAlpha} + shimmer * ${WATER_VISUAL_SETTINGS.shimmerAlphaBoost}) * edgeFade;
    gl_FragColor = vec4(color, alpha);
  }
`;

export const createWater = (): WorldModule<Group> => {
  const group = new Group();
  group.name = 'water';

  // Reflector handles the large-scale mirror response; the shader layer adds small ripples and warm shimmer.
  const reflector = new Reflector(new PlaneGeometry(1900, 1200), {
    color: WATER_VISUAL_SETTINGS.reflectorColor,
    textureWidth: 1024,
    textureHeight: 1024,
    clipBias: 0.002,
    shader: buildReflectorShader()
  });
  reflector.rotation.x = -Math.PI * 0.5;
  reflector.position.y = -0.12;
  group.add(reflector);

  const overlayMaterial = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeepColor: { value: WATER_VISUAL_SETTINGS.deepColor },
      uHorizonColor: { value: WATER_VISUAL_SETTINGS.horizonColor },
      uSheenColor: { value: WATER_VISUAL_SETTINGS.sheenColor },
      uGlintColor: { value: WATER_VISUAL_SETTINGS.glintColor }
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
