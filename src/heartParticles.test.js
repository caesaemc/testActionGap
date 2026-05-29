import { describe, expect, it } from 'vitest';
import { createHeartParticleAttributes } from './heartParticles.js';

describe('createHeartParticleAttributes', () => {
  it('creates a large heart body and a half-orbit particle field', () => {
    const attributes = createHeartParticleAttributes({
      heartCount: 120,
      orbitCount: 80,
      random: () => 0.5,
    });

    expect(attributes.positions).toHaveLength(600);
    expect(attributes.roles.filter((role) => role === 0)).toHaveLength(120);
    expect(attributes.roles.filter((role) => role === 1)).toHaveLength(80);

    const orbitAngles = attributes.orbitAngles.filter((angle) => Number.isFinite(angle));
    expect(Math.min(...orbitAngles)).toBeGreaterThanOrEqual(-Math.PI / 2);
    expect(Math.max(...orbitAngles)).toBeLessThanOrEqual(Math.PI / 2);
  });

  it('uses multiple color families for the love-heart particles', () => {
    let step = 0;
    const attributes = createHeartParticleAttributes({
      heartCount: 60,
      orbitCount: 40,
      random: () => ((step += 1) % 10) / 10,
    });

    const uniqueColorSamples = new Set();
    for (let index = 0; index < attributes.colors.length; index += 3) {
      uniqueColorSamples.add(
        `${attributes.colors[index].toFixed(2)}-${attributes.colors[index + 1].toFixed(2)}-${attributes.colors[
          index + 2
        ].toFixed(2)}`,
      );
    }

    expect(uniqueColorSamples.size).toBeGreaterThan(3);
  });
});
