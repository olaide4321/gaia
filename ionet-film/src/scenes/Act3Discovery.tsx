import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFrame} from '../time';
import {Globe, NODES} from '../components/Globe';
import {Flare, Starfield} from '../components/Flare';
import {Haze} from '../components/Atmosphere';
import {BrandLogo} from '../components/BrandLogo';
import {Photo} from '../components/Photo';
import {C, FONT} from '../theme';
import {envelope, lerp} from '../util';

const D2R = Math.PI / 180;

/** The Discovery — distributed GPU nodes ignite and connect across a dark globe. */
export const Act3Discovery: React.FC = () => {
  const f = useFrame();
  const lon0 = lerp(f, [0, 495], [-48, 14], (x) => x);
  const tilt = 0.3;
  const r = lerp(f, [70, 200, 330, 495], [300, 370, 370, 392]);
  const cx = lerp(f, [180, 250, 330, 400], [960, 1180, 1180, 960]);
  const cy = 540;
  const ignite = lerp(f, [104, 240], [0, 1.05], (x) => x);
  const links = lerp(f, [140, 345], [0, 1.25], (x) => x);
  const hub = lerp(f, [330, 430], [0, 1.0], (x) => x);
  const dots = lerp(f, [72, 118], [0, 1]);
  const globeIn = lerp(f, [68, 108], [0, 1]);

  // Lagos screen position for the flare
  const lag = NODES[0];
  const lam = (lag.lon - lon0) * D2R;
  const x3 = Math.cos(lag.lat * D2R) * Math.sin(lam);
  const y3 = Math.sin(lag.lat * D2R);
  const z3 = Math.cos(lag.lat * D2R) * Math.cos(lam);
  const ly = y3 * Math.cos(tilt) - z3 * Math.sin(tilt);
  const lx = cx + x3 * r;
  const lyS = cy - ly * r;
  const igniteFlare = Math.max(0, 1 - Math.abs(f - 110) / 18) * 0.7;
  const climax = lerp(f, [395, 425, 470], [0, 1, 0.35]);

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #3a3024 0%, #1a1611 75%)'}}>
      <Starfield frame={f} opacity={lerp(f, [70, 120], [0, 0.8])} />
      <AbsoluteFill style={{opacity: globeIn, transform: `scale(${lerp(f, [0, 495], [1.0, 1.06], (x) => x)})`}}>
        <Globe frame={f} cx={cx} cy={cy} r={r} lon0={lon0} tilt={tilt} dots={dots} ignite={ignite} links={links} hub={hub} labels={lerp(f, [150, 210], [0, 1])} rim={lerp(f, [70, 130], [0.2, 1])} />
        <Flare x={lx} y={lyS} intensity={igniteFlare + climax} scale={0.6 + climax * 0.5} />
      </AbsoluteFill>
      <Haze opacity={0.12} seed={12} color={C.gold} />

      {/* Opening: scattered GPUs, linked by streams of light */}
      <AbsoluteFill style={{opacity: envelope(f, 0, 104, 16, 34)}}>
        <Photo src="gpus-connected.jpg" start={0} end={104} grade="amber" from={{s: 1.02, x: 0, y: 0}} to={{s: 1.22, x: 0, y: -10}} shade={0.1} />
        <Flare x={960} y={470} intensity={lerp(f, [40, 90, 104], [0, 0.5, 0.9])} scale={0.8} />
      </AbsoluteFill>

      {/* io.net introduction — appears with the voiceover line */}
      <div
        style={{
          position: 'absolute',
          left: 170,
          top: 390,
          opacity: envelope(f, 149, 335, 20, 22),
          transform: `translateY(${lerp(f, [149, 335], [14, -8], (x) => x)}px)`,
        }}
      >
        <BrandLogo scale={0.62} glow={0.8} sweep={lerp(f, [159, 209], [0, 1], (x) => x)} />
        <div style={{width: lerp(f, [169, 214], [0, 360]), height: 1, background: C.gold, margin: '26px 0 22px'}} />
        <div style={{fontFamily: FONT.sans, fontSize: 20, letterSpacing: 7, color: C.ivoryDim, fontWeight: 300}}>DISTRIBUTED GPU COMPUTE</div>
      </div>

      {/* Climax: compute converging on one engineer's project in Lagos */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 182,
          textAlign: 'center',
          opacity: envelope(f, 360, 480, 20, 20),
          fontFamily: FONT.sans,
          fontSize: 17,
          letterSpacing: 9,
          color: C.gold,
        }}
      >
        SCATTERED RESOURCES · WORKING TOGETHER
      </div>
    </AbsoluteFill>
  );
};
