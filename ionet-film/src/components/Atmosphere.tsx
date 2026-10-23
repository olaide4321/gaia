import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {DrawCanvas} from './Canvas';
import {C} from '../theme';

/** Animated film grain, drawn at quarter resolution and scaled up. */
export const FilmGrain: React.FC<{opacity?: number}> = ({opacity = 0.09}) => {
  const frame = useCurrentFrame();
  const w = 480;
  const h = 270;
  return (
    <DrawCanvas
      width={w}
      height={h}
      deps={[frame]}
      style={{opacity, mixBlendMode: 'overlay'}}
      draw={(ctx) => {
        const img = ctx.createImageData(w, h);
        let s = (frame * 9301 + 49297) % 233280;
        for (let i = 0; i < img.data.length; i += 4) {
          s = (s * 9301 + 49297) % 233280;
          const v = (s / 233280) * 255;
          img.data[i] = v;
          img.data[i + 1] = v * 0.96;
          img.data[i + 2] = v * 0.88;
          img.data[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }}
    />
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.85}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** Warm grade: lifts blacks toward charcoal-brown, adds a subtle amber bloom. */
export const ColorGrade: React.FC = () => (
  <>
    <AbsoluteFill style={{pointerEvents: 'none', background: 'rgba(40,24,8,0.10)', mixBlendMode: 'soft-light'}} />
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(232,138,42,0.06), rgba(0,0,0,0) 60%)',
        mixBlendMode: 'screen',
      }}
    />
  </>
);

/** Slowly drifting volumetric haze bands. */
export const Haze: React.FC<{color?: string; opacity?: number; seed?: number}> = ({
  color = C.amber,
  opacity = 0.18,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const bands = useMemo(
    () =>
      new Array(5).fill(0).map((_, i) => ({
        y: 20 + random(`hz-y-${seed}-${i}`) * 70,
        w: 60 + random(`hz-w-${seed}-${i}`) * 60,
        speed: 0.02 + random(`hz-s-${seed}-${i}`) * 0.05,
        phase: random(`hz-p-${seed}-${i}`) * 100,
      })),
    [seed],
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'screen'}}>
      {bands.map((b, i) => {
        const x = ((b.phase + frame * b.speed) % 160) - 30;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${b.y}%`,
              width: `${b.w}%`,
              height: '40%',
              transform: 'translate(-50%,-50%)',
              background: `radial-gradient(ellipse at center, ${color}55 0%, ${color}00 70%)`,
              filter: 'blur(40px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Floating dust motes catching light. */
export const DustMotes: React.FC<{count?: number; seed?: number; color?: string; opacity?: number}> = ({
  count = 70,
  seed = 3,
  color = C.goldBright,
  opacity = 0.8,
}) => {
  const frame = useCurrentFrame();
  const motes = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => ({
        x: random(`dm-x-${seed}-${i}`) * 1920,
        y: random(`dm-y-${seed}-${i}`) * 1080,
        r: 0.8 + random(`dm-r-${seed}-${i}`) * 2.6,
        vx: (random(`dm-vx-${seed}-${i}`) - 0.5) * 0.5,
        vy: -0.1 - random(`dm-vy-${seed}-${i}`) * 0.35,
        ph: random(`dm-p-${seed}-${i}`) * Math.PI * 2,
        blur: random(`dm-b-${seed}-${i}`) > 0.75,
      })),
    [count, seed],
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      <svg width={1920} height={1080}>
        {motes.map((m, i) => {
          const x = (((m.x + frame * m.vx + Math.sin(frame / 40 + m.ph) * 12) % 1920) + 1920) % 1920;
          const y = (((m.y + frame * m.vy) % 1080) + 1080) % 1080;
          const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / 18 + m.ph));
          return (
            <circle key={i} cx={x} cy={y} r={m.blur ? m.r * 3 : m.r} fill={color} opacity={(m.blur ? 0.18 : 0.6) * tw} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Out-of-focus city lights. */
export const Bokeh: React.FC<{
  count?: number;
  seed?: number;
  opacity?: number;
  yRange?: [number, number];
  drift?: number;
}> = ({count = 40, seed = 7, opacity = 0.7, yRange = [0.3, 0.9], drift = 0.15}) => {
  const frame = useCurrentFrame();
  const dots = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const pal = [C.amber, C.gold, C.goldBright, C.ivory, C.amberDeep];
        return {
          x: random(`bk-x-${seed}-${i}`) * 2100 - 90,
          y: (yRange[0] + random(`bk-y-${seed}-${i}`) * (yRange[1] - yRange[0])) * 1080,
          r: 14 + random(`bk-r-${seed}-${i}`) ** 2 * 70,
          c: pal[Math.floor(random(`bk-c-${seed}-${i}`) * pal.length)],
          ph: random(`bk-p-${seed}-${i}`) * 6.28,
          a: 0.15 + random(`bk-a-${seed}-${i}`) * 0.4,
        };
      }),
    [count, seed, yRange],
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'screen'}}>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: d.x + frame * drift,
            top: d.y,
            width: d.r * 2,
            height: d.r * 2,
            marginLeft: -d.r,
            marginTop: -d.r,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${d.c} 0%, ${d.c}cc 45%, ${d.c}33 68%, transparent 72%)`,
            opacity: d.a * (0.75 + 0.25 * Math.sin(frame / 25 + d.ph)),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
