// Writes subtitles/the-worlds-idle-machines.srt and .vtt from src/data/narration.json,
// the same timing data that drives the burned-in subtitles.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const n = JSON.parse(fs.readFileSync(path.join(root, 'src/data/narration.json'), 'utf8'));

const ts = (frame, sep) => {
  const ms = Math.round((frame / n.fps) * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  const r = ms % 1000;
  const p = (x, k = 2) => String(x).padStart(k, '0');
  return `${p(h)}:${p(m)}:${p(s)}${sep}${p(r, 3)}`;
};

const srt = n.lines.map((l, i) => `${i + 1}\n${ts(l.from, ',')} --> ${ts(l.to, ',')}\n${l.text}\n`).join('\n');
const vtt = 'WEBVTT\n\n' + n.lines.map((l) => `${l.id}\n${ts(l.from, '.')} --> ${ts(l.to, '.')}\n${l.text}\n`).join('\n');

const dir = path.join(root, 'subtitles');
fs.mkdirSync(dir, {recursive: true});
fs.writeFileSync(path.join(dir, 'the-worlds-idle-machines.srt'), srt);
fs.writeFileSync(path.join(dir, 'the-worlds-idle-machines.vtt'), vtt);
console.log(`Subtitles written: subtitles/the-worlds-idle-machines.{srt,vtt} (${n.lines.length} cues)`);
