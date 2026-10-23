// Combines the per-line narration files (public/voiceover/vo-01.wav … vo-10.wav) into one
// continuous, film-length track: public/voiceover/assembled.wav.
//
// Why: Remotion mixes each <Audio> clip as a separate input, and the mixer re-balances its
// volume for a couple of seconds whenever a clip ends. That made lines starting right after
// another line come out much quieter. One steady track avoids it.
//
// Uses the ffmpeg bundled with Remotion (`npx remotion ffmpeg`), so nothing extra to install.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const n = JSON.parse(fs.readFileSync(path.join(root, 'src/data/narration.json'), 'utf8'));
const dir = path.join(root, 'public/voiceover');
const duration = n.durationInFrames / n.fps;

const lines = n.lines
  .map((l) => ({...l, file: ['wav', 'mp3'].map((ext) => path.join(dir, `${l.id}.${ext}`)).find((f) => fs.existsSync(f))}))
  .filter((l) => l.file);

if (lines.length === 0) {
  console.log('Voiceover: no vo-XX files in public/voiceover/, skipping (subtitles only).');
  process.exit(0);
}
if (lines.length < n.lines.length) {
  const missing = n.lines.filter((l) => !lines.some((x) => x.id === l.id)).map((l) => l.id);
  console.warn(`Voiceover: missing ${missing.join(', ')}; assembling the ${lines.length} lines found.`);
}

const inputs = lines.flatMap((l) => ['-i', l.file]);
const delays = lines.map((l, i) => `[${i}]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round((l.from / n.fps) * 1000)}:all=1[a${i}]`);
const mix = `${lines.map((_, i) => `[a${i}]`).join('')}amix=inputs=${lines.length}:normalize=0:dropout_transition=0,apad=whole_dur=${duration},atrim=0:${duration}[out]`;
const out = path.join(dir, 'assembled.wav');

execFileSync(
  'npx',
  ['remotion', 'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', ...inputs, '-filter_complex', [...delays, mix].join(';'), '-map', '[out]', '-c:a', 'pcm_s16le', out],
  {cwd: root, stdio: 'inherit'},
);
console.log(`Voiceover assembled: public/voiceover/assembled.wav (${lines.length} lines, ${duration.toFixed(1)} s)`);
