import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Camera} from '../components/Frame';
import {Workstation} from '../components/Workstation';
import {Photo} from '../components/Photo';
import {Flare} from '../components/Flare';
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

      {/* Shot B — first light over Lagos: the city her model is meant to protect */}
      <AbsoluteFill style={{opacity: envelope(f, 94, 156, 10, 10)}}>
        <Photo src="lagos-aerial-dawn.jpg" start={94} end={156} grade="warm" position="50% 40%" from={{s: 1.05, x: 0, y: 10}} to={{s: 1.12, x: 0, y: -10}} shade={0.05} />
        <Flare x={1240} y={240} intensity={0.45} scale={1.1} />
        <DustMotes count={30} seed={31} opacity={0.4} />
      </AbsoluteFill>

      {/* Shot C — the dashboard: training completes */}
      <AbsoluteFill style={{opacity: envelope(f, 148, 226, 10, 12), background: C.black}}>
        <Camera start={148} duration={78} from={{s: 1.02, x: 0, y: 0}} to={{s: 1.12, x: -40, y: 10}}>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{transform: 'scale(0.98)', boxShadow: '0 0 200px rgba(232,138,42,0.35)'}}>{screen}</div>
          </AbsoluteFill>
        </Camera>
      </AbsoluteFill>

      {/* Shot D1 — the stakes: rainwater on a Lagos road */}
      <AbsoluteFill style={{opacity: envelope(f, 216, 262, 10, 12)}}>
        <Photo src="lagos-rain-road.jpg" start={216} end={262} grade="warm" position="50% 60%" from={{s: 1.04, x: 0, y: 0}} to={{s: 1.12, x: 0, y: -12}} shade={0.15} />
        <RainStreaks count={180} seed={12} opacity={0.25} speed={30} />
      </AbsoluteFill>

      {/* Shot D — the flood-risk visualization */}
      <AbsoluteFill style={{opacity: envelope(f, 252, 400, 12, 1), background: C.black}}>
        <Camera start={252} duration={148} from={{s: 1.0, x: 0, y: 0}} to={{s: 1.1, x: 0, y: 0}}>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{transform: 'scale(0.98)', boxShadow: '0 0 220px rgba(232,138,42,0.35)'}}>
              <FloodMap frame={f} reveal={lerp(f, [258, 340], [0, 1], (x) => x)} />
            </div>
          </AbsoluteFill>
        </Camera>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
