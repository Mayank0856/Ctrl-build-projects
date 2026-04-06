const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');
const { generateVideoScript } = require('./scriptGenerator');
const { generateSpeech } = require('./ttsService');
const { getAudioDurationInSeconds } = require('get-audio-duration');

const FPS = 30;

exports.createVideoJob = async (fileText, studentName, jobId) => {
  try {
    // 1. Generate Script
    const scenes = await generateVideoScript(fileText, studentName);
    
    // 2. Generate Audio and calculate frames per scene
    let totalFrames = 0;
    const processedScenes = [];
    
    for (let scene of scenes) {
      const audioPath = await generateSpeech(scene.dialogue);
      let audioDurationSec = 5; // Default for mock mode
      let audioUrl = "";

      if (audioPath) {
        audioDurationSec = await getAudioDurationInSeconds(audioPath);
        audioUrl = `http://localhost:5000/audio/${path.basename(audioPath)}`;
      }

      // Wait to pause briefly after each sentence
      const sceneDurationSec = audioDurationSec + 0.5; 
      const sceneFrames = Math.ceil(sceneDurationSec * FPS);
      
      processedScenes.push({
        ...scene,
        audioUrl,
        audioPath,
        sceneFrames,
        startFrame: totalFrames,
      });
      totalFrames += sceneFrames;
    }

    const inputProps = {
      scenes: processedScenes,
      fps: FPS,
    };

    // 3. Render video
    const compositionId = 'TutorExplainer';
    // The entry file for the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.resolve(__dirname, '../remotion/index.js'),
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps,
    });

    const outputLocation = path.join(__dirname, '..', 'public', 'videos', `${jobId}.mp4`);
    
    if (!fs.existsSync(path.dirname(outputLocation))) {
      fs.mkdirSync(path.dirname(outputLocation), { recursive: true });
    }

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps,
    });

    return `/videos/${jobId}.mp4`;

  } catch (error) {
    console.error('Video rendering pipeline failed:', error);
    throw error;
  }
};
