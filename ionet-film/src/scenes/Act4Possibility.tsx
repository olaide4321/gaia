import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Camera} from '../components/Frame';
import {Workstation} from '../components/Workstation';
import {Engineer} from '../components/Engineer';
import {FloodMap, TrainingScreen} from '../components/Screen';
import {DustMotes} from '../components/Atmosphere';
import {RainStreaks} from '../components/Rain';
import {C} from '../theme';
import {envelope, lerp} from '../util';

/** 38–50s · The Possibility — her (fictional) workload runs; a flood-risk map appears. */
export const Act4Possibility: React.FC = () => {
  const f = useCurrentFrame();
  const progress = lerp(f, [0, 215], [0.23, 1], (x) => 1 - (1 - x) ** 2);
  const logs = lerp(f, [4, 200], [1, 5.2], (x) => x);
  const screen = <TrainingScreen frame={f} mode="running" progress={progress} logReveal={logs} />;

  return (
    <AbsoluteFill style={{background: C.black}}>
      {/* Shot A — back at her desk; the rain is easing, first light over the lagoon */}
      <AbsoluteFill style={{opacity: envelope(f, 0, 104, 16, 12)}}>
        <Camera duration={104} from={{s: 1.0, x: 0, y: 0}} to={{s: 1.08, x: -50, y: -10}}>
          <Workstation frame={f + 300} screen={screen} light={1.25} lean={lerp(f, [10, 80], [0, 1])} dawn={lerp(f, [0, 104], [0.2, 0.6])} rain={0.35} />
        </Camera>
      </AbsoluteFill>

      {/* Shot B — close on her face, now warm and determined */}
      <AbsoluteFill style={{opacity: envelope(f, 94, 156, 10, 10), background: C.black}}>
        <Camera duration={62} from={{s: 1.0, x: 0, y: 0}} to={{s: 1.07, x: -20, y: 6}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 85% 40%, #5a3818 0%, #120c08 60%)'}} />
          <div style={{position: 'absolute', left: -120, top: -400, width: 1840, height: 2640}}>
            <Engineer frame={f} light={1.5} leanForward={0.4} blinkAt={[128]} />
          </div>
          <DustMotes count={40} seed={31} opacity={0.6} />
          <RainStreaks count={40} seed={5} opacity={0.06} speed={20} />
        </Camera>
      </AbsoluteFill>

      {/* Shot C — the dashboard: training completes */}
      <AbsoluteFill style={{opacity: envelope(f, 148, 226, 10, 12), background: C.black}}>
        <Camera duration={78} from={{s: 1.02, x: 0, y: 0}} to={{s: 1.12, x: -40, y: 10}}>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{transform: 'scale(0.98)', boxShadow: '0 0 200px rgba(232,138,42,0.35)'}}>{screen}</div>
          </AbsoluteFill>
        </Camera>
      </AbsoluteFill>

      {/* Shot D — the flood-risk visualization */}
      <AbsoluteFill style={{opacity: envelope(f, 216, 400, 12, 1), background: C.black}}>
        <Camera duration={160} from={{s: 1.0, x: 0, y: 0}} to={{s: 1.1, x: 0, y: 0}}>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{transform: 'scale(0.98)', boxShadow: '0 0 220px rgba(232,138,42,0.35)'}}>
              <FloodMap frame={f} reveal={lerp(f, [224, 330], [0, 1], (x) => x)} />
            </div>
          </AbsoluteFill>
        </Camera>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
