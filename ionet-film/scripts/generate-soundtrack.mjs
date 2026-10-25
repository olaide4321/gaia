// Procedural background music + light sound design for "THE WORLD'S IDLE MACHINES".
// Everything is synthesised from oscillators and noise — no samples, no downloads.
// Output: public/audio/score.wav (48 kHz, 16-bit stereo, film length)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const narration = JSON.parse(fs.readFileSync(path.join(root, 'src/data/narration.json'), 'utf8'));
const SR = 48000;
const DUR = narration.durationInFrames / narration.fps;
const N = Math.round(SR * DUR);
// The score is composed on a "design" timeline: the original 60 s cut, with acts ending at
// 10, 22, 38, 50 and 60 s. W() maps any design time onto the film's actual act boundaries
// (from narration.json), so every cue lands on the matching moment of the current edit.
const DESIGN_ACT_ENDS = [0, 10, 22, 38, 50, 60];
const ACTUAL_ACT_ENDS = [0, ...narration.acts.map((a) => a.to / narration.fps)];
const W = (t) => {
  for (let k = 1; k < DESIGN_ACT_ENDS.length; k++) {
    if (t <= DESIGN_ACT_ENDS[k] || k === DESIGN_ACT_ENDS.length - 1) {
      const [d0, d1, a0, a1] = [DESIGN_ACT_ENDS[k - 1], DESIGN_ACT_ENDS[k], ACTUAL_ACT_ENDS[k - 1], ACTUAL_ACT_ENDS[k]];
      return a0 + ((t - d0) * (a1 - a0)) / (d1 - d0);
    }
  }
  return t;
};
const fr = (frame) => frame / narration.fps; // design frames → design seconds

const L = new Float32Array(N);
const R = new Float32Array(N);
const sendL = new Float32Array(N); // reverb send
const sendR = new Float32Array(N);

// ── utilities ──
let seed = 1337;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** piecewise-linear automation: pts = [[t, v], ...] */
const auto = (designPts) => (t) => {
  const pts = designPts.map(([dt, v]) => [W(dt), v]);
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, v0] = pts[i - 1];
      const [t1, v1] = pts[i];
      return v0 + (v1 - v0) * smooth((t - t0) / (t1 - t0));
    }
  }
  return pts[pts.length - 1][1];
};
const add = (i, l, r, send = 0) => {
  if (i < 0 || i >= N) return;
  L[i] += l;
  R[i] += r;
  sendL[i] += l * send;
  sendR[i] += r * send;
};
class OnePole {
  constructor() { this.z = 0; }
  lp(x, fc) { const a = 1 - Math.exp((-2 * Math.PI * fc) / SR); this.z += a * (x - this.z); return this.z; }
}
class Biquad {
  constructor() { this.x1 = this.x2 = this.y1 = this.y2 = 0; }
  bp(x, f, q) {
    const w = (2 * Math.PI * f) / SR, al = Math.sin(w) / (2 * q), c = Math.cos(w);
    const b0 = al, b2 = -al, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
    const y = (b0 * x + b2 * this.x2 - a1 * this.y1 - a2 * this.y2) / a0;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
  lp(x, f, q = 0.707) {
    const w = (2 * Math.PI * f) / SR, al = Math.sin(w) / (2 * q), c = Math.cos(w);
    const b0 = (1 - c) / 2, b1 = 1 - c, b2 = (1 - c) / 2, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
    const y = (b0 * x + b1 * this.x1 + b2 * this.x2 - a1 * this.y1 - a2 * this.y2) / a0;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

// ── 1. Light rain (opening) ──
{
  const gain = auto([[0, 0], [0.4, 0.28], [9.2, 0.26], [10.4, 0.06], [12, 0.0]]);
  const bL = new Biquad(), bR = new Biquad(), lL = new Biquad(), lR = new Biquad();
  for (let i = 0; i < N; i++) {
    const t = i / SR, g = gain(t);
    if (g <= 0.0005) continue;
    const hiL = bL.bp(noise(), 3800, 0.6), hiR = bR.bp(noise(), 4200, 0.6);
    const loL = lL.lp(noise(), 500), loR = lR.lp(noise(), 520);
    add(i, (hiL * 0.5 + loL * 0.6) * g, (hiR * 0.5 + loR * 0.6) * g, 0.15);
  }
  // individual drops / ticks on the window
  for (let k = 0; k < 900; k++) {
    const t = W(rnd() * 12);
    if (gain(t) < 0.05) continue;
    const i0 = Math.floor(t * SR), f = 2500 + rnd() * 4000, pan = rnd(), amp = 0.04 + rnd() * 0.08;
    const len = Math.floor(SR * 0.012);
    for (let j = 0; j < len; j++) {
      const e = Math.exp(-j / (SR * 0.002));
      const s = Math.sin((2 * Math.PI * f * j) / SR) * e * amp * gain(t) * 2;
      add(i0 + j, s * (1 - pan), s * pan, 0.3);
    }
  }
}

// ── 2. Thunder ──
const thunder = (t0, amp) => {
  const lp1 = new Biquad(), lp2 = new Biquad(), crack = new Biquad();
  const len = Math.floor(SR * 6);
  const i0 = Math.floor(W(t0) * SR);
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const env = (1 - Math.exp(-t / 0.05)) * Math.exp(-t / 1.6) * (0.7 + 0.3 * Math.sin(t * 7 + Math.sin(t * 3) * 2));
    const rumble = lp2.lp(lp1.lp(noise(), 160), 120) * 3.2;
    const cr = t < 0.35 ? crack.bp(noise(), 1800, 0.8) * Math.exp(-t / 0.08) * 0.8 : 0;
    const s = (rumble * env + cr) * amp;
    add(i0 + j, s, s * 0.92, 0.5);
  }
};
thunder(fr(80), 0.2); // one distant roll, timed with the lightning

// ── Instruments ──
/** Soft felt-piano note at an actual film time (seconds). */
const keys = (t0, midi, amp, pan = 0.5, decay = 2.6) => {
  const i0 = Math.floor(t0 * SR);
  const f = mtof(midi);
  const len = Math.floor(SR * decay * 2.2);
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.006) * Math.exp(-t / decay);
    const s =
      (Math.sin(2 * Math.PI * f * t) +
        0.4 * Math.sin(2 * Math.PI * f * 2.001 * t) * Math.exp(-t / 0.9) +
        0.15 * Math.sin(2 * Math.PI * f * 3.003 * t) * Math.exp(-t / 0.4) +
        0.05 * Math.sin(2 * Math.PI * f * 4.2 * t) * Math.exp(-t / 0.15)) *
      env * amp;
    add(i0 + j, s * (1 - pan) * 1.4, s * pan * 1.4, 0.55);
  }
};
/** The same note placed on the design timeline (for cues tied to picture events). */
const piano = (designT0, midi, amp, pan, decay) => keys(W(designT0), midi, amp, pan, decay);

