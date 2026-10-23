import React from 'react';
import {random} from 'remotion';
import {C, FONT} from '../theme';

/** A brand-less graphics card, drawn in SVG (1200×420 box). Fans idle. */
export const GpuCard: React.FC<{frame: number; fanSpeed?: number; led?: number; light?: number}> = ({
  frame,
  fanSpeed = 0,
  led = 0.25,
  light = 1,
}) => {
  const fan = (cx: number, k: number) => {
    const rot = frame * fanSpeed * 6 + k * 17;
    return (
      <g key={k}>
        <circle cx={cx} cy={210} r={128} fill="#0d0b09" stroke="#2c251c" strokeWidth={6} />
        <circle cx={cx} cy={210} r={118} fill="url(#fanWell)" />
        <g transform={`rotate(${rot} ${cx} 210)`}>
          {new Array(9).fill(0).map((_, b) => (
            <path
              key={b}
              transform={`rotate(${b * 40} ${cx} 210)`}
              d={`M${cx} 210 C${cx + 30} 175 ${cx + 70} 140 ${cx + 40} 98 C${cx + 15} 120 ${cx + 2} 160 ${cx} 210 Z`}
              fill="#1c1813"
              stroke="#3a3127"
              strokeWidth={1.5}
            />
          ))}
        </g>
        <circle cx={cx} cy={210} r={34} fill="#14110d" stroke={C.gold} strokeOpacity={0.35} strokeWidth={2} />
        <circle cx={cx} cy={210} r={128} fill="none" stroke={C.gold} strokeOpacity={0.12 * light} strokeWidth={2} />
      </g>
    );
  };
  return (
    <svg viewBox="0 0 1200 460" width="100%" height="100%">
      <defs>
        <linearGradient id="shroud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c261e" />
          <stop offset="40%" stopColor="#1a1612" />
          <stop offset="100%" stopColor="#0d0b09" />
        </linearGradient>
        <radialGradient id="fanWell">
          <stop offset="0%" stopColor="#0a0807" />
          <stop offset="100%" stopColor="#1a1612" />
        </radialGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.goldBright} stopOpacity={0} />
          <stop offset="50%" stopColor={C.goldBright} stopOpacity={0.18 * light} />
          <stop offset="100%" stopColor={C.goldBright} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* PCB + connector fingers */}
      <rect x={30} y={360} width={1120} height={40} fill="#14110d" />
      {new Array(46).fill(0).map((_, i) => (
        <rect key={i} x={260 + i * 13} y={398} width={8} height={30} fill={C.gold} opacity={0.7} />
      ))}
      {/* heatsink fins */}
      {new Array(70).fill(0).map((_, i) => (
        <rect key={i} x={40 + i * 16} y={40} width={4} height={330} fill="#241f18" />
      ))}
      <rect x={20} y={30} width={1160} height={340} rx={26} fill="url(#shroud)" stroke="#3a3127" strokeWidth={2} />
      <rect x={20} y={30} width={1160} height={340} rx={26} fill="url(#sheen)" />
      {fan(230, 0)}
      {fan(600, 1)}
      {fan(970, 2)}
      {/* idle LED strip */}
      <rect x={60} y={44} width={1080} height={6} rx={3} fill={C.amber} opacity={led} />
      <text x={1150} y={350} textAnchor="end" fill={C.ivoryDim} opacity={0.35} fontSize={18} letterSpacing={6} style={{fontFamily: FONT.sans}}>
        GPU
      </text>
    </svg>
  );
};

