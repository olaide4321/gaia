import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FONT} from '../theme';
import {envelope, lerp} from '../util';
import narration from '../data/narration.json';
import {SUBTITLES} from '../config';

export const LETTERBOX = 132; // ≈ 2.39:1 inside a 16:9 frame

/** Cinematic letterbox bars that open at the start of the film. */
export const Letterbox: React.FC = () => {
  const frame = useCurrentFrame();
  const h = lerp(frame, [0, 40], [540, LETTERBOX]);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h, background: '#000'}} />
    </>
  );
};

/** Burned-in subtitles, driven by src/data/narration.json (same source as the .srt file). */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  if (!SUBTITLES.burnIn) return null;
  const line = narration.lines.find((l) => frame >= l.from && frame < l.to);
  if (!line) return null;
  const o = envelope(frame, line.from, line.to, 8, 8);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', pointerEvents: 'none'}}>
      <div
        style={{
          marginBottom: LETTERBOX / 2 - 26,
          opacity: o,
          fontFamily: FONT.sans,
          fontWeight: 400,
          fontSize: 34,
          letterSpacing: 0.4,
          color: C.ivory,
          textAlign: 'center',
          maxWidth: 1780,
          lineHeight: 1.25,
          textShadow: '0 2px 12px rgba(0,0,0,0.9)',
        }}
      >
        {line.text}
      </div>
    </AbsoluteFill>
  );
};

/** Slow camera move: scale + pan + gentle handheld drift. */
export const Camera: React.FC<{
  children: React.ReactNode;
  duration: number;
  from?: {s: number; x: number; y: number};
  to?: {s: number; x: number; y: number};
  shake?: number;
  origin?: string;
}> = ({children, duration, from = {s: 1, x: 0, y: 0}, to = {s: 1.08, x: 0, y: 0}, shake = 0, origin = '50% 50%'}) => {
  const frame = useCurrentFrame();
  const t = (a: number, b: number) => lerp(frame, [0, duration], [a, b], (x) => x * (2 - x) * 0.5 + x * 0.5);
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
  const frame = useCurrentFrame();
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
