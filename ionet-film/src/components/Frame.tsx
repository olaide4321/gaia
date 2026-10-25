import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFrame} from '../time';
import {C, FONT} from '../theme';
import {envelope, lerp} from '../util';
import narration from '../data/narration.json';
import {SUBTITLES} from '../config';

export const LETTERBOX = 96; // slim bars, ≈ 2.1:1 inside a 16:9 frame

/** Cinematic letterbox bars that open at the start of the film. */
export const Letterbox: React.FC = () => {
  const frame = useFrame();
  const h = lerp(frame, [0, 40], [540, LETTERBOX]);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h, background: '#000'}} />
    </>
  );
};

/** Splits a line into plain and highlighted parts, using the line's "highlight" phrases. */
const splitHighlights = (text: string, phrases: string[]) => {
  const parts: {t: string; hl: boolean}[] = [];
  let rest = text;
  while (rest.length) {
    const hits = phrases.map((p) => ({p, i: rest.indexOf(p)})).filter((h) => h.i >= 0).sort((x, y) => x.i - y.i);
    if (!hits.length) {
      parts.push({t: rest, hl: false});
      break;
    }
    const {p, i} = hits[0];
    if (i > 0) parts.push({t: rest.slice(0, i), hl: false});
    parts.push({t: p, hl: true});
    rest = rest.slice(i + p.length);
  }
  return parts;
};

/**
 * Burned-in subtitles, driven by src/data/narration.json (same source as the .srt file).
 * Large ivory text on a soft dark backing, with each line's key phrases in gold.
 */
export const Subtitles: React.FC = () => {
  const frame = useFrame();
  if (!SUBTITLES.burnIn) return null;
  const line = narration.lines.find((l) => frame >= l.from && frame < l.to);
  if (!line) return null;
  const o = envelope(frame, line.from, line.to, 8, 8);
  const rise = lerp(frame, [line.from, line.from + 10], [14, 0]);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', pointerEvents: 'none'}}>
      <div
        style={{
          marginBottom: LETTERBOX + 34,
          opacity: o,
          transform: `translateY(${rise}px)`,
          fontFamily: FONT.sans,
          fontWeight: 600,
          fontSize: SUBTITLES.size,
          letterSpacing: 0.2,
          color: C.ivory,
          textAlign: 'center',
          maxWidth: 1560,
          lineHeight: 1.3,
          padding: '14px 34px 16px',
          borderRadius: 18,
          background: 'linear-gradient(180deg, rgba(14,12,10,0.62), rgba(14,12,10,0.72))',
          boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
          textShadow: '0 2px 10px rgba(0,0,0,0.6)',
        }}
      >
        {splitHighlights(line.text, line.highlight ?? []).map((part, i) =>
          part.hl ? (
            <span
              key={i}
              style={{
                background: `linear-gradient(90deg, ${C.goldBright}, ${C.amber})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 10px rgba(243,201,107,0.35))',
              }}
            >
              {part.t}
            </span>
          ) : (
            <span key={i}>{part.t}</span>
          ),
        )}
      </div>
    </AbsoluteFill>
  );
};

/** Slow camera move: scale + pan + gentle handheld drift. */
export const Camera: React.FC<{
  children: React.ReactNode;
  duration: number;
  start?: number; // frame (within the current Sequence) at which the move begins
  from?: {s: number; x: number; y: number};
  to?: {s: number; x: number; y: number};
  shake?: number;
  origin?: string;
}> = ({children, duration, start = 0, from = {s: 1, x: 0, y: 0}, to = {s: 1.08, x: 0, y: 0}, shake = 0, origin = '50% 50%'}) => {
  const frame = useFrame();
  const t = (a: number, b: number) => lerp(frame, [start, start + duration], [a, b], (x) => x * (2 - x) * 0.5 + x * 0.5);
  const sx = shake * (Math.sin(frame / 23) * 0.6 + Math.sin(frame / 9.7) * 0.4);
  const sy = shake * (Math.cos(frame / 19) * 0.6 + Math.sin(frame / 11.3) * 0.4);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${t(from.x, to.x) + sx}px, ${t(from.y, to.y) + sy}px) scale(${t(from.s, to.s)})`,
        transformOrigin: origin,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Location / chapter tag in the style of a film super. */
export const LocationTag: React.FC<{
  start: number;
  end: number;
  place: string;
  detail: string;
  align?: 'left' | 'right';
}> = ({start, end, place, detail, align = 'left'}) => {
  const frame = useFrame();
  const o = envelope(frame, start, end, 14, 14);
  const lineW = lerp(frame, [start, start + 24], [0, 120]);
  return (
    <div
      style={{
        position: 'absolute',
        top: LETTERBOX + 52,
        [align]: 96,
        opacity: o,
        textAlign: align,
        fontFamily: FONT.sans,
        color: C.ivory,
      }}
    >
      <div style={{fontSize: 15, letterSpacing: 6, color: C.gold, fontWeight: 500}}>{detail}</div>
      <div
        style={{
          height: 1,
          width: lineW,
          background: C.gold,
          margin: align === 'left' ? '10px 0 12px 0' : '10px 0 12px auto',
        }}
      />
      <div style={{fontSize: 30, letterSpacing: 3, fontWeight: 300}}>{place}</div>
    </div>
  );
};
