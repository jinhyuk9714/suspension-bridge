import { BRIDGE_CONFIG } from './config';
import { getDeckShoulderProfile, getHangerSocketPoint } from './hangerConnections';

describe('hanger connection points', () => {
  it('defines a continuous shoulder profile from the deck edge to beyond the main cable line', () => {
    const profile = getDeckShoulderProfile(BRIDGE_CONFIG);

    expect(profile.innerZ).toBe(BRIDGE_CONFIG.deckWidth * 0.5);
    expect(profile.outerZ).toBeGreaterThan(BRIDGE_CONFIG.mainCableOffset);
    expect(profile.width).toBeCloseTo(3.6, 6);
    expect(profile.railZ).toBeGreaterThan(BRIDGE_CONFIG.mainCableOffset);
    expect(profile.railZ).toBeLessThan(profile.outerZ);
  });

  it('keeps hanger sockets on the main cable line with a fixed deck attachment height', () => {
    const socket = getHangerSocketPoint(BRIDGE_CONFIG, 0, 1);

    expect(socket.z).toBeCloseTo(BRIDGE_CONFIG.mainCableOffset, 6);
    expect(socket.y).toBeCloseTo(BRIDGE_CONFIG.deckHeight + 0.34, 6);
  });

  it('keeps the hanger socket inside the widened shoulder span', () => {
    const profile = getDeckShoulderProfile(BRIDGE_CONFIG);
    const socket = getHangerSocketPoint(BRIDGE_CONFIG, 0, 1);

    expect(socket.z).toBeGreaterThanOrEqual(profile.innerZ);
    expect(socket.z).toBeLessThanOrEqual(profile.outerZ);
  });
});
