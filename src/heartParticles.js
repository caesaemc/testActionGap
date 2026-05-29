const DEFAULT_HEART_COUNT = 7200;
const DEFAULT_ORBIT_COUNT = 4200;

const PALETTE = [
  [1, 0.24, 0.42],
  [1, 0.48, 0.68],
  [1, 0.74, 0.34],
  [0.78, 0.32, 1],
  [0.35, 0.78, 1],
];

function heartPoint(t) {
  const x = 16 * Math.sin(t) ** 3;
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);

  return { x: x / 18, y: (y - 1.8) / 18 };
}

function writeColor(colors, offset, paletteIndex, random) {
  const base = PALETTE[paletteIndex % PALETTE.length];
  const shimmer = 0.82 + random() * 0.24;

  colors[offset] = Math.min(1, base[0] * shimmer);
  colors[offset + 1] = Math.min(1, base[1] * shimmer);
  colors[offset + 2] = Math.min(1, base[2] * shimmer);
}

export function createHeartParticleAttributes({
  heartCount = DEFAULT_HEART_COUNT,
  orbitCount = DEFAULT_ORBIT_COUNT,
  random = Math.random,
} = {}) {
  const total = heartCount + orbitCount;
  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const seeds = new Float32Array(total);
  const roles = new Uint8Array(total);
  const orbitAngles = new Float32Array(total).fill(Number.NaN);

  for (let index = 0; index < heartCount; index += 1) {
    const t = random() * Math.PI * 2;
    const fill = Math.sqrt(random());
    const thickness = (random() - 0.5) * 0.16;
    const point = heartPoint(t);
    const offset = index * 3;

    positions[offset] = point.x * fill * 1.15;
    positions[offset + 1] = point.y * fill * 1.18;
    positions[offset + 2] = thickness;
    roles[index] = 0;
    seeds[index] = random() * Math.PI * 2;
    writeColor(colors, offset, index, random);
  }

  for (let orbitIndex = 0; orbitIndex < orbitCount; orbitIndex += 1) {
    const index = heartCount + orbitIndex;
    const offset = index * 3;
    const angle = -Math.PI / 2 + random() * Math.PI;
    const radius = 1.3 + random() * 0.34;
    const ribbon = (random() - 0.5) * 0.14;

    positions[offset] = Math.cos(angle) * radius + ribbon + 0.08;
    positions[offset + 1] = Math.sin(angle) * 1.08 + (random() - 0.5) * 0.18;
    positions[offset + 2] = (random() - 0.5) * 0.34;
    roles[index] = 1;
    orbitAngles[index] = angle;
    seeds[index] = random() * Math.PI * 2;
    writeColor(colors, offset, orbitIndex + 2, random);
  }

  return { colors, orbitAngles, positions, roles, seeds };
}
