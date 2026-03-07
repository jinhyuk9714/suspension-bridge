export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;

export const smoothstep = (edge0: number, edge1: number, value: number): number => {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }

  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);

  return t * t * (3 - 2 * t);
};

export const damp = (current: number, target: number, lambda: number, delta: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * delta));

export const saturate = (value: number): number => clamp(value, 0, 1);