/** Warm, slow-attack pad chord between two actual times. */
const pad = (t0, t1, midis, amp, cut, att = 0.9, rel = 1.4) => {
  const i0 = Math.floor(t0 * SR), i1 = Math.min(N, Math.floor((t1 + rel) * SR));
  const voices = [];
  midis.forEach((m) => {
    for (let d = 0; d < 3; d++) voices.push({f: mtof(m) * (1 + (d - 1) * 0.003), ph: rnd(), side: voices.length % 2});
  });
  const fl = [new Biquad(), new Biquad()];
  for (let i = i0; i < i1; i++) {
    const t = i / SR;
    const env = Math.min(1, (t - t0) / att) * (t > t1 ? Math.exp(-(t - t1) / (rel / 3)) : 1);
    let l = 0, r = 0;
    for (const v of voices) {
      v.ph = (v.ph + v.f / SR) % 1;
      const tri = 1 - 4 * Math.abs(v.ph - 0.5); // triangle: softer than a saw
      if (v.side) r += tri; else l += tri;
    }
    const k = (env * amp) / voices.length;
    add(i, fl[0].lp(l, cut, 0.7) * k * 2, fl[1].lp(r, cut, 0.7) * k * 2, 0.6);
  }
};

/** Round sine bass note. */
const bass = (t0, dur, midi, amp) => {
  const i0 = Math.floor(t0 * SR), len = Math.floor((dur + 0.6) * SR), f = mtof(midi);
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.08) * (t > dur ? Math.exp(-(t - dur) / 0.2) : 1);
    const s = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env * amp;
    add(i0 + j, s, s, 0.05);
  }
};

/** Very soft kick, for a gentle pulse. */
const kick = (t0, amp) => {
  const i0 = Math.floor(t0 * SR), len = Math.floor(SR * 0.35);
  let ph = 0;
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    ph += (2 * Math.PI * (48 + 50 * Math.exp(-t / 0.025))) / SR;
    const s = Math.sin(ph) * Math.exp(-t / 0.11) * amp;
    add(i0 + j, s, s, 0.05);
  }
};

