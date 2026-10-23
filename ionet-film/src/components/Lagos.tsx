import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C} from '../theme';

const HORIZON = 700;

type Building = {x: number; w: number; h: number; layer: number; windows: {x: number; y: number; w: number; h: number; c: string; a: number}[]; beacon: boolean; crown: number};

const buildCity = (): Building[] => {
  const out: Building[] = [];
  [0, 1, 2].forEach((layer) => {
    let x = -40;
    let i = 0;
    while (x < 2000) {
      const seed = `${layer}-${i}`;
      const w = (layer === 2 ? 50 : 34) + random(`bw${seed}`) * (layer === 2 ? 90 : 60);
      // Taller cluster around the islands (centre-right), like Lagos Island / Victoria Island
      const cluster = Math.exp(-(((x - 1050) / 420) ** 2));
      const h =
        (layer === 0 ? 40 : layer === 1 ? 70 : 90) +
        random(`bh${seed}`) ** 1.6 * (layer === 0 ? 120 : layer === 1 ? 200 : 260) * (0.45 + cluster * 1.2);
      const windows: Building['windows'] = [];
      if (layer > 0) {
        const cols = Math.floor(w / 9);
        const rows = Math.floor(h / 13);
        for (let cI = 0; cI < cols; cI++) {
          for (let r = 0; r < rows; r++) {
            const k = random(`win${seed}-${cI}-${r}`);
            if (k > (layer === 2 ? 0.74 : 0.82)) {
              const warm = random(`wc${seed}-${cI}-${r}`);
              windows.push({
                x: x + 4 + cI * 9,
                y: HORIZON - h + 8 + r * 13,
                w: 4.5,
                h: 6.5,
                c: warm < 0.55 ? C.amber : warm < 0.85 ? C.goldBright : C.ivory,
                a: 0.35 + random(`wa${seed}-${cI}-${r}`) * 0.6,
              });
            }
          }
        }
      }
      out.push({x, w, h, layer, windows, beacon: layer === 2 && h > 260 && random(`bb${seed}`) > 0.4, crown: random(`cr${seed}`)});
      x += w + (layer === 0 ? 0 : 2 + random(`gap${seed}`) * 22);
      i++;
    }
  });
  return out;
};

/** Cable-stayed bridge silhouette (evokes Lagos's Lekki–Ikoyi Link Bridge). */
const Bridge: React.FC<{frame: number}> = ({frame}) => {
  const deckY = HORIZON + 26;
  const px = 1500;
  const topY = HORIZON - 250;
  const cables: React.ReactNode[] = [];
  for (let i = 1; i <= 14; i++) {
    const off = i * 30;
    cables.push(<line key={`l${i}`} x1={px} y1={topY + 20 + i * 3} x2={px - off} y2={deckY} stroke="#7a5a35" strokeOpacity={0.55} strokeWidth={1.2} />);
    cables.push(<line key={`r${i}`} x1={px} y1={topY + 20 + i * 3} x2={px + off} y2={deckY} stroke="#7a5a35" strokeOpacity={0.55} strokeWidth={1.2} />);
  }
  // Moving traffic lights on the deck
  const cars: React.ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const speed = 1.6 + random(`car${i}`) * 1.4;
    const x = ((random(`cx${i}`) * 1300 + dir * frame * speed) % 1300 + 1300) % 1300 + 700;
    cars.push(
      <circle key={i} cx={x} cy={deckY - 3 + (dir > 0 ? 0 : 2)} r={1.6} fill={dir > 0 ? C.ivory : C.amber} opacity={0.85} />,
    );
  }
  return (
    <g>
      <rect x={680} y={deckY - 4} width={1300} height={7} fill="#15110d" />
      {cables}
      <defs>
        <linearGradient id="pylonLight" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={C.goldBright} stopOpacity={0.9} />
          <stop offset="100%" stopColor={C.amber} stopOpacity={0.15} />
        </linearGradient>
      </defs>
      <path d={`M${px - 12} ${deckY} L${px - 4} ${topY} L${px + 4} ${topY} L${px + 12} ${deckY} Z`} fill="url(#pylonLight)" />
      <circle cx={px} cy={topY - 4} r={2.4} fill={C.warn} opacity={0.5 + 0.5 * Math.sin(frame / 8)} />
      {new Array(30).fill(0).map((_, i) => (
        <circle key={i} cx={700 + i * 44} cy={deckY - 6} r={1.4} fill={C.goldBright} opacity={0.75} />
      ))}
      {cars}
    </g>
  );
};

