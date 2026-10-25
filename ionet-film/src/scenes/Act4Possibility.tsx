import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFrame} from '../time';
import {Camera} from '../components/Frame';
import {Photo} from '../components/Photo';
import {Flare} from '../components/Flare';
import {FloodMap, TrainingScreen} from '../components/Screen';
import {DustMotes} from '../components/Atmosphere';
import {RainStreaks} from '../components/Rain';
import {C} from '../theme';
import {envelope, lerp} from '../util';

/** The Possibility — his (fictional) workload runs; a flood-risk map appears. */
export const Act4Possibility: React.FC = () => {
  const f = useFrame();
  const progress = lerp(f, [0, 215], [0.23, 1], (x) => 1 - (1 - x) ** 2);
  const logs = lerp(f, [4, 200], [1, 5.2], (x) => x);
  const screen = <TrainingScreen frame={f} mode="running" progress={progress} logReveal={logs} />;

  return (
    <AbsoluteFill style={{background: C.black}}>
      {/* Shot A — back at his desk; the job is running again */}
      <AbsoluteFill style={{opacity: envelope(f, 0, 104, 16, 12)}}>
        <Photo src="engineer.jpg" start={0} end={104} grade="hope" from={{s: 1.2, x: -220, y: 10}} to={{s: 1.32, x: -270, y: 10}} shade={0.05} />
        <Flare x={1500} y={520} intensity={lerp(f, [0, 60], [0.15, 0.45])} scale={0.9} />
        <DustMotes count={30} seed={22} opacity={0.5} />
      </AbsoluteFill>

      {/* Shot B — first light over Lagos: the city his model is meant to protect */}
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

      {/* Shot D — the flood-risk visualization */}
      <AbsoluteFill style={{opacity: envelope(f, 216, 400, 12, 1), background: C.black}}>
        <Camera start={216} duration={148} from={{s: 1.0, x: 0, y: 0}} to={{s: 1.1, x: 0, y: 0}}>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{transform: 'scale(0.98)', boxShadow: '0 0 220px rgba(232,138,42,0.35)'}}>
              <FloodMap frame={f} reveal={lerp(f, [222, 304], [0, 1], (x) => x)} />
            </div>
          </AbsoluteFill>
        </Camera>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
