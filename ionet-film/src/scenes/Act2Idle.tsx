import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Camera, LocationTag} from '../components/Frame';
import {GpuCard, RackCorridor, ServerRack} from '../components/Hardware';
import {DustMotes, Haze} from '../components/Atmosphere';
import {C, FONT} from '../theme';
import {envelope, lerp} from '../util';

const Readout: React.FC<{label: string; value: string; x: number; y: number; o?: number}> = ({label, value, x, y, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT.mono, color: C.ivoryDim, opacity: o}}>
    <div style={{fontSize: 16, letterSpacing: 5, color: C.gold}}>{label}</div>
    <div style={{fontSize: 44, color: C.ivory, marginTop: 4}}>{value}</div>
  </div>
);

const clock = (base: number, f: number) => {
  const s = base + Math.floor(f / 30);
  const hh = Math.floor(s / 3600) % 24;
  const mm = Math.floor(s / 60) % 60;
  const ss = s % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};

/** 10–22s · The Invisible Resources — idle GPUs around the world. */
export const Act2Idle: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.black}}>
      {/* Shot A — office at night, a workstation GPU sits idle behind glass */}
      <AbsoluteFill style={{opacity: envelope(f, 0, 112, 16, 12)}}>
        <Camera duration={112} from={{s: 1.12, x: 80, y: 0}} to={{s: 1.0, x: -60, y: 0}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 30%, #2a1f14 0%, #0b0907 60%)'}} />
          {/* window blind light stripes */}
          <AbsoluteFill style={{transform: 'skewY(-12deg)', opacity: 0.35}}>
            {new Array(9).fill(0).map((_, i) => (
              <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 120 + i * 70, height: 26, background: 'linear-gradient(90deg, rgba(232,138,42,0.0), rgba(232,138,42,0.35), rgba(232,138,42,0))'}} />
            ))}
          </AbsoluteFill>
          {/* case glass panel */}
          <div
            style={{
              position: 'absolute',
              left: 260,
              top: 230,
              width: 1400,
              height: 640,
              border: '2px solid rgba(243,201,107,0.18)',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(255,240,210,0.06), rgba(0,0,0,0) 40%, rgba(255,240,210,0.04) 70%, rgba(0,0,0,0))',
            }}
          />
          <div style={{position: 'absolute', left: 340, top: 330, width: 1240, height: 470, transform: 'perspective(2000px) rotateX(8deg)'}}>
            <GpuCard frame={f} fanSpeed={0} led={0.18} />
          </div>
          <Haze opacity={0.2} seed={5} />
          <DustMotes count={60} seed={8} />
        </Camera>
        <LocationTag start={8} end={108} place="Office · Toronto" detail={`22:14 LOCAL · GPU UTILIZATION 0%`} />
      </AbsoluteFill>

      {/* Shot B — university lab, morning light, racks unused */}
      <AbsoluteFill style={{opacity: envelope(f, 100, 215, 12, 12)}}>
        <Camera duration={115} from={{s: 1.0, x: 0, y: 0}} to={{s: 1.1, x: -120, y: 0}}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #1a140e 0%, #0b0907 100%)'}} />
          {/* light shafts through tall windows */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 200 + i * 520,
                top: -200,
                width: 220,
                height: 1500,
                transform: 'rotate(24deg)',
                background: 'linear-gradient(180deg, rgba(243,201,107,0.30), rgba(232,138,42,0.04))',
                filter: 'blur(26px)',
              }}
            />
          ))}
          <div style={{position: 'absolute', left: 120, top: 120, display: 'flex', gap: 40}}>
            {[0, 1, 2, 3, 4].map((k) => (
              <ServerRack key={k} frame={f} seed={k + 10} active={0.04} width={330} height={820} />
            ))}
          </div>
          <DustMotes count={110} seed={14} opacity={0.95} />
          {/* monitor with flat utilisation graph */}
          <div style={{position: 'absolute', left: 1180, top: 640, width: 560, height: 250, background: '#0d0b09', border: '10px solid #050404', borderRadius: 8, fontFamily: FONT.mono, color: C.ivoryDim, padding: 20, boxSizing: 'border-box'}}>
            <div style={{fontSize: 15, letterSpacing: 4, color: C.gold}}>CLUSTER LOAD · LAST 24H</div>
            <svg width={500} height={150} style={{marginTop: 10}}>
              <line x1={0} x2={500} y1={130} y2={130} stroke={C.smoke} />
              <polyline fill="none" stroke={C.amber} strokeWidth={3} points={new Array(50).fill(0).map((_, i) => `${i * 10},${126 - (random(`gl${i}`) < 0.1 ? 14 : 2)}`).join(' ')} />
            </svg>
          </div>
        </Camera>
        <LocationTag start={110} end={210} place="University lab · Bengaluru" detail="07:44 LOCAL · 4% LOAD" align="right" />
      </AbsoluteFill>

      {/* Shot C — data facility corridor */}
      <AbsoluteFill style={{opacity: envelope(f, 205, 300, 10, 12)}}>
        <RackCorridor frame={f} dolly={lerp(f, [205, 300], [0, 3.2], (x) => x)} />
        <Haze opacity={0.28} seed={9} />
        <LocationTag start={212} end={296} place="Data facility · Seoul" detail="11:14 LOCAL · CAPACITY UNUSED" />
        <Readout label="IDLE FOR" value={clock(14 * 3600 + 22 * 60, f)} x={1380} y={760} o={envelope(f, 225, 296, 12, 10)} />
      </AbsoluteFill>

      {/* Shot D — montage: idle machines multiply across the world */}
      <AbsoluteFill style={{opacity: envelope(f, 290, 380, 10, 1)}}>
        <IdleGrid f={f - 290} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PLACES = ['São Paulo', 'Nairobi', 'Berlin', 'Austin', 'Jakarta', 'Warsaw', 'Lima', 'Osaka', 'Cairo', 'Accra', 'Lyon', 'Dubai', 'Seattle', 'Manila', 'Kigali', 'Oslo', 'Pune', 'Bogotá', 'Taipei', 'Lisbon'];

const IdleGrid: React.FC<{f: number}> = ({f}) => {
  const zoom = lerp(f, [0, 75], [1.6, 0.5], (x) => x * x * (3 - 2 * x));
  const cols = 16;
  const rows = 10;
  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const dist = Math.hypot(c - cols / 2 + 0.5, r - rows / 2 + 0.5);
      const appear = Math.max(0, Math.min(1, (f - dist * 4) / 8));
      const util = Math.floor(random(`u${i}`) * 6);
      tiles.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: c * 250 - (cols * 250) / 2 + 960,
            top: r * 150 - (rows * 150) / 2 + 540,
            width: 230,
            height: 130,
            border: `1px solid rgba(217,164,65,${0.35 * appear})`,
            background: 'rgba(23,20,15,0.85)',
            opacity: appear,
            fontFamily: FONT.mono,
            padding: 16,
            boxSizing: 'border-box',
            color: C.ivoryDim,
          }}
        >
          <div style={{fontSize: 14, letterSpacing: 3, color: C.gold}}>{PLACES[i % PLACES.length].toUpperCase()}</div>
          <div style={{fontSize: 38, color: C.ivory, marginTop: 6}}>{util}%</div>
          <div style={{fontSize: 12, letterSpacing: 3, opacity: 0.6}}>IDLE</div>
        </div>,
      );
    }
  }
  return (
    <AbsoluteFill style={{background: C.black}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>{tiles}</AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(6,5,4,${lerp(f, [30, 75], [0.4, 1])}) 75%)`}} />
    </AbsoluteFill>
  );
};
