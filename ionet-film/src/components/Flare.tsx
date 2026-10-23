import React from 'react';
import {C} from '../theme';

/** Anamorphic lens flare: soft core plus a long horizontal streak. */
export const Flare: React.FC<{x: number; y: number; intensity: number; scale?: number}> = ({x, y, intensity, scale = 1}) => {
  if (intensity <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: x - 260 * scale,
          top: y - 260 * scale,
          width: 520 * scale,
          height: 520 * scale,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,246,220,${0.95 * intensity}) 0%, rgba(243,201,107,${0.5 * intensity}) 12%, rgba(232,138,42,${0.18 * intensity}) 35%, rgba(0,0,0,0) 70%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - 1100 * scale,
          top: y - 3 * scale,
          width: 2200 * scale,
          height: 6 * scale,
          background: `linear-gradient(90deg, rgba(0,0,0,0), rgba(243,201,107,${0.7 * intensity}) 45%, rgba(255,246,220,${intensity}) 50%, rgba(243,201,107,${0.7 * intensity}) 55%, rgba(0,0,0,0))`,
          filter: 'blur(2px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - 700 * scale,
          top: y - 40 * scale,
          width: 1400 * scale,
          height: 80 * scale,
          background: `radial-gradient(ellipse, rgba(232,138,42,${0.25 * intensity}) 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      {[0.35, 0.6, 1.3].map((k, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x + (960 - x) * k * 2 - 30 * (i + 1),
            top: y + (540 - y) * k * 2 - 30 * (i + 1),
            width: 60 * (i + 1),
            height: 60 * (i + 1),
            borderRadius: '50%',
            border: `1px solid rgba(243,201,107,${0.25 * intensity})`,
            background: `rgba(232,138,42,${0.05 * intensity})`,
          }}
        />
      ))}
    </div>
  );
};

/** Distant starfield / particles for space shots (warm-toned, never blue). */
export const Starfield: React.FC<{frame: number; count?: number; opacity?: number}> = ({frame, count = 260, opacity = 1}) => {
  const stars: React.ReactNode[] = [];
  let s = 4242;
  const r = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    const x = r() * 1920;
    const y = r() * 1080;
    const size = r() ** 3 * 2.2 + 0.4;
    const tw = 0.5 + 0.5 * Math.sin(frame / (10 + r() * 20) + i);
    stars.push(<circle key={i} cx={(x - frame * 0.15 * size + 1920) % 1920} cy={y} r={size} fill={i % 7 === 0 ? C.goldBright : C.ivory} opacity={(0.15 + 0.5 * tw) * opacity} />);
  }
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {stars}
    </svg>
  );
};
