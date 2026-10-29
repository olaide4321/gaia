import React, {useMemo} from 'react';
import {interpolate, random} from 'remotion';
import {C, FONT} from '../theme';
import {clamp} from '../util';

/** Fictional training dashboard for "FLOODWATCH-LAGOS", an invented project. */
export const TrainingScreen: React.FC<{
  frame: number; // local frame
  mode: 'stalled' | 'running';
  progress: number; // 0..1
  logReveal: number; // number of log lines visible
}> = ({frame, mode, progress, logReveal}) => {
  const stalledLogs = [
    ['03:12:41', 'Loading dataset lagos_rainfall_2015-2025 ..... ok'],
    ['03:12:44', 'Requesting 8 × GPU for training ....... queued'],
    ['03:13:58', 'Quote received: 41,880 USD / month'],
    ['03:13:58', 'Available budget: 2,000 USD'],
    ['03:14:02', 'Training paused — insufficient compute'],
  ];
  const runningLogs = [
    ['04:02:10', 'Connecting to distributed GPU cluster .... ok'],
    ['04:02:12', 'Workers online across 9 regions'],
    ['04:02:15', 'Resuming from checkpoint  epoch 12'],
    ['04:09:47', 'Epoch 50/50  val_loss 0.081 ........... done'],
    ['04:09:49', 'Generating 72h flood-risk forecast'],
  ];
  const logs = mode === 'stalled' ? stalledLogs : runningLogs;
  const pct = Math.round(progress * 100);
  const blink = Math.floor(frame / 15) % 2 === 0;
  const lossPts = useMemo(
    () =>
      new Array(60).fill(0).map((_, i) => {
        const t = i / 59;
        return 0.15 + 0.75 * Math.exp(-t * 3.2) + (random(`loss${i}`) - 0.5) * 0.05;
      }),
    [],
  );
  const shown = mode === 'stalled' ? 14 : Math.max(14, Math.floor(progress * 59) + 1);
  const accent = mode === 'stalled' ? C.warn : C.goldBright;
  return (
    <div
      style={{
        width: 1600,
        height: 900,
        background: 'linear-gradient(180deg, #23201b 0%, #1a1814 100%)',
        borderRadius: 10,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT.mono,
        color: C.ivoryDim,
        boxShadow: 'inset 0 0 120px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', padding: '28px 40px', borderBottom: `1px solid ${C.smoke}`, fontSize: 22}}>
        <span style={{color: C.ivory, letterSpacing: 3}}>FLOODWATCH-LAGOS · training</span>
        <span style={{color: C.ivoryDim, opacity: 0.6}}>prototype · simulated data</span>
      </div>
      <div style={{display: 'flex', padding: 40, gap: 40}}>
        <div style={{flex: 1.25}}>
          <div style={{fontSize: 18, letterSpacing: 4, opacity: 0.6}}>STATUS</div>
          <div style={{fontSize: 54, color: accent, marginTop: 8, fontWeight: 600, letterSpacing: 2}}>
            {mode === 'stalled' ? (blink ? 'TRAINING PAUSED' : 'TRAINING PAUSED') : pct >= 100 ? 'TRAINING COMPLETE' : 'TRAINING'}
          </div>
          <div style={{marginTop: 34, fontSize: 20, display: 'flex', justifyContent: 'space-between'}}>
            <span>epoch {mode === 'stalled' ? '12' : Math.max(12, Math.round(progress * 50))}/50</span>
            <span style={{color: C.ivory}}>{mode === 'stalled' ? '23%' : `${Math.max(23, pct)}%`}</span>
          </div>
          <div style={{marginTop: 12, height: 14, background: '#241e17', borderRadius: 7, overflow: 'hidden'}}>
            <div
              style={{
                height: '100%',
                width: `${mode === 'stalled' ? 23 : Math.max(23, pct)}%`,
                background: mode === 'stalled' ? `linear-gradient(90deg, ${C.smoke}, #6b4a35)` : `linear-gradient(90deg, ${C.amberDeep}, ${C.goldBright})`,
                boxShadow: mode === 'running' ? `0 0 24px ${C.amber}` : 'none',
              }}
            />
          </div>
          <div style={{marginTop: 40, fontSize: 21, lineHeight: 1.85}}>
            {logs.slice(0, Math.floor(logReveal)).map(([t, msg], i) => {
              const last = i === logs.length - 1;
              return (
                <div key={i} style={{color: last && mode === 'stalled' ? C.warn : last ? C.goldBright : C.ivoryDim}}>
                  <span style={{opacity: 0.45}}>[{t}]</span> {msg}
                </div>
              );
            })}
            <span style={{opacity: blink ? 1 : 0, color: C.ivory}}>▍</span>
          </div>
        </div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 18, letterSpacing: 4, opacity: 0.6}}>VALIDATION LOSS</div>
          <svg width={620} height={300} style={{marginTop: 16}}>
            {[0, 1, 2, 3].map((g) => (
              <line key={g} x1={0} x2={620} y1={20 + g * 85} y2={20 + g * 85} stroke={C.smoke} strokeWidth={1} opacity={0.6} />
            ))}
            <polyline
              fill="none"
              stroke={accent}
              strokeWidth={3}
              points={lossPts
                .slice(0, shown)
                .map((v, i) => `${(i / 59) * 610},${280 - v * 260}`)
                .join(' ')}
            />
          </svg>
          <div style={{marginTop: 28, fontSize: 18, letterSpacing: 4, opacity: 0.6}}>COMPUTE</div>
          <div style={{marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8}}>
            {new Array(32).fill(0).map((_, i) => {
              const on = mode === 'running' && i < interpolate(frame, [0, 60], [1, 32], clamp);
              return (
                <div
                  key={i}
                  style={{
                    height: 30,
                    borderRadius: 4,
                    border: `1px solid ${on ? C.gold : C.smoke}`,
                    background: on ? `rgba(217,164,65,${0.25 + 0.2 * Math.sin(frame / 6 + i)})` : 'transparent',
                  }}
                />
              );
            })}
          </div>
          <div style={{marginTop: 14, fontSize: 18, color: mode === 'stalled' ? C.warn : C.gold}}>
            {mode === 'stalled' ? 'local: 1 GPU · required: 8 GPU' : 'distributed workers · connected'}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Fictional flood-risk visualization ──
