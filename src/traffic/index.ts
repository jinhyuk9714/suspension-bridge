import { Group } from 'three';

import { BRIDGE_CONFIG, type BridgeConfig } from '../bridge/config';
import type { WorldModule } from '../types/world';
import type { TrafficConfig } from './config';
import { createTrafficConfig, createTrafficState, stepTrafficState } from './trafficController';
import { createVehicleCatalog } from './vehicleCatalog';

export const createTraffic = (
  bridgeConfig: BridgeConfig = BRIDGE_CONFIG,
  overrides: Partial<TrafficConfig> = {}
): WorldModule<Group> => {
  const config = createTrafficConfig(bridgeConfig, overrides);
  let state = createTrafficState(config);
  const counts = state.reduce(
    (accumulator, vehicle) => {
      accumulator[vehicle.kind] += 1;
      return accumulator;
    },
    { car: 0, truck: 0, bus: 0 }
  );
  const catalog = createVehicleCatalog(counts);
  const group = new Group();

  group.name = 'traffic';
  group.add(catalog.object3d);
  catalog.sync(state, config);

  return {
    object3d: group,
    update: (frame) => {
      state = stepTrafficState(state, config, frame.delta);
      catalog.sync(state, config);
    }
  };
};
