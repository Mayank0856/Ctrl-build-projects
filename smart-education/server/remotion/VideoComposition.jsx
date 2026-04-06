import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo.jsx';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="TutorExplainer"
        component={MainVideo}
        durationInFrames={300} // Default value, will be overridden by inputProps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: [
            {
              title: "Welcome",
              bullets: ["Hello world"],
              audioUrl: "",
              sceneFrames: 300,
              startFrame: 0,
            }
          ]
        }}
      />
    </>
  );
};