// A stylised impression of Lagos's lagoon and coastline — not a real map, not real data.
const HEX = 17;
const MAP_W = 1600;
const MAP_H = 760;
const coastY = (x: number) => 640 + Math.sin(x / 230) * 14 + Math.sin(x / 71) * 5;
const inWater = (x: number, y: number) => {
  if (y > coastY(x)) return true; // Atlantic
  const wob = Math.sin(x / 55) * 14 + Math.sin(y / 40) * 10;
  const lagoon = ((x - 620) / 430) ** 2 + ((y - 330 + wob * 0.4) / (120 + wob)) ** 2 < 1;
  const eastArm = x > 900 && Math.abs(y - (455 + Math.sin(x / 120) * 18)) < 30 + Math.sin(x / 47) * 6;
  const channel = x > 860 && x < 925 && y > 380;
  const island = ((x - 1010) / 95) ** 2 + ((y - 545) / 55) ** 2 < 1;
  const creek = Math.abs(x - 300 - Math.sin(y / 50) * 26) < 12 && y < 260;
  return (lagoon || eastArm || channel || creek) && !island;
};
const mapCells = (() => {
  const cells: {x: number; y: number; risk: number; water: boolean}[] = [];
  for (let row = 0; row * HEX * 0.87 < MAP_H; row++) {
    for (let col = 0; col * HEX < MAP_W + HEX; col++) {
      const x = col * HEX + (row % 2) * (HEX / 2);
      const y = row * HEX * 0.87;
      const water = inWater(x, y);
      let d = 999;
      if (!water) {
        for (let k = 0; k < 48; k++) {
          const ang = (k / 48) * Math.PI * 2;
          for (let rr = 8; rr < 260; rr += 16) {
            if (inWater(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr)) {
              d = Math.min(d, rr);
              break;
            }
          }
        }
      }
      const lowland = 0.5 + 0.5 * Math.sin(x / 140 + 1.3) * Math.cos(y / 110);
      const noise = (random(`mr${row}-${col}`) - 0.5) * 0.18;
      const risk = water ? 0 : Math.max(0, Math.min(1, 1.0 - d / 135 + (lowland - 0.5) * 0.3 + noise));
      cells.push({x, y, risk, water});
    }
  }
  return cells;
})();