/** Light shaker tick. */
const shaker = (t0, amp, pan) => {
  const i0 = Math.floor(t0 * SR), bp = new Biquad();
  for (let j = 0; j < SR * 0.06; j++) {
    const t = j / SR;
    const s = bp.bp(noise(), 7000, 1.2) * Math.min(1, t / 0.004) * Math.exp(-t / 0.018) * amp;
    add(i0 + j, s * (1 - pan) * 1.4, s * pan * 1.4, 0.2);
  }
};

/** Bell / pluck for the melody. */
const bell = (t0, midi, amp, pan = 0.5) => {
  const i0 = Math.floor(t0 * SR), f = mtof(midi), len = Math.floor(SR * 3);
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.003) * Math.exp(-t / 1.1);
    const s = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t / 0.3) + 0.12 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t / 0.1)) * env * amp;
    add(i0 + j, s * (1 - pan) * 1.4, s * pan * 1.4, 0.7);
  }
};

// ── 3. Background music: calm and refreshing, D major, start to end ──
// Bars are 2.8 s (≈86 BPM, 4 beats of 0.7 s) so section changes land on the act changes
// of the 40 s cut (8.4, 14, 25.2, 33.6 s). Progression: D – A – Bm – G.
{
  const BAR = 2.8, BEAT = BAR / 4;
  const CHORDS = [
    {root: 38, pad: [50, 57, 62, 66], arp: [62, 66, 69, 74]}, // D
    {root: 33, pad: [45, 57, 61, 64], arp: [61, 64, 69, 73]}, // A
    {root: 35, pad: [47, 54, 59, 62], arp: [59, 62, 66, 71]}, // Bm
    {root: 31, pad: [43, 55, 59, 62], arp: [59, 62, 67, 71]}, // G
  ];
  const end = DUR;
  const bars = Math.ceil(end / BAR);
  // a simple, singable pentatonic melody over 4 bars (beat offset, midi, velocity)
  const MELODY = [
    [0, 78, 1], [1, 81, 0.8], [2, 83, 0.9], [3, 81, 0.7],
    [4, 76, 0.9], [6, 78, 0.8], [7, 81, 0.7],
    [8, 83, 1], [9, 81, 0.8], [10, 78, 0.8], [11, 76, 0.7],
    [12, 74, 0.9], [14, 76, 0.7],
  ];
  for (let b = 0; b < bars; b++) {
    const t0 = b * BAR;
    const last = t0 + BAR >= end - 0.1;
    const c = last ? CHORDS[0] : CHORDS[b % 4];
    const lift = t0 >= 14 && t0 < 33.6; // the discovery / possibility stretch
    // pad from the second bar, opening up a little when the music lifts
    if (t0 >= 2.8) pad(t0, last ? end - 1.2 : t0 + BAR, lift ? [...c.pad, c.pad[2] + 12] : c.pad, lift ? 0.2 : 0.16, lift ? 2000 : 1400);
    // bass from 8.4 s
    if (t0 >= 8.3 && !last) bass(t0, BAR - 0.15, c.root, 0.07);
    if (last) bass(t0, end - t0 - 1.0, 38, 0.07);
    // piano: quarter notes at first, gentle eighths once the story moves
    const step = t0 < 8.3 || t0 >= 33.6 ? BEAT : BEAT / 2;
    for (let k = 0, t = t0; t < t0 + BAR - 0.01 && t < end - 1.6; t += step, k++) {
      const note = c.arp[k % 4] + (step < BEAT && k % 8 >= 4 ? 12 : 0);
      keys(t + 0.02, note, (step < BEAT ? 0.04 : 0.05) * (k % 2 ? 0.8 : 1), k % 2 ? 0.35 : 0.65, 1.5);
    }
    if (last) keys(t0 + 0.02, 74, 0.06, 0.5, 3.2), keys(t0 + 0.04, 81, 0.04, 0.3, 3.2);
    // soft pulse + shaker during the lift
    if (lift) {
      for (let q = 0; q < 4; q++) {
        if (q % 2 === 0) kick(t0 + q * BEAT, 0.17);
        shaker(t0 + q * BEAT + BEAT / 2, 0.05, q % 2 ? 0.3 : 0.7);
      }
    }
    // melody over the lift, one 4-bar phrase at a time
    if (lift) {
      const phraseStart = 14 + Math.floor((t0 - 14) / (4 * BAR)) * 4 * BAR;
      MELODY.forEach(([beat, m, v]) => {
        const t = phraseStart + beat * BEAT;
        if (t >= t0 && t < t0 + BAR && t < 33.5) bell(t, m, 0.05 * v, 0.4 + 0.2 * Math.sin(beat));
      });
    }
  }
}

