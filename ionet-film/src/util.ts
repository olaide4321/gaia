import {Easing, interpolate, random} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Clamped interpolate with optional easing. */
export const lerp = (
  frame: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = Easing.inOut(Easing.cubic),
) => interpolate(frame, input, output, {...clamp, easing});

/** Opacity envelope: fade in over `fin` frames from `start`, fade out over `fout` frames ending at `end`. */
export const envelope = (frame: number, start: number, end: number, fin = 15, fout = 15) =>
  Math.min(
    interpolate(frame, [start, start + fin], [0, 1], clamp),
    interpolate(frame, [end - fout, end], [1, 0], clamp),
  );

/** Deterministic random in [a, b). */
export const rand = (seed: string | number, a = 0, b = 1) => a + random(seed) * (b - a);

export const smoothNoise = (t: number, seed: number) =>
  Math.sin(t * 1.3 + seed) * 0.5 + Math.sin(t * 2.7 + seed * 1.7) * 0.3 + Math.sin(t * 5.1 + seed * 0.3) * 0.2;
