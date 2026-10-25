// Procedural score + sound design for "THE WORLD'S IDLE MACHINES".
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

// ── 1. Rain (Act 1, returns softly in Act 4) ──
{
  const gain = auto([[0, 0], [0.4, 0.5], [9.2, 0.5], [10.4, 0.12], [12, 0.0], [37.6, 0], [38.6, 0.16], [44, 0.1], [49.5, 0.04], [50.5, 0]]);
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
thunder(fr(80), 0.55);
thunder(fr(212), 0.38);

// ── 3. Low drone bed ──
{
  const gain = auto([[0, 0], [2, 0.16], [9.5, 0.22], [10.5, 0.14], [21.5, 0.2], [22.3, 0.08], [37, 0.1], [38.5, 0.05], [49, 0.06], [50, 0.12], [57.5, 0.12], [59.9, 0]]);
  const notes = auto([[0, 38], [21.9, 38], [22, 38], [60, 38]]); // D1/D2 pedal
  const lp = [new OnePole(), new OnePole()];
  const ph = [0, 0, 0, 0];
  for (let i = 0; i < N; i++) {
    const t = i / SR, g = gain(t);
    const f = mtof(notes(t));
    const det = [1, 1.004, 1.5, 2.003];
    let sl = 0, sr = 0;
    for (let k = 0; k < 4; k++) {
      ph[k] = (ph[k] + (f * det[k]) / SR) % 1;
      const saw = ph[k] * 2 - 1;
      if (k % 2) sr += saw; else sl += saw;
    }
    const cut = 140 + 90 * Math.sin(t * 0.4) ** 2;
    const yl = lp[0].lp(sl, cut), yr = lp[1].lp(sr, cut);
    add(i, yl * g, yr * g, 0.25);
  }
}

// ── 4. Heartbeat pulse (Act 1 suspense) ──
const thump = (t0, amp, f0 = 55) => {
  const i0 = Math.floor(W(t0) * SR);
  const len = Math.floor(SR * 0.5);
  let ph = 0;
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const f = f0 + 60 * Math.exp(-t / 0.03);
    ph += (2 * Math.PI * f) / SR;
    const s = Math.sin(ph) * Math.exp(-t / 0.14) * amp;
    add(i0 + j, s, s, 0.1);
  }
};
for (let t = 3.4; t < 9.6; t += 0.86) {
  const a = 0.25 + (t - 3.4) * 0.04;
  thump(t, a);
  thump(t + 0.22, a * 0.6);
}

// ── 5. Act 2: electrical hum, ticking time, sparse piano ──
{
  const gain = auto([[9.8, 0], [10.6, 0.05], [21, 0.06], [22, 0]]);
  for (let i = Math.floor(W(9.8) * SR); i < W(22) * SR; i++) {
    const t = i / SR, g = gain(t);
    const s = (Math.sin(2 * Math.PI * 100 * t) * 0.6 + Math.sin(2 * Math.PI * 200 * t) * 0.25 + Math.sin(2 * Math.PI * 300 * t) * 0.1) * g;
    add(i, s, s * 0.9, 0.1);
  }
  for (let t = 10.4; t < 21.6; t += 0.5) {
    const i0 = Math.floor(W(t) * SR);
    const loud = 0.05 + (t > 18 ? (t - 18) * 0.02 : 0);
    const bp = new Biquad();
    for (let j = 0; j < SR * 0.03; j++) {
      const s = bp.bp(noise(), 3000, 4) * Math.exp(-j / (SR * 0.004)) * loud * 3;
      add(i0 + j, s * 0.7, s, 0.4);
    }
  }
}
const piano = (t0, midi, amp, pan = 0.5, decay = 2.6) => {
  const i0 = Math.floor(W(t0) * SR);
  const f = mtof(midi);
  const len = Math.floor(SR * decay * 2.2);
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.004) * Math.exp(-t / decay);
    const s =
      (Math.sin(2 * Math.PI * f * t) +
        0.45 * Math.sin(2 * Math.PI * f * 2.001 * t) * Math.exp(-t / 0.9) +
        0.2 * Math.sin(2 * Math.PI * f * 3.003 * t) * Math.exp(-t / 0.4) +
        0.08 * Math.sin(2 * Math.PI * f * 4.2 * t) * Math.exp(-t / 0.15)) *
      env * amp;
    add(i0 + j, s * (1 - pan) * 1.4, s * pan * 1.4, 0.55);
  }
};
// melancholic D-minor motif, sparse
[[10.5, 62], [11.6, 65], [12.9, 69], [14.4, 67], [15.6, 62], [17.0, 65], [18.2, 70], [19.6, 69], [20.6, 64]].forEach(([t, m], k) =>
  piano(t, m, 0.12, k % 2 ? 0.35 : 0.65),
);
[[10.5, 38], [14.4, 34], [18.2, 41]].forEach(([t, m]) => piano(t, m + 12, 0.1, 0.5, 4));