// ── 4. Gentle transition swells ──
const whoosh = (designTEnd, dur, amp) => {
  const bp = new Biquad(), bp2 = new Biquad();
  const i0 = Math.floor((W(designTEnd) - dur) * SR);
  const len = Math.floor((dur + 0.6) * SR);
  for (let j = 0; j < len; j++) {
    const t = j / SR, x = t / dur;
    const env = x < 1 ? x ** 2.4 : Math.exp(-(t - dur) / 0.12);
    const f = 300 + 3000 * Math.min(1, x) ** 2;
    const s = bp.bp(noise(), f, 1.2) * env * amp;
    const s2 = bp2.bp(noise(), f * 1.1, 1.2) * env * amp;
    add(i0 + j, s, s2, 0.4);
  }
};
whoosh(fr(300), 1.0, 0.22);
whoosh(fr(660), 1.3, 0.25);
whoosh(fr(1140), 1.0, 0.18);
whoosh(fr(1500), 1.2, 0.2);

// ── 5. Picture cues: node ignition chimes, a soft lift into the climax, map and logo shimmer ──
{
  const scale = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83]; // D major pentatonic
  const t0 = fr(660 + 104), t1 = fr(660 + 240);
  let k = 0;
  for (let t = t0; t < t1; t += 0.136) {
    const prog = (t - t0) / (t1 - t0);
    piano(t, scale[(k * 3 + Math.floor(prog * 6)) % scale.length] + 12, 0.018 + prog * 0.015, rnd(), 0.8);
    k++;
  }
  const bp = new Biquad();
  const a = W(fr(990)), b = W(fr(1070));
  for (let i = Math.floor(a * SR); i < b * SR; i++) {
    const x = (i / SR - a) / (b - a);
    const s = bp.bp(noise(), 800 + 5000 * x * x, 1.5) * x ** 2 * 0.12;
    add(i, s, s, 0.6);
  }
  [74, 78, 81, 86].forEach((m, k) => piano(fr(1140 + 222) + k * 0.09, m, 0.045, 0.2 + k * 0.2, 2.2));
  [[55.0, 74], [55.12, 78], [55.24, 81], [55.36, 86]].forEach(([t, m], k) => piano(t, m, 0.05, k % 2 ? 0.3 : 0.7, 2.8));
}

// ── Reverb (Freeverb-style) ──
{
  const sc = SR / 44100;
  const combT = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((x) => Math.round(x * sc * 1.15));
  const apT = [556, 441, 341, 225].map((x) => Math.round(x * sc));
  const mk = (spread) => ({
    combs: combT.map((n) => ({buf: new Float32Array(n + spread), i: 0, f: 0})),
    aps: apT.map((n) => ({buf: new Float32Array(n + spread), i: 0})),
  });
  const chans = [mk(0), mk(23)];
  const fb = 0.86, damp = 0.25;
  for (let i = 0; i < N; i++) {
    [0, 1].forEach((c) => {
      const x = (c ? sendR[i] : sendL[i]) * 0.03;
      const ch = chans[c];
      let out = 0;
      for (const cb of ch.combs) {
        const y = cb.buf[cb.i];
        cb.f = y * (1 - damp) + cb.f * damp;
        cb.buf[cb.i] = x + cb.f * fb;
        cb.i = (cb.i + 1) % cb.buf.length;
        out += y;
      }
      for (const ap of ch.aps) {
        const b = ap.buf[ap.i];
        const y = -out + b;
        ap.buf[ap.i] = out + b * 0.5;
        ap.i = (ap.i + 1) % ap.buf.length;
        out = y;
      }
      if (c) R[i] += out; else L[i] += out;
    });
  }
}

// ── Master: fade, soft-clip, normalise ──
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.05) * Math.min(1, (DUR - t) / 0.8);
  L[i] = Math.tanh(L[i] * 1.1) * fade;
  R[i] = Math.tanh(R[i] * 1.1) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = peak > 0 ? 0.89 / peak : 1;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
const out = path.join(root, 'public/audio/score.wav');
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, buf);
console.log(`Soundtrack written: ${path.relative(root, out)}  (${DUR.toFixed(1)} s, peak normalised from ${peak.toFixed(2)})`);
