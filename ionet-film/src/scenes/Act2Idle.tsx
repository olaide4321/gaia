import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {useFrame} from '../time';
import {Camera, LocationTag} from '../components/Frame';
import {Photo} from '../components/Photo';
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

/** The Invisible Resources — idle machines around the world. */
export const Act2Idle: React.FC = () => {
  const f = useFrame();
  return (
    <AbsoluteFill style={{background: C.black}}>
      {/* Shot A — an office at night: rows of workstations, nobody using them */}
      <AbsoluteFill style={{opacity: envelope(f, 0, 112, 16, 12)}}>
        <Photo src="idle-office.jpg" start={0} end={112} grade="amber" from={{s: 1.16, x: 0, y: 0}} to={{s: 1.04, x: 0, y: 8}} shade={0.15} />
        <Haze opacity={0.16} seed={5} />
        <DustMotes count={50} seed={8} opacity={0.7} />
        <LocationTag start={8} end={108} place="Office · Toronto" detail="22:14 LOCAL · GPU UTILIZATION 0%" />
      </AbsoluteFill>

      {/* Shot C — data facility: racks of GPUs, idle */}
      <AbsoluteFill style={{opacity: envelope(f, 100, 195, 10, 12)}}>
        <Photo src="gpu-racks.jpg" start={100} end={195} grade="warm" position="40% 50%" from={{s: 1.02, x: 30, y: 0}} to={{s: 1.12, x: -40, y: 0}} shade={0.1} />
        <Haze opacity={0.2} seed={9} />
        <LocationTag start={106} end={191} place="Data facility · Seoul" detail="11:14 LOCAL · CAPACITY UNUSED" />
        <Readout label="IDLE FOR" value={clock(14 * 3600 + 22 * 60, f)} x={1380} y={760} o={envelope(f, 118, 191, 12, 10)} />
      </AbsoluteFill>

      {/* Shot D — montage: idle machines multiply across the world */}
      <AbsoluteFill style={{opacity: envelope(f, 185, 290, 10, 1)}}>
        <IdleGrid f={f - 185} />
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
    <AbsoluteFill style={{background: '#1a1611'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>{tiles}</AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(26,22,17,${lerp(f, [30, 75], [0.3, 1])}) 75%)`}} />
    </AbsoluteFill>
  );
};
