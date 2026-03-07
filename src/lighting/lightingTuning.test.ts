import {
  BoxGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
  Vector3
} from 'three';

import { createAnchorages } from '../bridge/anchorages';
import { BRIDGE_CONFIG } from '../bridge/config';
import { createMainCables } from '../bridge/cables';
import { createDeck } from '../bridge/deck';
import { createSuspenders } from '../bridge/suspenders';
import { createTowers } from '../bridge/towers';
import { createCamera, START_CAMERA_VIEW } from '../core/camera';
import { SKY_ATMOSPHERE_SETTINGS } from '../environment/sky';
import { BLOOM_SETTINGS } from '../postprocessing/composer';
import { createScene, SCENE_ATMOSPHERE } from '../core/scene';
import { RENDERER_SETTINGS } from '../core/renderer';
import { LIGHTING_SETTINGS, setupLighting } from './setupLighting';
import { SKY_SUN_SETTINGS, getSunDirection } from '../environment/sky';
import {
  buildReflectorShader,
  createWater,
  WATER_REFLECTION_GRADING,
  WATER_VISUAL_SETTINGS
} from '../environment/water';

const getFirstStandardMaterial = (object3d: Object3D): MeshStandardMaterial => {
  let material: MeshStandardMaterial | null = null;

  object3d.traverse((child) => {
    if (material) {
      return;
    }

    const candidate = (child as Mesh).material;
    if (candidate instanceof MeshStandardMaterial) {
      material = candidate;
    }
  });

  if (!material) {
    throw new Error('Expected a MeshStandardMaterial in the traversed object.');
  }

  return material;
};

const hasBoxGeometrySize = (
  mesh: Mesh,
  width: number,
  height: number,
  depth: number,
  epsilon = 0.0001
): boolean => {
  if (!(mesh.geometry instanceof BoxGeometry)) {
    return false;
  }

  const { width: meshWidth, height: meshHeight, depth: meshDepth } = mesh.geometry.parameters;

  return (
    Math.abs(meshWidth - width) < epsilon &&
    Math.abs(meshHeight - height) < epsilon &&
    Math.abs(meshDepth - depth) < epsilon
  );
};

const getStandardMaterialFromMesh = (
  object3d: Object3D,
  predicate: (mesh: Mesh) => boolean
): MeshStandardMaterial => {
  let material: MeshStandardMaterial | null = null;

  object3d.traverse((child) => {
    if (material || !(child instanceof Mesh) || !predicate(child)) {
      return;
    }

    const candidate = child.material;
    if (candidate instanceof MeshStandardMaterial) {
      material = candidate;
    }
  });

  if (!material) {
    throw new Error('Expected a matching mesh with MeshStandardMaterial.');
  }

  return material;
};

const getLuminance = (hex: number): number => {
  const color = new Color(hex);
  return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
};

