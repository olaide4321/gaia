import React from 'react';
import {random} from 'remotion';
import {C} from '../theme';

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