/** Lagos at night, in rain: skyline, bridge and lagoon reflections. */
export const LagosSkyline: React.FC<{lightning?: number; dawn?: number}> = ({lightning = 0, dawn = 0}) => {
  const frame = useCurrentFrame();
  const city = useMemo(buildCity, []);
  const layerFog = (layer: number) => (
    <rect key={`fog${layer}`} x={0} y={HORIZON - 420} width={1920} height={420} fill="url(#depthFog)" opacity={layer === 0 ? 0.55 : 0.35} />
  );
  const skyline = (
    <g>
      {city.map((b, i) => {
        const prev = city[i - 1];
        const fogBefore = prev && prev.layer !== b.layer ? layerFog(prev.layer) : null;
        const fill = b.layer === 0 ? '#1a140f' : b.layer === 1 ? '#120e0b' : '#0b0907';
        return (
          <g key={i}>
            {fogBefore}
            <rect x={b.x} y={HORIZON - b.h} width={b.w} height={b.h} fill={fill} />
            {b.layer === 2 && b.crown > 0.7 ? (
              <rect x={b.x + b.w * 0.3} y={HORIZON - b.h - 30} width={b.w * 0.4} height={30} fill={fill} />
            ) : null}
            {b.windows.map((w, k) => (
              <rect key={k} x={w.x} y={w.y} width={w.w} height={w.h} fill={w.c} opacity={w.a * (1 - dawn * 0.4)} />
            ))}
            {b.beacon ? (
              <circle cx={b.x + b.w / 2} cy={HORIZON - b.h - 34} r={2.5} fill={C.warn} opacity={0.4 + 0.6 * ((Math.floor(frame / 20) + i) % 2)} />
            ) : null}
          </g>
        );
      })}
      <Bridge frame={frame} />
    </g>
  );
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070605" />
            <stop offset="45%" stopColor={dawn > 0 ? '#1d140c' : '#110d0a'} />
            <stop offset="65%" stopColor={dawn > 0 ? '#4a2d14' : '#2d1c0f'} />
            <stop offset="72%" stopColor={dawn > 0 ? '#7a4a1e' : '#3a2412'} />
          </linearGradient>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b130c" />
            <stop offset="100%" stopColor="#060504" />
          </linearGradient>
          <linearGradient id="depthFog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2412" stopOpacity={0} />
            <stop offset="100%" stopColor="#5a3518" stopOpacity={0.9} />
          </linearGradient>
          <filter id="refl" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="2.5 7" />
          </filter>
          <filter id="cloudBlur">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>
        <rect width={1920} height={HORIZON} fill="url(#sky)" />
        {/* Low clouds lit from below by sodium light */}
        <g filter="url(#cloudBlur)" opacity={0.55}>
          {new Array(9).fill(0).map((_, i) => (
            <ellipse
              key={i}
              cx={((random(`cl${i}`) * 2400 + frame * (0.3 + random(`cs${i}`) * 0.4)) % 2600) - 300}
              cy={180 + random(`cy${i}`) * 300}
              rx={260 + random(`cr${i}`) * 300}
              ry={50 + random(`cq${i}`) * 50}
              fill={i % 2 ? '#3a2615' : '#2a1d12'}
            />
          ))}
        </g>
        {dawn > 0 ? <ellipse cx={1300} cy={HORIZON} rx={900} ry={160} fill={C.amber} opacity={dawn * 0.25} filter="url(#cloudBlur)" /> : null}
        {skyline}
        <rect y={HORIZON} width={1920} height={1080 - HORIZON} fill="url(#water)" />
        <g transform={`translate(0 ${HORIZON * 2 + 4}) scale(1 -1)`} opacity={0.45} filter="url(#refl)">
          {skyline}
        </g>
        {/* rain ripples striping the reflection */}
        {new Array(40).fill(0).map((_, i) => (
          <rect
            key={i}
            x={0}
            y={HORIZON + 6 + ((i * 9.5 + frame * 0.6) % 380)}
            width={1920}
            height={1.4}
            fill="#060504"
            opacity={0.5}
          />
        ))}
      </svg>
      {lightning > 0 ? (
        <AbsoluteFill style={{background: `rgba(255,236,205,${lightning * 0.55})`, mixBlendMode: 'screen'}} />
      ) : null}
    </AbsoluteFill>
  );
};
