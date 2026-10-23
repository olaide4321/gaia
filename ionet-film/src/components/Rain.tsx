import React from 'react';
import {useCurrentFrame} from 'remotion';
import {DrawCanvas} from './Canvas';

/** Falling rain streaks. Deterministic per frame. */
export const RainStreaks: React.FC<{
  count?: number;
  seed?: number;
  opacity?: number;
  speed?: number;
  wind?: number;
  length?: number;
  color?: string;
}> = ({count = 700, seed = 1, opacity = 0.5, speed = 38, wind = -0.18, length = 46, color = '244,234,215'}) => {
  const frame = useCurrentFrame();
  return (
    <DrawCanvas
      width={1920}
      height={1080}
      deps={[frame, count, opacity, speed]}
      style={{opacity}}
      draw={(ctx, w, h) => {
        let s = seed * 7919;
        const r = () => {
          s = (s * 16807) % 2147483647;
          return s / 2147483647;
        };
        ctx.lineCap = 'round';
        for (let i = 0; i < count; i++) {
          const depth = 0.3 + r() * 0.7;
          const x0 = r() * (w + 400) - 100;
          const y0 = r() * (h + 200);
          const v = speed * depth;
          const total = h + 300;
          const y = ((y0 + frame * v) % total) - 150;
          const x = x0 + (y + 150) * wind;
          const len = length * depth;
          ctx.strokeStyle = `rgba(${color},${0.08 + depth * 0.32})`;
          ctx.lineWidth = 0.6 + depth * 1.4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + len * wind, y + len);
          ctx.stroke();
        }
      }}
    />
  );
};

/** Water droplets and trickles on window glass, lit by warm city light. */
export const GlassDroplets: React.FC<{count?: number; seed?: number; opacity?: number}> = ({
  count = 260,
  seed = 11,
  opacity = 0.9,
}) => {
  const frame = useCurrentFrame();
  return (
    <DrawCanvas
      width={1920}
      height={1080}
      deps={[frame, count]}
      style={{opacity}}
      draw={(ctx, w, h) => {
        let s = seed * 104729;
        const r = () => {
          s = (s * 16807) % 2147483647;
          return s / 2147483647;
        };
        // Static beads
        for (let i = 0; i < count; i++) {
          const x = r() * w;
          const y = r() * h;
          const rad = 1.5 + r() ** 3 * 9;
          const g = ctx.createRadialGradient(x - rad * 0.3, y - rad * 0.4, 0, x, y, rad);
          g.addColorStop(0, 'rgba(255,236,200,0.55)');
          g.addColorStop(0.5, 'rgba(232,160,80,0.10)');
          g.addColorStop(1, 'rgba(10,8,6,0.35)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(x, y, rad * 0.9, rad, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // Trickling drops with trails
        const trickles = 26;
        for (let i = 0; i < trickles; i++) {
          const x = r() * w;
          const start = r() * 400;
          const v = 2 + r() * 5;
          const cycle = h + 300;
          const y = ((start + frame * v) % cycle) - 100;
          const rad = 3 + r() * 5;
          const wob = Math.sin((y + i * 40) / 60) * 6;
          const grad = ctx.createLinearGradient(x, y - 220, x, y);
          grad.addColorStop(0, 'rgba(255,220,170,0)');
          grad.addColorStop(1, 'rgba(255,220,170,0.22)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = rad * 0.7;
          ctx.beginPath();
          ctx.moveTo(x, y - 220);
          ctx.quadraticCurveTo(x + wob, y - 110, x + wob * 0.5, y);
          ctx.stroke();
          const g = ctx.createRadialGradient(x + wob * 0.5 - rad * 0.3, y - rad * 0.3, 0, x + wob * 0.5, y, rad * 1.3);
          g.addColorStop(0, 'rgba(255,240,210,0.85)');
          g.addColorStop(0.6, 'rgba(232,150,60,0.2)');
          g.addColorStop(1, 'rgba(0,0,0,0.3)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x + wob * 0.5, y, rad * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }}
    />
  );
};
