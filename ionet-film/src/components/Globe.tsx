import React from 'react';
import {random} from 'remotion';
import {CITIES, isLand} from '../data/geo';
import {C} from '../theme';

const D2R = Math.PI / 180;
type V3 = [number, number, number];

const toVec = (lon: number, lat: number): V3 => [
  Math.cos(lat * D2R) * Math.sin(lon * D2R),
  Math.sin(lat * D2R),
  Math.cos(lat * D2R) * Math.cos(lon * D2R),
];

// ── Precomputed geometry (module-level, computed once per render process) ──
const LAND_DOTS: V3[] = (() => {
  const out: V3[] = [];
  const step = 1.75;
  for (let lat = -84; lat <= 84; lat += step) {
    const n = Math.max(1, Math.round((360 * Math.cos(lat * D2R)) / step));
    for (let k = 0; k < n; k++) {
      const lon = -180 + (k * 360) / n + (Math.round(lat / step) % 2) * (180 / n);
      if (isLand(lon, lat)) out.push(toVec(lon, lat));
    }
  }
  return out;
})();

export type GlobeNode = {name: string; v: V3; ignite: number; big: boolean; lon: number; lat: number};

export const NODES: GlobeNode[] = (() => {
  const lagos = CITIES[0];
  const dist = (a: [string, number, number]) => Math.hypot(a[1] - lagos[1], a[2] - lagos[2]);
  const cities: GlobeNode[] = CITIES.map((c, i) => ({
    name: c[0],
    lon: c[1],
    lat: c[2],
    v: toVec(c[1], c[2]),
    // ignite roughly outward from Lagos with some jitter
    ignite: i === 0 ? 0 : Math.min(0.95, dist(c) / 230 + random(`ig-${i}`) * 0.25),
    big: true,
  }));
  const extra: GlobeNode[] = [];
  let k = 0;
  while (extra.length < 150 && k < 5000) {
    k++;
    const lon = random(`xn-lon-${k}`) * 360 - 180;
    const lat = random(`xn-lat-${k}`) * 125 - 55;
    if (!isLand(lon, lat)) continue;
    extra.push({
      name: '',
      lon,
      lat,
      v: toVec(lon, lat),
      ignite: 0.1 + random(`xn-ig-${k}`) * 0.9,
      big: false,
    });
  }
  return [...cities, ...extra];
})();

const angle = (a: V3, b: V3) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));

export type Arc = {a: number; b: number; start: number; hub: boolean; seed: number};

export const ARCS: Arc[] = (() => {
  const arcs: Arc[] = [];
  const seen = new Set<string>();
  const add = (a: number, b: number, start: number, hub = false) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a === b || seen.has(key)) return;
    seen.add(key);
    arcs.push({a, b, start, hub, seed: arcs.length});
  };
  // Each node links to its nearest neighbours → a mesh
  NODES.forEach((n, i) => {
    const near = NODES.map((m, j) => ({j, d: angle(n.v, m.v)}))
      .filter((x) => x.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, n.big ? 3 : 1);
    near.forEach((x) => add(i, x.j, Math.max(n.ignite, NODES[x.j].ignite) + 0.05));
  });
  // Long-haul links between major cities
  for (let i = 1; i < CITIES.length; i++) {
    if (random(`lh-${i}`) < 0.45) add(i, Math.floor(random(`lh2-${i}`) * CITIES.length), 0.35 + random(`lh3-${i}`) * 0.5);
  }
  // Hub links: everything converges toward Lagos at the climax
  for (let i = 1; i < CITIES.length; i++) add(0, i, 0, true);
  return arcs;
})();

const slerp = (a: V3, b: V3, t: number): V3 => {
  const w = angle(a, b);
  if (w < 1e-6) return a;
  const s = Math.sin(w);
  const ka = Math.sin((1 - t) * w) / s;
  const kb = Math.sin(t * w) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
};

