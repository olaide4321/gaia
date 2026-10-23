import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {lerp} from '../util';

/**
 * Colour grades that pull photographs into the film's charcoal / gold / amber palette.
 *  - amber:  full duotone, for blue- or teal-lit photos
 *  - warm:   keeps the photo's colour but warms and darkens it
 *  - golden: for photos that are already gold, adds contrast
 */
const GRADES = {
  amber: 'grayscale(1) sepia(1) saturate(1.9) hue-rotate(-10deg) contrast(1.18) brightness(0.72)',
  warm: 'sepia(0.72) saturate(1.0) hue-rotate(-8deg) contrast(1.12) brightness(0.78)',
  golden: 'saturate(0.95) contrast(1.15) brightness(0.85)',
};

/** A supplied photograph (from public/photos) with a slow Ken Burns move and a warm grade. */
export const Photo: React.FC<{
  src: string;
  start: number;
  end: number;
  from?: {s: number; x: number; y: number};
  to?: {s: number; x: number; y: number};
  grade?: keyof typeof GRADES;
  position?: string; // object-position, e.g. '50% 40%'
  shade?: number; // extra darkening 0..1 for text legibility
}> = ({src, start, end, from = {s: 1.05, x: 0, y: 0}, to = {s: 1.15, x: 0, y: 0}, grade = 'warm', position = '50% 50%', shade = 0.2}) => {
  const f = useCurrentFrame();
  const ease = (x: number) => x;
  const s = lerp(f, [start, end], [from.s, to.s], ease);
  const x = lerp(f, [start, end], [from.x, to.x], ease);
  const y = lerp(f, [start, end], [from.y, to.y], ease);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#060504'}}>
      <Img
        src={staticFile(`photos/${src}`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: position,
          transform: `translate(${x}px, ${y}px) scale(${s})`,
          filter: GRADES[grade],
        }}
      />
      {/* amber light wash + vignette shading */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(120,60,15,0.18), rgba(40,20,5,0.1))', mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(6,5,4,${shade * 0.4}) 30%, rgba(6,5,4,${0.35 + shade}) 100%)`}} />
    </AbsoluteFill>
  );
};
