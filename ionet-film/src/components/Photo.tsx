import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {useFrame} from '../time';
import {lerp} from '../util';

/**
 * Light colour grades: photos stay bright and close to their natural colour,
 * with just enough treatment to sit together in one film.
 *  - amber:  tames strong blue/teal light so it doesn't dominate
 *  - warm:   a touch of warmth, otherwise natural
 *  - golden: for photos that are already gold; a little lift
 *  - hope:   the brightest grade, for the turn toward optimism
 */
const GRADES = {
  amber: 'saturate(0.8) sepia(0.22) brightness(1.12) contrast(1.05)',
  warm: 'sepia(0.12) saturate(1.02) brightness(1.1) contrast(1.04)',
  golden: 'saturate(1.0) brightness(1.15) contrast(1.04)',
  hope: 'sepia(0.15) saturate(1.0) brightness(1.25) contrast(1.03)',
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
  const f = useFrame();
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
      {/* gentle edge shading only (shade adds a little extra for text legibility) */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(6,5,4,0) 55%, rgba(6,5,4,${0.1 + shade * 0.5}) 100%)`}} />
    </AbsoluteFill>
  );
};
