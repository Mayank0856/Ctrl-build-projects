import React, { useEffect, useState } from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, Img } from 'remotion';

// If @remotion/lottie fails to bundle, we can fallback to a CSS animated avatar.
// For the hackathon demo, we will use a pseudo-animated 2D avatar using simple remotion bouncing/speaking.

export const Scene = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro animation for text
  const textScale = spring({
    frame,
    fps,
    config: {
      damping: 12,
    },
  });

  const textOpacity = Math.min(1, frame / 15);

  // Simple lip sync simulation for character (bounces up and down slightly while speaking)
  // Stop speaking 15 frames before the end of the scene
  const isSpeaking = frame < scene.sceneFrames - 15;
  const mouthOpen = isSpeaking && frame % 10 < 5;
  const characterBounce = isSpeaking ? Math.sin(frame / 3) * 5 : 0;

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'row', padding: '60px', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* Left Column: Text & Bullets */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: textOpacity, transform: `scale(${textScale})` }}>
        <h1 style={{ fontSize: '70px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '40px' }}>
          {scene.title}
        </h1>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {scene.bullets && scene.bullets.map((bullet, i) => {
            // Animate bullets sequentially
            const bulletDelay = i * 20;
            const bulletScale = spring({ frame: frame - bulletDelay, fps, config: { damping: 10 } });
            const bulletOpacity = Math.min(1, Math.max(0, (frame - bulletDelay) / 10));

            return (
              <li key={i} style={{ fontSize: '40px', marginBottom: '20px', display: 'flex', alignItems: 'center', opacity: bulletOpacity, transform: `translateX(${100 - bulletScale*100}px)` }}>
                <span style={{ color: '#0ea5e9', marginRight: '20px' }}>★</span>
                {bullet}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right Column: 2D Tutor Character */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Tutor Container */}
        <div style={{ 
          position: 'relative', 
          width: '400px', 
          height: '400px', 
          transform: `translateY(${characterBounce}px)`,
          transition: 'transform 0.1s'
        }}>
          {/* Mock 2D Character Body */}
          <div style={{ position: 'absolute', bottom: 0, width: '300px', height: '300px', backgroundColor: '#e2e8f0', borderRadius: '40px', left: '50px', boxShadow: 'inset 0 -20px 0 rgba(0,0,0,0.1)' }}></div>
          
          {/* Head */}
          <div style={{ position: 'absolute', top: '20px', left: '100px', width: '200px', height: '200px', backgroundColor: '#f1f5f9', borderRadius: '50%', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
            
            {/* Eyes */}
            <div style={{ position: 'absolute', top: '80px', left: '40px', width: '25px', height: '25px', backgroundColor: '#334155', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', top: '80px', right: '40px', width: '25px', height: '25px', backgroundColor: '#334155', borderRadius: '50%' }}></div>
            
            {/* Mouth (Lip Sync) */}
            <div style={{ 
              position: 'absolute', 
              top: '140px', 
              left: '80px', 
              width: '40px', 
              height: mouthOpen ? '30px' : '10px', 
              backgroundColor: '#ef4444', 
              borderRadius: mouthOpen ? '20px' : '5px',
              transition: 'height 0.1s'
            }}></div>
          </div>
          
          {/* Action indicator */}
          {scene.animationHint && (
            <div style={{ position: 'absolute', top: '-40px', right: '0', backgroundColor: '#3b82f6', padding: '10px 20px', borderRadius: '20px', fontSize: '24px', fontWeight: 'bold' }}>
              {scene.animationHint.toUpperCase()}
            </div>
          )}
        </div>

      </div>

    </AbsoluteFill>
  );
};
