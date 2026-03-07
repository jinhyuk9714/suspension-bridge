import { BRIDGE_CONFIG } from '../bridge/config';
import {
  TRAFFIC_CONFIG,
  createTrafficConfig,
  createTrafficState,
  getLaneVehicleComposition,
  getVehicleLength,
  stepTrafficState
} from './trafficController';
import type { TrafficVehicleState } from './config';

const createVehicle = (overrides: Partial<TrafficVehicleState>): TrafficVehicleState => {
  return {
    instanceIndex: overrides.instanceIndex ?? 0,
    kind: overrides.kind ?? 'car',
    laneIndex: overrides.laneIndex ?? 0,
    direction: overrides.direction ?? 1,
    length: overrides.length ?? getVehicleLength('car'),
    paletteIndex: overrides.paletteIndex ?? 0,
    progress: overrides.progress ?? 0,
    speed: overrides.speed ?? 18,
    targetSpeed: overrides.targetSpeed ?? 18,
    cruiseSpeed: overrides.cruiseSpeed ?? 18
  };
};

describe('traffic controller', () => {
  it('keeps lane centers symmetric and inside the road surface bounds', () => {
    const config = createTrafficConfig(BRIDGE_CONFIG);
    const roadHalfWidth = (BRIDGE_CONFIG.deckWidth - 1.2) * 0.5;

    expect(config.laneCenters).toEqual([-2.4, 2.4]);
    expect(config.laneCenters[0]).toBeCloseTo(-config.laneCenters[1], 6);
    expect(Math.abs(config.laneCenters[0])).toBeLessThan(roadHalfWidth);
    expect(Math.abs(config.laneCenters[1])).toBeLessThan(roadHalfWidth);
    expect(config.travelMinX).toBeCloseTo(-(BRIDGE_CONFIG.totalSpan * 0.5 - 18), 6);
    expect(config.travelMaxX).toBeCloseTo(BRIDGE_CONFIG.totalSpan * 0.5 - 18, 6);
  });

  it('uses the approved traffic density and composition for each lane', () => {
    const config = createTrafficConfig(BRIDGE_CONFIG);
    const state = createTrafficState(config);

    expect(state).toHaveLength(20);
    expect(config.vehiclesPerLane).toBe(10);
    expect(getLaneVehicleComposition(state, 0)).toEqual({
      bus: 1,
      car: 7,
      truck: 2
    });
    expect(getLaneVehicleComposition(state, 1)).toEqual({
      bus: 1,
      car: 7,
      truck: 2
    });
  });

  it('creates deterministic initial placements from the fixed seed', () => {
    const config = createTrafficConfig(BRIDGE_CONFIG);
    const first = createTrafficState(config);
    const second = createTrafficState(config);

    expect(
      first.map((vehicle) => ({
        kind: vehicle.kind,
        laneIndex: vehicle.laneIndex,
        paletteIndex: vehicle.paletteIndex,
        progress: Number(vehicle.progress.toFixed(6)),
        speed: Number(vehicle.speed.toFixed(6))
      }))
    ).toEqual(
      second.map((vehicle) => ({
        kind: vehicle.kind,
        laneIndex: vehicle.laneIndex,
        paletteIndex: vehicle.paletteIndex,
        progress: Number(vehicle.progress.toFixed(6)),
        speed: Number(vehicle.speed.toFixed(6))
      }))
    );
    expect(config.seed).toBe(17);
    expect(TRAFFIC_CONFIG.seed).toBe(17);
  });

  it('slows followers when they drift inside the configured minimum spacing', () => {
    const config = createTrafficConfig(BRIDGE_CONFIG);
    const leader = createVehicle({
      progress: 40,
      kind: 'truck',
      length: getVehicleLength('truck'),
      speed: 12,
      targetSpeed: 12
    });
    const follower = createVehicle({
      progress: 24,
      speed: 18.5,
      targetSpeed: 18.5
    });

    const [nextFollower] = stepTrafficState([follower, leader], config, 0.2);

    expect(nextFollower.targetSpeed).toBeLessThan(18.5);
    expect(nextFollower.speed).toBeLessThan(18.5);
  });

  it('wraps vehicles back to their lane bounds while keeping lane and direction intact', () => {
    const config = createTrafficConfig(BRIDGE_CONFIG);
    const state = createTrafficState(config);
    const laneZeroVehicle = state.find((vehicle) => vehicle.laneIndex === 0)!;
    const laneOneVehicle = state.find((vehicle) => vehicle.laneIndex === 1)!;

    const [wrappedForward] = stepTrafficState(
      [
        {
          ...laneZeroVehicle,
          progress: config.travelMaxX + 5,
          speed: 18,
          targetSpeed: 18
        }
      ],
      config,
      0.016
    );
    const [wrappedBackward] = stepTrafficState(
      [
        {
          ...laneOneVehicle,
          progress: config.travelMinX - 5,
          speed: 12,
          targetSpeed: 12
        }
      ],
      config,
      0.016
    );

    expect(wrappedForward.laneIndex).toBe(0);
    expect(wrappedForward.direction).toBe(1);
    expect(wrappedForward.progress).toBeGreaterThanOrEqual(config.travelMinX);
    expect(wrappedForward.progress).toBeLessThanOrEqual(config.travelMaxX);

    expect(wrappedBackward.laneIndex).toBe(1);
    expect(wrappedBackward.direction).toBe(-1);
    expect(wrappedBackward.progress).toBeGreaterThanOrEqual(config.travelMinX);
    expect(wrappedBackward.progress).toBeLessThanOrEqual(config.travelMaxX);
  });
});