// ── 6. Transition whooshes / reverse swells ──
const whoosh = (tEnd, dur, amp) => {
  const bp = new Biquad(), bp2 = new Biquad();
  const i0 = Math.floor((W(tEnd) - dur) * SR);
  const len = Math.floor((dur + 0.6) * SR);
  for (let j = 0; j < len; j++) {
    const t = j / SR, x = t / dur;
    const env = x < 1 ? x ** 2.4 : Math.exp(-(t - dur) / 0.12);
    const f = 300 + 4200 * Math.min(1, x) ** 2;
    const s = bp.bp(noise(), f, 1.2) * env * amp;
    const s2 = bp2.bp(noise(), f * 1.1, 1.2) * env * amp;
    add(i0 + j, s, s2, 0.4);
  }
};
whoosh(fr(300), 1.2, 0.5);
whoosh(fr(660), 1.6, 0.55);
whoosh(fr(1140), 1.2, 0.4);
whoosh(fr(1500), 1.4, 0.45);

// ── 7. Impacts (sub boom + tail) ──
const impact = (t0, amp) => {
  thump(t0, amp * 1.2, 38);
  const lp = new Biquad();
  const i0 = Math.floor(W(t0) * SR);
  for (let j = 0; j < SR * 3; j++) {
    const t = j / SR;
    const s = lp.lp(noise(), 900) * Math.exp(-t / 0.5) * amp * 0.5;
    add(i0 + j, s, s, 0.8);
  }
};
impact(fr(660), 0.55); // globe emerges
impact(fr(1070), 0.65); // climax: all compute converges on Lagos
impact(fr(1650), 0.7); // logo reveal

// ── 8. Pads (supersaw chords with opening filter) ──
const pad = (designT0, designT1, midis, amp, cutA, cutB, att = 1.2, rel = 1.8) => {
  const t0 = W(designT0), t1 = W(designT1);
  const i0 = Math.floor(t0 * SR), i1 = Math.floor((t1 + rel) * SR);
  const voices = [];
  midis.forEach((m) => {
    for (let d = 0; d < 3; d++) voices.push({f: mtof(m) * (1 + (d - 1) * 0.0035), ph: rnd(), side: (voices.length % 2)});
  });
  const fl = [new Biquad(), new Biquad()];
  for (let i = i0; i < i1 && i < N; i++) {
    const t = i / SR;
    const env = Math.min(1, (t - t0) / att) * (t > t1 ? Math.exp(-(t - t1) / (rel / 3)) : 1);
    const cut = cutA + (cutB - cutA) * clamp01((t - t0) / (t1 - t0));
    let l = 0, r = 0;
    for (const v of voices) {
      v.ph = (v.ph + v.f / SR) % 1;
      const s = v.ph * 2 - 1;
      if (v.side) r += s; else l += s;
    }
    l = fl[0].lp(l, cut, 0.8);
    r = fl[1].lp(r, cut, 0.8);
    const k = (env * amp) / voices.length;
    add(i, l * k * 2, r * k * 2, 0.7);
  }
};
// Act 3 — wonder rising: Dm → B♭ → F → C → (climax) Dm/A
pad(22.0, 26.0, [50, 57, 62, 65], 0.32, 400, 1400);
pad(26.0, 30.0, [46, 53, 58, 62, 65], 0.34, 900, 2000);
pad(30.0, 33.5, [53, 57, 60, 65, 69], 0.36, 1200, 2600);
pad(33.5, 35.6, [48, 55, 60, 64, 67], 0.38, 1600, 3800, 0.6, 0.4);
pad(35.67, 38.2, [50, 57, 62, 65, 69, 74], 0.42, 3200, 1800, 0.05, 1.6);
// Act 4 — hope: D → A → Bm → G
pad(38.2, 41.2, [50, 57, 62, 66, 69], 0.26, 700, 1500);
pad(41.2, 44.0, [45, 57, 61, 64, 69], 0.27, 1000, 1700);
pad(44.0, 47.0, [47, 54, 59, 62, 66], 0.28, 1200, 2000);
pad(47.0, 50.2, [43, 55, 59, 62, 67], 0.3, 1400, 2600);
// Act 5 — resolution: G → A → D (long tail)
pad(50.2, 52.8, [43, 55, 59, 62, 67, 71], 0.32, 1200, 2600);
pad(52.8, 55.0, [45, 57, 61, 64, 69], 0.32, 1500, 3000);
pad(55.0, 57.6, [38, 50, 57, 62, 66, 69, 74], 0.4, 3400, 1200, 0.05, 2.0);

