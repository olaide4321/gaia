import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {Film} from './Film';
import {FILM} from './config';
import narration from './data/narration.json';

export const Root: React.FC = () => (
  <Composition
    id="IdleMachines"
    component={Film}
    durationInFrames={narration.durationInFrames}
    fps={FILM.fps}
    width={FILM.width}
    height={FILM.height}
  />
);
