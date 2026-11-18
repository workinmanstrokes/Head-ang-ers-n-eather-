/**
 * Original starter-pack sound effects.
 * Every sample is synthesized here. No third-party recordings or samples.
 * Output: www/audio/*.wav and www/data/starter-pack.json
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = join(ROOT, 'www', 'audio');
const JSON_PATH = join(ROOT, 'www', 'data', 'starter-pack.json');

const SOUNDS = [
  { id: 'airhorn', label: 'Airhorn', colour: '#c81f36', seconds: 0.78 },
  { id: 'rimshot', label: 'Rimshot', colour: '#ef7d12', seconds: 0.32 },
  { id: 'sad-trombone', label: 'Sad Trombone', colour: '#5346e4', seconds: 1.62 },
  { id: 'boing', label: 'Boing', colour: '#0d7a4d', seconds: 0.48 },
  { id: 'laser', label: 'Laser', colour: '#1f5fd4', seconds: 0.38 },
  { id: 'whistle', label: 'Whistle', colour: '#0c7380', seconds: 0.58 },
  { id: 'applause', label: 'Applause', colour: '#c21868', seconds: 1.15 },
  { id: 'drum-roll', label: 'Drum Roll', colour: '#d4652a', seconds: 1.28 },
  { id: 'quack', label: 'Quack', colour: '#c4920a', seconds: 0.34 },
  { id: 'moo', label: 'Moo', colour: '#7a4b38', seconds: 0.86 },
  { id: 'ding', label: 'Ding', colour: '#d7a30e', seconds: 0.9 },
  { id: 'buzzer', label: 'Buzzer', colour: '#b42338', seconds: 0.55 },
  { id: 'coin', label: 'Coin', colour: '#c99712', seconds: 0.46 },
  { id: 'fart', label: 'Fart', colour: '#4e7a22', seconds: 0.42 },
  { id: 'tada', label: 'Ta-da', colour: '#8e2eb0', seconds: 0.72 },
  { id: 'crickets', label: 'Crickets', colour: '#334856', seconds: 1.05 },
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lowpass() {
  let y = 0;
  return (x, freq) => {
    const a = 1 - Math.exp((-2 * Math.PI * Math.max(30, freq)) / SR);
    y += a * (x - y);
    return y;
  };
}

function lengthOf(seconds) {
  return Math.max(1, Math.floor(SR * seconds));
}

function finalize(samples) {
  let mean = 0;
  for (let i = 0; i < samples.length; i++) mean += samples[i];
  mean /= samples.length;
  for (let i = 0; i < samples.length; i++) samples[i] -= mean;
  const fadeIn = Math.floor(SR * 0.003);
  const fadeOut = Math.floor(SR * 0.018);
  for (let i = 0; i < fadeIn; i++) samples[i] *= i / fadeIn;
  for (let i = 0; i < fadeOut; i++) samples[samples.length - 1 - i] *= i / fadeOut;
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  const gain = peak > 1e-6 ? 0.62 / peak : 0;
  for (let i = 0; i < samples.length; i++) {
    const x = Math.max(-1, Math.min(1, samples[i] * gain));
    samples[i] = x;
  }
  return samples;
}

function wavBytes(samples) {
  const n = samples.length;
  const buffer = Buffer.alloc(44 + n * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + n * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SR, 24);
  buffer.writeUInt32LE(SR * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE((s < 0 ? s * 32768 : s * 32767) | 0, 44 + i * 2);
  }
  return buffer;
}

function additive(phase, harmonics, tilt = 1) {
  let y = 0;
  for (let k = 1; k <= harmonics; k++) {
    y += Math.sin(2 * Math.PI * phase * k) / (k ** tilt);
  }
  return y;
}

function synthAirhorn() {
  const n = lengthOf(0.78);
  const out = new Float32Array(n);
  const lp = lowpass();
  const rand = mulberry32(0xa17);
  let p1 = 0;
  let p2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    p1 += 415.3 / SR;
    p2 += 622.25 / SR;
    const body = additive(p1, 10, 1) * 0.55 + additive(p2, 8, 1) * 0.45;
    const chiff = (rand() * 2 - 1) * Math.exp(-t * 32);
    const env = Math.min(1, t / 0.02) * (0.72 + 0.28 * Math.exp(-t * 1.4));
    out[i] = Math.tanh(lp(body * 0.35 + chiff * 0.45, 2400) * 2.4) * env;
  }
  return finalize(out);
}

function synthRimshot() {
  const n = lengthOf(0.32);
  const out = new Float32Array(n);
  const rand = mulberry32(0xb17);
  const lp = lowpass();
  const hpState = lowpass();
  let p = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const noise = rand() * 2 - 1;
    const crack = (noise - hpState(noise, 1800)) * Math.exp(-t * 48);
    const bodyEnv = t > 0.09 ? Math.exp(-(t - 0.09) * 22) : 0;
    p += 196 / SR;
    const body = Math.sin(2 * Math.PI * p) * 0.7 + lp(noise, 900) * 0.5;
    out[i] = crack * 0.85 + body * bodyEnv;
  }
  return finalize(out);
}

function synthSadTrombone() {
  const n = lengthOf(1.62);
  const notes = [349.23, 329.63, 293.66, 261.63];
  const step = 0.4;
  const out = new Float32Array(n);
  const lp = lowpass();
  let phase = 0;
  let freq = notes[0];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const idx = Math.min(notes.length - 1, Math.floor(t / step));
    const target = notes[idx];
    freq += (target - freq) * 0.012;
    const vib = 1 + 0.012 * Math.sin(2 * Math.PI * 5.2 * t);
    phase += (freq * vib) / SR;
    const local = t - idx * step;
    const env = Math.min(1, local / 0.03) * Math.min(1, Math.max(0, (step - local) / 0.05));
    const saw = additive(phase % 1, 12, 1.05);
    out[i] = lp(saw * 0.32, 900) * env * 1.4;
  }
  return finalize(out);
}

function synthBoing() {
  const n = lengthOf(0.48);
  const out = new Float32Array(n);
  let phase = 0;
  const hits = [0, 0.12, 0.21, 0.28];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let env = 0;
    for (let h = 0; h < hits.length; h++) {
      if (t >= hits[h]) env += Math.exp(-(t - hits[h]) * (16 + h * 8)) * (1 - h * 0.18);
    }
    env = Math.min(1.2, env);
    const freq = 140 + 720 * env;
    phase += freq / SR;
    out[i] = Math.sin(2 * Math.PI * phase) * Math.min(1, env);
  }
  return finalize(out);
}

function synthLaser() {
  const n = lengthOf(0.38);
  const out = new Float32Array(n);
  const rand = mulberry32(0x1a5e);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const freq = 1700 * Math.pow(0.07, t / 0.38) + 70;
    phase += freq / SR;
    const tone = additive(phase % 1, 6, 1);
    const noise = (rand() * 2 - 1) * Math.exp(-t * 18) * 0.25;
    const env = Math.min(1, t / 0.008) * Math.exp(-t * 2.2);
    out[i] = Math.tanh((tone * 0.4 + noise) * 1.6) * env;
  }
  return finalize(out);
}

function synthWhistle() {
  const n = lengthOf(0.58);
  const out = new Float32Array(n);
  const rand = mulberry32(0xc0ff);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let freq = 1500;
    if (t < 0.24) freq = 1400 + (1950 - 1400) * (t / 0.24);
    else if (t < 0.3) freq = 1950;
    else freq = 1950 + (1250 - 1950) * Math.min(1, (t - 0.3) / 0.24);
    freq *= 1 + 0.008 * Math.sin(2 * Math.PI * 6 * t);
    phase += freq / SR;
    const gap = t > 0.24 && t < 0.3 ? 0.35 : 1;
    const env = Math.min(1, t / 0.02) * Math.min(1, (0.58 - t) / 0.05) * gap;
    const breath = (rand() * 2 - 1) * 0.04;
    out[i] = (Math.sin(2 * Math.PI * phase) * 0.85 + breath) * env;
  }
  return finalize(out);
}

function synthApplause() {
  const n = lengthOf(1.15);
  const out = new Float32Array(n);
  const rand = mulberry32(0xa991);
  const claps = [];
  for (let c = 0; c < 34; c++) {
    claps.push({ at: rand() * 1.05, amp: 0.35 + rand() * 0.65, tone: 900 + rand() * 2200 });
  }
  const bands = [lowpass(), lowpass()];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const noise = rand() * 2 - 1;
    let env = 0;
    let tone = 1600;
    for (const c of claps) {
      const d = t - c.at;
      if (d >= 0 && d < 0.05) {
        const e = Math.exp(-d * 70) * c.amp;
        if (e > env) {
          env = e;
          tone = c.tone;
        }
      }
    }
    const bright = noise - bands[0](noise, 700);
    const shaped = bands[1](bright, tone);
    const swell = 0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, t / 1.15));
    out[i] = shaped * env * swell * 3.2;
  }
  return finalize(out);
}

function synthDrumRoll() {
  const n = lengthOf(1.28);
  const out = new Float32Array(n);
  const rand = mulberry32(0xd200);
  const lp = lowpass();
  let phase = 0;
  const hits = [];
  let t = 0;
  let gap = 0.09;
  while (t < 1.05) {
    hits.push(t);
    t += gap;
    gap = Math.max(0.035, gap * 0.9);
  }
  for (let i = 0; i < n; i++) {
    const time = i / SR;
    const noise = rand() * 2 - 1;
    let env = 0;
    for (const h of hits) {
      const d = time - h;
      if (d >= 0 && d < 0.05) env = Math.max(env, Math.exp(-d * 55));
    }
    const snare = (noise - lp(noise, 500)) * env;
    let impact = 0;
    if (time > 1.02) {
      const d = time - 1.02;
      phase += (70 + 40 * Math.exp(-d * 8)) / SR;
      impact = Math.sin(2 * Math.PI * phase) * Math.exp(-d * 6) * 0.9
        + (rand() * 2 - 1) * Math.exp(-d * 30) * 0.4;
    }
    out[i] = snare * 0.85 + impact;
  }
  return finalize(out);
}

function synthQuack() {
  const n = lengthOf(0.34);
  const out = new Float32Array(n);
  const bursts = [0, 0.15];
  let phase = 0;
  let mod = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let env = 0;
    for (const b of bursts) {
      const d = t - b;
      if (d >= 0 && d < 0.14) env = Math.max(env, Math.sin(Math.PI * (d / 0.14)) * Math.exp(-d * 6));
    }
    mod += 140 / SR;
    const freq = 480 + Math.sin(2 * Math.PI * mod) * 180 * env;
    phase += freq / SR;
    const tone = Math.sin(2 * Math.PI * phase);
    const form = Math.sin(2 * Math.PI * phase * 2.3);
    out[i] = (tone * 0.7 + form * 0.3) * env;
  }
  return finalize(out);
}

function synthMoo() {
  const n = lengthOf(0.86);
  const out = new Float32Array(n);
  const lp = lowpass();
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const freq = (165 - 45 * (t / 0.86)) * (1 + 0.03 * Math.sin(2 * Math.PI * 5.5 * t));
    phase += freq / SR;
    const saw = additive(phase % 1, 14, 1);
    const open = 400 + 700 * Math.sin(Math.PI * Math.min(1, t / 0.86)) ** 1.2;
    const env = Math.min(1, t / 0.06) * Math.min(1, (0.86 - t) / 0.12);
    out[i] = lp(saw * 0.4, open) * env * 1.8;
  }
  return finalize(out);
}

function synthDing() {
  const n = lengthOf(0.9);
  const out = new Float32Array(n);
  const partials = [1, 2.76, 5.4, 8.93];
  const amps = [1, 0.48, 0.22, 0.1];
  const decays = [1.4, 2.4, 3.6, 4.8];
  const base = 660;
  const phases = [0.1, 0.4, 0.8, 0.2];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let y = 0;
    for (let p = 0; p < partials.length; p++) {
      phases[p] += (base * partials[p]) / SR;
      y += Math.sin(2 * Math.PI * phases[p]) * amps[p] * Math.exp(-t * decays[p]);
    }
    out[i] = y;
  }
  return finalize(out);
}

function synthBuzzer() {
  const n = lengthOf(0.55);
  const out = new Float32Array(n);
  const lp = lowpass();
  let p1 = 0;
  let p2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    p1 += 140 / SR;
    p2 += 186 / SR;
    const a = p1 % 1 < 0.5 ? 1 : -1;
    const b = p2 % 1 < 0.5 ? 1 : -1;
    const env = Math.min(1, t / 0.01) * Math.min(1, (0.55 - t) / 0.04);
    out[i] = lp((a * 0.6 + b * 0.4) * 0.5, 1400) * env * 1.6;
  }
  return finalize(out);
}

function synthCoin() {
  // Original two-note chime: D6 then A6 (a major sixth). Not a game-coin quote.
  const n = lengthOf(0.46);
  const out = new Float32Array(n);
  const notes = [
    { at: 0, freq: 1174.66 },
    { at: 0.09, freq: 1760 },
  ];
  const phases = [0, 0];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let y = 0;
    for (let k = 0; k < notes.length; k++) {
      const d = t - notes[k].at;
      if (d < 0) continue;
      phases[k] += notes[k].freq / SR;
      const env = Math.exp(-d * 7);
      y += Math.sin(2 * Math.PI * phases[k]) * env;
      y += Math.sin(2 * Math.PI * phases[k] * 2.01) * env * 0.25;
    }
    out[i] = y;
  }
  return finalize(out);
}

function synthFart() {
  const n = lengthOf(0.42);
  const out = new Float32Array(n);
  const rand = mulberry32(0xf007);
  const lp = lowpass();
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const flutter = 0.65 + 0.35 * Math.sin(2 * Math.PI * 13 * t);
    const freq = 150 * Math.pow(0.4, t / 0.42) + 48;
    phase += freq / SR;
    const tone = Math.sin(2 * Math.PI * phase);
    const noise = lp(rand() * 2 - 1, 420 + 200 * flutter);
    const env = Math.min(1, t / 0.02) * Math.exp(-t * 3.2) * flutter;
    out[i] = (tone * 0.45 + noise * 0.7) * env;
  }
  return finalize(out);
}

function synthTada() {
  const n = lengthOf(0.72);
  const out = new Float32Array(n);
  const rand = mulberry32(0x7ada);
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const phases = notes.map(() => 0);
  const lp = lowpass();
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let y = 0;
    for (let k = 0; k < notes.length; k++) {
      const d = t - k * 0.07;
      if (d < 0) continue;
      phases[k] += notes[k] / SR;
      const env = Math.exp(-d * 3.1) * Math.min(1, d / 0.01);
      const tri = Math.asin(Math.sin(2 * Math.PI * phases[k])) * (2 / Math.PI);
      y += tri * env * 0.7;
    }
    const crash = lp(rand() * 2 - 1, 2500) * Math.exp(-t * 10) * 0.25;
    out[i] = y + crash;
  }
  return finalize(out);
}

function synthCrickets() {
  const n = lengthOf(1.05);
  const out = new Float32Array(n);
  const rand = mulberry32(0xc1c1);
  let phase = 0;
  const chirps = [];
  for (let g = 0; g < 5; g++) {
    const base = 0.04 + g * 0.2;
    chirps.push(base, base + 0.045);
  }
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let env = 0;
    for (const c of chirps) {
      const d = t - c;
      if (d >= 0 && d < 0.028) env = Math.max(env, Math.sin(Math.PI * (d / 0.028)));
    }
    const freq = 4700 + (rand() - 0.5) * 30;
    phase += freq / SR;
    out[i] = Math.sin(2 * Math.PI * phase) * env;
  }
  return finalize(out);
}

const SYNTH = {
  airhorn: synthAirhorn,
  rimshot: synthRimshot,
  'sad-trombone': synthSadTrombone,
  boing: synthBoing,
  laser: synthLaser,
  whistle: synthWhistle,
  applause: synthApplause,
  'drum-roll': synthDrumRoll,
  quack: synthQuack,
  moo: synthMoo,
  ding: synthDing,
  buzzer: synthBuzzer,
  coin: synthCoin,
  fart: synthFart,
  tada: synthTada,
  crickets: synthCrickets,
};

await mkdir(AUDIO_DIR, { recursive: true });
await mkdir(dirname(JSON_PATH), { recursive: true });

const sounds = [];
for (const def of SOUNDS) {
  const samples = SYNTH[def.id]();
  const duration = Math.round((samples.length / SR) * 1000) / 1000;
  await writeFile(join(AUDIO_DIR, `${def.id}.wav`), wavBytes(samples));
  let peak = 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    peak = Math.max(peak, Math.abs(samples[i]));
    sum += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sum / samples.length);
  if (peak < 0.2 || peak > 0.95 || rms < 0.015) {
    throw new Error(`${def.id} failed level check peak=${peak} rms=${rms}`);
  }
  sounds.push({
    id: def.id,
    label: def.label,
    colour: def.colour,
    file: `audio/${def.id}.wav`,
    duration,
    source: 'Original synthesis',
  });
  console.log(`${def.id.padEnd(14)} ${duration.toFixed(2)}s  peak ${peak.toFixed(2)}  rms ${rms.toFixed(3)}`);
}

const pack = {
  pack: 'Laugh Pad starter pack',
  version: 2,
  license:
    'Original works generated by scripts/generate-starter-pack.mjs. No third-party samples. Licensed with this app under the MIT license. See LICENSES.md.',
  sounds,
};
await writeFile(JSON_PATH, JSON.stringify(pack, null, 2) + '\n');
console.log(`wrote ${sounds.length} sounds`);