/** A single 1U/2U server rack front panel with status LEDs. */
export const ServerRack: React.FC<{frame: number; seed: number; active?: number; width?: number; height?: number}> = ({
  frame,
  seed,
  active = 0.05,
  width = 360,
  height = 900,
}) => {
  const units = 14;
  const uh = (height - 40) / units;
  return (
    <svg width={width} height={height}>
      <rect width={width} height={height} rx={6} fill="#110e0b" stroke="#2c251c" strokeWidth={3} />
      {new Array(units).fill(0).map((_, u) => (
        <g key={u} transform={`translate(14 ${20 + u * uh})`}>
          <rect width={width - 28} height={uh - 8} rx={3} fill="#1a1611" stroke="#2e271e" />
          {new Array(Math.floor((width - 120) / 9)).fill(0).map((__, v) => (
            <rect key={v} x={60 + v * 9} y={8} width={4} height={uh - 24} fill="#0b0908" />
          ))}
          {[0, 1, 2].map((k) => {
            const on = random(`led-${seed}-${u}-${k}`) < active || (k === 0 && random(`pw-${seed}-${u}`) < 0.85);
            const blink = k === 2 && on && Math.floor(frame / (8 + k * 3) + u) % 3 === 0;
            return (
              <circle
                key={k}
                cx={18 + k * 13}
                cy={uh / 2 - 4}
                r={3.2}
                fill={k === 0 ? C.amber : C.goldBright}
                opacity={on ? (blink ? 0.3 : k === 0 ? 0.55 : 0.9) : 0.08}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
};

/** One-point perspective corridor of server racks (data facility). */
export const RackCorridor: React.FC<{frame: number; dolly: number}> = ({frame, dolly}) => {
  const cx = 960;
  const cy = 560;
  const f = 700;
  const halfW = 2.2; // corridor half width
  const top = 2.6;
  const bottom = -1.8;
  const proj = (x: number, y: number, z: number) => ({x: cx + (x * f) / z, y: cy - (y * f) / z});
  const segs: React.ReactNode[] = [];
  const zStart = 1.2;
  const seg = 1.1;
  const offset = dolly % seg;
  for (let i = 18; i >= 0; i--) {
    const z0 = zStart + i * seg - offset;
    const z1 = z0 + seg * 0.92;
    if (z0 <= 0.3) continue;
    const fog = Math.min(1, (z0 - 1) / 18);
    const idx = i + Math.floor(dolly / seg);
    [-1, 1].forEach((side) => {
      const a = proj(side * halfW, top, z0);
      const b = proj(side * halfW, top, z1);
      const c = proj(side * halfW, bottom, z1);
      const d = proj(side * halfW, bottom, z0);
      const shade = Math.round(44 - fog * 26);
      segs.push(
        <path
          key={`r${i}${side}`}
          d={`M${a.x},${a.y}L${b.x},${b.y}L${c.x},${c.y}L${d.x},${d.y}Z`}
          fill={`rgb(${shade},${Math.round(shade * 0.85)},${Math.round(shade * 0.68)})`}
          stroke={`rgba(217,164,65,${0.35 * (1 - fog)})`}
          strokeWidth={1.2}
        />,
      );
      // LED rows
      for (let r = 0; r < 12; r++) {
        const yy = top - 0.3 - r * ((top - bottom - 0.6) / 11);
        for (let k = 0; k < 4; k++) {
          const zz = z0 + 0.15 + k * 0.2;
          const on = random(`cl-${idx}-${side}-${r}-${k}`);
          if (on > 0.7) continue;
          const p = proj(side * (halfW - 0.01), yy, zz);
          const lit = on < 0.05 ? 1 : 0.55;
          const blink = on < 0.04 && Math.floor(frame / 7 + r) % 2 === 0 ? 0.4 : 1;
          segs.push(
            <circle
              key={`l${i}${side}${r}${k}`}
              cx={p.x}
              cy={p.y}
              r={Math.max(1, 14 / zz)}
              fill={on < 0.04 ? C.goldBright : C.amber}
              opacity={lit * blink * (1 - fog * 0.85)}
            />,
          );
        }
      }
    });
    // ceiling light strip
    const l0 = proj(-0.25, top, z0);
    const l1 = proj(0.25, top, z0 + 0.5);
    segs.push(
      <rect key={`c${i}`} x={l0.x} y={l0.y - 2} width={l1.x - l0.x} height={Math.max(1, 30 / z0)} fill={C.ivory} opacity={0.18 * (1 - fog)} />,
    );
  }
  return (
    <svg width={1920} height={1080}>
      <defs>
        <radialGradient id="corrFog" cx="50%" cy="52%" r="40%">
          <stop offset="0%" stopColor={C.amber} stopOpacity={0.35} />
          <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b150f" />
          <stop offset="100%" stopColor="#0a0807" />
        </linearGradient>
      </defs>
      <rect width={1920} height={1080} fill="#0a0807" />
      <rect y={cy} width={1920} height={1080 - cy} fill="url(#floor)" />
      {segs}
      <rect width={1920} height={1080} fill="url(#corrFog)" />
    </svg>
  );
};
