import type { BridgeConfig } from '../bridge/config';

import { createTrafficConfig as buildTrafficConfig, TRAFFIC_CONFIG } from './config';
import type { TrafficConfig, TrafficVehicleState, VehicleKind } from './config';
import { getForwardGap, getLaneVehicles, wrapTrafficProgress } from './laneSystem';

export { TRAFFIC_CONFIG } from './config';

const createRng = (seed: number): (() => number) => {
  let current = seed >>> 0;

  return () => {
    current += 0x6d2b79f5;
    let result = Math.imul(current ^ (current >>> 15), 1 | current);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T>(values: T[], rng: () => number): T[] => {
  const copy = [...values];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }

  return copy;
};

export const getVehicleLength = (kind: VehicleKind): number => TRAFFIC_CONFIG.vehicleLengths[kind];

export const createTrafficConfig = (
  bridgeConfig: BridgeConfig,
  overrides: Partial<TrafficConfig> = {}
): TrafficConfig => buildTrafficConfig(bridgeConfig, overrides);

const createLaneKinds = (config: TrafficConfig, rng: () => number): VehicleKind[] =>
  shuffle(
    [
      ...Array.from({ length: config.laneComposition.car }, () => 'car' as const),
      ...Array.from({ length: config.laneComposition.truck }, () => 'truck' as const),
      ...Array.from({ length: config.laneComposition.bus }, () => 'bus' as const)
    ],
    rng
  );

export const createTrafficState = (config: TrafficConfig): TrafficVehicleState[] => {
  const rng = createRng(config.seed);
  const state: TrafficVehicleState[] = [];
  const perKindIndex: Record<VehicleKind, number> = {
    car: 0,
    truck: 0,
    bus: 0
  };
  const travelSpan = config.travelMaxX - config.travelMinX;
  const baseSpacing = travelSpan / config.vehiclesPerLane;

  for (const laneIndex of [0, 1] as const) {
    const direction = config.laneDirections[laneIndex];
    const kinds = createLaneKinds(config, rng);

    kinds.forEach((kind, orderIndex) => {
      const range = config.speedRanges[kind];
      const jitter = (rng() - 0.5) * 10;
      const baseProgress =
        laneIndex === 0
          ? config.travelMinX + baseSpacing * orderIndex + baseSpacing * 0.5 + jitter
          : config.travelMaxX - baseSpacing * orderIndex - baseSpacing * 0.5 + jitter;
      const cruiseSpeed = range.min + (range.max - range.min) * rng();

      state.push({
        instanceIndex: perKindIndex[kind]++,
        kind,
        laneIndex,
        direction,
        length: config.vehicleLengths[kind],
        paletteIndex: Math.floor(rng() * config.palettes[kind].length),
        progress: Math.max(config.travelMinX, Math.min(config.travelMaxX, baseProgress)),
        speed: cruiseSpeed,
        targetSpeed: cruiseSpeed,
        cruiseSpeed
      });
    });
  }

  return state;
};

export const getLaneVehicleComposition = (
  state: TrafficVehicleState[],
  laneIndex: number
): Record<VehicleKind, number> =>
  getLaneVehicles(state, laneIndex).reduce<Record<VehicleKind, number>>(
    (composition, vehicle) => {
      composition[vehicle.kind] += 1;
      return composition;
    },
    { car: 0, truck: 0, bus: 0 }
  );

const getVehicleLeader = (
  vehicle: TrafficVehicleState,
  laneVehicles: TrafficVehicleState[]
): TrafficVehicleState => {
  const sorted = [...laneVehicles].sort((left, right) =>
    vehicle.direction === 1 ? left.progress - right.progress : right.progress - left.progress
  );
  const currentIndex = sorted.findIndex(
    (candidate) => candidate.instanceIndex === vehicle.instanceIndex && candidate.kind === vehicle.kind
  );

  return sorted[(currentIndex + 1) % sorted.length];
};

const computeTargetSpeed = (
  vehicle: TrafficVehicleState,
  laneVehicles: TrafficVehicleState[],
  config: TrafficConfig
): number => {
  if (laneVehicles.length <= 1) {
    return vehicle.cruiseSpeed;
  }

  const leader = getVehicleLeader(vehicle, laneVehicles);
  const gap = getForwardGap(vehicle, leader, config);
  const safeGap = config.safeGaps[vehicle.kind];
  const cautionGap = safeGap * 1.75;

  if (gap < safeGap) {
    return Math.max(config.speedRanges[vehicle.kind].min * 0.55, leader.speed * 0.7);
  }

  if (gap < cautionGap) {
    const blend = (gap - safeGap) / (cautionGap - safeGap);
    return leader.speed + (vehicle.cruiseSpeed - leader.speed) * Math.max(0, Math.min(1, blend));
  }

  return vehicle.cruiseSpeed;
};

export const stepTrafficState = (
  state: TrafficVehicleState[],
  config: TrafficConfig,
  delta: number
): TrafficVehicleState[] => {
  const laneZero = getLaneVehicles(state, 0);
  const laneOne = getLaneVehicles(state, 1);
  const lanes = [laneZero, laneOne];

  return state.map((vehicle) => {
    const laneVehicles = lanes[vehicle.laneIndex];
    const targetSpeed = computeTargetSpeed(vehicle, laneVehicles, config);
    const damping = 1 - Math.exp(-delta * 4.5);
    const speed = vehicle.speed + (targetSpeed - vehicle.speed) * damping;
    const progress = wrapTrafficProgress(vehicle.progress + speed * vehicle.direction * delta, config);

    return {
      ...vehicle,
      speed,
      targetSpeed,
      progress
    };
  });
};