describe('lighting rebalance tuning', () => {
  it('uses the balanced relighting intensities from the approved plan', () => {
    expect(LIGHTING_SETTINGS.hemisphereSkyColor).toBe(0xc8ddff);
    expect(LIGHTING_SETTINGS.hemisphereGroundColor).toBe(0x5f6972);
    expect(LIGHTING_SETTINGS.hemisphereIntensity).toBe(0.86);
    expect(LIGHTING_SETTINGS.sunIntensity).toBe(1.72);
    expect(LIGHTING_SETTINGS.fillColor).toBe(0xaec5ff);
    expect(LIGHTING_SETTINGS.fillIntensity).toBe(0.2);
    expect(LIGHTING_SETTINGS.bounceColor).toBe(0xc6aa8a);
    expect(LIGHTING_SETTINGS.bounceIntensity).toBe(0.24);
  });

  it('uses the restored exposure and bloom settings from the approved plan', () => {
    expect(RENDERER_SETTINGS.toneMappingExposure).toBe(0.76);
    expect(BLOOM_SETTINGS.strength).toBe(0.012);
    expect(BLOOM_SETTINGS.radius).toBe(0.4);
    expect(BLOOM_SETTINGS.threshold).toBe(0.99);
  });

  it('uses the restored sky and scene atmosphere values from the approved plan', () => {
    expect(SKY_ATMOSPHERE_SETTINGS.turbidity).toBe(9.8);
    expect(SKY_ATMOSPHERE_SETTINGS.rayleigh).toBe(1.5);
    expect(SKY_ATMOSPHERE_SETTINGS.mieCoefficient).toBe(0.004);
    expect(SCENE_ATMOSPHERE.background.getHex()).toBe(new Color(0x95a1ac).getHex());
    expect(SCENE_ATMOSPHERE.backgroundIntensity).toBe(0.54);
    expect(SCENE_ATMOSPHERE.environmentIntensity).toBe(0.3);
  });

  it('keeps enough non-direct light for views that face away from the sun', () => {
    const supportLighting =
      LIGHTING_SETTINGS.hemisphereIntensity +
      LIGHTING_SETTINGS.fillIntensity +
      LIGHTING_SETTINGS.bounceIntensity +
      SCENE_ATMOSPHERE.environmentIntensity;

    expect(supportLighting).toBeGreaterThan(1.55);
    expect(LIGHTING_SETTINGS.fillIntensity).toBeGreaterThanOrEqual(0.2);
    expect(LIGHTING_SETTINGS.bounceIntensity).toBeGreaterThanOrEqual(0.24);
    expect(SCENE_ATMOSPHERE.environmentIntensity).toBeGreaterThanOrEqual(0.3);
  });

  it('applies the exported scene and light settings to created objects', () => {
    const scene = createScene();

    expect(scene.background).toBeInstanceOf(Color);
    expect((scene.background as Color).getHex()).toBe(SCENE_ATMOSPHERE.background.getHex());
    expect(scene.fog).toBeNull();
    expect(scene.backgroundIntensity).toBe(SCENE_ATMOSPHERE.backgroundIntensity);
    expect(scene.environmentIntensity).toBe(SCENE_ATMOSPHERE.environmentIntensity);

    const lightingScene = new Scene();
    const lightingGroup = setupLighting(lightingScene, new Vector3(1, 1, 0).normalize());

    expect(lightingGroup.children).toHaveLength(4);
    expect(lightingGroup.children[0].type).toBe('HemisphereLight');
    expect(lightingGroup.children[1].type).toBe('DirectionalLight');
    expect(lightingGroup.children[2].type).toBe('DirectionalLight');
    expect(lightingGroup.children[3].type).toBe('DirectionalLight');

    const hemisphere = lightingGroup.children[0] as HemisphereLight;
    const sun = lightingGroup.children[1] as DirectionalLight;
    const fill = lightingGroup.children[2] as DirectionalLight;
    const bounce = lightingGroup.children[3] as DirectionalLight;

    expect(hemisphere.intensity).toBe(LIGHTING_SETTINGS.hemisphereIntensity);
    expect(hemisphere.color.getHex()).toBe(LIGHTING_SETTINGS.hemisphereSkyColor);
    expect(hemisphere.groundColor.getHex()).toBe(LIGHTING_SETTINGS.hemisphereGroundColor);
    expect(sun.intensity).toBe(LIGHTING_SETTINGS.sunIntensity);
    expect(fill.intensity).toBe(LIGHTING_SETTINGS.fillIntensity);
    expect(fill.color.getHex()).toBe(LIGHTING_SETTINGS.fillColor);
    expect(bounce.intensity).toBe(LIGHTING_SETTINGS.bounceIntensity);
    expect(bounce.color.getHex()).toBe(LIGHTING_SETTINGS.bounceColor);
    expect(sun.castShadow).toBe(true);
    expect(fill.castShadow).toBe(false);
    expect(bounce.castShadow).toBe(false);
  });

  it('keeps the startup camera view away from looking almost straight into the sun', () => {
    const camera = createCamera(1);
    const target = START_CAMERA_VIEW.target;
    const sunDirection = getSunDirection(SKY_SUN_SETTINGS);
    const cameraForward = new Vector3().subVectors(target, camera.position).normalize();
    const angleToSun = cameraForward.angleTo(sunDirection) * (180 / Math.PI);

    expect(SKY_SUN_SETTINGS.elevation).toBe(11);
    expect(SKY_SUN_SETTINGS.azimuth).toBe(140);
    expect(angleToSun).toBeGreaterThan(80);
  });

  it('uses rebalanced water reflection and highlight settings from the approved plan', () => {
    expect(WATER_VISUAL_SETTINGS.reflectorColor.getHex()).toBe(new Color(0x142028).getHex());
    expect(WATER_VISUAL_SETTINGS.deepColor.getHex()).toBe(new Color(0x1b4154).getHex());
    expect(WATER_VISUAL_SETTINGS.sheenColor.getHex()).toBe(new Color(0x8c959b).getHex());
    expect(WATER_VISUAL_SETTINGS.glintColor.getHex()).toBe(new Color(0xa47e5f).getHex());
    expect(WATER_VISUAL_SETTINGS.sheenMix).toBe(0.045);
    expect(WATER_VISUAL_SETTINGS.rippleMix).toBe(0.015);
    expect(WATER_VISUAL_SETTINGS.glintMix).toBe(0.09);
    expect(WATER_VISUAL_SETTINGS.glintThreshold).toBe(0.9);
    expect(WATER_VISUAL_SETTINGS.glintPower).toBe(2.6);
    expect(WATER_VISUAL_SETTINGS.baseAlpha).toBe(0.03);
    expect(WATER_VISUAL_SETTINGS.shimmerAlphaBoost).toBe(0.05);
    expect(WATER_VISUAL_SETTINGS.glintThreshold).toBeGreaterThan(0.85);
    expect(WATER_VISUAL_SETTINGS.glintMix).toBeGreaterThan(WATER_VISUAL_SETTINGS.sheenMix);
  });

  it('uses reflector-only grading to neutralize overly warm tower reflections', () => {
    expect(WATER_REFLECTION_GRADING.warmThresholdLow).toBe(0.055);
    expect(WATER_REFLECTION_GRADING.warmThresholdHigh).toBe(0.14);
    expect(WATER_REFLECTION_GRADING.lumaLow).toBe(0.22);
    expect(WATER_REFLECTION_GRADING.lumaHigh).toBe(0.68);
    expect(WATER_REFLECTION_GRADING.desaturateStrength).toBe(0.52);
    expect(WATER_REFLECTION_GRADING.coolTint.getHex()).toBe(new Color(0x8794a0).getHex());
    expect(WATER_REFLECTION_GRADING.coolTintMix).toBe(0.35);
    expect(WATER_REFLECTION_GRADING.neutralizeStrength).toBe(0.58);
    expect(WATER_REFLECTION_GRADING.neutralizeStrength).toBeGreaterThan(0.5);
    expect(WATER_REFLECTION_GRADING.warmThresholdHigh).toBeGreaterThan(
      WATER_REFLECTION_GRADING.warmThresholdLow
    );
    expect(WATER_REFLECTION_GRADING.coolTint.getHex()).toBe(new Color(0x8794a0).getHex());
    expect(WATER_REFLECTION_GRADING.coolTint.b).toBeGreaterThanOrEqual(WATER_REFLECTION_GRADING.coolTint.r);
  });

  it('injects the reflector grading uniforms without changing the overlay water controls', () => {
    const water = createWater().object3d;
    const reflector = water.children[0] as Mesh;
    const reflectorMaterial = reflector.material as MeshStandardMaterial & {
      uniforms: Record<string, { value: unknown }>;
      fragmentShader: string;
    };
    const reflectorShader = buildReflectorShader();

    expect(reflectorMaterial.uniforms.tDiffuse).toBeDefined();
    expect(reflectorMaterial.uniforms.textureMatrix).toBeDefined();
    expect(reflectorMaterial.uniforms.color).toBeDefined();
    expect(reflectorMaterial.uniforms.warmThresholdLow.value).toBe(WATER_REFLECTION_GRADING.warmThresholdLow);
    expect(reflectorMaterial.uniforms.warmThresholdHigh.value).toBe(WATER_REFLECTION_GRADING.warmThresholdHigh);
    expect(reflectorMaterial.uniforms.desaturateStrength.value).toBe(WATER_REFLECTION_GRADING.desaturateStrength);
    expect((reflectorMaterial.uniforms.coolTint.value as Color).getHex()).toBe(
      WATER_REFLECTION_GRADING.coolTint.getHex()
    );
    expect(reflectorMaterial.uniforms.coolTintMix.value).toBe(WATER_REFLECTION_GRADING.coolTintMix);
    expect(reflectorMaterial.uniforms.neutralizeStrength.value).toBe(WATER_REFLECTION_GRADING.neutralizeStrength);
    expect(reflectorMaterial.fragmentShader).toContain('warmMask');
    expect(reflectorShader.fragmentShader).toContain('neutralized');
    expect(WATER_VISUAL_SETTINGS.sheenMix).toBe(0.045);
    expect(WATER_VISUAL_SETTINGS.glintMix).toBe(0.09);
  });

  it('exports rebalanced bridge material settings and keeps bridge materials aligned with them', async () => {
    const { BRIDGE_MATERIAL_SETTINGS } = await import('../bridge/materials');
    const towers = createTowers(BRIDGE_CONFIG).object3d;
    const cables = createMainCables(BRIDGE_CONFIG).object3d;
    const suspenders = createSuspenders(BRIDGE_CONFIG).object3d;
    const deck = createDeck(BRIDGE_CONFIG).object3d;
    const anchorages = createAnchorages(BRIDGE_CONFIG).object3d;

    expect(BRIDGE_MATERIAL_SETTINGS.towers).toMatchObject({
      color: 0xbe6e45,
      metalness: 0.03,
      roughness: 0.89,
      envMapIntensity: 0.14
    });
    expect(BRIDGE_MATERIAL_SETTINGS.mainCables).toMatchObject({
      color: 0x394149,
      metalness: 0.2,
      roughness: 0.84,
      envMapIntensity: 0.2
    });
    expect(BRIDGE_MATERIAL_SETTINGS.suspenders).toMatchObject({
      color: 0x66707a,
      metalness: 0.16,
      roughness: 0.85,
      envMapIntensity: 0.17
    });
    expect(BRIDGE_MATERIAL_SETTINGS.deckBody).toMatchObject({
      color: 0x496074,
      metalness: 0.05,
      roughness: 0.9,
      envMapIntensity: 0.08
    });
    expect(BRIDGE_MATERIAL_SETTINGS.roadSurface).toMatchObject({
      color: 0x23272c,
      metalness: 0.01,
      roughness: 0.97,
      envMapIntensity: 0.015
    });
    expect(BRIDGE_MATERIAL_SETTINGS.rails).toMatchObject({
      color: 0xc4b7a8,
      metalness: 0.04,
      roughness: 0.84,
      envMapIntensity: 0.06
    });
    expect(BRIDGE_MATERIAL_SETTINGS.posts).toMatchObject({
      color: 0xac9f91,
      metalness: 0.03,
      roughness: 0.88,
      envMapIntensity: 0.05
    });
    expect(BRIDGE_MATERIAL_SETTINGS.laneMarks).toMatchObject({
      color: 0xd8cfb0,
      metalness: 0,
      roughness: 0.76,
      envMapIntensity: 0.02
    });
    expect(BRIDGE_MATERIAL_SETTINGS.anchorages).toMatchObject({
      color: 0x9c7560,
      metalness: 0.02,
      roughness: 0.95,
      envMapIntensity: 0.02
    });

    const towerMaterial = getFirstStandardMaterial(towers);
    const cableMaterial = getFirstStandardMaterial(cables);
    const suspenderMaterial = getFirstStandardMaterial(suspenders);
    const deckBodyMaterial = (deck.children[0] as Mesh).material as MeshStandardMaterial;
    const roadSurfaceMaterial = (deck.children[1] as Mesh).material as MeshStandardMaterial;
    const railMaterial = getStandardMaterialFromMesh(
      deck,
      (mesh) => hasBoxGeometrySize(mesh, BRIDGE_CONFIG.totalSpan, 0.18, 0.18)
    );
    const postMaterial = getStandardMaterialFromMesh(deck, (mesh) => hasBoxGeometrySize(mesh, 0.14, 1.1, 0.14));
    const laneMarkMaterial = getStandardMaterialFromMesh(deck, (mesh) =>
      hasBoxGeometrySize(mesh, 7.5, 0.03, 0.18)
    );
    const anchorageMaterial = getFirstStandardMaterial(anchorages);

    expect(towerMaterial.color.getHex()).toBe(BRIDGE_MATERIAL_SETTINGS.towers.color);
    expect(towerMaterial.metalness).toBe(BRIDGE_MATERIAL_SETTINGS.towers.metalness);
    expect(towerMaterial.roughness).toBe(BRIDGE_MATERIAL_SETTINGS.towers.roughness);
    expect(towerMaterial.envMapIntensity).toBe(BRIDGE_MATERIAL_SETTINGS.towers.envMapIntensity);

    expect(cableMaterial.color.getHex()).toBe(BRIDGE_MATERIAL_SETTINGS.mainCables.color);
    expect(cableMaterial.metalness).toBe(BRIDGE_MATERIAL_SETTINGS.mainCables.metalness);
    expect(cableMaterial.roughness).toBe(BRIDGE_MATERIAL_SETTINGS.mainCables.roughness);
    expect(cableMaterial.envMapIntensity).toBe(BRIDGE_MATERIAL_SETTINGS.mainCables.envMapIntensity);

    expect(suspenderMaterial.color.getHex()).toBe(BRIDGE_MATERIAL_SETTINGS.suspenders.color);
    expect(suspenderMaterial.metalness).toBe(BRIDGE_MATERIAL_SETTINGS.suspenders.metalness);
    expect(suspenderMaterial.roughness).toBe(BRIDGE_MATERIAL_SETTINGS.suspenders.roughness);
    expect(suspenderMaterial.envMapIntensity).toBe(BRIDGE_MATERIAL_SETTINGS.suspenders.envMapIntensity);

    expect(deckBodyMaterial.metalness).toBe(BRIDGE_MATERIAL_SETTINGS.deckBody.metalness);
    expect(deckBodyMaterial.roughness).toBe(BRIDGE_MATERIAL_SETTINGS.deckBody.roughness);
    expect(deckBodyMaterial.envMapIntensity).toBe(BRIDGE_MATERIAL_SETTINGS.deckBody.envMapIntensity);

    expect(roadSurfaceMaterial.color.getHex()).toBe(BRIDGE_MATERIAL_SETTINGS.roadSurface.color);
    expect(roadSurfaceMaterial.envMapIntensity).toBe(BRIDGE_MATERIAL_SETTINGS.roadSurface.envMapIntensity);

    expect(railMaterial.color.getHex()).toBe(BRIDGE_MATERIAL_SETTINGS.rails.color);
    expect(railMaterial.metalness).toBe(BRIDGE_MATERIAL_SETTINGS.rails.metalness);
    expect(railMaterial.roughness).toBe(BRIDGE_MATERIAL_SETTINGS.rails.roughness);
    expect(railMaterial.envMapIntensity).toBe(BRIDGE_MATERIAL_SETTINGS.rails.envMapIntensity);

    expect(postMaterial.color.getHex()).toBe(BRIDGE_MATERIAL_SETTINGS.posts.color);
    expect(postMaterial.metalness).toBe(BRIDGE_MATERIAL_SETTINGS.posts.metalness);
    expect(postMaterial.roughness).toBe(BRIDGE_MATERIAL_SETTINGS.posts.roughness);
    expect(postMaterial.envMapIntensity).toBe(BRIDGE_MATERIAL_SETTINGS.posts.envMapIntensity);

    expect(laneMarkMaterial.color.getHex()).toBe(BRIDGE_MATERIAL_SETTINGS.laneMarks.color);
    expect(laneMarkMaterial.metalness).toBe(BRIDGE_MATERIAL_SETTINGS.laneMarks.metalness);
    expect(laneMarkMaterial.roughness).toBe(BRIDGE_MATERIAL_SETTINGS.laneMarks.roughness);
    expect(laneMarkMaterial.envMapIntensity).toBe(BRIDGE_MATERIAL_SETTINGS.laneMarks.envMapIntensity);

    expect(anchorageMaterial.color.getHex()).toBe(BRIDGE_MATERIAL_SETTINGS.anchorages.color);
    expect(anchorageMaterial.metalness).toBe(BRIDGE_MATERIAL_SETTINGS.anchorages.metalness);
    expect(anchorageMaterial.roughness).toBe(BRIDGE_MATERIAL_SETTINGS.anchorages.roughness);
    expect(anchorageMaterial.envMapIntensity).toBe(BRIDGE_MATERIAL_SETTINGS.anchorages.envMapIntensity);

    expect(railMaterial).not.toBe(postMaterial);
    expect(postMaterial).not.toBe(laneMarkMaterial);
    expect(laneMarkMaterial).not.toBe(railMaterial);

    expect(getLuminance(BRIDGE_MATERIAL_SETTINGS.roadSurface.color)).toBeLessThan(
      getLuminance(BRIDGE_MATERIAL_SETTINGS.deckBody.color)
    );
    expect(getLuminance(BRIDGE_MATERIAL_SETTINGS.laneMarks.color)).toBeGreaterThan(
      getLuminance(BRIDGE_MATERIAL_SETTINGS.roadSurface.color)
    );
    expect(getLuminance(BRIDGE_MATERIAL_SETTINGS.mainCables.color)).toBeLessThan(
      getLuminance(BRIDGE_MATERIAL_SETTINGS.towers.color)
    );
    expect(getLuminance(BRIDGE_MATERIAL_SETTINGS.rails.color)).toBeGreaterThan(
      getLuminance(BRIDGE_MATERIAL_SETTINGS.posts.color)
    );
    expect(new Color(BRIDGE_MATERIAL_SETTINGS.towers.color).r).toBeGreaterThan(
      new Color(BRIDGE_MATERIAL_SETTINGS.towers.color).b
    );
    expect(new Color(BRIDGE_MATERIAL_SETTINGS.anchorages.color).r).toBeGreaterThan(
      new Color(BRIDGE_MATERIAL_SETTINGS.anchorages.color).b
    );
  });
});
