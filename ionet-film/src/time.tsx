import React, {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';

/**
 * Each act is designed on its own timeline ("designFrames" in narration.json) and played back
 * at the speed needed to fit its slot in the film. Scenes and components read time through
 * useFrame(), which returns the frame on that design timeline. Outside an act (subtitles,
 * letterbox, audio) the speed is 1, so useFrame() equals useCurrentFrame().
 */
const SceneSpeed = createContext(1);

export const SceneTime: React.FC<{speed: number; children: React.ReactNode}> = ({speed, children}) => (
  <SceneSpeed.Provider value={speed}>{children}</SceneSpeed.Provider>
);

export const useFrame = () => useCurrentFrame() * useContext(SceneSpeed);
