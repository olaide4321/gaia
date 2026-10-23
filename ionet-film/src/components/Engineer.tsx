import React from 'react';
import {C} from '../theme';

// Profile of the engineer, facing right toward her screen. Drawn in a 700×1000 box.
const HEAD =
  'M230 520 C205 480 185 400 195 330 C205 250 260 205 325 210 C375 214 398 255 398 295 L402 318 ' +
  'C408 335 425 352 432 366 C434 374 422 380 410 381 C414 388 416 394 411 399 C409 403 412 408 412 412 ' +
  'C412 420 404 426 402 432 C404 446 398 460 380 466 C365 470 352 472 345 480 L342 540 ' +
  'C360 560 400 575 430 600 C470 640 480 700 470 760 L640 790 C660 795 662 820 640 826 L460 830 ' +
  'C450 900 445 960 440 1000 L120 1000 C130 900 150 800 170 700 C185 620 210 560 230 520 Z';

// Afro puff: a large rounded mass with a soft, fluffy edge built from overlapping circles.
const PUFF = (() => {
  const out: {x: number; y: number; r: number}[] = [{x: 205, y: 178, r: 112}];
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2;
    const wob = 0.5 + 0.5 * Math.sin(i * 2.3) * Math.cos(i * 1.7);
    out.push({x: 205 + Math.cos(a) * 122, y: 178 + Math.sin(a) * 100, r: 15 + wob * 13});
  }
  return out;
})();
const HAIRLINE = 'M198 335 C188 280 220 228 290 212 C335 204 372 214 388 240 C360 232 330 234 300 244 C255 258 225 292 214 340 Z';

export const Engineer: React.FC<{
  frame: number;
  light: number; // screen glow intensity 0..1.5
  flicker?: number;
  leanForward?: number; // 0..1
  blinkAt?: number[];
}> = ({frame, light, flicker = 0, leanForward = 0, blinkAt = []}) => {
  const blink = blinkAt.some((b) => frame >= b && frame < b + 5);
  const l = Math.max(0, light * (1 - flicker * (0.5 + 0.5 * Math.sin(frame * 1.7)) * 0.4));
  return (
    <svg viewBox="0 0 700 1000" width="100%" height="100%" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="rim" x1="230" y1="0" x2="440" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={C.amber} stopOpacity={0} />
          <stop offset="60%" stopColor={C.amber} stopOpacity={0.5 * l} />
          <stop offset="100%" stopColor={C.goldBright} stopOpacity={Math.min(1, 1.0 * l)} />
        </linearGradient>
        <radialGradient id="faceLight" cx="420" cy="360" r="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7a4a22" stopOpacity={0.9 * Math.min(1, l)} />
          <stop offset="45%" stopColor="#3a2414" stopOpacity={0.6 * Math.min(1, l)} />
          <stop offset="100%" stopColor="#0b0806" stopOpacity={0} />
        </radialGradient>
        <filter id="rimBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g transform={`rotate(${leanForward * 6} 300 900) translate(${leanForward * 18} 0)`}>
        <path d={HEAD} fill="#0a0807" />
        <path d={HEAD} fill="url(#faceLight)" />
        {/* hair: warm rim glow offset toward the screen, then the dark mass on top */}
        <g transform="translate(5 -3)" filter="url(#rimBlur)" opacity={Math.min(1, l)}>
          {PUFF.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="url(#rim)" />
          ))}
          <path d={HAIRLINE} fill="url(#rim)" />
        </g>
        {PUFF.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="#070505" />
        ))}
        <path d={HAIRLINE} fill="#070505" />
        <path d={HEAD} fill="none" stroke="url(#rim)" strokeWidth={5} filter="url(#rimBlur)" />
        <path d={HEAD} fill="none" stroke="url(#rim)" strokeWidth={1.6} />
        {/* earring catching the light */}
        <circle cx={262} cy={385} r={5} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.6 * Math.min(1, l)} />
        {/* eye */}
        {blink ? (
          <path d="M370 318 Q382 322 392 318" stroke="#2a1a10" strokeWidth={2} fill="none" />
        ) : (
          <>
            <path d="M370 316 Q382 308 394 317 Q382 323 370 316 Z" fill="#1a110b" />
            <circle cx={389} cy={315} r={2.1} fill={C.ivory} opacity={0.9 * Math.min(1, l + 0.2)} />
          </>
        )}
        {/* shoulder light */}
        <ellipse cx={460} cy={700} rx={60} ry={120} fill={C.amber} opacity={0.12 * l} filter="url(#softGlow)" />
      </g>
    </svg>
  );
};
