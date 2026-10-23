import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Camera, LocationTag} from '../components/Frame';
import {Photo} from '../components/Photo';
import {RainStreaks} from '../components/Rain';
import {Haze} from '../components/Atmosphere';
import {Workstation} from '../components/Workstation';
import {Engineer} from '../components/Engineer';
import {TrainingScreen} from '../components/Screen';
import {C, FONT} from '../theme';
import {envelope, lerp} from '../util';
import {FILM} from '../config';

const flash = (f: number, at: number) => Math.max(0, 1 - Math.abs(f - at) / 3) + Math.max(0, 0.6 - Math.abs(f - at - 7) / 3);

/** 0–10s · The Problem — rainy Lagos at night, a stalled AI project. */
export const Act1Problem: React.FC = () => {
  const f = useCurrentFrame();
  const lightning = flash(f, 82) + flash(f, 214) * 0.7;
  const logs = lerp(f, [120, 180, 262], [1, 4, 5], (x) => x);
  const stalled = <TrainingScreen frame={f} mode="stalled" progress={0.23} logReveal={logs} />;

  return (
    <AbsoluteFill style={{background: C.black}}>
      {/* Shot A1 — rain over the city at night, title */}
      <AbsoluteFill style={{opacity: envelope(f, -1, 76, 1, 12)}}>
        <Photo src="rain-night-city.jpg" start={0} end={76} grade="amber" from={{s: 1.04, x: 0, y: 10}} to={{s: 1.14, x: -30, y: 0}} shade={0.15} />
        <RainStreaks count={500} seed={1} opacity={0.45} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div
            style={{
              opacity: envelope(f, 14, 74, 18, 12),
              fontFamily: FONT.serif,
              fontSize: 84,
              letterSpacing: lerp(f, [14, 76], [10, 15], (x) => x),
              color: C.ivory,
              fontWeight: 500,
              textShadow: '0 0 40px rgba(232,138,42,0.45), 0 2px 20px rgba(0,0,0,0.8)',
            }}
          >
            {FILM.title}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Shot A2 — Lagos at night (Civic Centre, Ozumba Mbadiwe), storm light */}
      <AbsoluteFill style={{opacity: envelope(f, 64, 130, 12, 14)}}>
        <Photo src="lagos-night.jpg" start={64} end={130} grade="warm" from={{s: 1.06, x: 20, y: 0}} to={{s: 1.16, x: -40, y: -6}} shade={0.1} />
        <Haze opacity={0.18} seed={2} />
        <RainStreaks count={700} seed={3} opacity={0.5} />
        <AbsoluteFill style={{background: `rgba(255,236,205,${lightning * 0.5})`, mixBlendMode: 'screen'}} />
        <LocationTag start={72} end={128} place="Lagos, Nigeria" detail="03:14 WAT · HEAVY RAIN" />
      </AbsoluteFill>

      {/* Shot B — interior: the engineer at her desk */}
      <AbsoluteFill style={{opacity: envelope(f, 116, 210, 14, 12)}}>
        <Camera start={116} duration={95} from={{s: 1.06, x: 30, y: 0}} to={{s: 1.0, x: -20, y: 0}} shake={1.2}>
          <Workstation frame={f} screen={stalled} light={0.95} flicker={0.2} lightning={lightning} />
        </Camera>
      </AbsoluteFill>

      {/* Shot C — close-up: her face in the monitor glow */}
      <AbsoluteFill style={{opacity: envelope(f, 200, 252, 8, 10), background: C.black}}>
        <Camera start={200} duration={52} from={{s: 1.0, x: 0, y: 0}} to={{s: 1.06, x: -10, y: 0}} shake={2}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 85% 40%, #3a2412 0%, #0b0806 55%)'}} />
          <div style={{position: 'absolute', left: -120, top: -400, width: 1840, height: 2640}}>
            <Engineer frame={f} light={1.2 + lightning * 0.6} flicker={0.35} blinkAt={[226]} />
          </div>
          <RainStreaks count={120} seed={9} opacity={0.12} speed={26} />
        </Camera>
      </AbsoluteFill>

      {/* Shot D — the screen: training paused */}
      <AbsoluteFill style={{opacity: envelope(f, 244, 330, 8, 1), background: C.black}}>
        <Camera start={244} duration={86} from={{s: 1.0, x: 0, y: 0}} to={{s: 1.12, x: 40, y: 30}}>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{transform: 'scale(0.98)', boxShadow: '0 0 160px rgba(232,138,42,0.3)'}}>{stalled}</div>
          </AbsoluteFill>
          {/* rain reflected on the glass of the screen */}
          <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.5}}>
            <RainStreaks count={160} seed={6} opacity={0.35} speed={18} />
          </AbsoluteFill>
        </Camera>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
