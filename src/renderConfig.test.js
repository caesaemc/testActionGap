import { describe, expect, it } from 'vitest';
import {
  TRAIL_FADE_ALPHA,
  TRAIL_FRAME_COUNT,
  createTrailFrameOpacity,
  createTrailOverlayStyle,
} from './renderConfig.js';

describe('trail render config', () => {
  it('uses a finite trail length instead of accumulating light forever', () => {
    expect(TRAIL_FRAME_COUNT).toBeGreaterThanOrEqual(4);
    expect(TRAIL_FRAME_COUNT).toBeLessThanOrEqual(10);
    expect(createTrailFrameOpacity(0)).toBeLessThan(createTrailFrameOpacity(TRAIL_FRAME_COUNT - 1));
    expect(createTrailFrameOpacity(TRAIL_FRAME_COUNT)).toBe(0);
  });

  it('uses a stronger fade for bounded trails', () => {
    expect(TRAIL_FADE_ALPHA).toBeGreaterThan(0.25);
    expect(TRAIL_FADE_ALPHA).toBeLessThan(0.6);
    expect(createTrailOverlayStyle()).toContain(`${TRAIL_FADE_ALPHA}`);
  });
});
