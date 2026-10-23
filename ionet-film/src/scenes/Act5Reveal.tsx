import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Globe} from '../components/Globe';
import {FloodMap} from '../components/Screen';
import {Flare, Starfield} from '../components/Flare';
import {BrandLogo} from '../components/BrandLogo';
import {Photo} from '../components/Photo';
import {C, FONT} from '../theme';
import {envelope, lerp} from '../util';

/** 50–60s · The Reveal — pull back to the glowing network, then the io.net end card. */
export const Act5Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const ease = (x: number) => 1 - (1 - x) ** 3;
  const r = lerp(f, [78, 170], [1100, 400], ease) * lerp(f, [150, 210], [1, 0.85]);
  const lon0 = lerp(f, [0, 300], [3.4, 46], (x) => x);
  const tilt = lerp(f, [78, 170], [6.45 * (Math.PI / 180), 0.32]);
  const globeO = lerp(f, [0, 20], [0, 1]) * lerp(f, [150, 205], [1, 0.22]);
  const logoIn = lerp(f, [150, 200], [0, 1]);
  const tagIn = envelope(f, 200, 300, 26, 1);
  const end = lerp(f, [282, 299], [1, 0], (x) => x);

  return (
    <AbsoluteFill style={{background: C.black}}>
      <AbsoluteFill style={{opacity: end}}>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #1a140e 0%, #060504 70%)'}} />
        <Starfield frame={f + 500} opacity={lerp(f, [20, 90], [0, 0.7])} />
        <AbsoluteFill style={{opacity: globeO}}>
          <Globe frame={f + 500} cx={960} cy={540} r={r} lon0={lon0} tilt={tilt} dots={1} ignite={1.1} links={1.3} hub={1} labels={lerp(f, [60, 110], [0, 0.8]) * lerp(f, [140, 170], [1, 0])} rim={1} />
        </AbsoluteFill>

        {/* pull back: the living network, seen from orbit */}
        <AbsoluteFill style={{opacity: envelope(f, 8, 112, 18, 32)}}>
          <Photo src="network-surface.jpg" start={8} end={112} grade="golden" from={{s: 1.45, x: 0, y: 40}} to={{s: 1.02, x: 0, y: 0}} shade={0.05} />
        </AbsoluteFill>

        {/* end-card backdrop: a golden globe beneath the logo */}
        <AbsoluteFill style={{opacity: lerp(f, [150, 215], [0, 0.5])}}>
          <Photo src="gold-globe.jpg" start={150} end={300} grade="golden" position="50% 30%" from={{s: 1.0, x: 0, y: 120}} to={{s: 1.06, x: 0, y: 100}} shade={0.3} />
        </AbsoluteFill>

        {/* the flood map collapses into the Lagos node */}
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: lerp(f, [0, 26], [1, 0])}}>
          <div style={{transform: `scale(${lerp(f, [0, 26], [1.08, 0.05], (x) => x * x)})`}}>
            <FloodMap frame={f + 360} reveal={1} />
          </div>
        </AbsoluteFill>
        <Flare x={960} y={540} intensity={lerp(f, [0, 14, 40], [0, 0.9, 0])} />

        {/* End card */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 40% 30% at 50% 50%, rgba(6,5,4,0.75), rgba(6,5,4,0) 100%)', opacity: logoIn}} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{opacity: logoIn, transform: `scale(${lerp(f, [150, 290], [0.94, 1.0], (x) => x)})`, filter: `blur(${(1 - logoIn) * 12}px)`, textAlign: 'center', marginTop: -40}}>
            <BrandLogo scale={1} glow={logoIn} sweep={lerp(f, [165, 215], [0, 1], (x) => x)} />
          </div>
          <div style={{width: lerp(f, [185, 235], [0, 520]), height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, marginTop: 34}} />
          <div
            style={{
              opacity: tagIn,
              marginTop: 30,
              fontFamily: FONT.serif,
              fontStyle: 'italic',
              fontSize: 46,
              color: C.ivory,
              letterSpacing: 1,
              transform: `translateY(${(1 - tagIn) * 10}px)`,
            }}
          >
            Distributed GPU compute. Connected for what’s next.
          </div>
        </AbsoluteFill>
        <Flare x={960} y={500} intensity={lerp(f, [158, 172, 230], [0, 0.55, 0])} scale={0.9} />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 158,
            textAlign: 'center',
            fontFamily: FONT.sans,
            fontSize: 15,
            letterSpacing: 2,
            color: C.ivoryDim,
            opacity: envelope(f, 225, 300, 20, 1) * 0.7,
          }}
        >
          Dramatization. The engineer, her project and all on-screen data are fictional.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
