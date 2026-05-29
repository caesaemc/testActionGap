const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;

const distance2d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function createIdleGestureState() {
  return {
    mode: 'idle',
    label: '等待手势',
    rotationX: 0,
    rotationY: 0,
    scale: 1,
    expansion: 0.2,
    spinBoost: 0.15,
    confidence: 0,
    hands: 0,
  };
}

function opennessForHand(hand) {
  const wrist = hand[0];
  const tips = [8, 12, 16, 20].map((index) => hand[index]);
  const averageTipDistance =
    tips.reduce((sum, tip) => sum + distance2d(tip, wrist), 0) / tips.length;
  return clamp((averageTipDistance - 0.18) / 0.22, 0, 1);
}

function pinchForHand(hand) {
  return distance2d(hand[4], hand[8]);
}

export function mapHandResultsToGlobeState(results, previous = createIdleGestureState()) {
  const hands = results?.landmarks ?? [];
  const gestures = results?.gestures ?? [];

  if (hands.length === 0) {
    return {
      ...previous,
      mode: 'idle',
      label: '等待手势',
      expansion: lerp(previous.expansion, 0.2, 0.08),
      spinBoost: lerp(previous.spinBoost, 0.15, 0.08),
      confidence: 0,
      hands: 0,
    };
  }

  const primary = hands[0];
  const wrist = primary[0];
  const index = primary[8];
  const pinch = pinchForHand(primary);
  const openness = opennessForHand(primary);
  const gestureLabel = gestures[0]?.[0]?.categoryName ?? '';
  const confidence = gestures[0]?.[0]?.score ?? 0.7;
  const isFist = gestureLabel === 'Closed_Fist' || openness < 0.28;
  const isOpen = gestureLabel === 'Open_Palm' || openness > 0.62;

  let label = isOpen ? '张开：粒子扩散' : isFist ? '握拳：粒子聚合' : '拖动：旋转星球';
  let mode = isOpen ? 'expand' : isFist ? 'contract' : 'orbit';
  let scale = previous.scale;
  let rotationX = lerp(previous.rotationX, (0.5 - index.y) * 1.4, 0.18);
  let rotationY = lerp(previous.rotationY, (0.5 - index.x) * 1.8, 0.18);
  let expansion = lerp(previous.expansion, isOpen ? 1 : isFist ? 0 : 0.35, 0.14);
  let spinBoost = lerp(previous.spinBoost, pinch < 0.055 ? 0.85 : 0.28 + openness * 0.35, 0.12);

  if (hands.length > 1) {
    const leftWrist = hands[0][0];
    const rightWrist = hands[1][0];
    const handDistance = distance2d(leftWrist, rightWrist);
    const nextScale = clamp(0.68 + handDistance * 1.9, 0.72, 1.65);
    scale = lerp(previous.scale, nextScale, 0.18);
    mode = 'zoom';
    label = '双手：缩放星球';
    expansion = lerp(expansion, clamp((handDistance - 0.22) * 1.9, 0.15, 0.95), 0.12);
  } else if (pinch < 0.055) {
    mode = 'grab';
    label = '捏合：抓住星球';
    spinBoost = lerp(previous.spinBoost, 0.95, 0.18);
  }

  return {
    mode,
    label,
    rotationX,
    rotationY,
    scale,
    expansion,
    spinBoost,
    confidence,
    hands: hands.length,
    cursor: { x: wrist.x, y: wrist.y },
  };
}

export function createSimulatedResults(kind) {
  const openOffset = kind === 'fist' ? 0.08 : 0.27;
  const base = { x: 0.5, y: 0.5, z: 0 };
  const hand = Array.from({ length: 21 }, (_, index) => ({
    x: base.x + Math.sin(index) * 0.025,
    y: base.y + Math.cos(index) * 0.025,
    z: 0,
  }));

  hand[0] = { x: 0.5, y: 0.6, z: 0 };
  hand[4] = { x: 0.45, y: 0.45, z: 0 };
  hand[8] = { x: kind === 'pinch' ? 0.47 : 0.64, y: 0.38 - openOffset, z: 0 };
  hand[12] = { x: 0.54, y: 0.37 - openOffset, z: 0 };
  hand[16] = { x: 0.47, y: 0.41 - openOffset, z: 0 };
  hand[20] = { x: 0.42, y: 0.46 - openOffset, z: 0 };

  if (kind === 'zoom') {
    const second = hand.map((point) => ({ ...point, x: point.x + 0.32 }));
    return {
      landmarks: [hand.map((point) => ({ ...point, x: point.x - 0.18 })), second],
      gestures: [[{ categoryName: 'Open_Palm', score: 0.92 }], [{ categoryName: 'Open_Palm', score: 0.9 }]],
    };
  }

  return {
    landmarks: [hand],
    gestures: [[{ categoryName: kind === 'fist' ? 'Closed_Fist' : 'Open_Palm', score: 0.9 }]],
  };
}
