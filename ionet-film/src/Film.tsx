import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import narration from './data/narration.json';
import {SCORE, VOICEOVER} from './config';
import {Act1Problem} from './scenes/Act1Problem';
import {Act2Idle} from './scenes/Act2Idle';
import {Act3Discovery} from './scenes/Act3Discovery';
import {Act4Possibility} from './scenes/Act4Possibility';
import {Act5Reveal} from './scenes/Act5Reveal';
import {ColorGrade, FilmGrain, Vignette} from './components/Atmosphere';
import {Letterbox, Subtitles} from './components/Frame';
import {C} from './theme';

const OVERLAP = 15; // frames each act keeps playing under the next one (cross-dissolve)

const SCENES: Record<string, React.FC> = {
  problem: Act1Problem,
  idle: Act2Idle,
  discovery: Act3Discovery,
  possibility: Act4Possibility,
  reveal: Act5Reveal,
};

const Voiceover: React.FC = () => {
  if (VOICEOVER.mode === 'full') {
    return <Audio src={staticFile(`voiceover/full.${VOICEOVER.extension}`)} volume={VOICEOVER.volume} />;
  }
  if (VOICEOVER.mode === 'lines') {
    return (
      <>
        {narration.lines.map((l) => (
          <Sequence key={l.id} from={l.from} durationInFrames={narration.durationInFrames - l.from} layout="none">
            <Audio src={staticFile(`voiceover/${l.id}.${VOICEOVER.extension}`)} volume={VOICEOVER.volume} />
          </Sequence>
        ))}
      </>
    );
  }
  return null;
};

export const Film: React.FC = () => {
  const voiced = VOICEOVER.mode !== 'none';
  return (
    <AbsoluteFill style={{background: C.black}}>
      {narration.acts.map((act) => {
        const Scene = SCENES[act.id];
        const last = act.to >= narration.durationInFrames;
        return (
          <Sequence key={act.id} from={act.from} durationInFrames={act.to - act.from + (last ? 0 : OVERLAP)} name={act.title}>
            <Scene />
          </Sequence>
        );
      })}
      <ColorGrade />
      <Vignette />
      <FilmGrain />
      <Letterbox />
      <Subtitles />
      {SCORE.enabled ? (
        <Audio
          src={staticFile('audio/score.wav')}
          volume={(f) => {
            if (!voiced) return SCORE.volume;
            const speaking = narration.lines.some((l) => f >= l.from - 6 && f < l.to + 6);
            return speaking ? SCORE.duckedVolume : SCORE.volume;
          }}
        />
      ) : null}
      <Voiceover />
    </AbsoluteFill>
  );
};

