import type { TrafficConfig, TrafficVehicleState } from './config';

export const getTravelSpan = (config: TrafficConfig): number => config.travelMaxX - config.travelMinX;

export const wrapTrafficProgress = (progress: number, config: TrafficConfig): number => {
  const span = getTravelSpan(config);

  if (progress > config.travelMaxX) {
    return config.travelMinX + ((progress - config.travelMinX) % span);
  }

  if (progress < config.travelMinX) {
    const wrapped = config.travelMaxX - ((config.travelMaxX - progress) % span);
    return wrapped === config.travelMaxX ? config.travelMinX : wrapped;
  }

  return progress;
};

export const getLaneVehicles = (
  state: TrafficVehicleState[],
  laneIndex: number
): TrafficVehicleState[] => state.filter((vehicle) => vehicle.laneIndex === laneIndex);

export const getSortedLaneVehicles = (
  state: TrafficVehicleState[],
  laneIndex: number
): TrafficVehicleState[] =>
  [...getLaneVehicles(state, laneIndex)].sort((left, right) =>
    state[left.instanceIndex]?.direction === -1 || left.direction === -1
      ? right.progress - left.progress
      : left.progress - right.progress
  );

export const getForwardGap = (
  vehicle: TrafficVehicleState,
  leader: TrafficVehicleState,
  config: TrafficConfig
): number => {
  const span = getTravelSpan(config);
  const centerGap =
    vehicle.direction === 1
      ? leader.progress - vehicle.progress
      : vehicle.progress - leader.progress;
  const wrappedGap = centerGap < 0 ? centerGap + span : centerGap;

  return Math.max(0, wrappedGap - vehicle.length * 0.5 - leader.length * 0.5);
};