const riskColor = (r: number) => {
  if (r < 0.3) return '#3a3026';
  if (r < 0.5) return '#7a5a2a';
  if (r < 0.68) return C.gold;
  if (r < 0.84) return C.amber;
  return C.ivory;
};

const LABELS: [string, number, number, number][] = [
  ['LAGOS LAGOON', 560, 335, 1],
  ['ATLANTIC OCEAN', 1180, 715, 1],
  ['IKEJA', 250, 120, 0],
  ['YABA', 720, 170, 0],
  ['VICTORIA ISLAND', 1010, 600, 0],
  ['LEKKI', 1360, 560, 0],
  ['APAPA', 640, 560, 0],
];

export const FloodMap: React.FC<{frame: number; reveal: number}> = ({frame, reveal}) => {
  const hexPath = (x: number, y: number, s: number) => {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * s).toFixed(1)},${(y + Math.sin(a) * s).toFixed(1)}`;
    }
    return d + 'Z';
  };
  const sweepX = reveal * 1900 - 150;
  return (
    <div
      style={{
        width: 1600,
        height: 900,
        background: '#1d1a16',
        borderRadius: 10,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT.mono,
        color: C.ivoryDim,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', padding: '28px 40px', borderBottom: `1px solid ${C.smoke}`, fontSize: 22}}>
        <span style={{color: C.ivory, letterSpacing: 3}}>FLOOD-RISK FORECAST · 72H · LAGOS</span>
        <span style={{opacity: 0.6}}>prototype · simulated data</span>
      </div>
      <svg width={MAP_W} height={780} style={{position: 'absolute', top: 92}}>
        <rect width={MAP_W} height={780} fill="#171511" />
        {mapCells.map((c, i) => {
          if (c.water) {
            const wave = 0.5 + 0.5 * Math.sin(frame / 12 + c.x / 40 + c.y / 25);
            return <path key={i} d={hexPath(c.x, c.y, HEX * 0.42)} fill="#17130f" opacity={0.6 + wave * 0.3} />;
          }
          const vis = Math.max(0, Math.min(1, (sweepX - c.x) / 160));
          if (vis <= 0) return <path key={i} d={hexPath(c.x, c.y, HEX * 0.42)} fill="#241d16" />;
          const r = c.risk * vis;
          const pulse = r > 0.84 ? 0.78 + 0.22 * Math.sin(frame / 6 + c.x / 50) : 1;
          return <path key={i} d={hexPath(c.x, c.y, HEX * (0.34 + 0.1 * vis))} fill={riskColor(r)} opacity={(0.4 + r * 0.6) * pulse} />;
        })}
        {LABELS.map(([t, x, y, water]) => (
          <text
            key={t}
            x={x}
            y={y}
            textAnchor="middle"
            fill={water ? C.ivoryDim : C.ivory}
            opacity={water ? 0.5 : Math.min(1, Math.max(0, (sweepX - x) / 200)) * 0.9}
            fontSize={water ? 20 : 16}
            letterSpacing={water ? 10 : 4}
            style={{fontFamily: FONT.sans, fontStyle: water ? 'italic' : 'normal', paintOrder: 'stroke'}}
            stroke="#0a0907"
            strokeWidth={5}
          >
            {t}
          </text>
        ))}
        <line x1={sweepX} x2={sweepX} y1={0} y2={780} stroke={C.goldBright} strokeWidth={2} opacity={reveal < 1 ? 0.8 : 0} />
        <rect x={sweepX - 60} y={0} width={60} height={780} fill={C.goldBright} opacity={reveal < 1 ? 0.06 : 0} />
      </svg>
      <div style={{position: 'absolute', right: 40, bottom: 30, display: 'flex', alignItems: 'center', gap: 14, fontSize: 18, background: 'rgba(12,10,8,0.85)', padding: '10px 14px'}}>
        <span>LOW</span>
        {['#3a3026', '#7a5a2a', C.gold, C.amber, C.ivory].map((c) => (
          <div key={c} style={{width: 40, height: 12, background: c, borderRadius: 2}} />
        ))}
        <span>HIGH</span>
      </div>
      <div style={{position: 'absolute', left: 40, bottom: 30, fontSize: 18, opacity: Math.min(1, reveal * 2), background: 'rgba(12,10,8,0.85)', padding: '10px 14px'}}>
        <span style={{color: C.goldBright}}>●</span> elevated-risk zones · illustrative model output
      </div>
    </div>
  );
};
