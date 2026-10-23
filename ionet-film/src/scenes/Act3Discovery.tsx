import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Globe, NODES} from '../components/Globe';
import {Flare, Starfield} from '../components/Flare';
import {Haze} from '../components/Atmosphere';
import {BrandLogo} from '../components/BrandLogo';
import {C, FONT} from '../theme';
import {envelope, lerp} from '../util';

const D2R = Math.PI / 180;

/** 22–38s · The Discovery — distributed GPU nodes ignite and connect across a dark globe. */
export const Act3Discovery: React.FC = () => {
  const f = useCurrentFrame();
  const lon0 = lerp(f, [0, 495], [-48, 14], (x) => x);
  const tilt = 0.3;
  const r = lerp(f, [0, 200, 330, 495], [290, 370, 370, 392]);
  const cx = lerp(f, [180, 250, 330, 400], [960, 1180, 1180, 960]);
  const cy = 540;
  const ignite = lerp(f, [36, 230], [0, 1.05], (x) => x);
  const links = lerp(f, [100, 340], [0, 1.25], (x) => x);
  const hub = lerp(f, [330, 430], [0, 1.0], (x) => x);
  const dots = lerp(f, [0, 50], [0, 1]);

  // Lagos screen position for the flare
  const lag = NODES[0];
  const lam = (lag.lon - lon0) * D2R;
  const x3 = Math.cos(lag.lat * D2R) * Math.sin(lam);
  const y3 = Math.sin(lag.lat * D2R);
  const z3 = Math.cos(lag.lat * D2R) * Math.cos(lam);
  const ly = y3 * Math.cos(tilt) - z3 * Math.sin(tilt);
  const lx = cx + x3 * r;
  const lyS = cy - ly * r;
  const igniteFlare = Math.max(0, 1 - Math.abs(f - 44) / 18) * 0.7;
  const climax = lerp(f, [395, 425, 470], [0, 1, 0.35]);

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #17120d 0%, #060504 70%)'}}>
      <Starfield frame={f} opacity={lerp(f, [0, 60], [0, 0.8])} />
      <AbsoluteFill style={{transform: `scale(${lerp(f, [0, 495], [1.0, 1.06], (x) => x)})`}}>
        <Globe frame={f} cx={cx} cy={cy} r={r} lon0={lon0} tilt={tilt} dots={dots} ignite={ignite} links={links} hub={hub} labels={lerp(f, [150, 210], [0, 1])} rim={lerp(f, [0, 60], [0.2, 1])} />
        <Flare x={lx} y={lyS} intensity={igniteFlare + climax} scale={0.6 + climax * 0.5} />
      </AbsoluteFill>
      <Haze opacity={0.12} seed={12} color={C.gold} />

      {/* io.net introduction — appears with the voiceover line */}
      <div
        style={{
          position: 'absolute',
          left: 170,
          top: 390,
          opacity: envelope(f, 205, 335, 24, 22),
          transform: `translateY(${lerp(f, [205, 335], [14, -8], (x) => x)}px)`,
        }}
      >
        <BrandLogo scale={0.62} glow={0.8} sweep={lerp(f, [215, 265], [0, 1], (x) => x)} />
        <div style={{width: lerp(f, [225, 270], [0, 360]), height: 1, background: C.gold, margin: '26px 0 22px'}} />
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
