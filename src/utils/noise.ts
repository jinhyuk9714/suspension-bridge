import { lerp, smoothstep } from './math';

const fract = (value: number): number => value - Math.floor(value);

const hash2D = (x: number, y: number, seed: number): number =>
  fract(Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123);

export const valueNoise2D = (x: number, y: number, seed = 1): number => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const tx = smoothstep(0, 1, x - x0);
  const ty = smoothstep(0, 1, y - y0);

  const a = hash2D(x0, y0, seed);
  const b = hash2D(x1, y0, seed);
  const c = hash2D(x0, y1, seed);
  const d = hash2D(x1, y1, seed);

  return lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
};

export const fbm2D = (
  x: number,
  y: number,
  octaves = 5,
  lacunarity = 2,
  gain = 0.5,
  seed = 1
): number => {
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  let normalizer = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    total += amplitude * valueNoise2D(x * frequency, y * frequency, seed + octave * 17);
    normalizer += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return normalizer === 0 ? 0 : total / normalizer;
};
