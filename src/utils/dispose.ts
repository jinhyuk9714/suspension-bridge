import { Material, Object3D } from 'three';

const disposeMaterial = (material: Material): void => {
  material.dispose();

  const candidateMaps = Object.values(material) as unknown[];
  for (const candidate of candidateMaps) {
    if (
      candidate &&
      typeof candidate === 'object' &&
      'isTexture' in candidate &&
      candidate.isTexture &&
      'dispose' in candidate &&
      typeof candidate.dispose === 'function'
    ) {
      candidate.dispose();
    }
  }
};

export const disposeObject3D = (root: Object3D): void => {
  root.traverse((node) => {
    const geometryCandidate = node as Object3D & { geometry?: { dispose?: () => void } };
    geometryCandidate.geometry?.dispose?.();

    const materialCandidate = node as Object3D & { material?: Material | Material[] };
    if (Array.isArray(materialCandidate.material)) {
      materialCandidate.material.forEach(disposeMaterial);
    } else if (materialCandidate.material) {
      disposeMaterial(materialCandidate.material);
    }
  });
};
