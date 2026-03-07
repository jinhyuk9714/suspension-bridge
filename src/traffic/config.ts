import type { BridgeConfig } from '../bridge/config';

export type VehicleKind = 'car' | 'truck' | 'bus';

export interface SpeedRange {
  min: number;
  max: number;
}

export interface TrafficVehicleState {
  instanceIndex: number;
  kind: VehicleKind;
  laneIndex: number;
  direction: 1 | -1;
  length: number;
  paletteIndex: number;
  progress: number;
  speed: number;
  targetSpeed: number;
  cruiseSpeed: number;
}

export interface TrafficConfig {
  seed: number;
  laneCenters: [number, number];
  laneDirections: [1, -1];
  laneY: number;
  travelMinX: number;
  travelMaxX: number;
  vehiclesPerLane: number;
  laneComposition: Record<VehicleKind, number>;
  speedRanges: Record<VehicleKind, SpeedRange>;
  safeGaps: Record<VehicleKind, number>;
  vehicleLengths: Record<VehicleKind, number>;
  palettes: Record<VehicleKind, number[]>;
}

export const TRAFFIC_CONFIG = {
  seed: 17,
  laneCenters: [-2.4, 2.4] as [number, number],
  laneDirections: [1, -1] as [1, -1],
  vehiclesPerLane: 10,
  laneComposition: {
    car: 7,
    truck: 2,
    bus: 1
  } satisfies Record<VehicleKind, number>,
  speedRanges: {
    car: { min: 16, max: 19 },
    truck: { min: 11, max: 13 },
    bus: { min: 12, max: 14 }
  } satisfies Record<VehicleKind, SpeedRange>,
  safeGaps: {
    car: 14,
    truck: 22,
    bus: 24
  } satisfies Record<VehicleKind, number>,
  vehicleLengths: {
    car: 4.8,
    truck: 9.8,
    bus: 11.2
  } satisfies Record<VehicleKind, number>,
  palettes: {
    car: [0xf1f0eb, 0x7a8087, 0x3b4551, 0x5a6774, 0x232a34],
    truck: [0x8b9096, 0x7a4f40, 0x8c744f, 0x5e6d7d],
    bus: [0xddddd5, 0x5a697a, 0x7f6b54]
  } satisfies Record<VehicleKind, number[]>
} as const;

export const createTrafficConfig = (
  bridgeConfig: BridgeConfig,
  overrides: Partial<TrafficConfig> = {}
): TrafficConfig => ({
  seed: overrides.seed ?? TRAFFIC_CONFIG.seed,
  laneCenters: overrides.laneCenters ?? TRAFFIC_CONFIG.laneCenters,
  laneDirections: overrides.laneDirections ?? TRAFFIC_CONFIG.laneDirections,
  laneY: overrides.laneY ?? bridgeConfig.deckHeight + 0.06,
  travelMinX: overrides.travelMinX ?? -(bridgeConfig.totalSpan * 0.5 - 18),
  travelMaxX: overrides.travelMaxX ?? bridgeConfig.totalSpan * 0.5 - 18,
  vehiclesPerLane: overrides.vehiclesPerLane ?? TRAFFIC_CONFIG.vehiclesPerLane,
  laneComposition: overrides.laneComposition ?? { ...TRAFFIC_CONFIG.laneComposition },
  speedRanges: overrides.speedRanges ?? {
    car: { ...TRAFFIC_CONFIG.speedRanges.car },
    truck: { ...TRAFFIC_CONFIG.speedRanges.truck },
    bus: { ...TRAFFIC_CONFIG.speedRanges.bus }
  },
  safeGaps: overrides.safeGaps ?? { ...TRAFFIC_CONFIG.safeGaps },
  vehicleLengths: overrides.vehicleLengths ?? { ...TRAFFIC_CONFIG.vehicleLengths },
  palettes: overrides.palettes ?? {
    car: [...TRAFFIC_CONFIG.palettes.car],
    truck: [...TRAFFIC_CONFIG.palettes.truck],
    bus: [...TRAFFIC_CONFIG.palettes.bus]
  }
});
