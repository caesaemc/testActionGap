import { describe, expect, it } from 'vitest';
import {
  createIdleGestureState,
  createSimulatedResults,
  mapHandResultsToGlobeState,
} from './gestureMath.js';

describe('mapHandResultsToGlobeState', () => {
  it('expands the particle globe for an open palm', () => {
    const state = mapHandResultsToGlobeState(createSimulatedResults('open'), createIdleGestureState());

    expect(state.mode).toBe('expand');
    expect(state.expansion).toBeGreaterThan(0.25);
    expect(state.hands).toBe(1);
  });

  it('contracts the particle globe for a closed fist', () => {
    const previous = { ...createIdleGestureState(), expansion: 0.8 };
    const state = mapHandResultsToGlobeState(createSimulatedResults('fist'), previous);

    expect(state.mode).toBe('contract');
    expect(state.expansion).toBeLessThan(previous.expansion);
  });

  it('uses two hands to scale the globe', () => {
    const state = mapHandResultsToGlobeState(createSimulatedResults('zoom'), createIdleGestureState());

    expect(state.mode).toBe('zoom');
    expect(state.scale).toBeGreaterThan(1);
  });
});