export type GlobeProps = {
  frame: number;
  cx: number;
  cy: number;
  r: number;
  lon0: number;
  tilt: number;
  dots?: number; // land dot opacity 0..1
  ignite?: number; // 0..1 portion of nodes lit
  links?: number; // 0..1 mesh link growth
  hub?: number; // 0..1 hub links toward Lagos
  labels?: number; // city label opacity
  rim?: number; // atmosphere glow strength
};

export const Globe: React.FC<GlobeProps> = ({
  frame,
  cx,
  cy,
  r,
  lon0,
  tilt,
  dots = 1,
  ignite = 0,
  links = 0,
  hub = 0,
  labels = 0,
  rim = 1,
}) => {
  const cl = Math.cos(-lon0 * D2R);
  const sl = Math.sin(-lon0 * D2R);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const proj = (v: V3, alt = 1) => {
    const x = (v[0] * cl + v[2] * sl) * alt;
    const z0 = (-v[0] * sl + v[2] * cl) * alt;
    const y0 = v[1] * alt;
    const y = y0 * ct - z0 * st;
    const z = y0 * st + z0 * ct;
    return {x: cx + x * r, y: cy - y * r, z, depth: z / alt};
  };
  const visible = (p: {x: number; y: number; z: number}) => p.z > 0 || Math.hypot(p.x - cx, p.y - cy) > r;

  // Land dots
  const dotEls: React.ReactNode[] = [];
  if (dots > 0) {
    for (let i = 0; i < LAND_DOTS.length; i++) {
      const p = proj(LAND_DOTS[i]);
      if (p.z <= 0.02) continue;
      const lim = p.z; // limb darkening
      dotEls.push(
        <circle key={i} cx={p.x} cy={p.y} r={1.25 + 1.1 * lim * (r / 500)} fill={C.ivoryDim} opacity={dots * (0.1 + 0.42 * lim)} />,
      );
    }
  }

  // Arcs
  const arcEls: React.ReactNode[] = [];
  ARCS.forEach((arc, idx) => {
    const amount = arc.hub ? hub : links;
    if (amount <= 0) return;
    const local = Math.max(0, Math.min(1, (amount - arc.start * (arc.hub ? 0.6 : 1)) / 0.22));
    if (local <= 0) return;
    const A = NODES[arc.a].v;
    const B = NODES[arc.b].v;
    const w = angle(A, B);
    const h = Math.min(0.2, 0.04 + w * 0.11);
    const steps = Math.max(10, Math.ceil(w * 40));
    const segs: string[] = [];
    let cur = '';
    let head = {x: 0, y: 0, ok: false};
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * local;
      const p = proj(slerp(A, B, t), 1 + h * Math.sin(Math.PI * t));
      const ok = visible(p);
      if (ok) cur += `${cur ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      else if (cur) {
        segs.push(cur);
        cur = '';
      }
      if (s === steps) head = {x: p.x, y: p.y, ok};
    }
    if (cur) segs.push(cur);
    const col = arc.hub ? C.goldBright : idx % 3 === 0 ? C.amber : C.gold;
    const op = arc.hub ? 0.75 : 0.5;
    segs.forEach((d, k) => {
      arcEls.push(<path key={`g${idx}-${k}`} d={d} stroke={col} strokeWidth={arc.hub ? 5 : 3.2} opacity={op * 0.22} fill="none" />);
      arcEls.push(<path key={`a${idx}-${k}`} d={d} stroke={col} strokeWidth={arc.hub ? 1.6 : 1.1} opacity={op} fill="none" />);
    });
    // Leading spark while drawing, and travelling data pulses once complete
    if (local < 1 && head.ok) {
      arcEls.push(<circle key={`h${idx}`} cx={head.x} cy={head.y} r={3.2} fill={C.ivory} opacity={0.95} />);
    } else if (local >= 1) {
      const speed = arc.hub ? 0.022 : 0.012 + (arc.seed % 5) * 0.002;
      const t = ((frame * speed + arc.seed * 0.137) % 1 + 1) % 1;
      const tt = arc.hub ? 1 - t : t; // hub pulses flow toward Lagos
      const p = proj(slerp(A, B, tt), 1 + h * Math.sin(Math.PI * tt));
      if (visible(p)) {
        arcEls.push(<circle key={`p${idx}`} cx={p.x} cy={p.y} r={arc.hub ? 3.4 : 2.4} fill={C.ivory} opacity={0.9} />);
        arcEls.push(<circle key={`pg${idx}`} cx={p.x} cy={p.y} r={arc.hub ? 10 : 7} fill={C.goldBright} opacity={0.25} />);
      }
    }
  });

  // Nodes
  const nodeEls: React.ReactNode[] = [];
  const labelEls: React.ReactNode[] = [];
  NODES.forEach((n, i) => {
    const lit = Math.max(0, Math.min(1, (ignite - n.ignite) / 0.06));
    if (lit <= 0) return;
    const p = proj(n.v);
    if (p.z <= 0.04) return;
    const pulse = 0.75 + 0.25 * Math.sin(frame / 9 + i);
    const flash = Math.max(0, 1 - (ignite - n.ignite) / 0.12); // ignition flare
    const base = n.big ? 4.2 : 2.4;
    const isLagos = i === 0;
    const hubBoost = isLagos ? 1 + hub * 1.6 : 1;
    nodeEls.push(
      <g key={i} opacity={lit * (0.4 + 0.6 * p.z)}>
        <circle cx={p.x} cy={p.y} r={(base * 5 + flash * 26) * hubBoost} fill="url(#nodeGlow)" opacity={0.6 * pulse} />
        <circle cx={p.x} cy={p.y} r={base * hubBoost} fill={isLagos ? C.ivory : C.goldBright} />
      </g>,
    );
    if (labels > 0 && n.big && n.name && p.z > 0.35) {
      labelEls.push(
        <text
          key={`l${i}`}
          x={p.x + 10}
          y={p.y - 9}
          fill={isLagos ? C.ivory : C.ivoryDim}
          opacity={labels * lit * Math.min(1, (p.z - 0.35) * 3) * (isLagos ? 1 : 0.65)}
          fontSize={isLagos ? 17 : 12}
          letterSpacing={isLagos ? 3 : 2}
          style={{fontFamily: 'Inter, sans-serif', textTransform: 'uppercase'}}
        >
          {n.name}
        </text>,
      );
    }
  });

  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="globeBody" cx="42%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#2a2117" />
          <stop offset="55%" stopColor="#14100c" />
          <stop offset="100%" stopColor="#070605" />
        </radialGradient>
        <radialGradient id="atmo" cx="50%" cy="50%" r="50%">
          <stop offset={`${(r / (r * 1.32)) * 100 - 6}%`} stopColor={C.amber} stopOpacity={0} />
          <stop offset={`${(r / (r * 1.32)) * 100}%`} stopColor={C.amber} stopOpacity={0.55 * rim} />
          <stop offset={`${(r / (r * 1.32)) * 100 + 3}%`} stopColor={C.gold} stopOpacity={0.22 * rim} />
          <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="nodeGlow">
          <stop offset="0%" stopColor={C.goldBright} stopOpacity={0.9} />
          <stop offset="35%" stopColor={C.amber} stopOpacity={0.35} />
          <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="terminator" cx="72%" cy="70%" r="75%">
          <stop offset="40%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.32} fill="url(#atmo)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#globeBody)" />
      {dotEls}
      <circle cx={cx} cy={cy} r={r} fill="url(#terminator)" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.gold} strokeOpacity={0.35 * rim} strokeWidth={1.2} />
      <g style={{mixBlendMode: 'screen'}}>{arcEls}</g>
      <g style={{mixBlendMode: 'screen'}}>{nodeEls}</g>
      {labelEls}
    </svg>
  );
};