// ── 9. Act 3 ignition chimes (follow node ignition) & riser ──
{
  const scale = [62, 65, 67, 69, 72, 74, 77, 79, 81, 84];
  const t0 = fr(660 + 36), t1 = fr(660 + 230);
  let k = 0;
  for (let t = t0; t < t1; t += 0.136) {
    const prog = (t - t0) / (t1 - t0);
    const m = scale[(k * 3 + Math.floor(prog * 6)) % scale.length];
    piano(t, m + 12, 0.035 + prog * 0.03, rnd(), 0.9);
    k++;
  }
  // pulses along the network during link growth
  for (let t = fr(760); t < fr(1060); t += 0.272) {
    const m = [74, 77, 81, 79][Math.floor(t * 3.7) % 4];
    piano(t, m, 0.03, rnd(), 0.6);
  }
  // riser into climax
  const bp = new Biquad();
  const a = W(fr(990)), b = W(fr(1070));
  let ph = 0;
  for (let i = Math.floor(a * SR); i < b * SR; i++) {
    const t = i / SR, x = (t - a) / (b - a);
    ph += (2 * Math.PI * (200 + 1400 * x * x)) / SR;
    const s = (bp.bp(noise(), 600 + 6000 * x * x, 1.5) * 0.6 + Math.sin(ph) * 0.15) * x ** 2 * 0.5;
    add(i, s, s, 0.5);
  }
}

// ── 10. Act 4: soft arpeggio + data blips ──
{
  const prog = [[38.2, [62, 66, 69, 74]], [41.2, [61, 64, 69, 73]], [44.0, [59, 62, 66, 71]], [47.0, [59, 62, 67, 71]]];
  prog.forEach(([start, notes], c) => {
    const end = c < 3 ? prog[c + 1][0] : 50.2;
    let k = 0;
    for (let t = start; t < end - 0.05; t += 0.272) {
      piano(t, notes[k % 4] + (k % 8 >= 4 ? 12 : 0), 0.05, k % 2 ? 0.3 : 0.7, 1.1);
      k++;
    }
  });
  for (let t = 38.6; t < 45.3; t += 0.136 + rnd() * 0.2) {
    const i0 = Math.floor(W(t) * SR), f = 1800 + rnd() * 1600;
    for (let j = 0; j < SR * 0.025; j++) {
      const s = Math.sin((2 * Math.PI * f * j) / SR) * Math.exp(-j / (SR * 0.006)) * 0.025;
      add(i0 + j, s * rnd(), s * rnd(), 0.3);
    }
  }
  // map reveal shimmer
  [74, 78, 81, 86].forEach((m, k) => piano(fr(1140 + 224) + k * 0.09, m, 0.06, 0.2 + k * 0.2, 2.2));
}

// ── 11. Logo shimmer ──
[[55.0, 74], [55.12, 78], [55.24, 81], [55.36, 86], [56.6, 81], [56.75, 86]].forEach(([t, m], k) => piano(t, m, 0.06, k % 2 ? 0.3 : 0.7, 2.8));

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
