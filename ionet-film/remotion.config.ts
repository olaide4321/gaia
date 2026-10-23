import {Config} from '@remotion/cli/config';

// Rendering defaults for `npx remotion render`.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');

// Optional: use an already-installed Chrome/Chromium instead of letting Remotion download one.
// Example: REMOTION_BROWSER_EXECUTABLE=/path/to/chrome npm run render
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
