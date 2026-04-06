const dotenv = require('dotenv');
dotenv.config();

const { createVideoJob } = require('./services/videoService');

async function test() {
  console.log("Starting test video generation...");
  try {
    const text = "A database is an organized collection of structured information, or data, typically stored electronically in a computer system.";
    const url = await createVideoJob(text, "Demo", "test_video");
    console.log("Video generated at:", url);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

test();
