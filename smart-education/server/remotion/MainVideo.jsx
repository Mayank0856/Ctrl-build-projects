import React from 'react';
import { AbsoluteFill, Sequence, Audio, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { Scene } from './Scene.jsx';

export const MainVideo = ({ scenes }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      {scenes.map((scene, index) => {
        return (
          <Sequence
            key={index}
            from={scene.startFrame}
            durationInFrames={scene.sceneFrames}
          >
            <AbsoluteFill>
              {scene.audioUrl && <Audio src={scene.audioUrl} />}
              <Scene scene={scene} index={index} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
