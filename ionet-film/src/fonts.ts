import {continueRender, delayRender} from 'remotion';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';

// Fonts are bundled from npm (no network). Hold the render until they are ready.
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading fonts');
  Promise.all([
    document.fonts.load('500 40px "Cormorant Garamond"'),
    document.fonts.load('italic 500 40px "Cormorant Garamond"'),
    document.fonts.load('300 40px "Inter"'),
    document.fonts.load('400 40px "Inter"'),
    document.fonts.load('500 40px "Inter"'),
    document.fonts.load('600 40px "Inter"'),
    document.fonts.load('400 40px "JetBrains Mono"'),
    document.fonts.load('600 40px "JetBrains Mono"'),
  ])
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
}
