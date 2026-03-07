import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Object3D,
  Vector3
} from 'three';

import type { TrafficConfig, TrafficVehicleState, VehicleKind } from './config';

interface VehiclePart {
  mesh: InstancedMesh;
  localMatrix: Matrix4;
  colorResolver: (bodyHex: number) => Color;
}

interface VehicleCatalog {
  object3d: Group;
  sync: (state: TrafficVehicleState[], config: TrafficConfig) => void;
}

const GLASS_COLOR = new Color(0x7f909f);
const WHEEL_COLOR = new Color(0x171b20);

const createStandardMaterial = (roughness: number, metalness: number): MeshStandardMaterial =>
  new MeshStandardMaterial({
    color: 0xffffff,
    roughness,
    metalness
  });

const createPart = (
  geometry: BoxGeometry,
  count: number,
  localOffset: Vector3,
  roughness: number,
  metalness: number,
  colorResolver: (bodyHex: number) => Color
): VehiclePart => {
  const mesh = new InstancedMesh(geometry, createStandardMaterial(roughness, metalness), count);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.instanceMatrix.setUsage(35048);

  const localMatrix = new Matrix4().makeTranslation(localOffset.x, localOffset.y, localOffset.z);

  return {
    mesh,
    localMatrix,
    colorResolver
  };
};

const darken = (hex: number, amount: number): Color => new Color(hex).multiplyScalar(amount);

const createKindParts = (kind: VehicleKind, count: number): VehiclePart[] => {
  if (kind === 'car') {
    return [
      createPart(
        new BoxGeometry(4.8, 0.72, 1.9),
        count,
        new Vector3(0, 0.58, 0),
        0.88,
        0.1,
        (bodyHex) => new Color(bodyHex)
      ),
      createPart(
        new BoxGeometry(2.35, 0.64, 1.54),
        count,
        new Vector3(-0.15, 1.16, 0),
        0.9,
        0.06,
        (bodyHex) => darken(bodyHex, 0.82)
      ),
      createPart(
        new BoxGeometry(2.0, 0.42, 1.4),
        count,
        new Vector3(-0.1, 1.15, 0),
        0.18,
        0,
        () => GLASS_COLOR.clone()
      ),
      createPart(
        new BoxGeometry(4.05, 0.42, 1.72),
        count,
        new Vector3(0, 0.21, 0),
        1,
        0,
        () => WHEEL_COLOR.clone()
      )
    ];
  }

  if (kind === 'truck') {
    return [
      createPart(
        new BoxGeometry(2.65, 1.55, 2.25),
        count,
        new Vector3(3.45, 0.78, 0),
        0.9,
        0.06,
        (bodyHex) => darken(bodyHex, 0.94)
      ),
      createPart(
        new BoxGeometry(6.4, 1.82, 2.5),
        count,
        new Vector3(-0.9, 0.95, 0),
        0.94,
        0.04,
        (bodyHex) => new Color(bodyHex)
      ),
      createPart(
        new BoxGeometry(1.2, 0.55, 2.05),
        count,
        new Vector3(3.7, 1.05, 0),
        0.15,
        0,
        () => GLASS_COLOR.clone()
      ),
      createPart(
        new BoxGeometry(8.8, 0.5, 2.3),
        count,
        new Vector3(0, 0.25, 0),
        1,
        0,
        () => WHEEL_COLOR.clone()
      )
    ];
  }

  return [
    createPart(
      new BoxGeometry(11.2, 1.95, 2.8),
      count,
      new Vector3(0, 0.98, 0),
      0.92,
      0.04,
      (bodyHex) => new Color(bodyHex)
    ),
    createPart(
      new BoxGeometry(10.3, 0.34, 2.46),
      count,
      new Vector3(0, 2.1, 0),
      0.92,
      0.02,
      (bodyHex) => darken(bodyHex, 0.9)
    ),
    createPart(
      new BoxGeometry(9.7, 0.74, 2.62),
      count,
      new Vector3(0, 1.38, 0),
      0.12,
      0,
      () => GLASS_COLOR.clone()
    ),
    createPart(
      new BoxGeometry(9.6, 0.5, 2.34),
      count,
      new Vector3(0, 0.25, 0),
      1,
      0,
      () => WHEEL_COLOR.clone()
    )
  ];
};

export const createVehicleCatalog = (
  counts: Record<VehicleKind, number>
): VehicleCatalog => {
  const group = new Group();
  group.name = 'traffic';
  const kindParts = {
    car: createKindParts('car', counts.car),
    truck: createKindParts('truck', counts.truck),
    bus: createKindParts('bus', counts.bus)
  } as const;

  (Object.values(kindParts) as VehiclePart[][]).flat().forEach((part) => group.add(part.mesh));

  const baseMatrix = new Matrix4();
  const worldMatrix = new Matrix4();
  const tempObject = new Object3D();

  return {
    object3d: group,
    sync: (state, config) => {
      state.forEach((vehicle) => {
        const bodyHex = config.palettes[vehicle.kind][vehicle.paletteIndex];
        tempObject.position.set(vehicle.progress, config.laneY, config.laneCenters[vehicle.laneIndex]);
        tempObject.rotation.set(0, vehicle.direction === 1 ? 0 : Math.PI, 0);
        tempObject.updateMatrix();
        baseMatrix.copy(tempObject.matrix);

        kindParts[vehicle.kind].forEach((part) => {
          worldMatrix.multiplyMatrices(baseMatrix, part.localMatrix);
          part.mesh.setMatrixAt(vehicle.instanceIndex, worldMatrix);
          part.mesh.setColorAt(vehicle.instanceIndex, part.colorResolver(bodyHex));
          part.mesh.instanceMatrix.needsUpdate = true;
          if (part.mesh.instanceColor) {
            part.mesh.instanceColor.needsUpdate = true;
          }
        });
      });
    }
  };
};
