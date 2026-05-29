export const TRAIL_FRAME_COUNT = 6;
export const TRAIL_FADE_ALPHA = 0.38;

export function createTrailOverlayStyle(alpha = TRAIL_FADE_ALPHA) {
  return `rgba(8, 5, 10, ${alpha})`;
}

export function createTrailFrameOpacity(index, frameCount = TRAIL_FRAME_COUNT) {
  if (index < 0 || index >= frameCount) return 0;
  return ((index + 1) / frameCount) ** 1.8;
}
